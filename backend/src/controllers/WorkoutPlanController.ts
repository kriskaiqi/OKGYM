import { Request, Response } from 'express';
import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { AppError, ErrorType } from '../utils/errors';
import { validateRequest } from '../middleware/validation';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { Difficulty, WorkoutCategory } from '../models/shared/Enums';
import { SimpleTrack } from '../utils/performance';
import logger from '../utils/logger';

// DTOs for request validation
export class CreateWorkoutPlanDto {
  name!: string;
  description!: string;
  difficulty?: Difficulty;
  workoutCategory?: WorkoutCategory;
  estimatedDuration?: number;
  exercises?: {
    exercise_id: number;
    order?: number;
    sets?: number;
    repetitions?: number;
    duration?: number;
    restTime?: number;
  }[];
}

export class UpdateWorkoutPlanDto {
  name?: string;
  description?: string;
  difficulty?: Difficulty;
  workoutCategory?: WorkoutCategory;
  estimatedDuration?: number;
  exercises?: {
    id?: number;
    exercise_id: number;
    order?: number;
    sets?: number;
    repetitions?: number;
    duration?: number;
    restTime?: number;
  }[];
}

export class AddExerciseDto {
  exercise_id!: number;
  order?: number;
  sets?: number;
  repetitions?: number;
  duration?: number;
  restTime?: number;
}

export class UpdateExerciseDto {
  sets?: number;
  repetitions?: number;
  duration?: number;
  restTime?: number;
  order?: number;
}

export class ReorderExercisesDto {
  exercises!: { id: number; order: number }[];
}

/**
 * Controller for managing workout plans and their exercises
 */
export class WorkoutPlanController {
  constructor(private readonly workoutPlanService: WorkoutPlanService) {}

  /**
   * Create a new workout plan
   */
  createWorkoutPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
      }

      const workoutPlan = await this.workoutPlanService.createWorkoutPlan(req.body, userId);
      res.status(201).json(workoutPlan);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Get workout plan by ID
   */
  getWorkoutPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id;
      const workoutPlan = await this.workoutPlanService.getWorkoutPlanById(id, userId);
      res.json(workoutPlan);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Update workout plan
   */
  updateWorkoutPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
      }

      const workoutPlan = await this.workoutPlanService.updateWorkoutPlan(id, req.body, userId);
      res.json(workoutPlan);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Delete workout plan
   */
  deleteWorkoutPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
      }

      await this.workoutPlanService.deleteWorkoutPlan(id, userId);
      res.status(204).send('');
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Get all workout plans with filtering
   */
  getWorkoutPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const result = await this.workoutPlanService.getWorkoutPlans(req.query, userId);
      res.json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Add exercise to workout plan
   */
  addExercise = async (req: Request, res: Response): Promise<void> => {
    try {
      const workoutPlanId = parseInt(req.params.id, 10);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
      }

      const workoutPlan = await this.workoutPlanService.addExerciseToWorkoutPlan(workoutPlanId, req.body, userId);
      res.status(201).json(workoutPlan);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Update exercise in workout plan
   */
  updateExercise = async (req: Request, res: Response): Promise<void> => {
    try {
      const workoutPlanId = parseInt(req.params.id, 10);
      const exerciseId = parseInt(req.params.exerciseId, 10);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
      }

      const workoutPlan = await this.workoutPlanService.updateExerciseInWorkoutPlan(workoutPlanId, exerciseId, req.body, userId);
      res.json(workoutPlan);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Remove exercise from workout plan
   */
  removeExercise = async (req: Request, res: Response): Promise<void> => {
    try {
      const workoutPlanId = parseInt(req.params.id, 10);
      const exerciseId = parseInt(req.params.exerciseId, 10);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
      }

      const workoutPlan = await this.workoutPlanService.removeExerciseFromWorkoutPlan(workoutPlanId, exerciseId, userId);
      res.json(workoutPlan);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Reorder exercises in workout plan
   */
  reorderExercises = async (req: Request, res: Response): Promise<void> => {
    try {
      const workoutPlanId = parseInt(req.params.id, 10);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
      }

      const workoutPlan = await this.workoutPlanService.reorderExercisesInWorkoutPlan(workoutPlanId, req.body.exercises, userId);
      res.json(workoutPlan);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Centralized error handling
   */
  private handleError(error: any, res: Response): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: error.message,
        type: error.type
      });
      return;
    }

    logger.error('Controller error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(500).json({
      error: 'Internal server error',
      type: ErrorType.SERVICE_ERROR
    });
  }
} 