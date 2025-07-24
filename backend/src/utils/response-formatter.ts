import { Response } from 'express';

/**
 * Interface for standardized API responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  metadata?: any;
  error?: {
    type?: string;
    message?: string;
    details?: any;
  };
}

/**
 * Format a success response
 * 
 * @param res Express response object
 * @param options Response options (data, message, metadata)
 * @param statusCode HTTP status code (default: 200)
 */
export function formatResponse<T>(
  res: Response,
  options: {
    data?: T;
    message?: string;
    metadata?: any;
  },
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    ...options
  };

  res.status(statusCode).json(response);
}

/**
 * Format a success response with data and optional message
 * 
 * @param data Data to include in the response
 * @param message Optional success message
 * @returns Formatted success response
 */
export function formatSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

/**
 * Format a paginated response
 * 
 * @param data Array of items
 * @param total Total number of items
 * @param page Current page number
 * @param pageSize Number of items per page
 * @returns Formatted paginated response
 */
export function formatPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  pageSize: number = 20
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    metadata: createPaginationMetadata(total, page, pageSize)
  };
}

/**
 * Format an error response and send it
 * 
 * @param res Express response object
 * @param options Error options (type, message, details)
 * @param statusCode HTTP status code (default: 500)
 */
export function formatErrorResponseAndSend(
  res: Response,
  options: {
    type?: string;
    message?: string;
    details?: any;
  },
  statusCode: number = 500
): void {
  const response: ApiResponse = {
    success: false,
    error: {
      ...options
    }
  };

  res.status(statusCode).json(response);
}

/**
 * Create a simple error response object
 * 
 * @param message Error message
 * @param type Optional error type
 * @param details Optional error details
 * @returns Error response object
 */
export function formatErrorResponseObject(
  message: string,
  type?: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      ...(type && { type }),
      ...(details && { details })
    }
  };
}

/**
 * Create a simple error response (for direct response without the Response object)
 * 
 * @param message Error message or error object with message property
 * @returns Error response object
 */
export function formatErrorResponse(message: string | Error): ApiResponse {
  const errorMessage = message instanceof Error ? message.message : message;
  
  return {
    success: false,
    error: {
      message: errorMessage
    }
  };
}

/**
 * Create a pagination metadata object
 * 
 * @param total Total number of items
 * @param page Current page (1-based)
 * @param pageSize Number of items per page
 * @returns Pagination metadata
 */
export function createPaginationMetadata(
  total: number,
  page: number = 1,
  pageSize: number = 20
): any {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasMore: page * pageSize < total
  };
} 