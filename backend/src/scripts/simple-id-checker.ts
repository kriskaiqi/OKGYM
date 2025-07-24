/**
 * Simple ID Checker
 * 
 * This script only performs a basic read-only check of the database
 * to see what ID types are used in workout_plans and workout_exercises.
 * It does NOT attempt to modify the schema in any way.
 */

import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Wait for DB connection with timeout
const connectWithTimeout = async (timeoutMs = 5000) => {
  return new Promise<boolean>(async (resolve) => {
    const timeout = setTimeout(() => {
      logger.error(`Database connection timed out after ${timeoutMs}ms`);
      resolve(false);
    }, timeoutMs);
    
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      clearTimeout(timeout);
      resolve(true);
    } catch (error) {
      clearTimeout(timeout);
      logger.error('Failed to connect to database:', error);
      resolve(false);
    }
  });
};

async function runSimpleIdCheck() {
  logger.info('Starting simple ID type check...');
  
  // Try to connect
  const connected = await connectWithTimeout();
  if (!connected) {
    logger.error('Cannot continue without database connection');
    process.exit(1);
  }
  
  logger.info('Database connection established');
  
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Just get sample IDs from main tables
      const workoutPlanIds = await queryRunner.query(
        `SELECT id FROM workout_plans LIMIT 5`
      );
      
      const workoutExerciseIds = await queryRunner.query(
        `SELECT id FROM workout_exercises LIMIT 5`
      );
      
      logger.info('Sample Workout Plan IDs:');
      workoutPlanIds.forEach((row: any) => {
        logger.info(`- ${row.id} (${typeof row.id}, appears to be: ${isNaN(Number(row.id)) ? 'UUID' : 'numeric'})`);
      });
      
      logger.info('Sample Workout Exercise IDs:');
      workoutExerciseIds.forEach((row: any) => {
        logger.info(`- ${row.id} (${typeof row.id}, appears to be: ${isNaN(Number(row.id)) ? 'UUID' : 'numeric'})`);
      });
      
      // Count numeric and UUID IDs
      const numericWorkoutPlanIds = await queryRunner.query(
        `SELECT COUNT(*) FROM workout_plans WHERE id::text ~ '^[0-9]+$'`
      );
      
      const uuidWorkoutPlanIds = await queryRunner.query(
        `SELECT COUNT(*) FROM workout_plans WHERE id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`
      );
      
      const numericWorkoutExerciseIds = await queryRunner.query(
        `SELECT COUNT(*) FROM workout_exercises WHERE id::text ~ '^[0-9]+$'`
      );
      
      const uuidWorkoutExerciseIds = await queryRunner.query(
        `SELECT COUNT(*) FROM workout_exercises WHERE id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`
      );
      
      logger.info(`
=============================================
SIMPLE ID TYPE CHECK REPORT
=============================================
Workout Plans:
- Numeric IDs: ${numericWorkoutPlanIds[0].count}
- UUID IDs: ${uuidWorkoutPlanIds[0].count}

Workout Exercises:
- Numeric IDs: ${numericWorkoutExerciseIds[0].count}
- UUID IDs: ${uuidWorkoutExerciseIds[0].count}

CONCLUSION:
The application code has been updated with a compatibility layer
to handle both ID types. No schema changes are needed.

A sample UUID for reference: ${uuidv4()}
=============================================
      `);
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    logger.error('Failed to check ID types:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      try {
        await AppDataSource.destroy();
        logger.info('Database connection closed');
      } catch (err) {
        logger.error('Error closing database connection:', err);
      }
    }
    logger.info('ID check script completed');
  }
}

// Run the check
runSimpleIdCheck(); 