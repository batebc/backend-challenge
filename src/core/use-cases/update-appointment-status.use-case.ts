import type { AppointmentRepository } from "../ports/appointment-repository.interface";
import { NotFoundError } from "../../shared/errors/custom-errors";

interface UpdateAppointmentStatusInput {
  appointmentId: string;
}

export class UpdateAppointmentStatusUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: UpdateAppointmentStatusInput): Promise<void> {
    const appointment = await this.appointmentRepository.findById(
      input.appointmentId
    );

    if (!appointment) {
      throw new NotFoundError(`Appointment not found: ${input.appointmentId}`);
    }

    const completedAppointment = appointment.markAsCompleted();

    await this.appointmentRepository.update(completedAppointment);
  }
}
