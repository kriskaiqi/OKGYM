import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { In } from 'typeorm';
import logger from '../utils/logger';

/**
 * Script to detect and clean up duplicate exercises in the database
 */
async function cleanDuplicateExercises() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    const exerciseRepository = AppDataSource.getRepository(Exercise);
    const workoutExerciseRepository = AppDataSource.getRepository(WorkoutExercise);
    
    // Get all exercises
    const allExercises = await exerciseRepository.find({
      order: { createdAt: 'ASC' }
    });
    logger.info(`Found ${allExercises.length} exercises in the database`);

    // Maps to track which exercises to keep and which to remove
    const exercisesToRemove: Exercise[] = [];
    const replacementMap: Record<string, string> = {}; // Maps duplicate ID -> keeper ID
    const processedNames = new Set<string>();
    
    // First pass: Find duplicate exercises and determine which ones to keep
    for (const exercise of allExercises) {
      const normalizedName = exercise.name.toLowerCase().trim();
      
      // Skip if we've already decided to keep this exercise
      if (processedNames.has(normalizedName)) {
        exercisesToRemove.push(exercise);
        continue;
      }
      
      // Look for similar exercises
      const similarExercises = allExercises.filter(e => {
        if (e.id === exercise.id) return false;
        
        const otherName = e.name.toLowerCase().trim();
        return (
          otherName === normalizedName || 
          otherName === `${normalizedName}s` || // Plural form
          normalizedName === `${otherName}s` || // Singular form
          (normalizedName.length > 4 && otherName.includes(normalizedName)) || // Substring
          (otherName.length > 4 && normalizedName.includes(otherName)) // Substring
        );
      });
      
      // If found similar exercises, mark newer ones for removal
      if (similarExercises.length > 0) {
        logger.info(`Found ${similarExercises.length} similar exercises to "${exercise.name}"`);
        
        // Keep the one with most complete data
        const exercisesToCompare = [exercise, ...similarExercises];
        const bestExercise = getBestExercise(exercisesToCompare);
        
        // Mark all others for removal and map IDs for replacement
        for (const e of exercisesToCompare) {
          if (e.id !== bestExercise.id) {
            exercisesToRemove.push(e);
            replacementMap[e.id] = bestExercise.id; // Map duplicate ID to keeper ID
          } else {
            // Keep track of normalized name to avoid repeatedly processing similar exercises
            processedNames.add(e.name.toLowerCase().trim());
          }
        }
      } else {
        // No similar exercises found, keep this one
        processedNames.add(normalizedName);
      }
    }
    
    // Start a transaction to ensure consistency
    if (exercisesToRemove.length > 0) {
      logger.info(`Found ${exercisesToRemove.length} duplicate exercises to process`);
      
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        const duplicateIds = exercisesToRemove.map(e => e.id);
        
        // First: Find all workout exercises referencing the duplicate exercises
        const workoutExercises = await workoutExerciseRepository.find({
          where: { exercise: { id: In(duplicateIds) } },
          relations: ['exercise'] 
        });
        
        if (workoutExercises.length > 0) {
          logger.info(`Found ${workoutExercises.length} workout exercise references to update`);
          
          // Update ALL workout exercise references to point to the keeper exercises
          for (const workoutExercise of workoutExercises) {
            const currentExerciseId = workoutExercise.exercise.id;
            const replacementExerciseId = replacementMap[currentExerciseId];
            
            if (replacementExerciseId) {
              logger.info(`Updating reference from ${currentExerciseId} to ${replacementExerciseId}`);
              
              // Update the reference using a direct SQL update to avoid ORM complexity
              await queryRunner.query(
                'UPDATE workout_exercises SET exercise_id = $1 WHERE id = $2',
                [replacementExerciseId, workoutExercise.id]
              );
            }
          }
          
          // Wait a moment to ensure all references are updated
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Now, delete the duplicate exercises one by one
        for (const exercise of exercisesToRemove) {
          try {
            logger.info(`Removing duplicate exercise: ${exercise.name} (ID: ${exercise.id})`);
            await queryRunner.manager.delete(Exercise, exercise.id);
          } catch (error) {
            logger.warn(`Failed to delete exercise ${exercise.name} (ID: ${exercise.id}): ${error.message}`);
          }
        }
        
        // Commit the transaction
        await queryRunner.commitTransaction();
        logger.info(`Successfully processed duplicate exercises`);
      } catch (error) {
        // If any operation fails, roll back the transaction
        await queryRunner.rollbackTransaction();
        logger.error('Error during transaction, rolling back changes:', error);
        throw error;
      } finally {
        // Release the query runner
        await queryRunner.release();
      }
    } else {
      logger.info('No duplicate exercises found');
    }
    
  } catch (error) {
    logger.error('Error cleaning up duplicate exercises:', error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
    
    process.exit(0);
  }
}

/**
 * Select the best exercise from a list of similar exercises
 * Prioritizes exercises with more complete data
 */
function getBestExercise(exercises: Exercise[]): Exercise {
  return exercises.reduce((best, current) => {
    // Calculate completeness score (higher is better)
    const getBestScore = (e: Exercise) => {
      let score = 0;
      
      // Score each field that's populated
      if (e.movementPattern) score += 3;
      if (e.targetMuscleGroups && e.targetMuscleGroups.length > 0) score += 5;
      if (e.synergistMuscleGroups && e.synergistMuscleGroups.length > 0) score += 3;
      if (e.description && e.description.length > 20) score += 2;
      
      return score;
    };
    
    const currentScore = getBestScore(current);
    const bestScore = getBestScore(best);
    
    return currentScore > bestScore ? current : best;
  }, exercises[0]);
}

// Run the cleanup function
cleanDuplicateExercises(); 