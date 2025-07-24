/**
 * UUID Compatibility Layer
 * 
 * This script checks for ID format inconsistencies between entity models and database records.
 * It doesn't modify the database schema, only reports on the current state.
 */

import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

async function checkUUIDCompatibility() {
  try {
    logger.info('Starting UUID compatibility check...');

    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Check for workout plans with numeric IDs
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Check if any workout plans have numeric IDs
      const workoutPlans = await queryRunner.query(
        `SELECT id FROM workout_plans WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`
      );

      if (workoutPlans.length === 0) {
        logger.info('All workout plans have UUID format IDs.');
      } else {
        logger.info(`Found ${workoutPlans.length} workout plans with non-UUID format IDs.`);
        
        // Log some example IDs
        logger.info(`Example workout plan IDs: ${workoutPlans.slice(0, 5).map(p => p.id).join(', ')}`);
      }

      // Check if any workout exercises have numeric IDs
      const workoutExercises = await queryRunner.query(
        `SELECT id FROM workout_exercises WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`
      );

      if (workoutExercises.length === 0) {
        logger.info('All workout exercises have UUID format IDs.');
      } else {
        logger.info(`Found ${workoutExercises.length} workout exercises with non-UUID format IDs.`);
        
        // Log some example IDs
        logger.info(`Example workout exercise IDs: ${workoutExercises.slice(0, 5).map(e => e.id).join(', ')}`);
      }

      // Check foreign key relationships
      const workoutRelationships = await queryRunner.query(
        `SELECT COUNT(*) as count FROM workout_exercises WHERE workout_plan_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`
      );
      
      logger.info(`Found ${workoutRelationships[0].count} workout_exercises with non-UUID workout_plan_id references.`);
      
      // Check workout sessions
      const workoutSessions = await queryRunner.query(
        `SELECT COUNT(*) as count FROM workout_sessions WHERE workout_plan_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`
      );
      
      logger.info(`Found ${workoutSessions[0].count} workout_sessions with non-UUID workout_plan_id references.`);

      // Verify that UUIDs can be generated correctly
      const testUuid = uuidv4();
      logger.info(`UUID generation is working. Example: ${testUuid}`);

      // Summary information about the compatibility layer
      logger.info(`
=============================================
UUID COMPATIBILITY REPORT
=============================================
- Workout Plans with non-UUID IDs: ${workoutPlans.length}
- Workout Exercises with non-UUID IDs: ${workoutExercises.length}
- Workout Exercises with non-UUID plan references: ${workoutRelationships[0].count}
- Workout Sessions with non-UUID plan references: ${workoutSessions[0].count}
- UUID generation is functioning correctly

RECOMMENDED ACTIONS:
1. Ensure all entity models use the union type approach (string | number) for IDs
2. Add helper functions for safe ID comparison
3. Update services to handle both ID formats
4. Consider migration strategy for standardizing on UUIDs in the future

Your application needs to support both numeric and UUID IDs.
The compatibility layer implemented in the code will handle
ID conversions without requiring schema changes.
      `);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  } catch (error) {
    logger.error('UUID compatibility check failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await AppDataSource.destroy();
    process.exit(0);
  }
}

// Run the script
checkUUIDCompatibility(); 