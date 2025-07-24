/**
 * Script to update any workout plan entries with missing UUIDs
 * 
 * This script handles the migration from integer IDs to UUIDs without requiring schema changes.
 * It updates any WorkoutPlan entries that have numeric IDs to use UUIDs.
 */

import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

async function updateMissingUuids() {
  try {
    logger.info('Starting UUID compatibility check...');

    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Start a transaction for safety
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check for workout plans with numeric IDs
      const workoutPlans = await queryRunner.query(
        `SELECT id FROM workout_plans WHERE id ~ '^[0-9]+$'`
      );

      if (workoutPlans.length === 0) {
        logger.info('No workout plans with numeric IDs found. All UUIDs are properly set.');
      } else {
        logger.info(`Found ${workoutPlans.length} workout plans with numeric IDs. Updating...`);

        // Create a mapping of old IDs to new UUIDs
        const idMapping = {};
        for (const plan of workoutPlans) {
          const oldId = plan.id;
          const newId = uuidv4();
          idMapping[oldId] = newId;
        }

        // Update each workout plan with a new UUID
        for (const [oldId, newId] of Object.entries(idMapping)) {
          logger.info(`Updating workout plan with ID ${oldId} to UUID ${newId}`);
          
          // Update the workout plan ID
          await queryRunner.query(
            `UPDATE workout_plans SET id = $1 WHERE id = $2`,
            [newId, oldId]
          );

          // Update related tables
          // Workout exercises
          await queryRunner.query(
            `UPDATE workout_exercises SET workout_plan_id = $1 WHERE workout_plan_id = $2`,
            [newId, oldId]
          );

          // Workout session
          await queryRunner.query(
            `UPDATE workout_sessions SET workout_plan_id = $1 WHERE workout_plan_id = $2`,
            [newId, oldId]
          );

          // Workout tags
          await queryRunner.query(
            `UPDATE workout_tag_map SET workout_id = $1 WHERE workout_id = $2`,
            [newId, oldId]
          );

          // Workout muscle groups
          await queryRunner.query(
            `UPDATE workout_muscle_group SET workout_id = $1 WHERE workout_id = $2`,
            [newId, oldId]
          );

          // Workout equipment
          await queryRunner.query(
            `UPDATE workout_equipment SET workout_id = $1 WHERE workout_id = $2`,
            [newId, oldId]
          );

          // User bookmarks
          await queryRunner.query(
            `UPDATE user_bookmarks SET workout_plan_id = $1 WHERE workout_plan_id = $2`,
            [newId, oldId]
          );

          // User progress
          await queryRunner.query(
            `UPDATE user_progress SET workout_id = $1 WHERE workout_id = $2`,
            [newId, oldId]
          );
        }
      }

      // Check for workout exercises with numeric IDs
      const workoutExercises = await queryRunner.query(
        `SELECT id FROM workout_exercises WHERE id ~ '^[0-9]+$'`
      );

      if (workoutExercises.length === 0) {
        logger.info('No workout exercises with numeric IDs found. All UUIDs are properly set.');
      } else {
        logger.info(`Found ${workoutExercises.length} workout exercises with numeric IDs. Updating...`);

        // Create a mapping of old IDs to new UUIDs
        const exerciseIdMapping = {};
        for (const exercise of workoutExercises) {
          const oldId = exercise.id;
          const newId = uuidv4();
          exerciseIdMapping[oldId] = newId;
        }

        // Update each workout exercise with a new UUID
        for (const [oldId, newId] of Object.entries(exerciseIdMapping)) {
          logger.info(`Updating workout exercise with ID ${oldId} to UUID ${newId}`);
          
          // Update the workout exercise ID
          await queryRunner.query(
            `UPDATE workout_exercises SET id = $1 WHERE id = $2`,
            [newId, oldId]
          );

          // Update superset references
          await queryRunner.query(
            `UPDATE workout_exercises SET superset_with_exercise_id = $1 WHERE superset_with_exercise_id = $2`,
            [newId, oldId]
          );
        }
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      logger.info('UUID compatibility update completed successfully!');
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      logger.error('Error during UUID compatibility update:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  } catch (error) {
    logger.error('UUID compatibility update failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await AppDataSource.destroy();
    process.exit(0);
  }
}

// Run the script
updateMissingUuids(); 