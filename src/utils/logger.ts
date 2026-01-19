/**
 * Log severity levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Represents a single log entry with metadata
 */
export interface LogEntry {
  /** The severity level of the log */
  level: LogLevel;
  /** The log message */
  message: string;
  /** When the log was created */
  timestamp: Date;
  /** Additional contextual data */
  context?: Record<string, unknown>;
  /** Error object if applicable */
  error?: Error;
  /** Associated user ID */
  userId?: string;
  /** Request correlation ID */
  requestId?: string;
}

/**
 * Application-wide logging service with level filtering and in-memory storage.
 * 
 * Provides structured logging with multiple severity levels, automatic console output,
 * and in-memory log storage for debugging and diagnostics. Implements singleton pattern
 * to ensure consistent logging across the application.
 * 
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR)
 * - In-memory log buffer (max 1000 entries)
 * - Automatic console output based on level
 * - Context enrichment with metadata
 * - Environment-aware default levels
 * 
 * @example
 * ```typescript
 * import { logger, LogLevel } from './utils/logger';
 * 
 * // Basic logging
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Database query failed', error, { query: 'SELECT...' });
 * 
 * // Change log level
 * logger.setLevel(LogLevel.DEBUG);
 * 
 * // Retrieve logs
 * const recentErrors = logger.getLogs({ level: LogLevel.ERROR, limit: 10 });
 * ```
 * 
 * @class
 * @since 1.0.0
 */
export class Logger {
  private static instance: Logger;
  private minLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {
    if (import.meta.env.DEV) {
      this.minLevel = LogLevel.DEBUG;
    }
  }

  /**
   * Returns the singleton instance of Logger.
   * 
   * @returns The Logger instance
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Sets the minimum log level for output.
   * Logs below this level will be ignored.
   * 
   * @param level - The minimum log level to capture
   * 
   * @example
   * ```typescript
   * logger.setLevel(LogLevel.WARN); // Only show warnings and errors
   * ```
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Logs a debug message.
   * Only visible when log level is DEBUG.
   * 
   * @param message - The debug message
   * @param [context] - Additional context data
   * 
   * @example
   * ```typescript
   * logger.debug('Cache hit', { key: 'user:123', ttl: 3600 });
   * ```
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Logs an informational message.
   * 
   * @param message - The info message
   * @param [context] - Additional context data
   * 
   * @example
   * ```typescript
   * logger.info('User created', { userId: '123', email: 'user@example.com' });
   * ```
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Logs a warning message.
   * 
   * @param message - The warning message
   * @param [context] - Additional context data
   * 
   * @example
   * ```typescript
   * logger.warn('API rate limit approaching', { remaining: 10, limit: 100 });
   * ```
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Logs an error message with optional error object.
   * 
   * @param message - The error message
   * @param [error] - The error object
   * @param [context] - Additional context data
   * 
   * @example
   * ```typescript
   * try {
   *   await riskyOperation();
   * } catch (error) {
   *   logger.error('Operation failed', error, { operation: 'riskyOperation' });
   * }
   * ```
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, { ...context, error });
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const levelPriority = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3
    };

    if (levelPriority[level] < levelPriority[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.output(entry);
  }

  private output(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';

    const logMessage = `${prefix} ${entry.message}${contextStr}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, entry.context?.error);
        break;
    }
  }

  /**
   * Retrieves filtered logs from the in-memory buffer.
   * 
   * @param [options] - Filter options
   * @param [options.level] - Filter by log level
   * @param [options.startTime] - Filter logs after this time
   * @param [options.endTime] - Filter logs before this time
   * @param [options.limit] - Maximum number of logs to return (from end)
   * 
   * @returns Array of filtered log entries
   * 
   * @example
   * ```typescript
   * // Get last 50 error logs
   * const errors = logger.getLogs({ level: LogLevel.ERROR, limit: 50 });
   * 
   * // Get logs from last hour
   * const recent = logger.getLogs({
   *   startTime: new Date(Date.now() - 3600000),
   *   limit: 100
   * });
   * ```
   */
  getLogs(options?: {
    level?: LogLevel;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): LogEntry[] {
    let filtered = this.logs;

    if (options?.level) {
      filtered = filtered.filter(log => log.level === options.level);
    }

    if (options?.startTime) {
      filtered = filtered.filter(log => log.timestamp >= options.startTime!);
    }

    if (options?.endTime) {
      filtered = filtered.filter(log => log.timestamp <= options.endTime!);
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Clears all logs from the in-memory buffer.
   * Useful for testing or memory management.
   * 
   * @example
   * ```typescript
   * logger.clearLogs();
   * ```
   */
  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
