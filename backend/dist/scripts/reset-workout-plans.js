"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const logger_1 = __importDefault(require("../utils/logger"));
async function resetWorkoutPlansTable() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        const workoutPlanRepository = data_source_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
        const countBefore = await workoutPlanRepository.count();
        logger_1.default.info(`Current workout plan count: ${countBefore}`);
        const workoutExercisesCount = await data_source_1.AppDataSource.query('SELECT COUNT(*) FROM workout_exercises');
        const workoutMuscleGroupCount = await data_source_1.AppDataSource.query('SELECT COUNT(*) FROM workout_muscle_group');
        const workoutTagMapCount = await data_source_1.AppDataSource.query('SELECT COUNT(*) FROM workout_tag_map');
        const workoutEquipmentCount = await data_source_1.AppDataSource.query('SELECT COUNT(*) FROM workout_equipment');
        logger_1.default.info(`Current junction table counts:`);
        logger_1.default.info(`- workout_exercises: ${workoutExercisesCount[0].count}`);
        logger_1.default.info(`- workout_muscle_group: ${workoutMuscleGroupCount[0].count}`);
        logger_1.default.info(`- workout_tag_map: ${workoutTagMapCount[0].count}`);
        logger_1.default.info(`- workout_equipment: ${workoutEquipmentCount[0].count}`);
        await data_source_1.AppDataSource.query('TRUNCATE TABLE "workout_plans" CASCADE');
        logger_1.default.info(`Successfully deleted all workout plans from the database with CASCADE`);
        const countAfter = await workoutPlanRepository.count();
        logger_1.default.info(`Workout plan count after reset: ${countAfter}`);
        const workoutExercisesCountAfter = await data_source_1.AppDataSource.query('SELECT COUNT(*) FROM workout_exercises');
        const workoutMuscleGroupCountAfter = await data_source_1.AppDataSource.query('SELECT COUNT(*) FROM workout_muscle_group');
        const workoutTagMapCountAfter = await data_source_1.AppDataSource.query('SELECT COUNT(*) FROM workout_tag_map');
        const workoutEquipmentCountAfter = await data_source_1.AppDataSource.query('SELECT COUNT(*) FROM workout_equipment');
        logger_1.default.info(`Junction table counts after reset:`);
        logger_1.default.info(`- workout_exercises: ${workoutExercisesCountAfter[0].count}`);
        logger_1.default.info(`- workout_muscle_group: ${workoutMuscleGroupCountAfter[0].count}`);
        logger_1.default.info(`- workout_tag_map: ${workoutTagMapCountAfter[0].count}`);
        logger_1.default.info(`- workout_equipment: ${workoutEquipmentCountAfter[0].count}`);
        await data_source_1.AppDataSource.destroy();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error resetting workout plans table:', error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed after error');
        }
        throw error;
    }
}
resetWorkoutPlansTable()
    .then(() => {
    console.log('Workout plans and related junction tables reset completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('Failed to reset workout plans tables:', error);
    process.exit(1);
});
//# sourceMappingURL=reset-workout-plans.js.map