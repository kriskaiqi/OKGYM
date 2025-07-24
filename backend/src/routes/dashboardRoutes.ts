import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  getDashboardData,
  getRecentWorkouts,
  getRecommendedWorkouts,
  getScheduledWorkouts,
  getAchievements,
  getFitnessGoals,
  getBodyMetrics,
  getWeeklyActivity,
  getNotifications,
  getWorkoutStats
} from '../controllers/dashboardController';
import {
  GetRecentWorkoutsDto,
  GetRecommendedWorkoutsDto,
  GetScheduledWorkoutsDto,
  GetWorkoutStatsDto
} from '../dto/dashboard.dto';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Main dashboard endpoint that returns all data
router.get('/', getDashboardData);

// Individual endpoints for specific data
router.get('/recent-workouts', validateRequest(GetRecentWorkoutsDto), getRecentWorkouts);
router.get('/recommended-workouts', validateRequest(GetRecommendedWorkoutsDto), getRecommendedWorkouts);
router.get('/scheduled-workouts', validateRequest(GetScheduledWorkoutsDto), getScheduledWorkouts);
router.get('/achievements', getAchievements);
router.get('/fitness-goals', getFitnessGoals);
router.get('/body-metrics', getBodyMetrics);
router.get('/weekly-activity', getWeeklyActivity);
router.get('/notifications', getNotifications);
router.get('/workout-stats', validateRequest(GetWorkoutStatsDto), getWorkoutStats);

export default router; 