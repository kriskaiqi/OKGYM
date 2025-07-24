import { AppDataSource } from '../data-source';
import { WorkoutPlan } from '../models/WorkoutPlan';
import logger from '../utils/logger';

/**
 * Script to reset the workout plans table and all related junction tables
 */
async function resetWorkoutPlansTable(): Promise<void> {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan);
    
    // Get count before deletion
    const countBefore = await workoutPlanRepository.count();
    logger.info(`Current workout plan count: ${countBefore}`);
    
    // Track counts of the junction tables before deletion
    const workoutExercisesCount = await AppDataSource.query('SELECT COUNT(*) FROM workout_exercises');
    const workoutMuscleGroupCount = await AppDataSource.query('SELECT COUNT(*) FROM workout_muscle_group');
    const workoutTagMapCount = await AppDataSource.query('SELECT COUNT(*) FROM workout_tag_map');
    const workoutEquipmentCount = await AppDataSource.query('SELECT COUNT(*) FROM workout_equipment');
    
    logger.info(`Current junction table counts:`);
    logger.info(`- workout_exercises: ${workoutExercisesCount[0].count}`);
    logger.info(`- workout_muscle_group: ${workoutMuscleGroupCount[0].count}`);
    logger.info(`- workout_tag_map: ${workoutTagMapCount[0].count}`);
    logger.info(`- workout_equipment: ${workoutEquipmentCount[0].count}`);
    
    // Use raw query with CASCADE to handle foreign key constraints
    // This will also clear all related junction tables
    await AppDataSource.query('TRUNCATE TABLE "workout_plans" CASCADE');
    logger.info(`Successfully deleted all workout plans from the database with CASCADE`);
    
    // Verify deletion
    const countAfter = await workoutPlanRepository.count();
    logger.info(`Workout plan count after reset: ${countAfter}`);
    
    // Verify counts of junction tables are also zero
    const workoutExercisesCountAfter = await AppDataSource.query('SELECT COUNT(*) FROM workout_exercises');
    const workoutMuscleGroupCountAfter = await AppDataSource.query('SELECT COUNT(*) FROM workout_muscle_group');
    const workoutTagMapCountAfter = await AppDataSource.query('SELECT COUNT(*) FROM workout_tag_map');
    const workoutEquipmentCountAfter = await AppDataSource.query('SELECT COUNT(*) FROM workout_equipment');
    
    logger.info(`Junction table counts after reset:`);
    logger.info(`- workout_exercises: ${workoutExercisesCountAfter[0].count}`);
    logger.info(`- workout_muscle_group: ${workoutMuscleGroupCountAfter[0].count}`);
    logger.info(`- workout_tag_map: ${workoutTagMapCountAfter[0].count}`);
    logger.info(`- workout_equipment: ${workoutEquipmentCountAfter[0].count}`);
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
  } catch (error) {
    logger.error('Error resetting workout plans table:', error);
    
    // Ensure connection is closed even if there's an error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed after error');
    }
    
    throw error;
  }
}

// Execute the function
resetWorkoutPlansTable()
  .then(() => {
    console.log('Workout plans and related junction tables reset completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reset workout plans tables:', error);
    process.exit(1);
  }); 