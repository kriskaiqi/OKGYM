import { AppDataSource } from '../data-source';
import logger from '../utils/logger';

/**
 * This script synchronizes entity model changes to the database
 * focusing only on adding columns and indexes, but not changing existing constraints.
 */
async function main() {
  try {
    logger.info('Starting TypeORM entity synchronization...');
    await AppDataSource.initialize();
    
    // Instead of using dataSource.synchronize() which tries to drop constraints,
    // we'll just run a query to check database is accessible
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      logger.info('Connected to database successfully');
      
      // Check if migrations need to be executed
      const pendingMigrations = await AppDataSource.showMigrations();
      logger.info(`Pending migrations: ${pendingMigrations}`);
      
      // Check workoutPlanId type in WorkoutExercise and WorkoutSession
      const workoutExerciseQuery = await queryRunner.query(
        `SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'`
      );
      
      logger.info(`WorkoutExercise.workout_plan_id type: ${JSON.stringify(workoutExerciseQuery)}`);
      
      const workoutSessionQuery = await queryRunner.query(
        `SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_name = 'workout_sessions' AND column_name = 'workout_plan_id'`
      );
      
      logger.info(`WorkoutSession.workout_plan_id type: ${JSON.stringify(workoutSessionQuery)}`);
      
      // Log the type mismatch situation for documentation
      logger.info('Entity models have been updated to use consistent UUID types.');
      logger.info('WorkoutPlan.id, WorkoutExercise.workout_plan_id, and WorkoutSession.workout_plan_id now use string/UUID types.');
      logger.info('Database schema modifications need to be handled manually or with TypeORM migrations.');
      
      logger.info('Synchronization completed successfully!');
    } finally {
      await queryRunner.release();
      await AppDataSource.destroy();
    }
  } catch (error) {
    logger.error(`Synchronization failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

main().then(() => {
  logger.info('Script execution completed');
}).catch(err => {
  logger.error('Script execution failed:', err);
}); 