// @ts-ignore to avoid TypeScript issues
const express = require('express');
import { UserController } from '../controllers/UserController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { UserRole } from '../models/shared/Enums';
import { UserCreateDto, UserUpdateDto, UserFitnessProfileDto, UserPreferencesDto, ChangePasswordDto, UserFilterDto, UserStatsUpdateDto } from '../dto/UserDto';

// Initialize router
const router = express.Router();
const userController = new UserController();

/**
 * User Routes
 * 
 * Routes for user management, including:
 * - User listing with filtering
 * - User creation and management
 * - Profile management
 * - Password management
 */

// Public routes
router.get('/check-email', userController.checkEmailAvailability);

// Admin routes for user management
/**
 * @route GET /api/users
 * @desc Get users with filtering and pagination (admin only)
 * @access Admin
 * 
 * Query parameters:
 * - role: Filter by user role (ADMIN, USER, TRAINER, CONTENT_CREATOR)
 * - status: Filter by user status (ACTIVE, INACTIVE, PENDING, SUSPENDED)
 * - searchTerm: Search in name and email
 * - gender: Filter by gender
 * - activityLevel: Filter by activity level
 * - minimumFitnessLevel: Filter by minimum fitness level
 * - preferredLocation: Filter by preferred workout location
 * - exercisePreferences: Filter by exercise preferences (comma-separated)
 * - targetBodyAreas: Filter by target body areas (comma-separated)
 * - limit: Number of records per page (default: 20, max: 100)
 * - offset: Number of records to skip (default: 0)
 * - sortBy: Field to sort by (default: createdAt)
 * - sortDirection: Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/',
  authenticate,
  authorize([UserRole.ADMIN] as UserRole[]),
  validateRequest(UserFilterDto, 'query'),
  userController.getUsers
);

/**
 * @route GET /api/users/filter
 * @desc Alternative endpoint for user filtering with more detailed options
 * @access Admin
 */
router.get(
  '/filter',
  authenticate,
  authorize([UserRole.ADMIN] as UserRole[]),
  validateRequest(UserFilterDto, 'query'),
  userController.getUsers
);

/**
 * @route POST /api/users
 * @desc Create a new user (admin only)
 * @access Admin
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN] as UserRole[]),
  validateRequest(UserCreateDto),
  userController.createUser
);

// User profile routes (for authenticated users)
/**
 * @route GET /api/users/profile
 * @desc Get current user's profile
 * @access Authenticated
 */
router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

/**
 * @route GET /api/users/profile/v2
 * @desc Get current user's profile (alternate route)
 * @access Authenticated
 */
router.get(
  '/profile/v2',
  authenticate,
  userController.getProfile
);

/**
 * @route GET /api/users/progress
 * @desc Get user's fitness progress data
 * @access Authenticated
 */
router.get(
  '/progress',
  authenticate,
  userController.getUserProgress
);

/**
 * @route GET /api/users/activity
 * @desc Get user's recent activity
 * @access Authenticated
 */
router.get(
  '/activity',
  authenticate,
  userController.getUserActivity
);

/**
 * @route POST /api/users/favorites/workout/:workoutId
 * @desc Toggle a workout as favorite/unfavorite
 * @access Authenticated
 */
router.post(
  '/favorites/workout/:workoutId',
  authenticate,
  userController.toggleFavoriteWorkout
);

/**
 * @route GET /api/users/favorites/workouts
 * @desc Get user's favorite workouts
 * @access Authenticated
 */
router.get(
  '/favorites/workouts',
  authenticate,
  userController.getFavoriteWorkouts
);

/**
 * @route PUT /api/users/profile
 * @desc Update current user's profile
 * @access Authenticated
 */
router.put(
  '/profile',
  authenticate,
  validateRequest(UserUpdateDto),
  userController.updateProfile
);

router.put(
  '/profile/fitness',
  authenticate,
  validateRequest(UserFitnessProfileDto),
  userController.updateFitnessProfile
);

router.put(
  '/profile/preferences',
  authenticate,
  validateRequest(UserPreferencesDto),
  userController.updatePreferences
);

/**
 * @route PUT /api/users/stats
 * @desc Update user stats
 * @access Authenticated
 */
router.put(
  '/stats',
  authenticate,
  validateRequest(UserStatsUpdateDto),
  userController.updateStats
);

/**
 * @route POST /api/users/preferences/cleanup
 * @desc Clean up duplicated fields in user preferences
 * @access Authenticated
 */
router.post(
  '/preferences/cleanup',
  authenticate,
  userController.cleanupPreferences
);

router.post(
  '/change-password',
  authenticate,
  validateRequest(ChangePasswordDto),
  userController.changePassword
);

// User routes with ID parameter
router.get(
  '/:id',
  authenticate,
  userController.getUserById
);

router.put(
  '/:id',
  authenticate,
  validateRequest(UserUpdateDto),
  userController.updateUser
);

router.put(
  '/:id/fitness',
  authenticate,
  validateRequest(UserFitnessProfileDto),
  userController.updateFitnessProfile
);

router.put(
  '/:id/preferences',
  authenticate,
  validateRequest(UserPreferencesDto),
  userController.updatePreferences
);

router.post(
  '/:id/change-password',
  authenticate,
  validateRequest(ChangePasswordDto),
  userController.changePassword
);

router.delete(
  '/:id',
  authenticate,
  userController.deleteUser
);

export default router; 