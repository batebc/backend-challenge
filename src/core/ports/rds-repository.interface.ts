export interface RDSAppointmentData {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  createdAt: Date;
}

export interface RDSAppointmentRepository {
  save(data: RDSAppointmentData): Promise<void>;
}
