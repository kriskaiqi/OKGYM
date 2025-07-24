import { AppDataSource } from "../data-source";
import { Exercise } from "../models/Exercise";
import logger from "../utils/logger";

/**
 * This script fixes the relationships between exercises, categories, and equipment
 * after cleanup of duplicate exercises. It ensures that only relationships pointing
 * to existing exercises remain in the database.
 */
async function fixExerciseRelationships() {
  try {
    logger.info("Initializing database connection");
    await AppDataSource.initialize();

    // Get all current exercise IDs
    const exercises = await AppDataSource.getRepository(Exercise).find({
      select: ["id"]
    });
    const exerciseIds = exercises.map(ex => ex.id);
    
    logger.info(`Found ${exerciseIds.length} valid exercises in the database`);

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Fix exercise_category relationships
      const exerciseCategoryResult = await queryRunner.query(
        `SELECT exercise_id, category_id FROM exercise_category`
      );
      
      logger.info(`Found ${exerciseCategoryResult.length} exercise-category relationships`);
      
      // Find orphaned relationships
      const orphanedExerciseCategories = exerciseCategoryResult.filter(
        relation => !exerciseIds.includes(relation.exercise_id)
      );
      
      if (orphanedExerciseCategories.length > 0) {
        logger.info(`Found ${orphanedExerciseCategories.length} orphaned exercise-category relationships to delete`);
        
        // Delete orphaned relationships
        for (const relation of orphanedExerciseCategories) {
          await queryRunner.query(
            `DELETE FROM exercise_category WHERE exercise_id = $1 AND category_id = $2`,
            [relation.exercise_id, relation.category_id]
          );
        }
        
        logger.info(`Deleted ${orphanedExerciseCategories.length} orphaned exercise-category relationships`);
      } else {
        logger.info(`No orphaned exercise-category relationships found`);
      }

      // Fix exercise_equipment relationships
      try {
        const exerciseEquipmentResult = await queryRunner.query(
          `SELECT exercise_id, equipment_id FROM exercise_equipment`
        );
        
        logger.info(`Found ${exerciseEquipmentResult.length} exercise-equipment relationships`);
        
        // Find orphaned relationships
        const orphanedExerciseEquipment = exerciseEquipmentResult.filter(
          relation => !exerciseIds.includes(relation.exercise_id)
        );
        
        if (orphanedExerciseEquipment.length > 0) {
          logger.info(`Found ${orphanedExerciseEquipment.length} orphaned exercise-equipment relationships to delete`);
          
          // Delete orphaned relationships
          for (const relation of orphanedExerciseEquipment) {
            await queryRunner.query(
              `DELETE FROM exercise_equipment WHERE exercise_id = $1 AND equipment_id = $2`,
              [relation.exercise_id, relation.equipment_id]
            );
          }
          
          logger.info(`Deleted ${orphanedExerciseEquipment.length} orphaned exercise-equipment relationships`);
        } else {
          logger.info(`No orphaned exercise-equipment relationships found`);
        }
      } catch (error) {
        logger.info(`No data found in exercise_equipment or table is empty: ${error.message}`);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      logger.info("Successfully fixed exercise relationships");
      
    } catch (error) {
      // Rollback the transaction if something goes wrong
      await queryRunner.rollbackTransaction();
      logger.error("Failed to fix exercise relationships:", error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
    
  } catch (error) {
    logger.error("Error in fixExerciseRelationships:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  }
}

// Run the script
fixExerciseRelationships(); 