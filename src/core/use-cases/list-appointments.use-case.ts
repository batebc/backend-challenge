import type { AppointmentRepository } from "../ports/appointment-repository.interface";
import { InsuredId } from "../domain/value-objects/insured-id";

interface ListAppointmentsInput {
  insuredId: string;
}

interface AppointmentSummary {
  appointmentId: string;
  scheduleId: number;
  countryISO: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ListAppointmentsOutput {
  insuredId: string;
  appointments: AppointmentSummary[];
  total: number;
}

export class ListAppointmentsByInsuredUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: ListAppointmentsInput): Promise<ListAppointmentsOutput> {
    const insuredIdVO = new InsuredId(input.insuredId);
    const appointments = await this.appointmentRepository.findByInsuredId(
      insuredIdVO.getValue()
    );
    const appointmentSummaries: AppointmentSummary[] = appointments.map(
      (appointment) => ({
        appointmentId: appointment.appointmentId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO.getValue(),
        status: appointment.status.getValue(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      })
    );

    return {
      insuredId: insuredIdVO.getValue(),
      appointments: appointmentSummaries,
      total: appointmentSummaries.length,
    };
  }
}
