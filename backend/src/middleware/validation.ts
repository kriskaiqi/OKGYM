import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppError, ErrorType } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Format validation errors into a user-friendly structure
 * 
 * @param errors Array of ValidationError objects
 * @returns Formatted validation errors
 */
const formatValidationErrors = (errors: ValidationError[]): Record<string, string[]> => {
  const formattedErrors: Record<string, string[]> = {};
  
  for (const error of errors) {
    // Get property name
    const property = error.property;
    
    // Get error messages
    const messages: string[] = [];
    
    // Extract constraint messages
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    
    // Handle nested errors
    if (error.children && error.children.length > 0) {
      const nestedErrors = formatValidationErrors(error.children);
      
      // Add nested errors with prefixed property name
      for (const [nestedProp, nestedMessages] of Object.entries(nestedErrors)) {
        const fullProp = `${property}.${nestedProp}`;
        formattedErrors[fullProp] = nestedMessages;
      }
    }
    
    // Add messages if any
    if (messages.length > 0) {
      formattedErrors[property] = messages;
    }
  }
  
  return formattedErrors;
};

/**
 * DTO validation middleware
 * Validates request data against a DTO class using class-validator
 * 
 * @param dtoClass The DTO class to validate against
 * @param source Where to look for data (body, query, params)
 * @param options Additional options
 */
export function validateRequest(
  dtoClass: any, 
  source: 'body' | 'query' | 'params' = 'body',
  options: { skipMissingProperties?: boolean } = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get data from request based on source
      const data = req[source];
      
      // Transform plain object to class instance
      const dtoObject = plainToInstance(dtoClass, data);
      
      // Validate against class-validator decorators
      const errors = await validate(dtoObject, {
        skipMissingProperties: options.skipMissingProperties || false,
        whitelist: true,
        forbidNonWhitelisted: true
      });
      
      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = formatValidationErrors(errors);
        
        logger.warn('Validation failed', {
          path: req.path,
          method: req.method,
          errors: formattedErrors
        });
        
        // Throw validation error
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Validation failed',
          400,
          formattedErrors
        );
      }
      
      // Update request data with validated and transformed object
      req[source] = dtoObject;
      
      next();
    } catch (error) {
      // Pass to error handler
      next(error);
    }
  };
} 