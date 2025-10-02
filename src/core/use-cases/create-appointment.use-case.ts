import { v4 as uuidv4 } from "uuid";
import { Appointment } from "../domain/entities/appointment";
import type { AppointmentRepository } from "../ports/appointment-repository.interface";
import type { MessagePublisher } from "../ports/message-publisher.interface";

interface CreateAppointmentInput {
  insuredId: string;
  scheduleId: number;
  countryISO: string;
}

interface CreateAppointmentOutput {
  appointmentId: string;
  status: string;
}

export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly messagePublisher: MessagePublisher
  ) {}

  async execute(
    input: CreateAppointmentInput
  ): Promise<CreateAppointmentOutput> {
    const appointmentId = uuidv4();

    const appointment = Appointment.create({
      appointmentId,
      insuredId: input.insuredId,
      scheduleId: input.scheduleId,
      countryISO: input.countryISO,
    });

    await this.appointmentRepository.save(appointment);

    await this.messagePublisher.publish(
      {
        appointmentId: appointment.appointmentId,
        insuredId: appointment.insuredId.getValue(),
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO.getValue(),
      },
      {
        countryISO: appointment.countryISO.getValue(),
      }
    );

    return {
      appointmentId: appointment.appointmentId,
      status: appointment.status.getValue(),
    };
  }
}
