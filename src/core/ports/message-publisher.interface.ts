export interface MessageAttributes {
  [key: string]: string | number;
}

export interface PublishMessage {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
}

export interface MessagePublisher {
  publish(
    message: PublishMessage,
    attributes: MessageAttributes
  ): Promise<void>;
}
