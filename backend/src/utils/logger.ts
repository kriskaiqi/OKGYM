import { config } from '../config';

/**
 * Log levels enum
 */
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Simple logger utility
 */
class Logger {
  private level: LogLevel;

  constructor() {
    // Set log level from config
    this.level = this.getLogLevelFromString(config.logger?.level || 'info');
  }

  /**
   * Convert string log level to enum
   */
  private getLogLevelFromString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  /**
   * Format log message with timestamp and metadata
   */
  private formatLog(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let formattedMeta = '';
    
    if (meta) {
      try {
        formattedMeta = JSON.stringify(meta);
      } catch (e) {
        formattedMeta = '[Unserializable data]';
      }
    }
    
    return `[${timestamp}] [${level}] ${message}${meta ? ' ' + formattedMeta : ''}`;
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.formatLog('DEBUG', message, meta));
    }
  }

  /**
   * Log info message
   */
  info(message: string, meta?: any): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.formatLog('INFO', message, meta));
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: any): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatLog('WARN', message, meta));
    }
  }

  /**
   * Log error message
   */
  error(message: string, meta?: any): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatLog('ERROR', message, meta));
    }
  }

  /**
   * Set log level
   */
  setLevel(level: string): void {
    this.level = this.getLogLevelFromString(level);
  }
}

// Export logger singleton
export default new Logger(); 