import { AppDataSource } from '../data-source';
import { seedAudioCues } from '../seed/seedAudioCues';
import logger from '../utils/logger';

/**
 * Script to seed only audio cues
 */
async function seedAudioOnly() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }
    
    // Seed audio cues
    await seedAudioCues();
    
    logger.info('Audio cues seeded successfully');
  } catch (error) {
    logger.error('Error seeding audio cues:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  } finally {
    // Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
    
    process.exit(0);
  }
}

 