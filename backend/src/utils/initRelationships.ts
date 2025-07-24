import { Exercise } from '../models/Exercise';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';
import { Media } from '../models/Media';
import { WorkoutTag } from '../models/WorkoutTag';
import { ExerciseRelation } from '../models/ExerciseRelation';
import { User } from '../models/User';
import { WorkoutSession } from '../models/WorkoutSession';
import { Achievement } from '../models/Achievement';
import { Notification } from '../models/Notification';
import { FitnessGoal } from '../models/FitnessGoal';
import { BodyMetric } from '../models/BodyMetric';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { applyRelationshipDecorators } from './RelationshipGenerator';
import logger from '../utils/logger';

/**
 * Initialize the relationship system by applying relationship decorators to entity classes
 */
export function initializeRelationships() {
  try {
    // Map of all entity classes
    const entityClasses = {
      Exercise,
      WorkoutPlan,
      ExerciseCategory,
      Equipment,
      Media,
      WorkoutTag,
      ExerciseRelation,
      User,
      WorkoutSession,
      Achievement,
      Notification,
      FitnessGoal,
      BodyMetric,
      WorkoutExercise
    };
    
    // Apply decorators
    applyRelationshipDecorators(entityClasses);
    
    logger.info('Initialized relationship system successfully');
  } catch (error) {
    logger.error('Failed to initialize relationship system', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 