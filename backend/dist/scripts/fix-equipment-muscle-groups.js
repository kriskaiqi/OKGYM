"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const logger_1 = __importDefault(require("../utils/logger"));
async function fixEquipmentMuscleGroups() {
    try {
        logger_1.default.info("Initializing database connection");
        await data_source_1.AppDataSource.initialize();
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const exercises = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).find({
                select: ["id"]
            });
            const exerciseIds = exercises.map(ex => ex.id);
            logger_1.default.info(`Found ${exerciseIds.length} valid exercises in the database`);
            const equipmentMuscleGroups = await queryRunner.query(`SELECT * FROM equipment_muscle_groups`);
            logger_1.default.info(`Found ${equipmentMuscleGroups.length} equipment-muscle group relationships`);
            await queryRunner.startTransaction();
            try {
                const equipmentExerciseRelations = await queryRunner.query(`SELECT * FROM equipment_exercises`);
                logger_1.default.info(`Found ${equipmentExerciseRelations.length} equipment-exercise relationships`);
                const orphanedEquipmentExercises = equipmentExerciseRelations.filter(relation => !exerciseIds.includes(relation.exercise_id));
                if (orphanedEquipmentExercises.length > 0) {
                    logger_1.default.info(`Found ${orphanedEquipmentExercises.length} orphaned equipment-exercise relationships to delete`);
                    for (const relation of orphanedEquipmentExercises) {
                        await queryRunner.query(`DELETE FROM equipment_exercises WHERE id = $1`, [relation.id]);
                    }
                    logger_1.default.info(`Deleted ${orphanedEquipmentExercises.length} orphaned equipment-exercise relationships`);
                }
                else {
                    logger_1.default.info(`No orphaned equipment-exercise relationships found`);
                }
            }
            catch (error) {
                logger_1.default.info(`equipment_exercises table doesn't exist or another error occurred: ${error.message}`);
            }
            try {
                const exerciseCategoryRelations = await queryRunner.query(`SELECT * FROM exercise_categories`);
                logger_1.default.info(`Found ${exerciseCategoryRelations.length} exercise-category relationships`);
                const orphanedExerciseCategories = exerciseCategoryRelations.filter(relation => !exerciseIds.includes(relation.exercise_id));
                if (orphanedExerciseCategories.length > 0) {
                    logger_1.default.info(`Found ${orphanedExerciseCategories.length} orphaned exercise-category relationships to delete`);
                    for (const relation of orphanedExerciseCategories) {
                        await queryRunner.query(`DELETE FROM exercise_categories WHERE exercise_id = $1 AND category_id = $2`, [relation.exercise_id, relation.category_id]);
                    }
                    logger_1.default.info(`Deleted ${orphanedExerciseCategories.length} orphaned exercise-category relationships`);
                }
                else {
                    logger_1.default.info(`No orphaned exercise-category relationships found`);
                }
            }
            catch (error) {
                logger_1.default.info(`exercise_categories table doesn't exist or another error occurred: ${error.message}`);
            }
            await queryRunner.commitTransaction();
            logger_1.default.info("Successfully fixed relationships");
        }
        catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            logger_1.default.error("Error fixing relationships:", error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error("Error in fixEquipmentMuscleGroups:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
        }
    }
}
fixEquipmentMuscleGroups();
//# sourceMappingURL=fix-equipment-muscle-groups.js.map