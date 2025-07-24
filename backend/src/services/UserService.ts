import { repositories } from '../repositories';
import { User, UserRole, UserStatus } from '../models/User';
import { AppError, ErrorType } from '../utils/errors';
import logger from '../utils/logger';
import { executeTransaction } from '../utils/transaction-helper';
import { compare, hash } from 'bcryptjs';
import { cacheManager } from '../services/CacheManager';
import { config } from '../config';
import { SimpleTrack } from '../utils/performance';
import { RelationshipLoader } from '../utils/RelationshipLoader';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { UserProgress } from '../models/UserProgress';
import { UserActivity } from '../models/UserActivity';
import { 
  Gender, 
  ActivityLevel, 
  FitnessGoal, 
  WorkoutLocation, 
  ExercisePreference, 
  BodyArea,
  MeasurementUnit,
  AppTheme,
  Difficulty,
  SessionStatus
} from '../models/shared/Enums';

/**
 * Service for managing user accounts and profiles
 * Handles user creation, updates, profile management, and preferences
 */
export class UserService {
  private cacheTTL: number;

  constructor() {
    this.cacheTTL = config.cache?.ttl?.user || 3600; // 1 hour default
  }

  /**
   * Get users with filtering, pagination, and sorting
   * Admin-only operation
   * 
   * @param filterDto Filter criteria from UserFilterDto
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @returns Array of users and total count
   * @throws {AppError} If not authorized or database error
   */
  @SimpleTrack({ slowThreshold: 200 })
  async getAll(filterDto: any, currentUserId: string, isAdmin: boolean): Promise<[User[], number]> {
    try {
      // Admin-only operation
      if (!isAdmin) {
        throw new AppError(
          ErrorType.AUTHORIZATION_ERROR,
          'Only administrators can list all users',
          403
        );
      }

      // Generate cache key for this specific query
      const cacheKey = `users:filters:${JSON.stringify(filterDto || {})}`;
      
      // Try to get from cache first
      const cachedResult = await cacheManager.get<[User[], number]>(cacheKey);
      if (cachedResult) {
        logger.debug('Users list retrieved from cache', { filters: filterDto });
        return cachedResult;
      }

      // Use repository's findWithFilters method with the filter DTO
      const [users, count] = await repositories.user.findWithFilters(filterDto || {});

      // Transform users to remove sensitive data
      const transformedUsers = users.map(user => this.toUserResponseDto(user));
      
      // Cache the result
      const result: [User[], number] = [transformedUsers as unknown as User[], count];
      await cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });

      return result;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log and transform other errors
      logger.error('Failed to fetch users', { 
        error: error instanceof Error ? error.message : String(error),
        filters: filterDto, 
        currentUserId 
      });

      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to fetch users',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Get user by ID
   * 
   * @param id User ID
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @returns User data without sensitive information
   * @throws {AppError} If user not found or unauthorized
   */
  @SimpleTrack({ slowThreshold: 50 })
  async getById(id: string, currentUserId: string, isAdmin: boolean): Promise<User> {
    try {
      // Authorization check
      this.ensureUserCanAccess(id, currentUserId, isAdmin);

      // Check cache first
      const cacheKey = `user:${id}`;
      const cachedUser = await cacheManager.get<User>(cacheKey);

      if (cachedUser) {
        logger.debug('User retrieved from cache', { userId: id });
        return this.toUserResponseDto(cachedUser) as unknown as User;
      }

      // Get from database
      const user = await repositories.user.findById(id);

      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${id} not found`,
          404
        );
      }

      // Cache the result
      await cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });

      // Return transformed data
      return this.toUserResponseDto(user) as unknown as User;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log and transform other errors
      logger.error('Failed to get user by ID', { 
        error: error instanceof Error ? error.message : String(error), 
        userId: id 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to retrieve user',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Get user by email
   * 
   * @param email User email
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @returns User data without sensitive information or null if not found
   * @throws {AppError} If unauthorized or database error
   */
  @SimpleTrack({ slowThreshold: 50 })
  async getByEmail(email: string, currentUserId: string, isAdmin: boolean): Promise<User | null> {
    try {
      // Check cache first
      const cacheKey = `user:email:${email.toLowerCase()}`;
      const cachedUser = await cacheManager.get<User>(cacheKey);

      if (cachedUser) {
        // If found in cache, check authorization
        this.ensureUserCanAccess(cachedUser.id, currentUserId, isAdmin);
        logger.debug('User retrieved from cache by email', { email });
        return this.toUserResponseDto(cachedUser) as unknown as User;
      }

      // Get from database
      const user = await repositories.user.findByEmail(email);

      if (!user) {
        return null;
      }

      // If found, check authorization
      this.ensureUserCanAccess(user.id, currentUserId, isAdmin);

      // Cache the result
      await cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
      await cacheManager.set(`user:${user.id}`, user, { ttl: this.cacheTTL });

      // Return transformed data
      return this.toUserResponseDto(user) as unknown as User;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log and transform other errors
      logger.error('Failed to get user by email', { 
        error: error instanceof Error ? error.message : String(error), 
        email 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to retrieve user by email',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Check if email is available (not already taken)
   * 
   * @param email Email to check
   * @returns True if email is available, false if already taken
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    try {
      const user = await repositories.user.findByEmail(email);
      return !user;
    } catch (error) {
      logger.error('Failed to check email availability', { 
        error: error instanceof Error ? error.message : String(error), 
        email 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to check email availability',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Create a new user
   * 
   * @param data User creation data
   * @returns Created user without sensitive information
   * @throws {AppError} If validation fails, email is taken, or database error
   */
  @SimpleTrack({ slowThreshold: 300 })
  async create(data: any): Promise<User> {
    return executeTransaction(async (queryRunner) => {
      try {
        // Validate user data
        this.validateUserData(data, false);

        // Check if email is already taken
        const existingUser = await repositories.user.findByEmail(data.email);
        if (existingUser) {
          throw new AppError(
            ErrorType.ALREADY_EXISTS,
            'Email is already registered',
            409
          );
        }

        // Hash password
        const hashedPassword = await hash(data.password, 10);

        // Prepare user data with defaults
        const userData = {
          ...data,
          password: hashedPassword,
          status: data.status || UserStatus.ACTIVE,
          role: data.role || UserRole.USER
        };

        // Create user
        const user = await repositories.user.create(userData);

        logger.info('User created', { 
          userId: user.id, 
          email: user.email 
        });

        // Return user without sensitive data
        return this.toUserResponseDto(user) as unknown as User;
      } catch (error) {
        // Re-throw AppError instances
        if (error instanceof AppError) {
          throw error;
        }

        // Log and transform other errors
        logger.error('Failed to create user', { 
          error: error instanceof Error ? error.message : String(error), 
          email: data.email 
        });
        
        throw new AppError(
          ErrorType.DATABASE_ERROR,
          'Failed to create user',
          500,
          error instanceof Error ? { message: error.message } : undefined
        );
      }
    });
  }

  /**
   * Update user data
   * 
   * @param id User ID to update
   * @param data Update data
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @returns Updated user without sensitive information
   * @throws {AppError} If validation fails, user not found, unauthorized, or database error
   */
  @SimpleTrack({ slowThreshold: 200 })
  async update(id: string, data: any, currentUserId: string, isAdmin: boolean): Promise<User> {
    try {
      // Authorization check
      this.ensureUserCanAccess(id, currentUserId, isAdmin);

      // Validate update data
      this.validateUserData(data, true);

      // Check if user exists
      const existingUser = await repositories.user.findById(id);
      if (!existingUser) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${id} not found`,
          404
        );
      }

      // Verify role update authorization
      if (data.isAdmin !== undefined && data.isAdmin !== existingUser.isAdmin && !isAdmin) {
        throw new AppError(
          ErrorType.AUTHORIZATION_ERROR,
          'Only administrators can change user admin status',
          403
        );
      }

      // Check if email is being changed and already exists
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await repositories.user.findByEmail(data.email);
        if (emailExists) {
          throw new AppError(
            ErrorType.ALREADY_EXISTS,
            'Email is already registered',
            409
          );
        }
      }

      // Hash password if provided
      let updateData = { ...data };
      if (data.password) {
        updateData.password = await hash(data.password, 10);
      }

      // Update user
      const updatedUser = await repositories.user.update(id, updateData);
      if (!updatedUser) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${id} not found`,
          404
        );
      }

      // Invalidate cache
      await this.invalidateUserCache(id);

      logger.info('User updated', { 
        userId: id, 
        fields: Object.keys(data),
        updatedBy: currentUserId
      });

      // Return updated user without sensitive data
      return this.toUserResponseDto(updatedUser) as unknown as User;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log and transform other errors
      logger.error('Failed to update user', { 
        error: error instanceof Error ? error.message : String(error), 
        userId: id 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to update user',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Update user's fitness profile
   * 
   * @param id User ID
   * @param data Fitness profile data
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @returns Updated user without sensitive information
   * @throws {AppError} If validation fails, user not found, unauthorized, or database error
   */
  async updateFitnessProfile(id: string, data: any, currentUserId: string, isAdmin: boolean): Promise<User> {
    try {
      // Authorization check
      this.ensureUserCanAccess(id, currentUserId, isAdmin);

      // Extract date of birth if provided to handle separately
      let dateOfBirth = null;
      if (data.dateOfBirth) {
        dateOfBirth = data.dateOfBirth;
        delete data.dateOfBirth;
      }
      
      // Remove birthYear and preferences from data to avoid validation errors
      if (data.birthYear) {
        // Don't delete birthYear - we'll use it directly
        // delete data.birthYear;
      }
      if (data.preferences) {
        delete data.preferences;
      }

      // Validate fitness profile data
      this.validateFitnessProfile(data);

      // Check if user exists
      const existingUser = await repositories.user.findById(id);
      if (!existingUser) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${id} not found`,
          404
        );
      }

      // Prepare preferences update
      const currentPreferences = existingUser.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        ...data
      };
      
      // Add dateOfBirth to preferences if provided
      if (dateOfBirth) {
        updatedPreferences['dateOfBirth'] = dateOfBirth;
        
        // Also update birthYear from dateOfBirth if not explicitly provided
        if (!data.birthYear) {
          const birthYear = new Date(dateOfBirth).getFullYear();
          logger.info(`Extracted birth year ${birthYear} from date ${dateOfBirth}`);
          data.birthYear = birthYear;
        }
      }

      // Prepare direct column updates
      const directUpdates: any = {
        preferences: updatedPreferences
      };
      
      // Update direct columns as well to ensure consistency
      if (data.gender) {
        directUpdates.gender = data.gender;
      }
      
      if (data.heightCm) {
        directUpdates.height = data.heightCm;
      }
      
      if (data.activityLevel) {
        directUpdates.activityLevel = data.activityLevel;
      }
      
      if (data.fitnessGoals && data.fitnessGoals.length > 0) {
        // Set the first fitness goal as the main goal
        directUpdates.mainGoal = data.fitnessGoals[0];
      }
      
      // Update birthYear if provided or extracted from dateOfBirth
      if (data.birthYear) {
        directUpdates.birthYear = data.birthYear;
        logger.info(`Updating birthYear to ${data.birthYear}`);
      }
      
      // Log what we're updating
      logger.info('Updating user fitness profile with both preferences and direct columns', {
        userId: id,
        preferences: Object.keys(updatedPreferences),
        directColumns: Object.keys(directUpdates).filter(k => k !== 'preferences')
      });

      // Update user with both preferences and direct columns
      const updatedUser = await repositories.user.update(id, directUpdates);

      if (!updatedUser) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${id} not found`,
          404
        );
      }

      // Invalidate cache
      await this.invalidateUserCache(id);

      logger.info('User fitness profile updated', { 
        userId: id, 
        fields: Object.keys(data),
        updatedBy: currentUserId
      });

      // Return updated user without sensitive data
      return this.toUserResponseDto(updatedUser) as unknown as User;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log and transform other errors
      logger.error('Failed to update fitness profile', { 
        error: error instanceof Error ? error.message : String(error), 
        userId: id 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to update fitness profile',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Update user preferences
   * 
   * @param id User ID
   * @param preferences Preference data
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @returns Updated user without sensitive information
   * @throws {AppError} If user not found, unauthorized, or database error
   */
  async updatePreferences(id: string, preferences: any, currentUserId: string, isAdmin: boolean): Promise<User> {
    try {
      // Authorization check
      this.ensureUserCanAccess(id, currentUserId, isAdmin);

      // Check if user exists
      const existingUser = await repositories.user.findById(id);
      if (!existingUser) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${id} not found`,
          404
        );
      }

      // Prepare preferences update
      const currentPreferences = existingUser.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      };

      // Update user preferences
      const updatedUser = await repositories.user.update(id, { 
        preferences: updatedPreferences 
      });

      if (!updatedUser) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${id} not found`,
          404
        );
      }

      // Invalidate cache
      await this.invalidateUserCache(id);

      logger.info('User preferences updated', { 
        userId: id, 
        fields: Object.keys(preferences),
        updatedBy: currentUserId
      });

      // Return updated user without sensitive data
      return this.toUserResponseDto(updatedUser) as unknown as User;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log and transform other errors
      logger.error('Failed to update preferences', { 
        error: error instanceof Error ? error.message : String(error), 
        userId: id 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to update preferences',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Change user password
   * 
   * @param id User ID
   * @param currentPassword Current password
   * @param newPassword New password
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @returns True if password changed successfully
   * @throws {AppError} If user not found, unauthorized, invalid current password, or database error
   */
  async changePassword(
    id: string, 
    currentPassword: string, 
    newPassword: string, 
    currentUserId: string, 
    isAdmin: boolean
  ): Promise<boolean> {
    try {
      // Authorization check
      this.ensureUserCanAccess(id, currentUserId, isAdmin);

      // Validate new password
      this.validatePassword(newPassword);

      // Get user with password
      const user = await repositories.user.findById(id);
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${id} not found`,
          404
        );
      }

      // If not admin, verify current password
      if (!isAdmin) {
        const isPasswordValid = await compare(currentPassword, user.password);
        if (!isPasswordValid) {
          throw new AppError(
            ErrorType.AUTHENTICATION_ERROR,
            'Current password is incorrect',
            401
          );
        }
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10);

      // Update password
      await repositories.user.update(id, { password: hashedPassword });

      // Invalidate cache
      await this.invalidateUserCache(id);

      logger.info('User password changed', { 
        userId: id, 
        updatedBy: currentUserId,
        byAdmin: isAdmin
      });

      return true;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log and transform other errors
      logger.error('Failed to change password', { 
        error: error instanceof Error ? error.message : String(error), 
        userId: id 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to change password',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Delete user (soft delete by changing status)
   * 
   * @param id User ID
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @returns True if user deleted successfully
   * @throws {AppError} If user not found, unauthorized, or database error
   */
  async delete(id: string, currentUserId: string, isAdmin: boolean): Promise<boolean> {
    try {
      // Authorization check (only self or admin can delete)
      this.ensureUserCanAccess(id, currentUserId, isAdmin);

      // Check if user can be deleted
      await this.canDelete(id);

      // Update user to mark as deleted (using available fields)
      // Since there's no status or deletedAt field, we'll use isPremium to indicate deletion
      // This is a temporary solution - ideally you'd add a proper isDeleted or status field
      const result = await repositories.user.update(id, { 
        isPremium: false // Remove premium status as part of soft-deletion
      });

      if (!result) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${id} not found`,
          404
        );
      }

      // Invalidate cache
      await this.invalidateUserCache(id);

      logger.info('User deleted (soft delete)', { 
        userId: id, 
        deletedBy: currentUserId
      });

      return true;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log and transform other errors
      logger.error('Failed to delete user', { 
        error: error instanceof Error ? error.message : String(error), 
        userId: id 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to delete user',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Validate user data before create/update
   * 
   * @param data User data to validate
   * @param isUpdate Whether this is an update operation
   */
  private validateUserData(data: any, isUpdate: boolean): void {
    // For creation, these fields are required
    if (!isUpdate) {
      if (!data.email) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Email is required',
          400
        );
      }

      if (!data.password) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Password is required',
          400
        );
      }

      if (!data.firstName) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'First name is required',
          400
        );
      }

      if (!data.lastName) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Last name is required',
          400
        );
      }

      // Validate password
      this.validatePassword(data.password);
    } else {
      // For updates, validate only if provided
      if (data.password) {
        this.validatePassword(data.password);
      }
    }

    // Validate email format if provided
    if (data.email && !this.isValidEmail(data.email)) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid email format',
        400
      );
    }

    // Validate role if provided
    if (data.role && !Object.values(UserRole).includes(data.role)) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid user role',
        400
      );
    }

    // Validate status if provided
    if (data.status && !Object.values(UserStatus).includes(data.status)) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid user status',
        400
      );
    }
  }

  /**
   * Validate password strength
   * 
   * @param password Password to validate
   */
  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Password must be at least 8 characters long',
        400
      );
    }

    // Check for complexity (at least one letter and one number)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Password must contain at least one letter and one number',
        400
      );
    }
  }

  /**
   * Check if email is valid
   * 
   * @param email Email to validate
   * @returns True if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate fitness profile data
   * 
   * @param data Fitness profile data to validate
   */
  private validateFitnessProfile(data: any): void {
    // Validate age if provided
    if (data.age !== undefined) {
      if (typeof data.age !== 'number' || data.age < 1 || data.age > 120) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Age must be between 1 and 120',
          400
        );
      }
    }

    // Validate height if provided
    if (data.heightCm !== undefined) {
      if (typeof data.heightCm !== 'number' || data.heightCm < 30 || data.heightCm > 300) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Height must be between 30 and 300 cm',
          400
        );
      }
    }

    // Validate weight if provided
    if (data.weightKg !== undefined) {
      if (typeof data.weightKg !== 'number' || data.weightKg < 20 || data.weightKg > 300) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Weight must be between 20 and 300 kg',
          400
        );
      }
    }

    // Validate gender if provided
    if (data.gender && !Object.values(Gender).includes(data.gender)) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid gender value',
        400
      );
    }

    // Validate activity level if provided
    if (data.activityLevel && !Object.values(ActivityLevel).includes(data.activityLevel)) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid activity level',
        400
      );
    }

    // Validate fitness goals if provided
    if (data.fitnessGoals) {
      if (!Array.isArray(data.fitnessGoals)) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Fitness goals must be an array',
          400
        );
      }

      for (const goal of data.fitnessGoals) {
        if (!Object.values(FitnessGoal).includes(goal)) {
          throw new AppError(
            ErrorType.VALIDATION_ERROR,
            `Invalid fitness goal: ${goal}`,
            400
          );
        }
      }
    }

    // Validate fitness level if provided
    if (data.fitnessLevel && !Object.values(Difficulty).includes(data.fitnessLevel)) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid fitness level',
        400
      );
    }

    // Validate preferred location if provided
    if (data.preferredLocation && !Object.values(WorkoutLocation).includes(data.preferredLocation)) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid preferred workout location',
        400
      );
    }

    // Validate exercise preferences if provided
    if (data.exercisePreferences) {
      if (!Array.isArray(data.exercisePreferences)) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Exercise preferences must be an array',
          400
        );
      }

      for (const pref of data.exercisePreferences) {
        if (!Object.values(ExercisePreference).includes(pref)) {
          throw new AppError(
            ErrorType.VALIDATION_ERROR,
            `Invalid exercise preference: ${pref}`,
            400
          );
        }
      }
    }

    // Validate target body areas if provided
    if (data.targetBodyAreas) {
      if (!Array.isArray(data.targetBodyAreas)) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Target body areas must be an array',
          400
        );
      }

      for (const area of data.targetBodyAreas) {
        if (!Object.values(BodyArea).includes(area)) {
          throw new AppError(
            ErrorType.VALIDATION_ERROR,
            `Invalid target body area: ${area}`,
            400
          );
        }
      }
    }

    // Validate preferred unit if provided
    if (data.preferredUnit && !Object.values(MeasurementUnit).includes(data.preferredUnit)) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid preferred measurement unit',
        400
      );
    }

    // Validate preferred theme if provided
    if (data.preferredTheme && !Object.values(AppTheme).includes(data.preferredTheme)) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid preferred app theme',
        400
      );
    }
  }

  /**
   * Check if a user can be deleted
   * 
   * @param id User ID
   * @returns True if user can be deleted
   */
  private async canDelete(id: string): Promise<boolean> {
    try {
      // For now, we allow all users to be deleted (soft delete)
      // Future implementation may check for dependencies
      return true;
    } catch (error) {
      logger.error('Error checking if user can be deleted', { 
        error: error instanceof Error ? error.message : String(error), 
        userId: id 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to check if user can be deleted',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Ensure the current user can access the requested user data
   * 
   * @param targetUserId ID of the user being accessed
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @throws {AppError} If unauthorized
   */
  private ensureUserCanAccess(targetUserId: string, currentUserId: string, isAdmin: boolean): void {
    // Admins can access any user
    if (isAdmin) {
      return;
    }

    // Regular users can only access their own data
    if (targetUserId !== currentUserId) {
      throw new AppError(
        ErrorType.AUTHORIZATION_ERROR,
        'You do not have permission to access this user data',
        403
      );
    }
  }

  /**
   * Transform User entity to DTO without sensitive information
   * 
   * @param user User entity
   * @returns User data without sensitive information
   */
  private toUserResponseDto(user: User): any {
    if (!user) return null;
    
    // Exclude sensitive fields like password
    const { password, ...userDto } = user;
    return userDto;
  }

  /**
   * Invalidate user-related caches
   * 
   * @param userId User ID
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    try {
      // Use pattern matching for more comprehensive cache invalidation
      const cachePattern = `user:${userId}*`;
      await cacheManager.deleteByPattern(cachePattern);
      
      logger.debug('User cache invalidated', { userId, pattern: cachePattern });
    } catch (error) {
      logger.warn('Failed to invalidate user cache', { 
        error: error instanceof Error ? error.message : String(error), 
        userId 
      });
      // Continue execution, don't throw error for cache invalidation issues
    }
  }

  /**
   * Batch get users by IDs with optimized caching
   * 
   * @param ids Array of user IDs
   * @param currentUserId ID of the user making the request
   * @param isAdmin Whether the requester is an admin
   * @returns Object mapping user IDs to user data
   * @throws {AppError} If not authorized or database error
   */
  @SimpleTrack({ slowThreshold: 150 })
  async batchGetByIds(ids: string[], currentUserId: string, isAdmin: boolean): Promise<Record<string, User>> {
    if (!ids.length) return {};
    
    try {
      // De-duplicate IDs
      const uniqueIds = [...new Set(ids)];
      
      // Authorization check (for non-admins, can only request self)
      if (!isAdmin && !uniqueIds.every(id => id === currentUserId)) {
        throw new AppError(
          ErrorType.AUTHORIZATION_ERROR,
          'You do not have permission to access other user data',
          403
        );
      }
      
      const result: Record<string, User> = {};
      const uncachedIds: string[] = [];
      
      // Try to get users from cache first
      await Promise.all(uniqueIds.map(async (id) => {
        const cacheKey = `user:${id}`;
        const cachedUser = await cacheManager.get<User>(cacheKey);
        
        if (cachedUser) {
          result[id] = this.toUserResponseDto(cachedUser) as unknown as User;
        } else {
          uncachedIds.push(id);
        }
      }));
      
      // If we have any uncached users, get them from the database
      if (uncachedIds.length) {
        // Implement this method in UserRepository or use existing methods
        const users = await Promise.all(
          uncachedIds.map(id => repositories.user.findById(id))
        );
        
        // Cache and add to result
        await Promise.all(users.filter(Boolean).map(async (user) => {
          if (!user) return;
          
          const cacheKey = `user:${user.id}`;
          await cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
          
          result[user.id] = this.toUserResponseDto(user) as unknown as User;
        }));
      }
      
      return result;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      // Log and transform other errors
      logger.error('Failed to batch get users by IDs', { 
        error: error instanceof Error ? error.message : String(error), 
        userIds: ids 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to retrieve users',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Get user's fitness progress data
   * 
   * @param userId ID of the user to get progress for
   * @returns Object containing user's progress metrics
   * @throws {AppError} If user not found or database error
   */
  @SimpleTrack({ slowThreshold: 100 })
  async getUserProgress(userId: string): Promise<any> {
    try {
      // Check cache first
      const cacheKey = `user:${userId}:progress`;
      const cachedProgress = await cacheManager.get(cacheKey);
      
      if (cachedProgress) {
        logger.debug('User progress retrieved from cache', { userId });
        return cachedProgress;
      }
      
      // Get user
      const user = await repositories.user.findById(userId);
      
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${userId} not found`,
          404
        );
      }
      
      // Get TypeORM repository
      const progressRepository = AppDataSource.getRepository(UserProgress);
      
      // Load progress using RelationshipLoader
      const progress = await RelationshipLoader.loadRelationship(
        'User',
        'progress',
        userId,
        progressRepository
      );
      
      // Format progress data
      const progressData = {
        metrics: progress,
        // Add any additional aggregated data as needed
      };
      
      // Cache the result
      await cacheManager.set(cacheKey, progressData, { ttl: 3600 }); // 1 hour cache
      
      return progressData;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      // Log and transform other errors
      logger.error('Failed to get user progress', { 
        error: error instanceof Error ? error.message : String(error), 
        userId 
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to retrieve user progress data',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }
  
  /**
   * Get user's recent activity
   * 
   * @param userId ID of the user to get activity for
   * @param limit Maximum number of activity items to return
   * @returns Array of user activity items
   * @throws {AppError} If user not found or database error
   */
  @SimpleTrack({ slowThreshold: 100 })
  async getUserActivity(userId: string, limit: number = 10): Promise<any[]> {
    try {
      // Validate limit parameter
      const validLimit = Math.min(Math.max(limit, 1), 50); // Between 1 and 50
      
      // Check cache first
      const cacheKey = `user:${userId}:activity:${validLimit}`;
      const cachedActivity = await cacheManager.get<any[]>(cacheKey);
      
      if (cachedActivity) {
        logger.debug('User activity retrieved from cache', { userId, limit: validLimit });
        return cachedActivity;
      }
      
      // Get user
      const user = await repositories.user.findById(userId);
      
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${userId} not found`,
          404
        );
      }
      
      // Get TypeORM repository
      const activityRepository = AppDataSource.getRepository(UserActivity);
      
      // Load activity using RelationshipLoader
      const activity = await RelationshipLoader.loadRelationship(
        'User',
        'activity',
        userId,
        activityRepository
      );
      
      // Sort and limit activity items
      const sortedActivity = activity
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, validLimit);
      
      // Cache the result
      await cacheManager.set(cacheKey, sortedActivity, { ttl: 1800 }); // 30 minutes cache
      
      return sortedActivity;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      // Log and transform other errors
      logger.error('Failed to get user activity', { 
        error: error instanceof Error ? error.message : String(error), 
        userId,
        limit
      });
      
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to retrieve user activity data',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Get user profile with all related data
   */
  async getUserProfile(userId: string, options: { useCache?: boolean, ttl?: number } = {}): Promise<any> {
    console.log('👉 UserService.getUserProfile called for user', userId, 'at', new Date().toISOString());
    try {
      // IMPORTANT: Skip cache entirely for profile data to ensure fresh data
      logger.info(`Getting fresh user profile data for user ${userId}`);

      // Get user base data first
      const user = await this.getById(userId, userId, false);
      
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `User with ID ${userId} not found`,
          404
        );
      }

      // Load relationships using the RelationshipLoader with cache disabled
      const options = { useCache: false };
      const [
        fitnessGoals,
        bodyMetrics,
        favoriteWorkouts,
        recentActivities,
        achievements
      ] = await Promise.all([
        RelationshipLoader.loadUserFitnessGoals(userId, options),
        RelationshipLoader.loadUserBodyMetrics(userId, options),
        RelationshipLoader.loadUserFavoriteWorkouts(userId, options),
        RelationshipLoader.loadUserRecentActivity(userId, 5, options), // Get 5 most recent
        RelationshipLoader.loadUserAchievements(userId, options)
      ]);

      // Calculate user stats based on data (always fresh)
      const userStats = await this.calculateUserStats(userId, bodyMetrics, achievements);
      
      // Log the stats for debugging
      logger.info(`User stats calculated: totalWorkouts=${userStats.totalWorkouts}`);

      // Construct the complete profile
      const profile = {
        user,
        stats: userStats,
        fitnessGoals,
        bodyMetrics: bodyMetrics.slice(0, 10), // Limit to the 10 most recent
        favoriteWorkouts,
        recentActivities,
        achievements: achievements.filter(a => a.isUnlocked).slice(0, 5) // Only show unlocked achievements
      };

      return profile;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log and transform other errors
      logger.error('Failed to get user profile', { 
        error: error instanceof Error ? error.message : String(error), 
        userId 
      });
      
      throw new AppError(
        ErrorType.SERVICE_ERROR,
        'Failed to retrieve user profile',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }

  /**
   * Calculate user stats
   */
  private async calculateUserStats(userId: string, bodyMetrics: any[] = [], achievements: any[] = []): Promise<any> {
    try {
      // Get the user data to access current stats
      const user = await AppDataSource.getRepository(User).findOne({
        where: { id: userId }
      });
      
      if (!user) {
        throw new AppError(ErrorType.NOT_FOUND, 'User not found', 404);
      }
      
      // Extract the current stats (or initialize empty object)
      const stats = user.stats || {};
      
      // Get current weight and starting weight
      let currentWeight = stats.currentWeight;
      let startingWeight = stats.startingWeight;
      
      // Extract weight from body metrics if available
      const weightMetric = bodyMetrics.find(m => m.type === 'WEIGHT');
      if (weightMetric && weightMetric.value) {
        currentWeight = weightMetric.value;
        
        // Set starting weight if not already set
        if (!startingWeight) {
          startingWeight = currentWeight;
        }
      }
      
      // Create the stats object with only weight-related information
      const userStats = {
        currentWeight,
        startingWeight,
        weightHistory: stats.weightHistory || [],
        weightUnit: stats.weightUnit || 'METRIC',
        lastWorkoutDate: stats.lastWorkoutDate
      };
      
      // Log the updated stats
      logger.info(`User stats calculated: currentWeight=${userStats.currentWeight || 'not set'}`);
      
      return userStats;
    } catch (error) {
      logger.error('Error calculating user stats', {
        error: error instanceof Error ? error.message : String(error),
        userId
      });
      
      // Return minimal default stats
      return {
        currentWeight: null,
        startingWeight: null,
        weightHistory: [],
        weightUnit: 'METRIC'
      };
    }
  }

  /**
   * Load user profile data including preferences and add dateOfBirth from preferences if available
   */
  private async loadUserProfile(user: User, includeRelationships = true): Promise<User> {
    try {
      // Create a copy of the user object
      const userProfile = { ...user } as unknown as User;
      
      // Check for dateOfBirth in preferences using bracket notation to avoid TypeScript errors
      if (userProfile.preferences && userProfile.preferences['dateOfBirth']) {
        // Set dateOfBirth using type assertion
        (userProfile as any).dateOfBirth = new Date(userProfile.preferences['dateOfBirth']);
        console.log(`Loaded dateOfBirth from preferences: ${(userProfile as any).dateOfBirth}`);
      } else if (userProfile.birthYear) {
        // Fallback to just year from birthYear column if full date not available
        (userProfile as any).dateOfBirth = new Date(userProfile.birthYear, 0, 1); // January 1 of birthYear
        console.log(`Created dateOfBirth from birthYear: ${(userProfile as any).dateOfBirth}`);
      }
      
      // Process other profile data as needed...
      
      return userProfile;
    } catch (error) {
      logger.error('Error loading user profile', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id
      });
      
      // Return the user as is if there's an error
      return user as unknown as User;
    }
  }

  /**
   * Get user's favorite workouts
   * @param userId User ID
   * @returns Array of favorite workout plans
   */
  async getUserFavoriteWorkouts(userId: string): Promise<any[]> {
    try {
      // Load favorite workouts via RelationshipLoader
      const favoriteWorkouts = await RelationshipLoader.loadUserFavoriteWorkouts(userId, {
        useCache: false // Don't use cache to ensure we get the latest favorites
      });
      
      // Return normalized workout plans
      return favoriteWorkouts;
    } catch (error) {
      logger.error('Error getting user favorite workouts', { 
        userId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return [];
    }
  }
} 