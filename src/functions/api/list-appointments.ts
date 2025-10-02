import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ListAppointmentsByInsuredUseCase } from "../../core/use-cases/list-appointments.use-case";
import { DynamoDBAppointmentRepository } from "../../infrastructure/repositories/dynamodb-appointment.repository";
import { ApiResponseBuilder, getLogger } from "../../shared/utils";
import { ValidationError } from "../../shared/errors/custom-errors";

const logger = getLogger("listAppointments");

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Listing appointments", {
      requestId: event.requestContext.requestId,
    });

    const insuredId = event.pathParameters?.insuredId;

    if (!insuredId) {
      return ApiResponseBuilder.badRequest("insuredId parameter is required");
    }

    const appointmentRepository = new DynamoDBAppointmentRepository();

    const useCase = new ListAppointmentsByInsuredUseCase(appointmentRepository);

    const result = await useCase.execute({ insuredId });

    logger.info("Appointments retrieved successfully", {
      insuredId,
      count: result.total,
    });

    return ApiResponseBuilder.success(result);
  } catch (error) {
    logger.error("Error listing appointments", error);

    if (error instanceof ValidationError) {
      return ApiResponseBuilder.badRequest(error.message);
    }

    return ApiResponseBuilder.internalError(
      "Failed to retrieve appointments. Please try again later."
    );
  }
};
