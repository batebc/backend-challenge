// src/infrastructure/messaging/sns-publisher.ts
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import type {
  MessagePublisher,
  PublishMessage,
  MessageAttributes,
} from "../../core/ports/message-publisher.interface";
import { MessagingError } from "../../shared/errors/custom-errors";

export class SNSMessagePublisher implements MessagePublisher {
  private readonly client: SNSClient;
  private readonly topicArn: string;

  constructor(topicArn?: string) {
    this.client = new SNSClient({});
    this.topicArn = topicArn || process.env.SNS_TOPIC_ARN || "";

    if (!this.topicArn) {
      throw new Error("SNS_TOPIC_ARN environment variable is required");
    }
  }

  async publish(
    message: PublishMessage,
    attributes: MessageAttributes
  ): Promise<void> {
    try {
      const messageAttributes = this.buildMessageAttributes(attributes);

      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
        MessageAttributes: messageAttributes,
      });

      await this.client.send(command);
    } catch (error) {
      throw new MessagingError(
        `Failed to publish message to SNS for appointment ${message.appointmentId}`,
        error
      );
    }
  }

  private buildMessageAttributes(attributes: MessageAttributes) {
    const snsAttributes: Record<string, any> = {};

    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value === "string") {
        snsAttributes[key] = {
          DataType: "String",
          StringValue: value,
        };
      } else if (typeof value === "number") {
        snsAttributes[key] = {
          DataType: "Number",
          StringValue: value.toString(),
        };
      }
    }

    return snsAttributes;
  }
}
