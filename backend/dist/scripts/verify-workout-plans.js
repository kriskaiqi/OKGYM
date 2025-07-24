"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const logger_1 = __importDefault(require("../utils/logger"));
async function verifyWorkoutPlans() {
    try {
        logger_1.default.info("Initializing database connection...");
        await data_source_1.AppDataSource.initialize();
        logger_1.default.info("Database connection established successfully");
        const workoutPlans = await data_source_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan)
            .createQueryBuilder("workoutPlan")
            .leftJoinAndSelect("workoutPlan.exercises", "workoutExercise")
            .leftJoinAndSelect("workoutExercise.exercise", "exercise")
            .leftJoinAndSelect("workoutPlan.targetMuscleGroups", "muscleGroup")
            .leftJoinAndSelect("workoutPlan.tags", "tag")
            .leftJoinAndSelect("workoutPlan.equipmentNeeded", "equipment")
            .getMany();
        logger_1.default.info(`Found ${workoutPlans.length} workout plans in the database:`);
        for (const plan of workoutPlans) {
            logger_1.default.info(`\n[Workout Plan] ID: ${plan.id}, Name: ${plan.name}, Difficulty: ${plan.difficulty}`);
            logger_1.default.info(`Description: ${plan.description || 'None'}`);
            logger_1.default.info(`Duration: ${plan.estimatedDuration} minutes`);
            if (plan.targetMuscleGroups && plan.targetMuscleGroups.length > 0) {
                logger_1.default.info(`Muscle Groups: ${plan.targetMuscleGroups.map(mg => mg.name).join(', ')}`);
            }
            else {
                logger_1.default.info('Muscle Groups: None');
            }
            if (plan.tags && plan.tags.length > 0) {
                logger_1.default.info(`Tags: ${plan.tags.map(tag => tag.name).join(', ')}`);
            }
            else {
                logger_1.default.info('Tags: None');
            }
            if (plan.equipmentNeeded && plan.equipmentNeeded.length > 0) {
                logger_1.default.info(`Equipment: ${plan.equipmentNeeded.map(eq => eq.name).join(', ')}`);
            }
            else {
                logger_1.default.info('Equipment: None');
            }
            if (plan.exercises && plan.exercises.length > 0) {
                logger_1.default.info(`\nExercises (${plan.exercises.length}):`);
                let index = 1;
                for (const workoutExercise of plan.exercises) {
                    try {
                        if (workoutExercise && workoutExercise.exercise) {
                            const exercise = workoutExercise.exercise;
                            const exerciseTypes = exercise.types && exercise.types.length > 0
                                ? exercise.types.join(', ')
                                : 'N/A';
                            logger_1.default.info(`  ${index}. ${exercise.name} - ${exerciseTypes}`);
                            logger_1.default.info(`     Sets: ${workoutExercise.sets}, Reps: ${workoutExercise.repetitions || 'N/A'}, Duration: ${workoutExercise.duration || 'N/A'}s`);
                            logger_1.default.info(`     Rest: ${workoutExercise.restTime}s, Role: ${workoutExercise.exerciseRole}`);
                            if (workoutExercise.notes) {
                                logger_1.default.info(`     Notes: ${workoutExercise.notes}`);
                            }
                            index++;
                        }
                        else {
                            logger_1.default.warn(`  ${index}. Invalid exercise data - missing exercise reference`);
                            index++;
                        }
                    }
                    catch (err) {
                        logger_1.default.error(`Error displaying exercise at position ${index}:`, err);
                        index++;
                    }
                }
            }
            else {
                logger_1.default.info('\nExercises: None');
            }
        }
        const emptyWorkouts = workoutPlans.filter(plan => !plan.exercises || plan.exercises.length === 0);
        if (emptyWorkouts.length > 0) {
            logger_1.default.warn(`\nWarning: Found ${emptyWorkouts.length} workout plans without exercises:`);
            emptyWorkouts.forEach(plan => {
                logger_1.default.warn(`  - ${plan.name} (ID: ${plan.id})`);
            });
        }
        logger_1.default.info("\nVerification complete");
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
        }
    }
    catch (error) {
        logger_1.default.error("Error verifying workout plans:", error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed after error");
        }
    }
}
verifyWorkoutPlans();
//# sourceMappingURL=verify-workout-plans.js.map