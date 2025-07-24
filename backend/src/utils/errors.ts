/**
 * Error types for the application
 */
export enum ErrorType {
  // Auth errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  
  // Service errors
  SERVICE_ERROR = 'SERVICE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Generic errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED'
}

/**
 * Custom application error class
 * Standardizes error handling throughout the application
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode: number;
  details?: any;
  
  /**
   * Create a new application error
   * 
   * @param type Error type
   * @param message User-friendly error message
   * @param statusCode HTTP status code
   * @param details Additional error details (for logging)
   */
  constructor(type: ErrorType, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      error: {
        type: this.type,
        message: this.message,
        ...(this.details ? { details: this.details } : {})
      }
    };
  }
  
  /**
   * Convert error to plain object for logging
   */
  toObject() {
    return {
      name: this.name,
      type: this.type,
      statusCode: this.statusCode,
      message: this.message,
      details: this.details,
      stack: this.stack
    };
  }
  
  /**
   * Factory method to create an authentication error
   */
  static authentication(message: string = 'Authentication failed', details?: any): AppError {
    return new AppError(ErrorType.AUTHENTICATION_ERROR, message, 401, details);
  }
  
  /**
   * Factory method to create an authorization error
   */
  static authorization(message: string = 'You do not have permission to perform this action', details?: any): AppError {
    return new AppError(ErrorType.AUTHORIZATION_ERROR, message, 403, details);
  }
  
  /**
   * Factory method to create a not found error
   */
  static notFound(message: string = 'Resource not found', details?: any): AppError {
    return new AppError(ErrorType.NOT_FOUND, message, 404, details);
  }
  
  /**
   * Factory method to create a validation error
   */
  static validation(message: string = 'Validation failed', details?: any): AppError {
    return new AppError(ErrorType.VALIDATION_ERROR, message, 400, details);
  }
  
  /**
   * Factory method to create a conflict error
   */
  static conflict(message: string = 'Resource already exists', details?: any): AppError {
    return new AppError(ErrorType.CONFLICT, message, 409, details);
  }
  
  /**
   * Factory method to create a database error
   */
  static database(message: string = 'Database operation failed', details?: any): AppError {
    return new AppError(ErrorType.DATABASE_ERROR, message, 500, details);
  }
  
  /**
   * Factory method to create a business rule violation error
   */
  static businessRule(message: string, details?: any): AppError {
    return new AppError(ErrorType.BUSINESS_RULE_VIOLATION, message, 422, details);
  }
}

/**
 * Convert unknown error to AppError
 * 
 * @param error Unknown error
 * @param defaultMessage Default error message
 * @returns Standardized AppError
 */
export function normalizeError(error: unknown, defaultMessage: string = 'An unexpected error occurred'): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(
      ErrorType.INTERNAL_ERROR,
      error.message || defaultMessage,
      500,
      { originalError: error.name, stack: error.stack }
    );
  }
  
  return new AppError(
    ErrorType.INTERNAL_ERROR,
    typeof error === 'string' ? error : defaultMessage,
    500,
    { originalError: error }
  );
}

/**
 * Extract error details from database errors
 * 
 * @param error Database error
 * @returns Standardized error details
 */
export function extractDatabaseErrorDetails(error: any): any {
  // Handle common database errors
  // This can be expanded based on the database being used
  
  const details: any = {
    originalError: error.name || 'DatabaseError'
  };
  
  // Extract constraint violation details (PostgreSQL-specific)
  if (error.code === '23505') { // Unique violation
    details.constraint = error.constraint;
    details.type = 'UniqueViolation';
    details.message = 'A record with this data already exists';
  }
  
  // Extract foreign key violation details
  if (error.code === '23503') { // Foreign key violation
    details.constraint = error.constraint;
    details.type = 'ForeignKeyViolation';
    details.message = 'Referenced record does not exist';
  }
  
  return details;
} 