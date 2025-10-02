export class Logger {
  constructor(private readonly context: string) {}

  private log(level: string, message: string, meta?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(meta && { meta }),
    };

    console.log(JSON.stringify(logEntry));
  }

  info(message: string, meta?: any) {
    this.log("INFO", message, meta);
  }

  warn(message: string, meta?: any) {
    this.log("WARN", message, meta);
  }

  error(message: string, error?: unknown, meta?: any) {
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    this.log("ERROR", message, { ...meta, error: errorDetails });
  }

  debug(message: string, meta?: any) {
    if (process.env.LOG_LEVEL === "DEBUG") {
      this.log("DEBUG", message, meta);
    }
  }
}

export function getLogger(context: string): Logger {
  return new Logger(context);
}
