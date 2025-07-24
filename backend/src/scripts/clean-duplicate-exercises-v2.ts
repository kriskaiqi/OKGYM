import { AppDataSource } from "../data-source";
import { Exercise } from "../models/Exercise";
import { In } from "typeorm";
import logger from "../utils/logger";

/**
 * This script identifies duplicate exercises by name and removes all but the oldest one.
 * It updates any workout references to point to the exercise that will be kept.
 * 
 * This version handles foreign key constraints properly by:
 * 1. Collecting all duplicate sets first
 * 2. Updating all references in a single transaction before attempting deletion
 * 3. Using raw SQL queries for both update and delete operations to avoid ORM complexities
 */
async function cleanDuplicateExercisesV2() {
  try {
    logger.info("Initializing database connection");
    await AppDataSource.initialize();

    // Get all exercises ordered by creation date (oldest first)
    const exercises = await AppDataSource.getRepository(Exercise).find({
      order: { createdAt: "ASC" }
    });

    logger.info(`Found ${exercises.length} exercises in the database`);

    // Group exercises by name
    const exercisesByName: Record<string, Exercise[]> = {};
    exercises.forEach(exercise => {
      if (!exercisesByName[exercise.name]) {
        exercisesByName[exercise.name] = [];
      }
      exercisesByName[exercise.name].push(exercise);
    });

    // Find duplicate sets
    const duplicateSets: { keeper: Exercise, duplicates: Exercise[] }[] = [];
    
    for (const [name, exs] of Object.entries(exercisesByName)) {
      if (exs.length > 1) {
        logger.info(`Found ${exs.length - 1} similar exercises to "${name}"`);
        
        // The keeper is the oldest exercise (first in the array since we sorted by creation date)
        const keeper = exs[0];
        const duplicates = exs.slice(1);
        
        duplicateSets.push({ keeper, duplicates });
      }
    }
    
    // If no duplicates, exit early
    if (duplicateSets.length === 0) {
      logger.info("No duplicate exercises found!");
      return;
    }

    // Collect all duplicate IDs and create mapping from duplicate ID to keeper ID
    const idMapping: Record<string, string> = {};
    const allDuplicateIds: string[] = [];
    
    duplicateSets.forEach(({ keeper, duplicates }) => {
      duplicates.forEach(duplicate => {
        idMapping[duplicate.id] = keeper.id;
        allDuplicateIds.push(duplicate.id);
      });
    });

    logger.info(`Found ${allDuplicateIds.length} duplicate exercises to remove`);
    
    // Begin transaction
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // First, find all workout exercises that reference any of the duplicate exercises
      // Use $1, $2, etc. for PostgreSQL parameterized queries
      const placeholders = allDuplicateIds.map((_, idx) => `$${idx + 1}`).join(',');
      const workoutExercisesResult = await queryRunner.query(
        `SELECT id, exercise_id FROM workout_exercises WHERE exercise_id IN (${placeholders})`,
        allDuplicateIds
      );

      logger.info(`Found ${workoutExercisesResult.length} workout exercise references to update`);

      // Update all workout exercises to reference the keeper exercise IDs
      for (const workoutExercise of workoutExercisesResult) {
        const newExerciseId = idMapping[workoutExercise.exercise_id];
        logger.info(`Updating reference from ${workoutExercise.exercise_id} to ${newExerciseId} for workout exercise ${workoutExercise.id}`);
        
        await queryRunner.query(
          `UPDATE workout_exercises SET exercise_id = $1 WHERE id = $2`,
          [newExerciseId, workoutExercise.id]
        );
      }

      // Now delete all duplicate exercises
      if (allDuplicateIds.length > 0) {
        logger.info("Deleting all duplicate exercises");
        const deletePlaceholders = allDuplicateIds.map((_, idx) => `$${idx + 1}`).join(',');
        await queryRunner.query(
          `DELETE FROM exercises WHERE id IN (${deletePlaceholders})`,
          allDuplicateIds
        );
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      logger.info("Successfully processed duplicate exercises");
      
    } catch (error) {
      // Rollback the transaction if something goes wrong
      await queryRunner.rollbackTransaction();
      logger.error("Failed to process duplicate exercises:", error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }

  } catch (error) {
    logger.error("Error in cleanDuplicateExercisesV2:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  }
}

// Run the script
cleanDuplicateExercisesV2();