"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const logger_1 = __importDefault(require("../utils/logger"));
async function fixExerciseRelationships() {
    try {
        logger_1.default.info("Initializing database connection");
        await data_source_1.AppDataSource.initialize();
        const exercises = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).find({
            select: ["id"]
        });
        const exerciseIds = exercises.map(ex => ex.id);
        logger_1.default.info(`Found ${exerciseIds.length} valid exercises in the database`);
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const exerciseCategoryResult = await queryRunner.query(`SELECT exercise_id, category_id FROM exercise_category`);
            logger_1.default.info(`Found ${exerciseCategoryResult.length} exercise-category relationships`);
            const orphanedExerciseCategories = exerciseCategoryResult.filter(relation => !exerciseIds.includes(relation.exercise_id));
            if (orphanedExerciseCategories.length > 0) {
                logger_1.default.info(`Found ${orphanedExerciseCategories.length} orphaned exercise-category relationships to delete`);
                for (const relation of orphanedExerciseCategories) {
                    await queryRunner.query(`DELETE FROM exercise_category WHERE exercise_id = $1 AND category_id = $2`, [relation.exercise_id, relation.category_id]);
                }
                logger_1.default.info(`Deleted ${orphanedExerciseCategories.length} orphaned exercise-category relationships`);
            }
            else {
                logger_1.default.info(`No orphaned exercise-category relationships found`);
            }
            try {
                const exerciseEquipmentResult = await queryRunner.query(`SELECT exercise_id, equipment_id FROM exercise_equipment`);
                logger_1.default.info(`Found ${exerciseEquipmentResult.length} exercise-equipment relationships`);
                const orphanedExerciseEquipment = exerciseEquipmentResult.filter(relation => !exerciseIds.includes(relation.exercise_id));
                if (orphanedExerciseEquipment.length > 0) {
                    logger_1.default.info(`Found ${orphanedExerciseEquipment.length} orphaned exercise-equipment relationships to delete`);
                    for (const relation of orphanedExerciseEquipment) {
                        await queryRunner.query(`DELETE FROM exercise_equipment WHERE exercise_id = $1 AND equipment_id = $2`, [relation.exercise_id, relation.equipment_id]);
                    }
                    logger_1.default.info(`Deleted ${orphanedExerciseEquipment.length} orphaned exercise-equipment relationships`);
                }
                else {
                    logger_1.default.info(`No orphaned exercise-equipment relationships found`);
                }
            }
            catch (error) {
                logger_1.default.info(`No data found in exercise_equipment or table is empty: ${error.message}`);
            }
            await queryRunner.commitTransaction();
            logger_1.default.info("Successfully fixed exercise relationships");
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            logger_1.default.error("Failed to fix exercise relationships:", error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error("Error in fixExerciseRelationships:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
        }
    }
}
fixExerciseRelationships();
//# sourceMappingURL=fix-exercise-relationships.js.map