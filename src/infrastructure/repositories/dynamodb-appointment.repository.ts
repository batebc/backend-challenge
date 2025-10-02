import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type { AppointmentRepository } from "../../core/ports/appointment-repository.interface";
import { Appointment } from "../../core/domain/entities/appointment";
import { RepositoryError } from "../../shared/errors/custom-errors";

export class DynamoDBAppointmentRepository implements AppointmentRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(tableName?: string) {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName || process.env.APPOINTMENTS_TABLE || "";

    if (!this.tableName) {
      throw new Error("APPOINTMENTS_TABLE environment variable is required");
    }
  }

  async save(appointment: Appointment): Promise<void> {
    try {
      const item = {
        PK: `APPOINTMENT#${appointment.appointmentId}`,
        SK: `METADATA`,
        GSI1PK: `INSURED#${appointment.insuredId.getValue()}`,
        GSI1SK: `APPOINTMENT#${appointment.createdAt.toISOString()}`,
        appointmentId: appointment.appointmentId,
        insuredId: appointment.insuredId.getValue(),
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO.getValue(),
        status: appointment.status.getValue(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      };

      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: item,
        })
      );
    } catch (error) {
      throw new RepositoryError(
        "Failed to save appointment to DynamoDB",
        error
      );
    }
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    try {
      const result = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            PK: `APPOINTMENT#${appointmentId}`,
            SK: "METADATA",
          },
        })
      );

      if (!result.Item) {
        return null;
      }

      return Appointment.fromPersistence({
        appointmentId: result.Item.appointmentId,
        insuredId: result.Item.insuredId,
        scheduleId: result.Item.scheduleId,
        countryISO: result.Item.countryISO,
        status: result.Item.status,
        createdAt: result.Item.createdAt,
        updatedAt: result.Item.updatedAt,
      });
    } catch (error) {
      throw new RepositoryError(
        `Failed to find appointment ${appointmentId}`,
        error
      );
    }
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    try {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :insuredId",
          ExpressionAttributeValues: {
            ":insuredId": `INSURED#${insuredId}`,
          },
          ScanIndexForward: false, // Most recent first
        })
      );

      if (!result.Items || result.Items.length === 0) {
        return [];
      }

      return result.Items.map((item) =>
        Appointment.fromPersistence({
          appointmentId: item.appointmentId,
          insuredId: item.insuredId,
          scheduleId: item.scheduleId,
          countryISO: item.countryISO,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })
      );
    } catch (error) {
      throw new RepositoryError(
        `Failed to find appointments for insured ${insuredId}`,
        error
      );
    }
  }

  async update(appointment: Appointment): Promise<void> {
    try {
      await this.docClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: {
            PK: `APPOINTMENT#${appointment.appointmentId}`,
            SK: "METADATA",
          },
          UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
          ExpressionAttributeNames: {
            "#status": "status",
            "#updatedAt": "updatedAt",
          },
          ExpressionAttributeValues: {
            ":status": appointment.status.getValue(),
            ":updatedAt": appointment.updatedAt.toISOString(),
          },
        })
      );
    } catch (error) {
      throw new RepositoryError(
        `Failed to update appointment ${appointment.appointmentId}`,
        error
      );
    }
  }
}
