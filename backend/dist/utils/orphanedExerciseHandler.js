"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrphanedExerciseHandler = void 0;
const data_source_1 = require("../data-source");
const models_1 = require("../models");
const logger_1 = __importDefault(require("./logger"));
const RelationshipLoader_1 = require("./RelationshipLoader");
class OrphanedExerciseHandler {
    static async safelyLoadExercises(workoutPlanId) {
        try {
            let idForQuery = workoutPlanId;
            logger_1.default.debug(`Loading exercises for workout plan ID ${idForQuery} (type: ${typeof idForQuery})`);
            const exercises = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'exercises', idForQuery, data_source_1.AppDataSource.getRepository(models_1.WorkoutExercise));
            if (exercises && exercises.length > 0) {
                logger_1.default.debug(`Successfully loaded ${exercises.length} exercises for workout plan ${idForQuery} using RelationshipLoader`);
                return exercises;
            }
            logger_1.default.warn(`No exercises found for workout plan ${idForQuery} using RelationshipLoader, trying direct query`);
            const directExercises = await data_source_1.AppDataSource
                .getRepository(models_1.WorkoutExercise)
                .createQueryBuilder('we')
                .where('we.workout_id = :workoutPlanId', { workoutPlanId: idForQuery })
                .getMany();
            if (directExercises && directExercises.length > 0) {
                logger_1.default.debug(`Successfully loaded ${directExercises.length} exercises for workout plan ${idForQuery} using direct query`);
                return directExercises;
            }
            logger_1.default.warn(`No exercises found for workout plan ${idForQuery} using any method`);
            return [];
        }
        catch (error) {
            logger_1.default.error(`Error loading exercises for workout plan ${workoutPlanId}:`, error);
            return [];
        }
    }
    static async hasOrphanedExercises(workoutPlanId) {
        try {
            const standardExercises = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'exercises', workoutPlanId, data_source_1.AppDataSource.getRepository(models_1.WorkoutExercise));
            const directExercises = await data_source_1.AppDataSource
                .getRepository(models_1.WorkoutExercise)
                .createQueryBuilder('we')
                .where('we.workout_id = :workoutPlanId', { workoutPlanId })
                .getMany();
            return directExercises.length > standardExercises.length;
        }
        catch (error) {
            logger_1.default.error(`Error checking for orphaned exercises for workout plan ${workoutPlanId}:`, error);
            return false;
        }
    }
}
exports.OrphanedExerciseHandler = OrphanedExerciseHandler;
//# sourceMappingURL=orphanedExerciseHandler.js.map