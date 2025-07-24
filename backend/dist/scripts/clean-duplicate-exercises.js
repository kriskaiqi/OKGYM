"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const typeorm_1 = require("typeorm");
const logger_1 = __importDefault(require("../utils/logger"));
async function cleanDuplicateExercises() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const workoutExerciseRepository = data_source_1.AppDataSource.getRepository(WorkoutExercise_1.WorkoutExercise);
        const allExercises = await exerciseRepository.find({
            order: { createdAt: 'ASC' }
        });
        logger_1.default.info(`Found ${allExercises.length} exercises in the database`);
        const exercisesToRemove = [];
        const replacementMap = {};
        const processedNames = new Set();
        for (const exercise of allExercises) {
            const normalizedName = exercise.name.toLowerCase().trim();
            if (processedNames.has(normalizedName)) {
                exercisesToRemove.push(exercise);
                continue;
            }
            const similarExercises = allExercises.filter(e => {
                if (e.id === exercise.id)
                    return false;
                const otherName = e.name.toLowerCase().trim();
                return (otherName === normalizedName ||
                    otherName === `${normalizedName}s` ||
                    normalizedName === `${otherName}s` ||
                    (normalizedName.length > 4 && otherName.includes(normalizedName)) ||
                    (otherName.length > 4 && normalizedName.includes(otherName)));
            });
            if (similarExercises.length > 0) {
                logger_1.default.info(`Found ${similarExercises.length} similar exercises to "${exercise.name}"`);
                const exercisesToCompare = [exercise, ...similarExercises];
                const bestExercise = getBestExercise(exercisesToCompare);
                for (const e of exercisesToCompare) {
                    if (e.id !== bestExercise.id) {
                        exercisesToRemove.push(e);
                        replacementMap[e.id] = bestExercise.id;
                    }
                    else {
                        processedNames.add(e.name.toLowerCase().trim());
                    }
                }
            }
            else {
                processedNames.add(normalizedName);
            }
        }
        if (exercisesToRemove.length > 0) {
            logger_1.default.info(`Found ${exercisesToRemove.length} duplicate exercises to process`);
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const duplicateIds = exercisesToRemove.map(e => e.id);
                const workoutExercises = await workoutExerciseRepository.find({
                    where: { exercise: { id: (0, typeorm_1.In)(duplicateIds) } },
                    relations: ['exercise']
                });
                if (workoutExercises.length > 0) {
                    logger_1.default.info(`Found ${workoutExercises.length} workout exercise references to update`);
                    for (const workoutExercise of workoutExercises) {
                        const currentExerciseId = workoutExercise.exercise.id;
                        const replacementExerciseId = replacementMap[currentExerciseId];
                        if (replacementExerciseId) {
                            logger_1.default.info(`Updating reference from ${currentExerciseId} to ${replacementExerciseId}`);
                            await queryRunner.query('UPDATE workout_exercises SET exercise_id = $1 WHERE id = $2', [replacementExerciseId, workoutExercise.id]);
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                for (const exercise of exercisesToRemove) {
                    try {
                        logger_1.default.info(`Removing duplicate exercise: ${exercise.name} (ID: ${exercise.id})`);
                        await queryRunner.manager.delete(Exercise_1.Exercise, exercise.id);
                    }
                    catch (error) {
                        logger_1.default.warn(`Failed to delete exercise ${exercise.name} (ID: ${exercise.id}): ${error.message}`);
                    }
                }
                await queryRunner.commitTransaction();
                logger_1.default.info(`Successfully processed duplicate exercises`);
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                logger_1.default.error('Error during transaction, rolling back changes:', error);
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }
        else {
            logger_1.default.info('No duplicate exercises found');
        }
    }
    catch (error) {
        logger_1.default.error('Error cleaning up duplicate exercises:', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed');
        }
        process.exit(0);
    }
}
function getBestExercise(exercises) {
    return exercises.reduce((best, current) => {
        const getBestScore = (e) => {
            let score = 0;
            if (e.movementPattern)
                score += 3;
            if (e.targetMuscleGroups && e.targetMuscleGroups.length > 0)
                score += 5;
            if (e.synergistMuscleGroups && e.synergistMuscleGroups.length > 0)
                score += 3;
            if (e.description && e.description.length > 20)
                score += 2;
            return score;
        };
        const currentScore = getBestScore(current);
        const bestScore = getBestScore(best);
        return currentScore > bestScore ? current : best;
    }, exercises[0]);
}
cleanDuplicateExercises();
//# sourceMappingURL=clean-duplicate-exercises.js.map