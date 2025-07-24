import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, ErrorType } from '../utils/errors';
import logger from '../utils/logger';
import { config } from '../config';
import { UserRole } from '../models/shared/Enums';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: UserRole;
                isAdmin?: boolean;
            };
        }
    }
}

/**
 * Authentication middleware to protect routes
 * Verifies JWT token from Authorization header and adds user data to request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Check for authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'No token provided', 401);
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'Invalid token format', 401);
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as {
                id: string;
                email: string;
                role: UserRole;
                isAdmin?: boolean;
            };
            
            // Add user data to request
            req.user = decoded;
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AppError(ErrorType.TOKEN_EXPIRED, 'Token expired', 401);
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError(ErrorType.INVALID_TOKEN, 'Invalid token', 401);
            } else {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'Token verification failed', 401);
            }
        }
    } catch (error) {
        logger.warn('Authentication failed', { error });
        next(error);
    }
};

/**
 * Role-based authorization middleware
 * Allows only users with specified roles to access the route
 * 
 * @param roles Array of allowed roles
 */
export const authorizeRoles = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new AppError(ErrorType.AUTHENTICATION_ERROR, 'Not authenticated', 401);
            }

            if (!roles.includes(req.user.role)) {
                throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'Not authorized to access this resource', 403);
            }

            next();
        } catch (error) {
            logger.warn('Authorization failed', { 
                userId: req.user?.id,
                requiredRoles: roles,
                userRole: req.user?.role
            });
            next(error);
        }
    };
}; 