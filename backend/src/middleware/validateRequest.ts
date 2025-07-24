import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Middleware for validating request data against a DTO class
 * 
 * @param dtoClass The DTO class to validate against
 * @param source Where to get data from ('body' or 'query')
 */
export const validateRequest = <T extends object>(dtoClass: new () => T, source: 'body' | 'query' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    // Get data from the appropriate source
    const data = source === 'body' ? req.body : req.query;
    
    // Transform plain object to class instance
    const dtoObject = plainToClass(dtoClass, data);
    
    // Validate using class-validator
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => ({
        property: error.property,
        constraints: error.constraints
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    // Attach validated data to the appropriate request property
    if (source === 'body') {
      req.body = dtoObject as any;
    } else {
      req.query = dtoObject as any;
    }
    
    next();
    return;
  };
}; 