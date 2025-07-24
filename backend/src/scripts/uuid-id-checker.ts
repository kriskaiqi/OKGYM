/**
 * UUID ID Checker
 * 
 * This script directly queries the database to check for ID format discrepancies
 * without attempting to modify the schema.
 */

import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

async function checkIdFormats() {
  try {
    logger.info('Starting ID format check...');

    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    logger.info('Database connection established');

    // Use basic SQL queries to check tables directly
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // First check table structure
      const tables = ['workout_plans', 'workout_exercises', 'workout_sessions'];
      const tableInfo: Record<string, any> = {};
      
      for (const table of tables) {
        const columnInfo = await queryRunner.query(
          `SELECT column_name, data_type, udt_name 
           FROM information_schema.columns 
           WHERE table_name = $1 AND column_name = 'id'`,
          [table]
        );
        
        tableInfo[table] = columnInfo[0];
        logger.info(`Table ${table} ID column type: ${columnInfo[0]?.data_type} (${columnInfo[0]?.udt_name})`);
      }

      // Check ID formats in workout_plans
      const workoutPlansNumericIds = await queryRunner.query(
        `SELECT id FROM workout_plans WHERE id ~ '^[0-9]+$'`
      );

      const workoutPlansUuidIds = await queryRunner.query(
        `SELECT id FROM workout_plans WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`
      );

      logger.info(`Workout Plans with numeric IDs: ${workoutPlansNumericIds.length}`);
      logger.info(`Workout Plans with UUID format IDs: ${workoutPlansUuidIds.length}`);
      
      if (workoutPlansNumericIds.length > 0) {
        logger.info(`Sample numeric IDs: ${workoutPlansNumericIds.slice(0, 5).map(p => p.id).join(', ')}`);
      }

      // Check ID formats in workout_exercises
      const workoutExercisesNumericIds = await queryRunner.query(
        `SELECT id FROM workout_exercises WHERE id ~ '^[0-9]+$'`
      );

      const workoutExercisesUuidIds = await queryRunner.query(
        `SELECT id FROM workout_exercises WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`
      );

      logger.info(`Workout Exercises with numeric IDs: ${workoutExercisesNumericIds.length}`);
      logger.info(`Workout Exercises with UUID format IDs: ${workoutExercisesUuidIds.length}`);

      // Check foreign key relationships
      const exercisesToWorkoutPlan = await queryRunner.query(
        `SELECT we.id, we.workout_plan_id, wp.id as plan_id
         FROM workout_exercises we
         JOIN workout_plans wp ON we.workout_plan_id::text = wp.id::text
         LIMIT 5`
      );

      logger.info(`Checked workout_exercises join to workout_plans. Found ${exercisesToWorkoutPlan.length} valid joins.`);

      // Check workout sessions
      const sessionsToWorkoutPlan = await queryRunner.query(
        `SELECT ws.id, ws.workout_plan_id, wp.id as plan_id
         FROM workout_sessions ws
         JOIN workout_plans wp ON ws.workout_plan_id::text = wp.id::text
         LIMIT 5`
      );
      
      logger.info(`Checked workout_sessions join to workout_plans. Found ${sessionsToWorkoutPlan.length} valid joins.`);

      // Count total records
      const totalWorkoutPlans = await queryRunner.query(`SELECT COUNT(*) as count FROM workout_plans`);
      const totalWorkoutExercises = await queryRunner.query(`SELECT COUNT(*) as count FROM workout_exercises`);
      const totalWorkoutSessions = await queryRunner.query(`SELECT COUNT(*) as count FROM workout_sessions`);

      logger.info(`
=============================================
ID FORMAT COMPATIBILITY REPORT
=============================================
- Workout Plans total: ${totalWorkoutPlans[0].count}
  - Numeric IDs: ${workoutPlansNumericIds.length}
  - UUID format IDs: ${workoutPlansUuidIds.length}
  - Other formats: ${totalWorkoutPlans[0].count - workoutPlansNumericIds.length - workoutPlansUuidIds.length}

- Workout Exercises total: ${totalWorkoutExercises[0].count}
  - Numeric IDs: ${workoutExercisesNumericIds.length}
  - UUID format IDs: ${workoutExercisesUuidIds.length}
  - Other formats: ${totalWorkoutExercises[0].count - workoutExercisesNumericIds.length - workoutExercisesUuidIds.length}

- Workout Sessions total: ${totalWorkoutSessions[0].count}

COMPATIBILITY STATUS:
The application code has been updated to support both numeric IDs and UUID IDs
through a type compatibility layer. No schema changes are required; instead,
the code handles the conversion as needed.

To properly handle both ID formats:
1. Use WorkoutPlanId and WorkoutExerciseId union types (string | number)
2. Convert IDs to string when comparing them
3. Handle both formats in repository queries

UUID SAMPLE: ${uuidv4()} (for reference)
=============================================
      `);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  } catch (error) {
    logger.error('ID format check failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

// Run the script
checkIdFormats(); 