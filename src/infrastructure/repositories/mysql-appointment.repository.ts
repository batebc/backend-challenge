import type { Pool, RowDataPacket } from "mysql2/promise";
import type {
  RDSAppointmentRepository,
  RDSAppointmentData,
} from "../../core/ports/rds-repository.interface";
import { RepositoryError } from "../../shared/errors/custom-errors";

export class MySQLAppointmentRepository implements RDSAppointmentRepository {
  constructor(private readonly pool: Pool) {}

  async save(data: RDSAppointmentData): Promise<void> {
    const connection = await this.pool.getConnection();

    try {
      const query = `
        INSERT INTO appointments (
          appointment_id,
          insured_id,
          schedule_id,
          country_iso,
          created_at
        ) VALUES (?, ?, ?, ?, ?)
      `;

      await connection.execute(query, [
        data.appointmentId,
        data.insuredId,
        data.scheduleId,
        data.countryISO,
        data.createdAt,
      ]);
    } catch (error) {
      throw new RepositoryError(
        `Failed to save appointment to RDS: ${data.appointmentId}`,
        error
      );
    } finally {
      connection.release();
    }
  }

  async findById(appointmentId: string): Promise<RDSAppointmentData | null> {
    const connection = await this.pool.getConnection();

    try {
      const query = `
        SELECT 
          appointment_id as appointmentId,
          insured_id as insuredId,
          schedule_id as scheduleId,
          country_iso as countryISO,
          created_at as createdAt
        FROM appointments
        WHERE appointment_id = ?
      `;

      const [rows] = await connection.execute<RowDataPacket[]>(query, [
        appointmentId,
      ]);

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as RDSAppointmentData;
    } catch (error) {
      throw new RepositoryError(
        `Failed to find appointment in RDS: ${appointmentId}`,
        error
      );
    } finally {
      connection.release();
    }
  }
}
