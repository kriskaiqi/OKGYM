// @ts-ignore to avoid TypeScript issues
const express = require('express');
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError, ErrorType } from '../utils/errors';
import { UserRole } from '../models/shared/Enums';
import logger from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import { formatErrorResponseAndSend } from '../utils/response-formatter';

// Extend the Express Request interface to include user information
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
 * Interface for the decoded JWT token payload
 */
interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('Authentication failed: No token provided');
      return formatErrorResponseAndSend(res, { message: 'Authentication required' }, 401);
    }
    
    // Extract the token from the 'Bearer <token>' format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;
    
    // Verify the token
    const jwtSecret = config.jwt.secret;
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Check if the token has expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      logger.warn('Authentication failed: Token expired');
      return formatErrorResponseAndSend(res, { message: 'Token expired' }, 401);
    }
    
    // Add user info to the request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      isAdmin: decoded.role === UserRole.ADMIN
    };
    
    logger.debug('User authenticated', { id: decoded.id, role: decoded.role });
    next();
  } catch (error) {
    logger.error('Authentication error', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return formatErrorResponseAndSend(res, { message: 'Invalid token' }, 401);
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return formatErrorResponseAndSend(res, { message: 'Token expired' }, 401);
    }
    
    return formatErrorResponseAndSend(res, { message: 'Authentication error' }, 500);
  }
};

/**
 * Middleware to authorize requests based on user role
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn('Authorization failed: No authenticated user');
        return formatErrorResponseAndSend(res, { message: 'Authentication required' }, 401);
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Authorization failed: Insufficient privileges', { 
          id: req.user.id, 
          role: req.user.role, 
          requiredRoles: allowedRoles 
        });
        return formatErrorResponseAndSend(res, { message: 'Insufficient privileges' }, 403);
      }
      
      logger.debug('User authorized', { 
        id: req.user.id, 
        role: req.user.role 
      });
      next();
    } catch (error) {
      logger.error('Authorization error', error);
      return formatErrorResponseAndSend(res, { message: 'Authorization error' }, 500);
    }
  };
};

/**
 * Middleware to restrict access to admin users only
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  authorize([UserRole.ADMIN])(req, res, next);
};

/**
 * Middleware to restrict access to trainers and admins
 */
export const trainerAndAbove = (req: Request, res: Response, next: NextFunction) => {
  authorize([UserRole.ADMIN, UserRole.TRAINER])(req, res, next);
}; 
