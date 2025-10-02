import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import type {
  EventPublisher,
  AppointmentCompletedEvent,
} from "../../core/ports/event-publisher.interface";
import { MessagingError } from "../../shared/errors/custom-errors";

export class EventBridgePublisher implements EventPublisher {
  private readonly client: EventBridgeClient;
  private readonly eventBusName: string;

  constructor(eventBusName?: string) {
    this.client = new EventBridgeClient({});
    this.eventBusName = eventBusName || process.env.EVENTBRIDGE_BUS_NAME || "";

    if (!this.eventBusName) {
      throw new Error("EVENTBRIDGE_BUS_NAME environment variable is required");
    }
  }

  async publishAppointmentCompleted(
    event: AppointmentCompletedEvent
  ): Promise<void> {
    try {
      const command = new PutEventsCommand({
        Entries: [
          {
            Source: "appointment.processor",
            DetailType: "AppointmentCompleted",
            Detail: JSON.stringify(event),
            EventBusName: this.eventBusName,
          },
        ],
      });

      const result = await this.client.send(command);

      if (result.FailedEntryCount && result.FailedEntryCount > 0) {
        throw new Error(
          `Failed to publish event: ${JSON.stringify(result.Entries)}`
        );
      }
    } catch (error) {
      throw new MessagingError(
        `Failed to publish AppointmentCompleted event for ${event.appointmentId}`,
        error
      );
    }
  }
}
