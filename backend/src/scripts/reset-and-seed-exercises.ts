import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import logger from '../utils/logger';
import { seedExercises } from '../seed/seedExercises';

/**
 * Script to reset and then seed the exercises table
 * This ensures we have exactly the exercises defined in seedExercises.ts
 */
async function resetAndSeedExercisesTable(): Promise<void> {
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
    
    // Run the seed function
    logger.info('Starting exercise seeding...');
    await seedExercises();
    
    // Verify seeding
    const countFinal = await exerciseRepository.count();
    logger.info(`Final exercise count after seeding: ${countFinal}`);
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
  } catch (error) {
    logger.error('Error resetting and seeding exercises table:', error);
    
    // Ensure connection is closed even if there's an error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed after error');
    }
    
    throw error;
  }
}

// Execute the function
resetAndSeedExercisesTable()
  .then(() => {
    console.log('Exercise table reset and seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reset and seed exercise table:', error);
    process.exit(1);
  }); 