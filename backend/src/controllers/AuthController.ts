import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { validateOrReject } from 'class-validator';
import { formatSuccessResponse, formatErrorResponse } from '../utils/response-formatter';

/**
 * Controller for authentication operations
 */
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('User registration request received');

      // Extract all registration data
      const { 
        email, 
        password, 
        firstName, 
        lastName,
        gender,
        birthYear,
        height,
        fitnessLevel,
        mainGoal,
        activityLevel,
        stats,
        preferences,
        bodyMetrics,
        fitnessGoals,
        fitnessProfile 
      } = req.body;

      // Basic validation of required fields
      if (!email || !password || !firstName || !lastName) {
        res.status(400).json(formatErrorResponse('Missing required fields'));
        return;
      }

      // Prepare complete registration data
      const userData = {
        email,
        password,
        firstName,
        lastName,
        // Include all optional fields
        gender,
        birthYear,
        height,
        fitnessLevel,
        mainGoal,
        activityLevel,
        stats,
        preferences,
        bodyMetrics,
        fitnessGoals,
        fitnessProfile
      };

      // Register the user
      const result = await this.authService.register(userData);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh'
      });

      // Return user data and access token
      res.status(201).json(formatSuccessResponse({
        user: result.user,
        token: result.token
      }, 'User registered successfully'));
    } catch (error) {
      logger.error('Registration error', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode || 400).json(formatErrorResponse(error.message));
        return;
      }
      
      res.status(500).json(formatErrorResponse('Registration failed'));
    }
  };

  /**
   * Login a user
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Login request received');

      // Validate input
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json(formatErrorResponse('Email and password are required'));
        return;
      }

      // Authenticate the user
      const result = await this.authService.login({ email, password });

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh'
      });

      // Return user data and access token
      res.status(200).json(formatSuccessResponse({
        user: result.user,
        token: result.token
      }, 'Login successful'));
    } catch (error) {
      logger.error('Login error', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode || 401).json(formatErrorResponse(error.message));
        return;
      }
      
      res.status(500).json(formatErrorResponse('Login failed'));
    }
  };

  /**
   * Refresh access token using refresh token
   */
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Token refresh request received');

      // Get refresh token from cookie
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json(formatErrorResponse('Refresh token required'));
        return;
      }

      // Generate new tokens
      const result = await this.authService.refreshToken({ refreshToken });

      // Set new refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh'
      });

      // Return new access token
      res.status(200).json(formatSuccessResponse({
        token: result.token
      }, 'Token refreshed successfully'));
    } catch (error) {
      logger.error('Token refresh error', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode || 401).json(formatErrorResponse(error.message));
        return;
      }
      
      res.status(500).json(formatErrorResponse('Token refresh failed'));
    }
  };

  /**
   * Logout a user
   */
  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Logout request received');

      // Get user ID from authenticated request
      const userId = req.user?.id;
      const refreshToken = req.cookies.refreshToken;

      if (!userId || !refreshToken) {
        res.status(400).json(formatErrorResponse('User ID and refresh token required'));
        return;
      }

      // Invalidate refresh token
      await this.authService.logout(userId, refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        path: '/api/auth/refresh'
      });

      res.status(200).json(formatSuccessResponse(null, 'Logout successful'));
    } catch (error) {
      logger.error('Logout error', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode || 500).json(formatErrorResponse(error.message));
        return;
      }
      
      res.status(500).json(formatErrorResponse('Logout failed'));
    }
  };

  /**
   * Get the authenticated user's profile
   */
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Get profile request received');

      // Get user ID from authenticated request
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(formatErrorResponse('Authentication required'));
        return;
      }

      // Get user profile
      const user = await this.authService.getUserById(userId);

      if (!user) {
        res.status(404).json(formatErrorResponse('User not found'));
        return;
      }

      res.status(200).json(formatSuccessResponse({ user }, 'Profile retrieved successfully'));
    } catch (error) {
      logger.error('Get profile error', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode || 500).json(formatErrorResponse(error.message));
        return;
      }
      
      res.status(500).json(formatErrorResponse('Failed to retrieve profile'));
    }
  };

  /**
   * Update the authenticated user's fitness profile
   */
  public updateFitnessProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Update fitness profile request received');

      // Get user ID from authenticated request
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(formatErrorResponse('Authentication required'));
        return;
      }

      // Update fitness profile
      const updatedUser = await this.authService.updateFitnessProfile(userId, req.body);

      res.status(200).json(formatSuccessResponse({ user: updatedUser }, 'Fitness profile updated successfully'));
    } catch (error) {
      logger.error('Update fitness profile error', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode || 500).json(formatErrorResponse(error.message));
        return;
      }
      
      res.status(500).json(formatErrorResponse('Failed to update fitness profile'));
    }
  };

  /**
   * Get a user's profile by ID
   */
  public getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Get user profile by ID request received');

      const userId = req.params.id;

      if (!userId) {
        res.status(400).json(formatErrorResponse('User ID is required'));
        return;
      }

      // Get user profile
      const user = await this.authService.getUserById(userId);

      if (!user) {
        res.status(404).json(formatErrorResponse('User not found'));
        return;
      }

      res.status(200).json(formatSuccessResponse({ user }, 'Profile retrieved successfully'));
    } catch (error) {
      logger.error('Get user profile error', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode || 500).json(formatErrorResponse(error.message));
        return;
      }
      
      res.status(500).json(formatErrorResponse('Failed to retrieve profile'));
    }
  };

  /**
   * Get all users (admin only)
   */
  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Get all users request received');

      // Fetch all users
      const users = await this.authService.getAllUsers();

      res.status(200).json(formatSuccessResponse({ users }, 'Users retrieved successfully'));
    } catch (error) {
      logger.error('Get all users error', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode || 500).json(formatErrorResponse(error.message));
        return;
      }
      
      res.status(500).json(formatErrorResponse('Failed to retrieve users'));
    }
  };
} 