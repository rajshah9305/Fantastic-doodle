/**
 * Centralized logging utilities
 * Provides structured logging for debugging and monitoring
 */

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
}

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private format(entry: LogEntry): string {
    const { timestamp, level, module, message, data, error } = entry;
    let output = `[${timestamp}] [${level}] [${module}] ${message}`;

    if (data && Object.keys(data).length > 0) {
      output += ` ${JSON.stringify(data)}`;
    }

    if (error) {
      output += ` ERROR: ${error}`;
    }

    return output;
  }

  private log(level: LogLevel, module: string, message: string, data?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      ...(data && { data }),
      ...(error && { error: error.message }),
    };

    const formatted = this.format(entry);

    // Always log errors
    if (level === "ERROR") {
      console.error(formatted);
      if (error && this.isDev) {
        console.error(error.stack);
      }
    } else if (level === "WARN") {
      console.warn(formatted);
    } else if (this.isDev || level === "INFO") {
      console.log(formatted);
    }
  }

  debug(module: string, message: string, data?: Record<string, unknown>) {
    this.log("DEBUG", module, message, data);
  }

  info(module: string, message: string, data?: Record<string, unknown>) {
    this.log("INFO", module, message, data);
  }

  warn(module: string, message: string, data?: Record<string, unknown>) {
    this.log("WARN", module, message, data);
  }

  error(module: string, message: string, error?: Error, data?: Record<string, unknown>) {
    this.log("ERROR", module, message, data, error);
  }
}

export const logger = new Logger();

/**
 * Request logging middleware for Express
 */
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();
  const path = `${req.method} ${req.path}`;

  logger.debug("HTTP", `→ ${path}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusMsg =
      statusCode >= 400
        ? "ERROR"
        : statusCode >= 300
        ? "REDIRECT"
        : "SUCCESS";

    logger.info("HTTP", `← ${path}`, {
      statusCode,
      duration: `${duration}ms`,
      status: statusMsg,
    });
  });

  next();
}
