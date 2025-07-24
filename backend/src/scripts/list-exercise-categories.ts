import { AppDataSource } from "../data-source";
import logger from "../utils/logger";

/**
 * This script lists all exercises and their associated categories
 */
async function listExerciseCategories() {
  try {
    logger.info("Initializing database connection");
    await AppDataSource.initialize();

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Get all exercises with their categories
      const exercises = await queryRunner.query(`
        SELECT 
          e.id as exercise_id,
          e.name as exercise_name,
          e.level as exercise_level,
          e."movementPattern" as movement_pattern,
          array_agg(ec.category_id) as category_ids,
          array_agg(c.name) as category_names
        FROM 
          exercises e
        LEFT JOIN 
          exercise_category ec ON e.id = ec.exercise_id
        LEFT JOIN 
          exercise_categories c ON ec.category_id = c.id
        GROUP BY 
          e.id, e.name, e.level, e."movementPattern"
        ORDER BY 
          e.name
      `);
      
      logger.info(`Found ${exercises.length} exercises with categories:`);
      
      exercises.forEach((ex: any) => {
        logger.info(`Exercise: ${ex.exercise_name} (${ex.exercise_id})`);
        logger.info(`  Level: ${ex.exercise_level}`);
        logger.info(`  Movement: ${ex.movement_pattern || 'Not specified'}`);
        
        if (ex.category_ids && ex.category_ids[0] !== null) {
          logger.info(`  Categories:`);
          ex.category_ids.forEach((catId: number, index: number) => {
            logger.info(`    - ${ex.category_names[index]} (ID: ${catId})`);
          });
        } else {
          logger.info(`  Categories: None assigned`);
        }
        
        logger.info(``); // Empty line for separation
      });
      
    } catch (error) {
      logger.error("Error listing exercise categories:", error);
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    
  } catch (error) {
    logger.error("Error in listExerciseCategories:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  }
}

// Run the script
listExerciseCategories(); 