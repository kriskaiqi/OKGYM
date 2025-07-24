import { AppDataSource } from '../data-source';
import { seedExerciseCategoryJunction } from '../seed/seedExerciseCategoryJunction';
import logger from '../utils/logger';

/**
 * This script fixes the exercise-category relationships by properly populating
 * the junction table without changing the database schema.
 */
async function fixExerciseCategories() {
  try {
    logger.info('Starting exercise-category junction table fix...');
    
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      logger.info('Initializing database connection...');
      await AppDataSource.initialize();
      logger.info('Database connection initialized successfully');
    }
    
    // Check if junction table exists
    const { rows: tables } = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'exercise_category'
      );
    `);
    
    if (!tables[0].exists) {
      logger.error('The exercise_category junction table does not exist. Please run the fix-category-table.js script first.');
      process.exit(1);
    }
    
    // Run the seeding process for the junction table
    await seedExerciseCategoryJunction();
    
    logger.info('Exercise-category junction table fix completed successfully');
  } catch (error) {
    logger.error('Error fixing exercise-category junction table:', error);
    process.exit(1);
  } finally {
    // Close database connection if we opened it
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
  }
}

// Run the function
fixExerciseCategories().catch(error => {
  logger.error('Unhandled error during fix process:', error);
  process.exit(1);
}); 