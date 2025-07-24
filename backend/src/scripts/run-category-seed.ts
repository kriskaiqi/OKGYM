import { AppDataSource } from '../data-source';
import { seedExerciseCategoryJunction } from '../seed/seedExerciseCategoryJunction';
import logger from '../utils/logger';

/**
 * This script runs the seedExerciseCategoryJunction function
 * and verifies that it successfully populates the junction table.
 */
async function runCategorySeed() {
  try {
    logger.info('Starting exercise-category junction seeding verification...');
    
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      logger.info('Initializing database connection...');
      await AppDataSource.initialize();
      logger.info('Database connection initialized successfully');
    }
    
    // Check initial count
    const initialCount = await AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_category"
    `);
    logger.info(`Initial count of entries in exercise_category table: ${initialCount[0].count}`);
    
    // Clear existing entries to force a fresh seeding
    logger.info('Clearing existing entries from exercise_category table to force fresh seeding...');
    await AppDataSource.query(`
      DELETE FROM "exercise_category"
    `);
    
    // Verify the table is empty
    const emptyCount = await AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_category"
    `);
    logger.info(`Table cleared. Current count: ${emptyCount[0].count}`);
    
    // Run the seeding process for the junction table
    logger.info('Running seedExerciseCategoryJunction function...');
    await seedExerciseCategoryJunction();
    
    // Check final count to verify success
    const finalCount = await AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_category"
    `);
    logger.info(`Final count of entries in exercise_category table: ${finalCount[0].count}`);
    
    // Calculate the number of entries added
    const entriesAdded = parseInt(finalCount[0].count);
    
    if (entriesAdded > 0) {
      logger.info(`Success! ${entriesAdded} entries were added to the exercise_category table.`);
      
      // Show a sample of the entries added
      const sampleEntries = await AppDataSource.query(`
        SELECT e.name as exercise_name, c.name as category_name, c.type as category_type
        FROM "exercise_category" ec
        JOIN "exercises" e ON ec.exercise_id = e.id
        JOIN "exercise_categories" c ON ec.category_id = c.id
        LIMIT 5
      `);
      
      logger.info('Sample of entries (first 5):');
      sampleEntries.forEach((entry, index) => {
        logger.info(`${index + 1}. Exercise: ${entry.exercise_name}, Category: ${entry.category_name} (${entry.category_type})`);
      });
      
    } else {
      logger.warn('No entries were added to the exercise_category table. This indicates an issue with the seeding process.');
    }
    
  } catch (error) {
    logger.error('Error during category seeding process:', error);
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
runCategorySeed().catch(error => {
  logger.error('Unhandled error during seeding process:', error);
  process.exit(1);
}); 