import type { SQSEvent, SQSBatchResponse } from "aws-lambda";
import { UpdateAppointmentStatusUseCase } from "../../core/use-cases/update-appointment-status.use-case";
import { DynamoDBAppointmentRepository } from "../../infrastructure/repositories/dynamodb-appointment.repository";
import { getLogger } from "../../shared/utils";
import { NotFoundError } from "../../shared/errors/custom-errors";

const logger = getLogger("appointmentStatusUpdater");

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  logger.info("Updating appointment statuses", { count: event.Records.length });

  const batchItemFailures: SQSBatchResponse["batchItemFailures"] = [];

  const appointmentRepository = new DynamoDBAppointmentRepository();
  const useCase = new UpdateAppointmentStatusUseCase(appointmentRepository);

  for (const record of event.Records) {
    try {
      const eventData = JSON.parse(record.body);
      const detail = eventData.detail;

      logger.info("Updating appointment status", {
        appointmentId: detail.appointmentId,
      });

      await useCase.execute({
        appointmentId: detail.appointmentId,
      });

      logger.info("Appointment status updated successfully", {
        appointmentId: detail.appointmentId,
      });
    } catch (error) {
      logger.error("Error updating appointment status", error, {
        messageId: record.messageId,
      });

      if (!(error instanceof NotFoundError)) {
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }
  }

  return { batchItemFailures };
};
