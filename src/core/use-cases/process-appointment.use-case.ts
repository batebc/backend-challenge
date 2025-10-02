import type { RDSAppointmentRepository } from "../ports/rds-repository.interface";
import type { EventPublisher } from "../ports/event-publisher.interface";

interface ProcessAppointmentInput {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
}

export class ProcessAppointmentUseCase {
  constructor(
    private readonly rdsRepository: RDSAppointmentRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(input: ProcessAppointmentInput): Promise<void> {
    await this.rdsRepository.save({
      appointmentId: input.appointmentId,
      insuredId: input.insuredId,
      scheduleId: input.scheduleId,
      countryISO: input.countryISO,
      createdAt: new Date(),
    });

    await this.eventPublisher.publishAppointmentCompleted({
      appointmentId: input.appointmentId,
      insuredId: input.insuredId,
      scheduleId: input.scheduleId,
      countryISO: input.countryISO,
      completedAt: new Date().toISOString(),
    });
  }
}
