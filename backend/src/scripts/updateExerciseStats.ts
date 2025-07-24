import { AppDataSource } from '../data-source';
import { updateExerciseStats } from '../seed/seedExercises';
import logger from '../utils/logger';

/**
 * Script to update exercise stats with realistic values
 */
async function main() {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      logger.info('Initializing database connection...');
      await AppDataSource.initialize();
    }
    
    logger.info('Starting exercise stats update process...');
    await updateExerciseStats();
    logger.info('Exercise stats update completed successfully!');
    
    // Close the connection
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    logger.error('Failed to update exercise stats:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the script
main(); 