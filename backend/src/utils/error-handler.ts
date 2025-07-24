import { Request, Response } from '../types/express';
import { AppError, ErrorType } from './errors';
import logger from './logger';

/**
 * Centralized error handling for API responses
 * Formats errors into a consistent response format and logs appropriate details
 * 
 * @param error The error object
 * @param req Express request object
 * @param res Express response object
 * @returns Express response with formatted error
 */
export const handleApiError = (error: any, req: Request, res: Response): Response => {
  // Extract request info for logging
  const requestInfo = {
    path: req.path,
    method: req.method,
    query: req.query,
    ip: req.ip,
    userId: (req as any).user?.id // Access user ID if authenticated
  };

  // Handle AppError instances
  if (error instanceof AppError) {
    // Log based on severity
    if (error.statusCode >= 500) {
      logger.error(`API Error: ${error.message}`, {
        type: error.type,
        requestInfo,
        details: error.details,
        stack: error.stack
      });
    } else {
      logger.warn(`API Error: ${error.message}`, {
        type: error.type,
        requestInfo,
        details: error.details
      });
    }

    // Return formatted error response
    return res.status(error.statusCode).json({
      success: false,
      error: {
        type: error.type,
        message: error.message,
        ...(process.env.NODE_ENV !== 'production' && { details: error.details })
      }
    });
  }
  
  // Handle validation errors (from class-validator)
  if (error?.name === 'ValidationError' || error?.name === 'BadRequestError') {
    const details = error.errors || error.constraints || error.children || error.message;
    
    logger.warn(`Validation Error in API request`, {
      requestInfo,
      details
    });

    return res.status(400).json({
      success: false,
      error: {
        type: ErrorType.VALIDATION_ERROR,
        message: 'Validation failed',
        details: process.env.NODE_ENV !== 'production' ? details : undefined
      }
    });
  }

  // Handle unknown errors
  logger.error(`Unexpected Error in API request`, {
    error: error.message || String(error),
    requestInfo,
    stack: error.stack
  });

  // In production, don't expose error details
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : error.message || String(error);

  return res.status(500).json({
    success: false,
    error: {
      type: ErrorType.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    }
  });
}; 