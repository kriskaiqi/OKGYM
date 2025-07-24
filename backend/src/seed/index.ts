import { AppDataSource } from '../data-source';
import { seedExerciseCategories } from './seedExerciseCategories';
import { seedEquipment } from './seedEquipment';
import { seedExercises } from './seedExercises';
import { seedMedia } from './seedMedia';
import { seedWorkoutTags } from './seedWorkoutTags';
import { seedAchievements } from './seedAchievements';
import { seedAudioCues } from './seedAudioCues';
import { seedUsers } from './seedUsers';
import { seedWorkoutPlans } from './seedWorkoutPlans';
import { seedWorkouts } from './seedWorkouts';
import { seedExerciseCategoryJunction } from './seedExerciseCategoryJunction';
import { seedExerciseEquipment } from './seedExerciseEquipment';
import { seedExerciseMedia } from './seedExerciseMedia';
// Comment out AI model config import as it's not yet implemented
// import { seedAIModelConfig } from './seedAIModelConfig';
import logger from '../utils/logger';

/**
 * Main function to orchestrate seeding the database
 */
export async function runSeeds() {
  try {
    // Only initialize the database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized for seeding');
    }

    // Phase 1: Foundation Tables (no dependencies)
    logger.info('Phase 1: Seeding foundation tables (no dependencies)...');
    
    // 1. Seed exercise categories (muscle groups, etc)
    await seedExerciseCategories();
    
    // 2. Seed workout tags
    await seedWorkoutTags();
    
    // 3. Seed audio cues
    await seedAudioCues();
    
    // Phase 2: Core Reference Data (depends on foundation)
    logger.info('Phase 2: Seeding core reference data...');
    
    // 4. Seed equipment (depends on categories and tags)
    try {
      await seedEquipment();
    } catch (equipError) {
      logger.error('Error seeding equipment (continuing):', {
        message: equipError instanceof Error ? equipError.message : 'Unknown error' 
      });
    }
    
    // Phase 3: Supporting Entities
    logger.info('Phase 3: Seeding supporting entities...');
    
    // 5. Seed achievements
    try {
      await seedAchievements();
    } catch (achieveError) {
      logger.error('Error seeding achievements (continuing):', { 
        message: achieveError instanceof Error ? achieveError.message : 'Unknown error'
      });
    }
    
    // 6. Seed media (depends on equipment)
    try {
      await seedMedia();
    } catch (mediaError) {
      logger.error('Error seeding media (continuing):', {
        message: mediaError instanceof Error ? mediaError.message : 'Unknown error'
      });
    }
    
    // 7. Seed exercises (depends on categories, equipment, and media)
    try {
      await seedExercises();
    } catch (exerciseError) {
      logger.error('Error seeding exercises (continuing):', {
        message: exerciseError instanceof Error ? exerciseError.message : 'Unknown error'
      });
    }
    
    // 8. Seed exercise-category junction table (depends on exercises and categories)
    try {
      logger.info('Starting to seed exercise-category junction table...');
      await seedExerciseCategoryJunction();
    } catch (junctionError) {
      logger.error('Error seeding exercise-category junction table (continuing):', {
        message: junctionError instanceof Error ? junctionError.message : 'Unknown error'
      });
    }
    
    // 9. Seed exercise-equipment junction table (depends on exercises and equipment)
    try {
      logger.info('Starting to seed exercise-equipment junction table...');
      await seedExerciseEquipment();
    } catch (exerciseEquipError) {
      logger.error('Error seeding exercise-equipment junction table (continuing):', {
        message: exerciseEquipError instanceof Error ? exerciseEquipError.message : 'Unknown error'
      });
    }
    
    // 10. Seed exercise media (depends on exercises)
    try {
      logger.info('Starting to seed exercise media...');
      await seedExerciseMedia();
    } catch (exerciseMediaError) {
      logger.error('Error seeding exercise media (continuing):', {
        message: exerciseMediaError instanceof Error ? exerciseMediaError.message : 'Unknown error'
      });
    }
    
    // 11. Seed workout plans (depends on exercises, equipment, and categories)
    try {
      await seedWorkoutPlans();
    } catch (workoutPlanError) {
      logger.error('Error seeding workout plans (continuing):', {
        message: workoutPlanError instanceof Error ? workoutPlanError.message : 'Unknown error'
      });
    }
    
    // 12. Seed legacy workout plans (for backward compatibility)
    try {
      await seedWorkouts();
    } catch (workoutError) {
      logger.error('Error seeding legacy workout plans (continuing):', {
        message: workoutError instanceof Error ? workoutError.message : 'Unknown error'
      });
    }
    
    // 13. Seed users (admin user)
    try {
      await seedUsers();
    } catch (userError) {
      logger.error('Error seeding users (continuing):', {
        message: userError instanceof Error ? userError.message : 'Unknown error'
      });
    }
    
    // Skipping AI model config seeding as it's not yet implemented
    // try {
    //   await seedAIModelConfig();
    // } catch (aiError) {
    //   logger.error('Error seeding AI model config (continuing):', {
    //     message: aiError instanceof Error ? aiError.message : 'Unknown error'
    //   });
    // }
    
    logger.info('All seeds completed successfully');
  } catch (error) {
    logger.error('Error running seeds:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorObj: error
    });
    throw error;
  } finally {
    // Do NOT close the database connection here when called from app.ts
    // It will be managed by the main app
  }
} 