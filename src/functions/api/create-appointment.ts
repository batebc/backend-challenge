import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateAppointmentUseCase } from "../../core/use-cases/create-appointment.use-case";
import { DynamoDBAppointmentRepository } from "../../infrastructure/repositories/dynamodb-appointment.repository";
import { SNSMessagePublisher } from "../../infrastructure/messaging/sns-publisher";
import { validateCreateAppointmentDto } from "../../shared/dtos/create-appointment.dto";
import { ApiResponseBuilder, getLogger } from "../../shared/utils";
import {
  ValidationError,
  DomainError,
} from "../../shared/errors/custom-errors";

const logger = getLogger("createAppointment");

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Creating appointment", {
      requestId: event.requestContext.requestId,
    });

    if (!event.body) {
      return ApiResponseBuilder.badRequest("Request body is required");
    }

    const body = JSON.parse(event.body);

    let validatedDto;
    try {
      validatedDto = validateCreateAppointmentDto(body);
    } catch (error) {
      logger.warn("Validation error", {
        error: error instanceof Error ? error.message : error,
      });
      return ApiResponseBuilder.validationError(
        error instanceof Error ? error.message : "Validation failed"
      );
    }

    const appointmentRepository = new DynamoDBAppointmentRepository();
    const messagePublisher = new SNSMessagePublisher();

    const useCase = new CreateAppointmentUseCase(
      appointmentRepository,
      messagePublisher
    );

    const result = await useCase.execute({
      insuredId: validatedDto.insuredId,
      scheduleId: validatedDto.scheduleId,
      countryISO: validatedDto.countryISO,
    });

    logger.info("Appointment created successfully", {
      appointmentId: result.appointmentId,
    });

    return ApiResponseBuilder.created({
      appointmentId: result.appointmentId,
      status: result.status,
      message: "Appointment request is being processed",
    });
  } catch (error) {
    logger.error("Error creating appointment", error);

    if (error instanceof ValidationError || error instanceof DomainError) {
      return ApiResponseBuilder.badRequest(error.message);
    }

    return ApiResponseBuilder.internalError(
      "Failed to create appointment. Please try again later."
    );
  }
};
