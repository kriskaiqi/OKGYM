import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { Exercise } from '../models/Exercise';
import { WorkoutPlanRepository, EnhancedWorkoutPlanFilters } from '../repositories/WorkoutPlanRepository';
import { WorkoutExerciseRepository } from '../repositories/WorkoutExerciseRepository';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { AppError, ErrorType } from '../utils/errors';
import { executeTransaction } from '../utils/transaction-helper';
import { SimpleTrack } from '../utils/performance';
import logger from '../utils/logger';
import { Difficulty, WorkoutCategory } from '../models/shared/Enums';
import { cacheManager } from './CacheManager';
import { EntityManager } from 'typeorm';
import { RelationshipLoader } from '../utils/RelationshipLoader';
import { AppDataSource } from '../data-source';
import { WorkoutTag } from '../models/WorkoutTag';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';

/**
 * Type for workout plan ID (can be number or string UUID)
 */
export type WorkoutPlanId = string | number;

/**
 * Convert any ID type to string for consistent comparison
 */
function idToString(id: WorkoutPlanId): string {
  return id?.toString() || '';
}

/**
 * Service for managing workout plans and their exercises
 */
export class WorkoutPlanService {
  private tagRepository = AppDataSource.getRepository(WorkoutTag);
  private categoryRepository = AppDataSource.getRepository(ExerciseCategory);
  private equipmentRepository = AppDataSource.getRepository(Equipment);

  constructor(
    private readonly workoutPlanRepo = new WorkoutPlanRepository(),
    private readonly workoutExerciseRepo = new WorkoutExerciseRepository(),
    private readonly exerciseRepo = new ExerciseRepository(),
    private readonly cacheTTL = 3600
  ) {}

  /**
   * Create a new workout plan with exercises
   */
  @SimpleTrack({ slowThreshold: 300 })
  async createWorkoutPlan(data: any, userId: string): Promise<WorkoutPlan> {
    try {
      return await executeTransaction(async (queryRunner) => {
        if (!data.name || !data.description) {
          throw new AppError(ErrorType.VALIDATION_ERROR, 'Name and description are required', 400);
        }

        // Create base workout plan with defaults
        const workoutPlan = await this.workoutPlanRepo.create({
          ...data,
          creator_id: userId,
          isCustom: true,
          difficulty: data.difficulty || Difficulty.BEGINNER,
          workoutCategory: data.workoutCategory || WorkoutCategory.FULL_BODY,
          estimatedDuration: data.estimatedDuration || 30,
        });

        // Add exercises if provided
        if (data.exercises?.length) {
          const exercises = data.exercises.map((ex: any, idx: number) => ({
            workoutPlan: { id: workoutPlan.id },
            exercise_id: ex.exercise_id || ex.exerciseId,
            order: ex.order || idx,
            sets: ex.sets || 1,
            repetitions: ex.repetitions || 0,
            duration: ex.duration || 0,
            restTime: ex.restTime || 30,
            ...ex
          }));
          
          await queryRunner.manager.save(WorkoutExercise, exercises);
        }

        logger.info(`Created workout plan: ${workoutPlan.name}`, { userId, workoutPlanId: workoutPlan.id });
        return this.workoutPlanRepo.findById(workoutPlan.id) as Promise<WorkoutPlan>;
      });
    } catch (error) {
      this.handleError(error, 'Failed to create workout plan', { userId });
    }
  }

  /**
   * Get workout plan by ID with all related entities
   */
  @SimpleTrack({ slowThreshold: 200 })
  async getWorkoutPlanById(id: WorkoutPlanId, userId?: string): Promise<WorkoutPlan> {
    try {
      const cacheKey = `workout-plan:${id}`;
      const cachedPlan = await cacheManager.get<WorkoutPlan>(cacheKey);
      if (cachedPlan) return cachedPlan;

      const workoutPlan = await this.workoutPlanRepo.findById(id);
      if (!workoutPlan) {
        throw new AppError(ErrorType.NOT_FOUND, `Workout plan with ID ${id} not found`, 404);
      }

      if (userId && workoutPlan.isCustom && workoutPlan.creator_id !== userId) {
        throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'Access denied', 403);
      }
      
      // Load all relationships manually using RelationshipLoader
      const [tags, targetMuscleGroups, equipmentNeeded] = await Promise.all([
        RelationshipLoader.loadRelationship('WorkoutPlan', 'tags', id, this.tagRepository),
        RelationshipLoader.loadRelationship('WorkoutPlan', 'targetMuscleGroups', id, this.categoryRepository),
        RelationshipLoader.loadRelationship('WorkoutPlan', 'equipmentNeeded', id, this.equipmentRepository)
      ]);
      
      // Assign relationships to workout plan
      workoutPlan.tags = tags;
      workoutPlan.targetMuscleGroups = targetMuscleGroups;
      workoutPlan.equipmentNeeded = equipmentNeeded;

      await cacheManager.set(cacheKey, workoutPlan, { ttl: this.cacheTTL });
      return workoutPlan;
    } catch (error) {
      this.handleError(error, 'Failed to get workout plan', { id, userId });
    }
  }

  /**
   * Update workout plan with partial data
   */
  @SimpleTrack({ slowThreshold: 250 })
  async updateWorkoutPlan(id: WorkoutPlanId, data: any, userId: string): Promise<WorkoutPlan> {
    try {
      return await executeTransaction(async () => {
        const existingPlan = await this.workoutPlanRepo.findById(id);
        if (!existingPlan) {
          throw new AppError(ErrorType.NOT_FOUND, `Workout plan with ID ${id} not found`, 404);
        }

        if (existingPlan.isCustom && existingPlan.creator_id !== userId) {
          throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'Update denied', 403);
        }

        const { exercises, ...planData } = data;
        await this.workoutPlanRepo.update(id, planData);

        if (exercises?.length) {
          await this.updateWorkoutExercises(id, exercises);
        }

        await this.invalidateWorkoutPlanCache(id);
        logger.info(`Updated workout plan: ${existingPlan.name}`, { userId, id });
        return this.workoutPlanRepo.findById(id) as Promise<WorkoutPlan>;
      });
    } catch (error) {
      this.handleError(error, 'Failed to update workout plan', { id, userId });
    }
  }
  
  /**
   * Delete workout plan
   */
  @SimpleTrack({ slowThreshold: 200 })
  async deleteWorkoutPlan(id: WorkoutPlanId, userId: string): Promise<boolean> {
    try {
      const existingPlan = await this.workoutPlanRepo.findById(id);
      if (!existingPlan) {
        throw new AppError(ErrorType.NOT_FOUND, `Workout plan with ID ${id} not found`, 404);
      }

      if (existingPlan.isCustom && existingPlan.creator_id !== userId) {
        throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'Delete denied', 403);
      }

      await this.workoutPlanRepo.delete(id);
      await this.invalidateWorkoutPlanCache(id);
      logger.info(`Deleted workout plan: ${existingPlan.name}`, { userId, id });
      return true;
    } catch (error) {
      this.handleError(error, 'Failed to delete workout plan', { id, userId });
    }
  }

  /**
   * Get workout plans with filtering
   */
  @SimpleTrack({ slowThreshold: 300 })
  async getWorkoutPlans(filters: EnhancedWorkoutPlanFilters, userId?: string): Promise<[WorkoutPlan[], number]> {
    try {
      // If userId is provided and not in filters, add it to show user's custom plans
      if (userId && !filters.creatorId && filters.userPlansOnly) {
        filters.creatorId = userId;
      }
      
      // Only cache standard queries without complex filters
      const isCacheable = !filters.searchTerm && !filters.creatorId && !filters.tagIds?.length;
      const cacheKey = isCacheable ? `workout-plans:${JSON.stringify(filters)}` : null;
      
      if (cacheKey) {
        const cached = await cacheManager.get<[WorkoutPlan[], number]>(cacheKey);
        if (cached) return cached;
      }
      
      const [plans, count] = await this.workoutPlanRepo.findWithFilters(filters);
      
      // Load relationships for all plans in a batch operation
      if (plans.length) {
        const planIds = plans.map(plan => plan.id);
        
        // Load related entities in parallel for all plans
        const [tagsMap, targetMuscleGroupsMap, equipmentMap] = await Promise.all([
          RelationshipLoader.loadRelationshipBatch('WorkoutPlan', 'tags', planIds, this.tagRepository),
          RelationshipLoader.loadRelationshipBatch('WorkoutPlan', 'targetMuscleGroups', planIds, this.categoryRepository),
          RelationshipLoader.loadRelationshipBatch('WorkoutPlan', 'equipmentNeeded', planIds, this.equipmentRepository)
        ]);
        
        // Assign loaded relationships to each plan
        plans.forEach(plan => {
          plan.tags = tagsMap.get(plan.id) || [];
          plan.targetMuscleGroups = targetMuscleGroupsMap.get(plan.id) || [];
          plan.equipmentNeeded = equipmentMap.get(plan.id) || [];
        });
      }
      
      if (cacheKey) {
        await cacheManager.set(cacheKey, [plans, count], { ttl: this.cacheTTL });
      }
      
      return [plans, count];
    } catch (error) {
      this.handleError(error, 'Failed to get workout plans', { filters });
    }
  }

  /**
   * Add exercise to workout plan
   */
  @SimpleTrack({ slowThreshold: 200 })
  async addExerciseToWorkoutPlan(workoutPlanId: WorkoutPlanId, exerciseData: any, userId: string): Promise<WorkoutPlan> {
    try {
      return await executeTransaction(async () => {
        const workoutPlan = await this.getWorkoutPlanById(workoutPlanId, userId);
        
        if (!exerciseData.exercise_id) {
          throw new AppError(ErrorType.VALIDATION_ERROR, 'Exercise ID required', 400);
        }

        const exercise = await this.exerciseRepo.findById(exerciseData.exercise_id);
        if (!exercise) {
          throw new AppError(ErrorType.NOT_FOUND, `Exercise with ID ${exerciseData.exercise_id} not found`, 404);
        }

        const exercises = workoutPlan.exercises || [];
        const nextOrder = exercises.length ? Math.max(...exercises.map(e => e.order)) + 1 : 0;
        
        await this.workoutExerciseRepo.create({
          workoutPlan: { id: workoutPlanId },
          exercise_id: exerciseData.exercise_id,
          order: exerciseData.order || nextOrder,
          sets: exerciseData.sets || 1,
          repetitions: exerciseData.repetitions || 0,
          duration: exerciseData.duration || 0,
          restTime: exerciseData.restTime || 30,
          ...exerciseData
        });
        
        await this.invalidateWorkoutPlanCache(workoutPlanId);
        return this.getWorkoutPlanById(workoutPlanId, userId);
      });
    } catch (error) {
      this.handleError(error, 'Failed to add exercise to workout plan', { workoutPlanId, userId });
    }
  }

  /**
   * Update exercise in workout plan
   */
  @SimpleTrack({ slowThreshold: 200 })
  async updateExerciseInWorkoutPlan(workoutPlanId: WorkoutPlanId, exerciseId: number, exerciseData: any, userId: string): Promise<WorkoutPlan> {
    try {
      const workoutPlan = await this.getWorkoutPlanById(workoutPlanId, userId);
      
      // Convert IDs to strings for safe comparison
      const foundExercise = workoutPlan.exercises?.find(e => idToString(e.id) === idToString(exerciseId));
      if (!foundExercise) {
        throw new AppError(ErrorType.NOT_FOUND, `Exercise with ID ${exerciseId} not found in workout plan`, 404);
      }
      
      await this.workoutExerciseRepo.update(exerciseId, {
        ...exerciseData,
        workoutPlan: { id: workoutPlanId }  // Ensure we keep the relationship
      });
      
      await this.invalidateWorkoutPlanCache(workoutPlanId);
      return this.getWorkoutPlanById(workoutPlanId, userId);
    } catch (error) {
      this.handleError(error, 'Failed to update exercise in workout plan', { workoutPlanId, exerciseId, userId });
    }
  }

  /**
   * Remove exercise from workout plan
   */
  @SimpleTrack({ slowThreshold: 200 })
  async removeExerciseFromWorkoutPlan(workoutPlanId: WorkoutPlanId, exerciseId: number, userId: string): Promise<WorkoutPlan> {
    try {
      const workoutPlan = await this.getWorkoutPlanById(workoutPlanId, userId);
      
      // Convert IDs to strings for safe comparison
      const foundExercise = workoutPlan.exercises?.find(e => idToString(e.id) === idToString(exerciseId));
      if (!foundExercise) {
        throw new AppError(ErrorType.NOT_FOUND, `Exercise with ID ${exerciseId} not found in workout plan`, 404);
      }
      
      await this.workoutExerciseRepo.delete(exerciseId);
      await this.invalidateWorkoutPlanCache(workoutPlanId);
      
      return this.getWorkoutPlanById(workoutPlanId, userId);
    } catch (error) {
      this.handleError(error, 'Failed to remove exercise from workout plan', { workoutPlanId, exerciseId, userId });
    }
  }

  /**
   * Reorder exercises in workout plan
   */
  @SimpleTrack({ slowThreshold: 200 })
  async reorderExercisesInWorkoutPlan(workoutPlanId: WorkoutPlanId, exerciseOrders: { id: number, order: number }[], userId: string): Promise<WorkoutPlan> {
    try {
      return await executeTransaction(async () => {
        const workoutPlan = await this.getWorkoutPlanById(workoutPlanId, userId);
        
        // Use idToString for ID comparison to handle both UUID and number types
        const exercisesMap = new Map(
          workoutPlan.exercises?.map(ex => [idToString(ex.id), ex]) || []
        );
        
        // Update each exercise's order
        for (const { id, order } of exerciseOrders) {
          if (exercisesMap.has(idToString(id))) {
            await this.workoutExerciseRepo.update(id, { order });
          }
        }
        
        await this.invalidateWorkoutPlanCache(workoutPlanId);
        return this.getWorkoutPlanById(workoutPlanId, userId);
      });
    } catch (error) {
      this.handleError(error, 'Failed to reorder exercises', { workoutPlanId, userId });
    }
  }

  /**
   * Update multiple exercises at once
   */
  private async updateWorkoutExercises(workoutPlanId: WorkoutPlanId, exercises: any[]): Promise<void> {
    const existingExercises = await this.workoutExerciseRepo.findByWorkoutPlan(workoutPlanId);
    const existingIds = new Set(existingExercises.map(e => e.id));
    
    // Process each exercise in the array
    for (const exercise of exercises) {
      if (exercise.id && existingIds.has(exercise.id)) {
        // Update existing exercise
        await this.workoutExerciseRepo.update(exercise.id, {
          ...exercise,
          // Ensure we're not overriding the relationship
          workoutPlan: { id: workoutPlanId }
        });
        // Remove from the set to track which ones were processed
        existingIds.delete(exercise.id);
      } else {
        // Create new exercise
        await this.workoutExerciseRepo.create({
          ...exercise,
          workoutPlan: { id: workoutPlanId },
          exercise_id: exercise.exercise_id,
          order: exercise.order || 0,
          sets: exercise.sets || 1
        });
      }
    }
    
    // If we should delete exercises that weren't in the update list
    if (exercises.length && exercises[0]?.deleteRemaining) {
      // Delete exercises that weren't included in the update
      for (const id of existingIds) {
        await this.workoutExerciseRepo.delete(id);
      }
    }
  }

  /**
   * Helper method to invalidate workout plan cache
   */
  private async invalidateWorkoutPlanCache(workoutPlanId: WorkoutPlanId): Promise<void> {
    try {
      await Promise.all([
        cacheManager.delete(`workout-plan:${workoutPlanId}`),
        // Invalidate any cache keys that might contain this workout plan's data
        ...Array.from({ length: 10 }, (_, i) => 
          cacheManager.delete(`workout-plans-page-${i}`)
        )
      ]);
    } catch (error) {
      logger.warn(`Cache invalidation error: ${error.message}`, { workoutPlanId });
    }
  }

  /**
   * Centralized error handling
   */
  private handleError(error: any, message: string, context: any): never {
    if (error instanceof AppError) throw error;
    
    logger.error(message, {
      error: error instanceof Error ? error.message : String(error),
      ...context
    });
    
    throw new AppError(ErrorType.SERVICE_ERROR, message, 500);
  }
} 