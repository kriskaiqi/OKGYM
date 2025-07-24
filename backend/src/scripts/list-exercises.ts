import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import logger from '../utils/logger';

/**
 * Simple script to list all exercises in the database
 */
async function listExercises() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    const exerciseRepository = AppDataSource.getRepository(Exercise);
    
    // Get all exercises
    const exercises = await exerciseRepository.find({
      order: { name: 'ASC' }
    });
    
    console.log(`Found ${exercises.length} exercises in the database:\n`);
    
    // Log each exercise and its data
    exercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name} (ID: ${exercise.id})`);
      console.log(`   Level: ${exercise.level}`);
      console.log(`   Movement: ${exercise.movementPattern || 'Not specified'}`);
      console.log(`   Target Muscles: ${exercise.targetMuscleGroups || 'Not specified'}`);
      console.log(`   Synergist Muscles: ${exercise.synergistMuscleGroups || 'Not specified'}`);
      console.log('');
    });
    
  } catch (error) {
    logger.error('Error listing exercises:', error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
    
    process.exit(0);
  }
}

// Run the function
listExercises(); 