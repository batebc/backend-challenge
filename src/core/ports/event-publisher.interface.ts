export interface AppointmentCompletedEvent {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  completedAt: string;
}

export interface EventPublisher {
  publishAppointmentCompleted(event: AppointmentCompletedEvent): Promise<void>;
}
