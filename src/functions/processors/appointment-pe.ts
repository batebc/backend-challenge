import type { SQSEvent, SQSBatchResponse } from "aws-lambda";
import { ProcessAppointmentUseCase } from "../../core/use-cases/process-appointment.use-case";
import { MySQLAppointmentRepository } from "../../infrastructure/repositories/mysql-appointment.repository";
import { EventBridgePublisher } from "../../infrastructure/messaging/eventbridge-publisher";
import { DatabaseFactory } from "../../infrastructure/database/database-factory";
import { getLogger } from "../../shared/utils";

const logger = getLogger("appointmentPE");

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  logger.info("Processing PE appointments", { count: event.Records.length });

  const batchItemFailures: SQSBatchResponse["batchItemFailures"] = [];

  const connection = DatabaseFactory.getConnection("PE");
  const rdsRepository = new MySQLAppointmentRepository(connection);
  const eventPublisher = new EventBridgePublisher();

  const useCase = new ProcessAppointmentUseCase(rdsRepository, eventPublisher);

  for (const record of event.Records) {
    try {
      const snsMessage = JSON.parse(record.body);
      const message = JSON.parse(snsMessage.Message);

      logger.info("Processing appointment", {
        appointmentId: message.appointmentId,
        country: "PE",
      });

      await useCase.execute({
        appointmentId: message.appointmentId,
        insuredId: message.insuredId,
        scheduleId: message.scheduleId,
        countryISO: message.countryISO,
      });

      logger.info("Appointment processed successfully", {
        appointmentId: message.appointmentId,
      });
    } catch (error) {
      logger.error("Error processing appointment", error, {
        messageId: record.messageId,
      });

      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
