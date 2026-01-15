/**
 * Structured Logger Utility
 * 
 * Provides structured logging with consistent format for CloudWatch Logs.
 * All logs are JSON-formatted for easy parsing and filtering.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  requestId?: string;
  userId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  [key: string]: any;
}

class Logger {
  private serviceName: string;
  private environment: string;
  private logLevel: LogLevel;

  constructor(serviceName: string = 'flowlogic-backend') {
    this.serviceName = serviceName;
    this.environment = process.env.STAGE || process.env.NODE_ENV || 'dev';
    
    // Set log level from environment variable
    const envLogLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
    this.logLevel = LogLevel[envLogLevel as keyof typeof LogLevel] || LogLevel.INFO;
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Create base log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      environment: this.environment,
      ...context,
    };

    // Extract requestId from context if present
    if (context?.requestId) {
      entry.requestId = context.requestId;
      delete context.requestId;
    }

    // Extract userId from context if present
    if (context?.userId) {
      entry.userId = context.userId;
      delete context.userId;
    }

    return entry;
  }

  /**
   * Output log entry to console (JSON format)
   */
  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // Use console.error for ERROR and WARN, console.log for others
    const outputMethod = entry.level === LogLevel.ERROR || entry.level === LogLevel.WARN
      ? console.error
      : console.log;

    outputMethod(JSON.stringify(entry));
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.output(this.createLogEntry(LogLevel.DEBUG, message, context));
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.output(this.createLogEntry(LogLevel.INFO, message, context));
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.output(this.createLogEntry(LogLevel.WARN, message, context));
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const logEntry = this.createLogEntry(LogLevel.ERROR, message, context);

    if (error instanceof Error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: this.environment === 'production' ? undefined : error.stack,
      };
    } else if (error) {
      logEntry.error = {
        name: 'UnknownError',
        message: String(error),
      };
    }

    this.output(logEntry);
  }

  /**
   * Log HTTP request
   */
  request(req: { method: string; path: string; ip?: string }, context?: LogContext): void {
    this.info(`${req.method} ${req.path}`, {
      ...context,
      httpMethod: req.method,
      httpPath: req.path,
      clientIp: req.ip,
    });
  }

  /**
   * Log HTTP response
   */
  response(
    req: { method: string; path: string },
    statusCode: number,
    latency?: number,
    context?: LogContext
  ): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = `${req.method} ${req.path} ${statusCode}`;

    this.output(this.createLogEntry(level, message, {
      ...context,
      httpMethod: req.method,
      httpPath: req.path,
      httpStatus: statusCode,
      latency,
    }));
  }

  /**
   * Log with correlation ID (for distributed tracing)
   */
  withRequestId(requestId: string): Logger {
    const logger = new Logger(this.serviceName);
    logger.logLevel = this.logLevel;
    logger.environment = this.environment;
    
    // Create a proxy that adds requestId to all log calls
    return new Proxy(logger, {
      get(target, prop) {
        const original = target[prop as keyof Logger];
        if (typeof original === 'function' && prop !== 'withRequestId') {
          return function(...args: any[]) {
            const lastArg = args[args.length - 1];
            if (lastArg && typeof lastArg === 'object' && !Array.isArray(lastArg) && !(lastArg instanceof Error)) {
              lastArg.requestId = requestId;
            } else {
              args.push({ requestId });
            }
            return (original as Function).apply(target, args);
          };
        }
        return original;
      },
    }) as Logger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for custom instances
export { Logger };
