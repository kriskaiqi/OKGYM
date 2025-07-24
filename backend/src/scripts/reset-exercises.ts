import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import logger from '../utils/logger';

/**
 * Script to reset only the exercises table
 */
async function resetExercisesTable(): Promise<void> {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    const exerciseRepository = AppDataSource.getRepository(Exercise);
    
    // Get count before deletion
    const countBefore = await exerciseRepository.count();
    logger.info(`Current exercise count: ${countBefore}`);
    
    // Use raw query with CASCADE to handle foreign key constraints
    await AppDataSource.query('TRUNCATE TABLE "exercises" CASCADE');
    logger.info(`Successfully deleted all exercises from the database with CASCADE`);
    
    // Verify deletion
    const countAfter = await exerciseRepository.count();
    logger.info(`Exercise count after reset: ${countAfter}`);
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
  } catch (error) {
    logger.error('Error resetting exercises table:', error);
    
    // Ensure connection is closed even if there's an error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed after error');
    }
    
    throw error;
  }
}

// Execute the function
resetExercisesTable()
  .then(() => {
    console.log('Exercise table reset completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reset exercise table:', error);
    process.exit(1);
  }); 