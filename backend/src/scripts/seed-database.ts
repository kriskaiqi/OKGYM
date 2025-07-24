import { runSeeds } from '../seed';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';

/**
 * Script to seed the database with initial data
 */
async function seedDatabase() {
  try {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }
    
    // Run the seed functions
    await runSeeds();
    
    // Generate a comprehensive summary of what was seeded
    await generateSeedingSummary();
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
    
    process.exit(0);
  }
}

/**
 * Generates a comprehensive summary of what was seeded
 */
async function generateSeedingSummary() {
  try {
    logger.info('-----------------------------------------------');
    logger.info('DATABASE SEEDING SUMMARY');
    logger.info('-----------------------------------------------');
    
    // Phase 1: Foundation Tables
    logger.info('PHASE 1: FOUNDATION TABLES');
    
    // Exercise Categories
    const categoryCount = await AppDataSource.query(`SELECT COUNT(*) FROM exercise_categories`);
    logger.info(`- Exercise Categories: ${categoryCount[0].count} records`);
    
    // Get category counts by type
    const categoryTypeCount = await AppDataSource.query(`
      SELECT type, COUNT(*) 
      FROM exercise_categories 
      GROUP BY type 
      ORDER BY type
    `);
    categoryTypeCount.forEach((typeCount: any) => {
      logger.info(`  - ${typeCount.type}: ${typeCount.count} records`);
    });
    
    // Equipment
    const equipmentCount = await AppDataSource.query(`SELECT COUNT(*) FROM equipment`);
    logger.info(`- Equipment: ${equipmentCount[0].count} records`);
    
    // Workout Tags
    const workoutTagCount = await AppDataSource.query(`SELECT COUNT(*) FROM workout_tags`);
    logger.info(`- Workout Tags: ${workoutTagCount[0].count} records`);
    
    // Audio Cues
    const audioCueCount = await AppDataSource.query(`SELECT COUNT(*) FROM audio_cues`);
    logger.info(`- Audio Cues: ${audioCueCount[0].count} records`);
    
    // Achievements
    try {
      const achievementCount = await AppDataSource.query(`SELECT COUNT(*) FROM achievement`);
      logger.info(`- Achievements: ${achievementCount[0].count} records`);
    } catch (error) {
      logger.warn(`- Achievements: Unable to determine table name (tried 'achievement')`);
      
      // Check the actual table name in the database schema
      const tables = await AppDataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name LIKE '%achievement%'
      `);
      
      if (tables.length > 0) {
        const achievementTableName = tables[0].table_name;
        const achievementCount = await AppDataSource.query(`SELECT COUNT(*) FROM "${achievementTableName}"`);
        logger.info(`- Achievements (${achievementTableName}): ${achievementCount[0].count} records`);
      }
    }
    
    // Phase 2: Main Entities
    logger.info('\nPHASE 2: MAIN ENTITIES');
    
    // Exercises
    const exerciseCount = await AppDataSource.query(`SELECT COUNT(*) FROM exercises`);
    logger.info(`- Exercises: ${exerciseCount[0].count} records`);
    
    // Media
    const mediaCount = await AppDataSource.query(`SELECT COUNT(*) FROM media`);
    logger.info(`- Media: ${mediaCount[0].count} records`);
    
    // Workout Plans
    const workoutPlanCount = await AppDataSource.query(`SELECT COUNT(*) FROM workout_plans`);
    logger.info(`- Workout Plans: ${workoutPlanCount[0].count} records`);
    
    // Users
    const userCount = await AppDataSource.query(`SELECT COUNT(*) FROM users`);
    logger.info(`- Users: ${userCount[0].count} records`);
    
    // Phase 3: Relationships
    logger.info('\nPHASE 3: RELATIONSHIPS');
    
    // Exercise-Category relationships
    const exerciseCategoryCount = await AppDataSource.query(`SELECT COUNT(*) FROM exercise_category`);
    logger.info(`- Exercise-Category Relationships: ${exerciseCategoryCount[0].count} records`);
    
    // Exercise-Equipment relationships
    const exerciseEquipmentCount = await AppDataSource.query(`SELECT COUNT(*) FROM exercise_equipment`);
    logger.info(`- Exercise-Equipment Relationships: ${exerciseEquipmentCount[0].count} records`);
    
    // Workout-Exercise relationships - Check table name first
    try {
      // Try with plural form (workout_exercises)
      const workoutExerciseCount = await AppDataSource.query(`SELECT COUNT(*) FROM workout_exercises`);
      logger.info(`- Workout-Exercise Relationships: ${workoutExerciseCount[0].count} records`);
    } catch (error) {
      try {
        // Try with singular form (workout_exercise)
        const workoutExerciseCount = await AppDataSource.query(`SELECT COUNT(*) FROM workout_exercise`);
        logger.info(`- Workout-Exercise Relationships: ${workoutExerciseCount[0].count} records`);
      } catch (innerError) {
        // If both fail, check actual table names and inform user
        logger.warn(`- Workout-Exercise Relationships: Unable to determine table name (tried workout_exercises and workout_exercise)`);
        
        // Check the actual table name in the database schema
        const tables = await AppDataSource.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name LIKE '%workout%exercise%'
        `);
        
        if (tables.length > 0) {
          logger.info(`  Found similar tables: ${tables.map((t: any) => t.table_name).join(', ')}`);
        }
      }
    }
    
    // Additional Details
    logger.info('\nADDITIONAL STATISTICS');
    
    // Exercise coverage for equipment
    const exercisesWithEquipment = await AppDataSource.query(`
      SELECT COUNT(DISTINCT exercise_id) FROM exercise_equipment
    `);
    const equipmentCoverage = (exercisesWithEquipment[0].count / exerciseCount[0].count * 100).toFixed(2);
    logger.info(`- Equipment Coverage: ${exercisesWithEquipment[0].count}/${exerciseCount[0].count} exercises (${equipmentCoverage}%)`);
    
    // Exercise coverage for categories
    const exercisesWithCategories = await AppDataSource.query(`
      SELECT COUNT(DISTINCT exercise_id) FROM exercise_category
    `);
    const categoryCoverage = (exercisesWithCategories[0].count / exerciseCount[0].count * 100).toFixed(2);
    logger.info(`- Category Coverage: ${exercisesWithCategories[0].count}/${exerciseCount[0].count} exercises (${categoryCoverage}%)`);
    
    // Top 5 equipment by exercise usage
    logger.info('\nTOP 5 EQUIPMENT BY USAGE:');
    const topEquipment = await AppDataSource.query(`
      SELECT e.name, COUNT(ee.exercise_id) as exercise_count
      FROM equipment e
      JOIN exercise_equipment ee ON e.id = ee.equipment_id
      GROUP BY e.name
      ORDER BY exercise_count DESC
      LIMIT 5
    `);
    topEquipment.forEach((equipment: any, index: number) => {
      logger.info(`  ${index + 1}. ${equipment.name}: ${equipment.exercise_count} exercises`);
    });
    
    logger.info('-----------------------------------------------');
  } catch (error) {
    logger.error('Error generating seeding summary:', error);
  }
}

// Run the seeding function
seedDatabase(); 