import * as mysql from "mysql2/promise";
import { DatabaseError } from "../../shared/errors/custom-errors";

export class DatabaseFactory {
  private static connections: Map<string, mysql.Pool> = new Map();

  static getConnection(country: "PE" | "CL"): mysql.Pool {
    const existing = this.connections.get(country);
    if (existing) {
      return existing;
    }

    const pool = this.createConnection(country);
    this.connections.set(country, pool);
    return pool;
  }

  private static createConnection(country: "PE" | "CL"): mysql.Pool {
    const config = this.getConfig(country);

    if (!config.host || !config.database || !config.user || !config.password) {
      throw new DatabaseError(
        `Missing RDS configuration for ${country}. Check environment variables.`
      );
    }

    return mysql.createPool({
      host: config.host,
      database: config.database,
      user: config.user,
      password: config.password,
      port: config.port,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  private static getConfig(country: "PE" | "CL") {
    if (country === "PE") {
      return {
        host: process.env.RDS_PE_HOST,
        database: process.env.RDS_PE_DATABASE || "appointments_pe",
        user: process.env.RDS_PE_USER,
        password: process.env.RDS_PE_PASSWORD,
        port: 3306,
      };
    } else {
      return {
        host: process.env.RDS_CL_HOST,
        database: process.env.RDS_CL_DATABASE || "appointments_cl",
        user: process.env.RDS_CL_USER,
        password: process.env.RDS_CL_PASSWORD,
        port: 3306,
      };
    }
  }

  static async closeAll(): Promise<void> {
    const promises = Array.from(this.connections.values()).map((pool) =>
      pool.end()
    );
    await Promise.all(promises);
    this.connections.clear();
  }
}
