import { AppDataSource } from "../data-source";
import { Exercise } from "../models/Exercise";
import logger from "../utils/logger";

/**
 * This script checks and fixes equipment-muscle group relationships for the current exercises.
 * It ensures that all equipment-muscle group mappings correspond to exercises that still exist.
 */
async function fixEquipmentMuscleGroups() {
  try {
    logger.info("Initializing database connection");
    await AppDataSource.initialize();

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Get all current exercise IDs
      const exercises = await AppDataSource.getRepository(Exercise).find({
        select: ["id"]
      });
      const exerciseIds = exercises.map(ex => ex.id);
      
      logger.info(`Found ${exerciseIds.length} valid exercises in the database`);

      // Check equipment_muscle_groups table
      const equipmentMuscleGroups = await queryRunner.query(
        `SELECT * FROM equipment_muscle_groups`
      );
      
      logger.info(`Found ${equipmentMuscleGroups.length} equipment-muscle group relationships`);

      // Start transaction
      await queryRunner.startTransaction();

      // Check equipment_exercise relationships (if the table exists)
      try {
        const equipmentExerciseRelations = await queryRunner.query(
          `SELECT * FROM equipment_exercises`
        );
        
        logger.info(`Found ${equipmentExerciseRelations.length} equipment-exercise relationships`);
        
        // Find orphaned equipment-exercise relationships
        const orphanedEquipmentExercises = equipmentExerciseRelations.filter(
          relation => !exerciseIds.includes(relation.exercise_id)
        );
        
        if (orphanedEquipmentExercises.length > 0) {
          logger.info(`Found ${orphanedEquipmentExercises.length} orphaned equipment-exercise relationships to delete`);
          
          // Delete orphaned relationships
          for (const relation of orphanedEquipmentExercises) {
            await queryRunner.query(
              `DELETE FROM equipment_exercises WHERE id = $1`,
              [relation.id]
            );
          }
          
          logger.info(`Deleted ${orphanedEquipmentExercises.length} orphaned equipment-exercise relationships`);
        } else {
          logger.info(`No orphaned equipment-exercise relationships found`);
        }
      } catch (error) {
        logger.info(`equipment_exercises table doesn't exist or another error occurred: ${error.message}`);
      }

      // Check exercise_category relationships
      try {
        const exerciseCategoryRelations = await queryRunner.query(
          `SELECT * FROM exercise_categories`
        );
        
        logger.info(`Found ${exerciseCategoryRelations.length} exercise-category relationships`);
        
        // Find orphaned exercise-category relationships
        const orphanedExerciseCategories = exerciseCategoryRelations.filter(
          relation => !exerciseIds.includes(relation.exercise_id)
        );
        
        if (orphanedExerciseCategories.length > 0) {
          logger.info(`Found ${orphanedExerciseCategories.length} orphaned exercise-category relationships to delete`);
          
          // Delete orphaned relationships
          for (const relation of orphanedExerciseCategories) {
            await queryRunner.query(
              `DELETE FROM exercise_categories WHERE exercise_id = $1 AND category_id = $2`,
              [relation.exercise_id, relation.category_id]
            );
          }
          
          logger.info(`Deleted ${orphanedExerciseCategories.length} orphaned exercise-category relationships`);
        } else {
          logger.info(`No orphaned exercise-category relationships found`);
        }
      } catch (error) {
        logger.info(`exercise_categories table doesn't exist or another error occurred: ${error.message}`);
      }

      // Commit transaction
      await queryRunner.commitTransaction();
      logger.info("Successfully fixed relationships");
      
    } catch (error) {
      // Rollback transaction on error
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      logger.error("Error fixing relationships:", error);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    
  } catch (error) {
    logger.error("Error in fixEquipmentMuscleGroups:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  }
}

// Run the script
fixEquipmentMuscleGroups(); 