import { seedExerciseEquipment } from '../seed/seedExerciseEquipment';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';

/**
 * This script runs the seedExerciseEquipment function
 * It will populate the exercise_equipment junction table
 * based on the equipment specified in each exercise.
 */
async function main(): Promise<void> {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection established');
    }
    
    // Run the seed function
    logger.info('Running seedExerciseEquipment function...');
    await seedExerciseEquipment();
    logger.info('Successfully completed exercise equipment seeding');
    
    // Close database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error running seedExerciseEquipment function:', error);
    
    // Ensure connection is closed on error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    
    process.exit(1);
  }
}

// Execute the function
main()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    logger.error('Unhandled error in main process:', error);
    process.exit(1);
  }); 