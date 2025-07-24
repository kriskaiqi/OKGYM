import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { WorkoutSession, WorkoutSummary } from '../models/WorkoutSession';
import { Achievement } from '../models/Achievement';
import { FitnessGoal } from '../models/FitnessGoal';
import { BodyMetric } from '../models/BodyMetric';
import { Notification } from '../models/Notification';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { Between } from 'typeorm';
import { UserRole, SessionStatus } from '../models/shared/Enums';
import { AppError, ErrorType } from '../utils/errors';
import logger from '../utils/logger';
import { RelationshipLoader } from '../utils/RelationshipLoader';
import { WorkoutSessionService } from '../services/WorkoutSessionService';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
    isAdmin?: boolean;
  };
}

// Type for workout with relationships
interface WorkoutWithRelations extends Omit<WorkoutSession, 'summary'> {
  workoutPlan: WorkoutPlan;
  summary?: WorkoutSummary;
}

// Initialize session service
const sessionService = new WorkoutSessionService();

export const getRecentWorkouts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const userId = req.user.id;

    // Get base workouts
    const workouts = await AppDataSource
      .getRepository(WorkoutSession)
      .find({
        where: { user: { id: userId } },
        order: { startTime: 'DESC' },
        take: limit
      }) as WorkoutWithRelations[];

    if (workouts.length > 0) {
      const workoutIds = workouts.map(w => w.id);
      
      // Batch load relationships
      const [workoutPlansMap, summariesMap] = await Promise.all([
        RelationshipLoader.loadRelationshipBatch(
          'WorkoutSession',
          'workoutPlan',
          workoutIds,
          AppDataSource.getRepository(WorkoutPlan)
        ),
        RelationshipLoader.loadRelationshipBatch(
          'WorkoutSession',
          'summary',
          workoutIds,
          AppDataSource.getRepository(WorkoutSummary)
        )
      ]);

      // Attach relationships
      workouts.forEach(workout => {
        workout.workoutPlan = workoutPlansMap.get(workout.id)?.[0] as WorkoutPlan;
        workout.summary = summariesMap.get(workout.id)?.[0] as WorkoutSummary;
      });
    }

    res.json(workouts);
  } catch (error) {
    logger.error('Error fetching recent workouts:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching recent workouts', 500, error));
  }
};

export const getRecommendedWorkouts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 4;
    const userId = req.user.id;

    // Get base workouts
    const workouts = await AppDataSource
      .getRepository(WorkoutSession)
      .find({
        where: { 
          user: { id: userId },
          status: SessionStatus.COMPLETED 
        },
        order: { startTime: 'DESC' },
        take: limit
      }) as WorkoutWithRelations[];

    if (workouts.length > 0) {
      const workoutIds = workouts.map(w => w.id);
      
      // Batch load relationships
      const [workoutPlansMap, summariesMap] = await Promise.all([
        RelationshipLoader.loadRelationshipBatch(
          'WorkoutSession',
          'workoutPlan',
          workoutIds,
          AppDataSource.getRepository(WorkoutPlan)
        ),
        RelationshipLoader.loadRelationshipBatch(
          'WorkoutSession',
          'summary',
          workoutIds,
          AppDataSource.getRepository(WorkoutSummary)
        )
      ]);

      // Attach relationships
      workouts.forEach(workout => {
        workout.workoutPlan = workoutPlansMap.get(workout.id)?.[0] as WorkoutPlan;
        workout.summary = summariesMap.get(workout.id)?.[0] as WorkoutSummary;
      });
    }

    res.json(workouts);
  } catch (error) {
    logger.error('Error fetching recommended workouts:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching recommended workouts', 500, error));
  }
};

export const getScheduledWorkouts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;
    const userId = req.user.id;

    // Get base workouts
    const workouts = await AppDataSource
      .getRepository(WorkoutSession)
      .find({
        where: { 
          user: { id: userId },
          status: SessionStatus.PENDING,
          startTime: Between(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // Next 7 days
        },
        order: { startTime: 'ASC' },
        take: limit
      }) as WorkoutWithRelations[];

    if (workouts.length > 0) {
      const workoutIds = workouts.map(w => w.id);
      
      // Batch load relationships
      const [workoutPlansMap, summariesMap] = await Promise.all([
        RelationshipLoader.loadRelationshipBatch(
          'WorkoutSession',
          'workoutPlan',
          workoutIds,
          AppDataSource.getRepository(WorkoutPlan)
        ),
        RelationshipLoader.loadRelationshipBatch(
          'WorkoutSession',
          'summary',
          workoutIds,
          AppDataSource.getRepository(WorkoutSummary)
        )
      ]);

      // Attach relationships
      workouts.forEach(workout => {
        workout.workoutPlan = workoutPlansMap.get(workout.id)?.[0] as WorkoutPlan;
        workout.summary = summariesMap.get(workout.id)?.[0] as WorkoutSummary;
      });
    }

    res.json(workouts);
  } catch (error) {
    logger.error('Error fetching scheduled workouts:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching scheduled workouts', 500, error));
  }
};

export const getAchievements = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 5;

    const achievements = await AppDataSource
      .getRepository(Achievement)
      .find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        take: limit
      });

    res.json(achievements);
  } catch (error) {
    logger.error('Error fetching achievements:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching achievements', 500, error));
  }
};

export const getFitnessGoals = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 3;

    const goals = await AppDataSource
      .getRepository(FitnessGoal)
      .find({
        where: { user: { id: userId } },
        order: { deadline: 'ASC' },
        take: limit
      });

    res.json(goals);
  } catch (error) {
    logger.error('Error fetching fitness goals:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching fitness goals', 500, error));
  }
};

export const getBodyMetrics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 5;

    const metrics = await AppDataSource
      .getRepository(BodyMetric)
      .find({
        where: { user: { id: userId } },
        order: { measurementDate: 'DESC' },
        take: limit
      });

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching body metrics:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching body metrics', 500, error));
  }
};

export const getWeeklyActivity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));

    const workouts = await AppDataSource
      .getRepository(WorkoutSession)
      .find({
        where: {
          user: { id: userId },
          status: SessionStatus.COMPLETED,
          startTime: Between(weekStart, new Date())
        }
      });

    // Create array of 7 days with workout counts
    const activity = Array(7).fill(0);
    workouts.forEach(workout => {
      if (workout.startTime) {
        const dayIndex = new Date(workout.startTime).getDay();
        activity[dayIndex]++;
      }
    });

    res.json(activity);
  } catch (error) {
    logger.error('Error fetching weekly activity:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching weekly activity', 500, error));
  }
};

export const getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 5;

    const notifications = await AppDataSource
      .getRepository(Notification)
      .find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        take: limit
      });

    res.json(notifications);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching notifications', 500, error));
  }
};

export const getWorkoutStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get base workouts
    const workouts = await AppDataSource
      .getRepository(WorkoutSession)
      .find({
        where: {
          user: { id: userId },
          status: SessionStatus.COMPLETED,
          startTime: Between(startDate, new Date())
        },
        order: { startTime: 'ASC' }
      }) as WorkoutWithRelations[];

    if (workouts.length > 0) {
      const workoutIds = workouts.map(w => w.id);
      
      // Batch load summaries
      const summariesMap = await RelationshipLoader.loadRelationshipBatch(
        'WorkoutSession',
        'summary',
        workoutIds,
        AppDataSource.getRepository(WorkoutSummary)
      );

      // Attach summaries
      workouts.forEach(workout => {
        workout.summary = summariesMap.get(workout.id)?.[0] as WorkoutSummary;
      });
    }

    // Calculate stats
    const stats = {
      totalWorkouts: workouts.length,
      totalDuration: workouts.reduce((sum, workout) => sum + (workout.summary?.totalDuration || 0), 0),
      averageDuration: workouts.length > 0 
        ? workouts.reduce((sum, workout) => sum + (workout.summary?.totalDuration || 0), 0) / workouts.length 
        : 0,
      totalCaloriesBurned: workouts.reduce((sum, workout) => sum + (workout.summary?.caloriesBurned || 0), 0),
      averageCaloriesBurned: workouts.length > 0
        ? workouts.reduce((sum, workout) => sum + (workout.summary?.caloriesBurned || 0), 0) / workouts.length
        : 0
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching workout stats:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching workout stats', 500, error));
  }
};

export const getDashboardData = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    
    logger.info(`Fetching dashboard data for user ${userId}`);
    
    // Determine the start of the current week (Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek); // Go back to Sunday
    weekStart.setHours(0, 0, 0, 0); // Start of day
    
    logger.info(`Week start date: ${weekStart.toISOString()}`);

    // Fetch only current week's completed sessions
    const weeklySessionsResult = await sessionService.getUserSessions(
      userId, 
      { 
        status: SessionStatus.COMPLETED,
        startDateMin: weekStart, // Only fetch from current week
        limit: undefined // No limit needed since we're date-filtering
      }
    );
    
    // These are all sessions for this week only
    const weeklyActivity = weeklySessionsResult[0];
    
    logger.info(`Found ${weeklyActivity.length} completed sessions for current week`);

    // Fetch a limited number of recent sessions for the Recent Workouts display
    const recentSessionsResult = await sessionService.getUserSessions(
      userId, 
      { 
        status: SessionStatus.COMPLETED,
        limit: 5 // Limit for display purposes only
      }
    );
    
    const recentSessions = recentSessionsResult[0];
    
    // Create array of 7 days with workout counts
    const activity = Array(7).fill(0);
    weeklyActivity.forEach(workout => {
      if (workout.startTime) {
        const startTime = new Date(workout.startTime);
        const dayIndex = startTime.getDay();
        activity[dayIndex]++;
      }
    });
    
    // Calculate stats using weekly activities
    const totalWorkouts = weeklyActivity.length;
    
    let totalDurationSeconds = 0;
    let totalCaloriesBurned = 0;
    
    // Process each workout session for stats calculation
    weeklyActivity.forEach((workout) => {
      // Extract duration - be flexible with data format
      let duration = 0;
      if (typeof workout.totalDuration === 'number') {
        duration = workout.totalDuration;
      } else if (workout.summary && typeof workout.summary.totalDuration === 'number') {
        duration = workout.summary.totalDuration;
      }
      
      // Extract calories - be flexible with data format
      let calories = 0;
      if (typeof workout.caloriesBurned === 'number') {
        calories = workout.caloriesBurned;
      } else if (workout.summary && typeof workout.summary.caloriesBurned === 'number') {
        calories = workout.summary.caloriesBurned;
      }
      
      // Add to totals
      totalDurationSeconds += duration;
      totalCaloriesBurned += calories;
      
      logger.info(`Processing workout ${workout.id}: duration=${duration}s, calories=${calories}`);
    });

    // Calculate average stats
    const stats = {
      totalWorkouts,
      totalDuration: totalDurationSeconds, // Return in seconds, not minutes
      averageDuration: totalWorkouts > 0 ? Math.round(totalDurationSeconds / totalWorkouts) : 0,
      totalCaloriesBurned: Math.round(totalCaloriesBurned),
      averageCaloriesBurned: totalWorkouts > 0 ? Math.round(totalCaloriesBurned / totalWorkouts) : 0
    };
    
    logger.info(`Dashboard stats: ${JSON.stringify(stats)}`);
    
    // Ensure workout data is well-formed for frontend display
    const formattedSessions = recentSessions.map(session => ({
      id: session.id,
      workoutPlan: session.workoutPlan,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      totalDuration: session.totalDuration || (session.summary?.totalDuration || 0),
      caloriesBurned: session.caloriesBurned || (session.summary?.caloriesBurned || 0)
    }));
    
    // Return the dashboard data
    res.json({
      recentWorkouts: formattedSessions,
      recommendedWorkouts: [],
      achievements: [],
      goals: [],
      metrics: [],
      notifications: [],
      weeklyActivity: activity,
      stats
    });
    
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching dashboard data', 500, error));
  }
}; 