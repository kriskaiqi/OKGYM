import { Request, Response, NextFunction } from '../types/express';
import { AppError, ErrorType } from '../utils/errors';
import { UserRole } from '../models/shared/Enums';

/**
 * Middleware to verify if the authenticated user is an admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): Response | void => {
  try {
    // User should be attached by the authenticate middleware
    if (!req.user) {
      throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
    }

    // Check if user has admin role
    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'Admin privileges required', 403);
    }

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Authorization error'
    });
  }
}; 