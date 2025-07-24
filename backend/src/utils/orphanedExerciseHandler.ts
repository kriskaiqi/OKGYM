import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { WorkoutPlan, WorkoutExercise } from '../models';
import logger from './logger';
import { RelationshipLoader } from './RelationshipLoader';

/**
 * Utility to safely handle orphaned exercises for workout plans
 * This is designed to be resilient to database schema issues and migration problems
 */
export class OrphanedExerciseHandler {
  /**
   * Safely load exercises for a workout plan, even if relationships are broken
   * @param workoutPlanId The ID of the workout plan to load exercises for
   * @returns An array of workout exercises (may be empty if none found or errors occur)
   */
  static async safelyLoadExercises(workoutPlanId: string | number): Promise<WorkoutExercise[]> {
    try {
      // Process the workoutPlanId to ensure it's in the correct format for queries
      let idForQuery = workoutPlanId;
      
      logger.debug(`Loading exercises for workout plan ID ${idForQuery} (type: ${typeof idForQuery})`);
      
      // First try the standard approach using the RelationshipLoader
      const exercises = await RelationshipLoader.loadRelationship(
        'WorkoutPlan',
        'exercises',
        idForQuery,
        AppDataSource.getRepository(WorkoutExercise)
      );
      
      if (exercises && exercises.length > 0) {
        logger.debug(`Successfully loaded ${exercises.length} exercises for workout plan ${idForQuery} using RelationshipLoader`);
        return exercises;
      }
      
      // If that fails or returns empty, try a direct query to the workout_exercise table
      logger.warn(`No exercises found for workout plan ${idForQuery} using RelationshipLoader, trying direct query`);
      
      const directExercises = await AppDataSource
        .getRepository(WorkoutExercise)
        .createQueryBuilder('we')
        .where('we.workout_id = :workoutPlanId', { workoutPlanId: idForQuery })
        .getMany();
      
      if (directExercises && directExercises.length > 0) {
        logger.debug(`Successfully loaded ${directExercises.length} exercises for workout plan ${idForQuery} using direct query`);
        return directExercises;
      }
      
      // If that also fails, return an empty array
      logger.warn(`No exercises found for workout plan ${idForQuery} using any method`);
      return [];
    } catch (error) {
      logger.error(`Error loading exercises for workout plan ${workoutPlanId}:`, error);
      return [];
    }
  }
  
  /**
   * Check if a workout plan has orphaned exercises
   * @param workoutPlanId The ID of the workout plan to check
   * @returns True if the workout plan has exercises that can't be loaded normally
   */
  static async hasOrphanedExercises(workoutPlanId: string | number): Promise<boolean> {
    try {
      // Try the standard approach
      const standardExercises = await RelationshipLoader.loadRelationship(
        'WorkoutPlan',
        'exercises',
        workoutPlanId,
        AppDataSource.getRepository(WorkoutExercise)
      );
      
      // Try the direct query approach
      const directExercises = await AppDataSource
        .getRepository(WorkoutExercise)
        .createQueryBuilder('we')
        .where('we.workout_id = :workoutPlanId', { workoutPlanId })
        .getMany();
      
      // If there are more direct exercises than standard, some are orphaned
      return directExercises.length > standardExercises.length;
    } catch (error) {
      logger.error(`Error checking for orphaned exercises for workout plan ${workoutPlanId}:`, error);
      return false;
    }
  }
} 