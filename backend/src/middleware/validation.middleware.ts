import { Request, Response, NextFunction } from 'express';

export function validateDto(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        // Simple pass-through for mock implementation
        next();
    };
} 