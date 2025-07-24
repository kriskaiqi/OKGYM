"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const uuid_1 = require("uuid");
async function updateMissingUuids() {
    try {
        logger_1.default.info('Starting UUID compatibility check...');
        await data_source_1.AppDataSource.initialize();
        logger_1.default.info('Database connection established');
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const workoutPlans = await queryRunner.query(`SELECT id FROM workout_plans WHERE id ~ '^[0-9]+$'`);
            if (workoutPlans.length === 0) {
                logger_1.default.info('No workout plans with numeric IDs found. All UUIDs are properly set.');
            }
            else {
                logger_1.default.info(`Found ${workoutPlans.length} workout plans with numeric IDs. Updating...`);
                const idMapping = {};
                for (const plan of workoutPlans) {
                    const oldId = plan.id;
                    const newId = (0, uuid_1.v4)();
                    idMapping[oldId] = newId;
                }
                for (const [oldId, newId] of Object.entries(idMapping)) {
                    logger_1.default.info(`Updating workout plan with ID ${oldId} to UUID ${newId}`);
                    await queryRunner.query(`UPDATE workout_plans SET id = $1 WHERE id = $2`, [newId, oldId]);
                    await queryRunner.query(`UPDATE workout_exercises SET workout_plan_id = $1 WHERE workout_plan_id = $2`, [newId, oldId]);
                    await queryRunner.query(`UPDATE workout_sessions SET workout_plan_id = $1 WHERE workout_plan_id = $2`, [newId, oldId]);
                    await queryRunner.query(`UPDATE workout_tag_map SET workout_id = $1 WHERE workout_id = $2`, [newId, oldId]);
                    await queryRunner.query(`UPDATE workout_muscle_group SET workout_id = $1 WHERE workout_id = $2`, [newId, oldId]);
                    await queryRunner.query(`UPDATE workout_equipment SET workout_id = $1 WHERE workout_id = $2`, [newId, oldId]);
                    await queryRunner.query(`UPDATE user_bookmarks SET workout_plan_id = $1 WHERE workout_plan_id = $2`, [newId, oldId]);
                    await queryRunner.query(`UPDATE user_progress SET workout_id = $1 WHERE workout_id = $2`, [newId, oldId]);
                }
            }
            const workoutExercises = await queryRunner.query(`SELECT id FROM workout_exercises WHERE id ~ '^[0-9]+$'`);
            if (workoutExercises.length === 0) {
                logger_1.default.info('No workout exercises with numeric IDs found. All UUIDs are properly set.');
            }
            else {
                logger_1.default.info(`Found ${workoutExercises.length} workout exercises with numeric IDs. Updating...`);
                const exerciseIdMapping = {};
                for (const exercise of workoutExercises) {
                    const oldId = exercise.id;
                    const newId = (0, uuid_1.v4)();
                    exerciseIdMapping[oldId] = newId;
                }
                for (const [oldId, newId] of Object.entries(exerciseIdMapping)) {
                    logger_1.default.info(`Updating workout exercise with ID ${oldId} to UUID ${newId}`);
                    await queryRunner.query(`UPDATE workout_exercises SET id = $1 WHERE id = $2`, [newId, oldId]);
                    await queryRunner.query(`UPDATE workout_exercises SET superset_with_exercise_id = $1 WHERE superset_with_exercise_id = $2`, [newId, oldId]);
                }
            }
            await queryRunner.commitTransaction();
            logger_1.default.info('UUID compatibility update completed successfully!');
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            logger_1.default.error('Error during UUID compatibility update:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error('UUID compatibility update failed:', error);
        process.exit(1);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
        process.exit(0);
    }
}
updateMissingUuids();
//# sourceMappingURL=update-missing-uuids.js.map