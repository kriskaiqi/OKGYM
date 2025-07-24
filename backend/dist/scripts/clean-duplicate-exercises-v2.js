"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const logger_1 = __importDefault(require("../utils/logger"));
async function cleanDuplicateExercisesV2() {
    try {
        logger_1.default.info("Initializing database connection");
        await data_source_1.AppDataSource.initialize();
        const exercises = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).find({
            order: { createdAt: "ASC" }
        });
        logger_1.default.info(`Found ${exercises.length} exercises in the database`);
        const exercisesByName = {};
        exercises.forEach(exercise => {
            if (!exercisesByName[exercise.name]) {
                exercisesByName[exercise.name] = [];
            }
            exercisesByName[exercise.name].push(exercise);
        });
        const duplicateSets = [];
        for (const [name, exs] of Object.entries(exercisesByName)) {
            if (exs.length > 1) {
                logger_1.default.info(`Found ${exs.length - 1} similar exercises to "${name}"`);
                const keeper = exs[0];
                const duplicates = exs.slice(1);
                duplicateSets.push({ keeper, duplicates });
            }
        }
        if (duplicateSets.length === 0) {
            logger_1.default.info("No duplicate exercises found!");
            return;
        }
        const idMapping = {};
        const allDuplicateIds = [];
        duplicateSets.forEach(({ keeper, duplicates }) => {
            duplicates.forEach(duplicate => {
                idMapping[duplicate.id] = keeper.id;
                allDuplicateIds.push(duplicate.id);
            });
        });
        logger_1.default.info(`Found ${allDuplicateIds.length} duplicate exercises to remove`);
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const placeholders = allDuplicateIds.map((_, idx) => `$${idx + 1}`).join(',');
            const workoutExercisesResult = await queryRunner.query(`SELECT id, exercise_id FROM workout_exercises WHERE exercise_id IN (${placeholders})`, allDuplicateIds);
            logger_1.default.info(`Found ${workoutExercisesResult.length} workout exercise references to update`);
            for (const workoutExercise of workoutExercisesResult) {
                const newExerciseId = idMapping[workoutExercise.exercise_id];
                logger_1.default.info(`Updating reference from ${workoutExercise.exercise_id} to ${newExerciseId} for workout exercise ${workoutExercise.id}`);
                await queryRunner.query(`UPDATE workout_exercises SET exercise_id = $1 WHERE id = $2`, [newExerciseId, workoutExercise.id]);
            }
            if (allDuplicateIds.length > 0) {
                logger_1.default.info("Deleting all duplicate exercises");
                const deletePlaceholders = allDuplicateIds.map((_, idx) => `$${idx + 1}`).join(',');
                await queryRunner.query(`DELETE FROM exercises WHERE id IN (${deletePlaceholders})`, allDuplicateIds);
            }
            await queryRunner.commitTransaction();
            logger_1.default.info("Successfully processed duplicate exercises");
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            logger_1.default.error("Failed to process duplicate exercises:", error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error("Error in cleanDuplicateExercisesV2:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
        }
    }
}
cleanDuplicateExercisesV2();
//# sourceMappingURL=clean-duplicate-exercises-v2.js.map