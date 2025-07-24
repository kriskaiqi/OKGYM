import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import logger from '../utils/logger';

/**
 * Script to reset only the users table
 */
async function resetUsersTable(): Promise<void> {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    const userRepository = AppDataSource.getRepository(User);
    
    // Get count before deletion
    const countBefore = await userRepository.count();
    logger.info(`Current user count: ${countBefore}`);
    
    // Use raw query with CASCADE to handle foreign key constraints
    await AppDataSource.query('TRUNCATE TABLE "users" CASCADE');
    logger.info(`Successfully deleted all users from the database with CASCADE`);
    
    // Verify deletion
    const countAfter = await userRepository.count();
    logger.info(`User count after reset: ${countAfter}`);
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
  } catch (error) {
    logger.error('Error resetting users table:', error);
    
    // Ensure connection is closed even if there's an error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed after error');
    }
    
    throw error;
  }
}

// Execute the function
resetUsersTable()
  .then(() => {
    console.log('Users table reset completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reset users table:', error);
    process.exit(1);
  }); 