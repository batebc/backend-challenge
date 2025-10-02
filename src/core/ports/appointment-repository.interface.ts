import { Appointment } from "../domain/entities/appointment";

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findById(appointmentId: string): Promise<Appointment | null>;
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
  update(appointment: Appointment): Promise<void>;
}
