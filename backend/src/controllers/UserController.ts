import { Request, Response, NextFunction } from 'express';
import { services } from '../services';
import { AppError, ErrorType } from '../utils/errors';
import { formatResponse } from '../utils/response-formatter';
import { UserCreateDto, UserUpdateDto, UserFitnessProfileDto, UserPreferencesDto, ChangePasswordDto, UserFilterDto, UserStatsUpdateDto } from '../dto/UserDto';
import logger from '../utils/logger';
import { repositories } from '../repositories';

/**
 * Controller for user-related operations
 */
export class UserController {
  /**
   * Get users with filtering and pagination (admin only)
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id || '';
      const isAdmin = req.user?.isAdmin || false;

      // Check if user has permission to list users
      if (!isAdmin) {
        throw new AppError(
          ErrorType.AUTHORIZATION_ERROR,
          'Only administrators can list users',
          403
        );
      }

      // Parse and validate filter parameters
      const rawFilters = req.query;
      const filterDto = UserFilterDto.formatQueryParams(rawFilters);
      
      // Log the incoming request
      logger.debug('User filter request received', {
        userId: currentUserId,
        filters: {
          ...filterDto,
          searchTerm: filterDto.searchTerm ? `${filterDto.searchTerm.substring(0, 3)}...` : undefined
        }
      });

      // Set default pagination if not provided
      if (!filterDto.limit) filterDto.limit = 20;
      if (filterDto.offset === undefined) filterDto.offset = 0;
      
      // Validate pagination limits
      if (filterDto.limit > 100) {
        filterDto.limit = 100; // Cap at 100 records per page
      }

      // Call service method with timing
      const startTime = Date.now();
      const [users, total] = await services.user.getAll(filterDto, currentUserId, isAdmin);
      const duration = Date.now() - startTime;
      
      // Log performance metrics for slow queries
      if (duration > 1000) {
        logger.warn('Slow user filter query detected', {
          duration,
          filters: filterDto,
          resultCount: users.length,
          totalCount: total
        });
      }

      // Format pagination metadata
      const metadata = {
        limit: filterDto.limit,
        offset: filterDto.offset || 0,
        totalItems: total,
        totalPages: Math.ceil(total / filterDto.limit),
        page: Math.floor(filterDto.offset / filterDto.limit) + 1
      };

      // Send response
      formatResponse(res, {
        data: users,
        metadata,
        message: users.length > 0 
          ? `Successfully retrieved ${users.length} users` 
          : 'No users found matching the criteria'
      });
    } catch (error) {
      logger.error('Error in getUsers controller', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const currentUserId = req.user?.id || '';
      const isAdmin = req.user?.isAdmin || false;

      // Call service method
      const user = await services.user.getById(userId, currentUserId, isAdmin);

      // Send response
      formatResponse(res, { data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile (current authenticated user)
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Log request received with more details
      console.log('\n\n');
      console.log('🚨🚨🚨 PROFILE REQUEST RECEIVED 🚨🚨🚨');
      console.log('Time:', new Date().toISOString());
      console.log('Query params:', req.query);
      console.log('Method:', req.method);
      console.log('Headers:', JSON.stringify({
        'cache-control': req.headers['cache-control'],
        'pragma': req.headers['pragma'],
        'accept': req.headers['accept'],
        'user-agent': req.headers['user-agent']
      }, null, 2));
      
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        console.log('❌ User not authenticated');
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      console.log(`🔍 Getting profile for user: ${currentUserId}`);
      
      // Call getUserProfile service method to get complete profile with relationships
      const profile = await services.user.getUserProfile(currentUserId);
      
      console.log('✅ Profile data retrieved successfully:', JSON.stringify({
        user: profile.user ? { id: profile.user.id, email: profile.user.email } : null,
        stats: profile.stats ? { totalWorkouts: profile.stats.totalWorkouts } : null,
        relationships: {
          fitnessGoals: Array.isArray(profile.fitnessGoals) ? profile.fitnessGoals.length : 0,
          bodyMetrics: Array.isArray(profile.bodyMetrics) ? profile.bodyMetrics.length : 0,
          favoriteWorkouts: Array.isArray(profile.favoriteWorkouts) ? profile.favoriteWorkouts.length : 0,
          recentActivities: Array.isArray(profile.recentActivities) ? profile.recentActivities.length : 0,
          achievements: Array.isArray(profile.achievements) ? profile.achievements.length : 0,
        }
      }, null, 2));

      // Set explicit no-cache headers for all browsers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      // Add extra headers for problematic browsers/proxies
      res.setHeader('Vary', '*');
      res.setHeader('Age', '0');
      
      console.log('✅ No-cache headers set');

      // Send response
      formatResponse(res, { data: profile });
      console.log('✅ Response sent');
      console.log('\n\n');
    } catch (error) {
      console.log('❌ Error in getProfile:', error);
      next(error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get validated DTO from request
      const userDto = req.body as UserCreateDto;

      // Call service method
      const createdUser = await services.user.create(userDto);

      // Send response
      formatResponse(res, {
        data: createdUser,
        message: 'User created successfully'
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user by ID
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const currentUserId = req.user?.id || '';
      const isAdmin = req.user?.isAdmin || false;

      // Get validated DTO from request
      const userDto = req.body as UserUpdateDto;

      // Call service method
      const updatedUser = await services.user.update(userId, userDto, currentUserId, isAdmin);

      // Send response
      formatResponse(res, {
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile (current authenticated user)
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      // Get validated DTO from request
      const userDto = req.body as UserUpdateDto;

      // Call service method with same user ID
      const updatedUser = await services.user.update(currentUserId, userDto, currentUserId, false);

      // Send response
      formatResponse(res, {
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user's fitness profile
   */
  async updateFitnessProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id || req.user?.id;
      const currentUserId = req.user?.id || '';
      const isAdmin = req.user?.isAdmin || false;

      if (!userId) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'User ID is required',
          400
        );
      }

      // Get validated DTO from request
      const fitnessProfileDto = req.body as UserFitnessProfileDto;

      // Call service method
      const updatedUser = await services.user.updateFitnessProfile(
        userId, 
        fitnessProfileDto, 
        currentUserId, 
        isAdmin
      );

      // Send response
      formatResponse(res, {
        data: updatedUser,
        message: 'Fitness profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id || req.user?.id;
      const currentUserId = req.user?.id || '';
      const isAdmin = req.user?.isAdmin || false;

      if (!userId) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'User ID is required',
          400
        );
      }

      // Get validated DTO from request
      const preferencesDto = req.body as UserPreferencesDto;

      // Call service method
      const updatedUser = await services.user.updatePreferences(
        userId, 
        preferencesDto, 
        currentUserId, 
        isAdmin
      );

      // Send response
      formatResponse(res, {
        data: updatedUser,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user stats
   */
  async updateStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      // Get validated DTO from request
      const statsDto = req.body as UserStatsUpdateDto;

      // Log the request
      logger.info(`Updating user stats for ${userId}`, { 
        stats: Object.keys(statsDto)
      });

      // Get the current user data
      const user = await services.user.getById(userId, userId, false);
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          'User not found',
          404
        );
      }

      // Prepare stats update
      const currentStats = user.stats || {};
      const updatedStats = {
        ...currentStats,
        ...statsDto
      };

      // Protect startingWeight from being overwritten if it already exists
      if (currentStats.startingWeight !== undefined && statsDto.startingWeight !== undefined) {
        // Keep the original starting weight and log the attempt
        updatedStats.startingWeight = currentStats.startingWeight;
        logger.info(`Protected startingWeight from being overwritten: original=${currentStats.startingWeight}, attempted=${statsDto.startingWeight}`);
      }

      // Special handling for weightHistory
      if (statsDto.weightHistory) {
        // Ensure current user has a weightHistory array
        if (!currentStats.weightHistory) {
          currentStats.weightHistory = [];
        }
        
        // Handle both array and single object formats
        if (Array.isArray(statsDto.weightHistory)) {
          // Process each weight entry to ensure dates are handled properly
          const processedEntries = statsDto.weightHistory.map((entry: any) => ({
            weight: entry.weight,
            // Convert string dates to Date objects
            date: entry.date instanceof Date ? entry.date : new Date(entry.date)
          }));
          
          // Add new weight entries to history
          updatedStats.weightHistory = [
            ...currentStats.weightHistory,
            ...processedEntries
          ];
        } else {
          // Single weight entry - use type assertion
          const entry = statsDto.weightHistory as any;
          updatedStats.weightHistory = [
            ...currentStats.weightHistory,
            {
              weight: entry.weight,
              // Convert string date to Date object
              date: entry.date instanceof Date ? entry.date : new Date(entry.date)
            }
          ];
        }
      }

      // Update user with new stats
      const updatedUser = await services.user.update(
        userId, 
        { stats: updatedStats }, 
        userId, 
        false
      );

      // Send response
      formatResponse(res, {
        data: updatedUser,
        message: 'Stats updated successfully'
      });
    } catch (error) {
      logger.error('Error updating user stats', error);
      next(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id || req.user?.id;
      const currentUserId = req.user?.id || '';
      const isAdmin = req.user?.isAdmin || false;

      if (!userId) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'User ID is required',
          400
        );
      }

      // Get validated DTO from request
      const { currentPassword, newPassword } = req.body as ChangePasswordDto;

      // Call service method
      await services.user.changePassword(
        userId, 
        currentPassword, 
        newPassword, 
        currentUserId, 
        isAdmin
      );

      // Send response
      formatResponse(res, {
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const currentUserId = req.user?.id || '';
      const isAdmin = req.user?.isAdmin || false;

      // Call service method
      await services.user.delete(userId, currentUserId, isAdmin);

      // Send response
      formatResponse(res, {
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if email is available
   */
  async checkEmailAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.query.email as string;

      if (!email) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Email is required',
          400
        );
      }

      // Call service method
      const isAvailable = await services.user.isEmailAvailable(email);

      // Send response
      formatResponse(res, {
        data: { available: isAvailable }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's fitness progress data
   */
  async getUserProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      // Call service method to get progress data
      const progressData = await services.user.getUserProgress(currentUserId);

      // Send response
      formatResponse(res, { 
        data: progressData,
        message: 'User progress retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getUserProgress controller', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      next(error);
    }
  }

  /**
   * Get user's recent activity
   */
  async getUserActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      // Parse optional limit parameter
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      // Call service method to get user activity
      const activityData = await services.user.getUserActivity(currentUserId, limit);

      // Send response
      formatResponse(res, { 
        data: activityData,
        message: 'User activity retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getUserActivity controller', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      next(error);
    }
  }

  /**
   * Cleanup duplicated fields in user preferences
   */
  async cleanupPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const { removeFields } = req.body;
      
      // Validate removeFields is an array
      if (!Array.isArray(removeFields)) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'removeFields must be an array',
          400
        );
      }
      
      // Get the current user
      const user = await repositories.user.findById(userId);
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${userId} not found`,
          404
        );
      }
      
      // Only modify preferences if it exists
      if (!user.preferences) {
        formatResponse(res, {
          message: 'No preferences to cleanup'
        });
        return;
      }
      
      // Create a copy of the preferences
      const updatedPreferences = { ...user.preferences };
      
      // Remove the specified fields
      let changesCount = 0;
      for (const field of removeFields) {
        if (updatedPreferences[field] !== undefined) {
          delete updatedPreferences[field];
          changesCount++;
        }
      }
      
      // Only update if changes were made
      if (changesCount > 0) {
        // Update user preferences
        await repositories.user.update(userId, { 
          preferences: updatedPreferences 
        });
        
        // Use a service method to update instead of direct cache invalidation
        // This ensures proper cache handling through the service layer
        logger.info('Updated user preferences via cleanup', { 
          userId,
          removedFields: removeFields.filter(field => updatedPreferences[field] === undefined)
        });
      }
      
      // Send response
      formatResponse(res, {
        message: `Preferences cleaned up (${changesCount} fields removed)`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle a workout as a favorite
   */
  async toggleFavoriteWorkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const workoutId = req.params.workoutId;
      if (!workoutId) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Workout ID is required',
          400
        );
      }

      const { action } = req.body;
      if (action !== 'add' && action !== 'remove') {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Action must be either "add" or "remove"',
          400
        );
      }

      logger.info(`Favorite workout operation requested`, {
        userId,
        workoutId,
        action
      });

      let relationModified = false;
      
      if (action === 'remove') {
        // Use the improved repository method for removing
        relationModified = await repositories.user.removeFavoriteWorkout(userId, workoutId);
      } else {
        // Add to favorites - get user and workout
        const user = await repositories.user.findOne({
          where: { id: userId },
          relations: ['favoriteWorkouts']
        });

        if (!user) {
          throw new AppError(
            ErrorType.NOT_FOUND,
            'User not found',
            404
          );
        }

        // Get the workout
        const workout = await repositories.workoutPlan.findOne({
          where: { id: workoutId }
        });

        if (!workout) {
          throw new AppError(
            ErrorType.NOT_FOUND,
            'Workout not found',
            404
          );
        }

        // Initialize favorite workouts array if needed
        if (!user.favoriteWorkouts) {
          user.favoriteWorkouts = [];
        }

        // Check if already a favorite - use String conversion for consistent comparison
        const isAlreadyFavorite = user.favoriteWorkouts.some(
          (favWorkout) => String(favWorkout.id) === String(workoutId)
        );

        if (!isAlreadyFavorite) {
          user.favoriteWorkouts.push(workout);
          await repositories.user.save(user);
          relationModified = true;
          logger.info(`Added workout to favorites`, { userId, workoutId });
        } else {
          logger.info(`Workout already in favorites`, { userId, workoutId });
        }
      }

      // Get the updated favorite count for verification using the improved loader
      const favoriteWorkouts = await services.user.getUserFavoriteWorkouts(userId);
      const finalCount = favoriteWorkouts.length;
      
      // Return success response with more detailed data
      formatResponse(res, {
        data: { 
          success: true,
          action,
          workoutId,
          favoriteCount: finalCount,
          modified: relationModified
        },
        message: action === 'add' 
          ? 'Workout added to favorites' 
          : 'Workout removed from favorites'
      });
    } catch (error) {
      logger.error('Error in toggleFavoriteWorkout operation', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      next(error);
    }
  }

  /**
   * Get user's favorite workouts
   */
  async getFavoriteWorkouts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      // Get user with favorite workouts
      const favoriteWorkouts = await services.user.getUserFavoriteWorkouts(userId);

      // Return the favorite workouts
      formatResponse(res, {
        data: favoriteWorkouts,
        message: 'Favorite workouts retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
} 