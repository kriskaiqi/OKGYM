"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeeder = void 0;
const Exercise_1 = require("../models/Exercise");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const Enums_1 = require("../models/shared/Enums");
function convertMuscleGroups(groups) {
    return groups;
}
class DatabaseSeeder {
    constructor() {
        this.exerciseRepo = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        this.workoutPlanRepo = data_source_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
        this.workoutExerciseRepo = data_source_1.AppDataSource.getRepository(WorkoutExercise_1.WorkoutExercise);
    }
    async seedDatabase() {
        await this.seedExercises();
        await this.seedWorkoutPlans();
    }
    async seedExercises() {
        const count = await this.exerciseRepo.count();
        if (count === 0) {
            logger_1.default.info('No exercises found in database. Seeding exercise data...');
            const pushupData = new Exercise_1.Exercise();
            pushupData.name = 'Push-up';
            pushupData.description = 'A classic bodyweight exercise that works your chest, shoulders, and triceps.';
            pushupData.measurementType = Enums_1.MeasurementType.REPS;
            pushupData.types = [Enums_1.ExerciseType.STRENGTH_COMPOUND];
            pushupData.level = Enums_1.Difficulty.BEGINNER;
            pushupData.movementPattern = Enums_1.MovementPattern.PUSH;
            pushupData.targetMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.CHEST,
                Enums_1.MuscleGroup.SHOULDERS,
                Enums_1.MuscleGroup.TRICEPS
            ]);
            pushupData.synergistMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.CORE
            ]);
            pushupData.trackingFeatures = [];
            const squatData = new Exercise_1.Exercise();
            squatData.name = 'Squat';
            squatData.description = 'A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.';
            squatData.measurementType = Enums_1.MeasurementType.REPS;
            squatData.types = [Enums_1.ExerciseType.STRENGTH_COMPOUND];
            squatData.level = Enums_1.Difficulty.BEGINNER;
            squatData.movementPattern = Enums_1.MovementPattern.SQUAT;
            squatData.targetMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.QUADRICEPS,
                Enums_1.MuscleGroup.HAMSTRINGS,
                Enums_1.MuscleGroup.GLUTES
            ]);
            squatData.synergistMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.CORE,
                Enums_1.MuscleGroup.LOWER_BACK
            ]);
            squatData.trackingFeatures = [];
            const plankData = new Exercise_1.Exercise();
            plankData.name = 'Plank';
            plankData.description = 'An isometric core exercise that improves stability and strengthens the abdominals.';
            plankData.measurementType = Enums_1.MeasurementType.DURATION;
            plankData.types = [Enums_1.ExerciseType.CORE];
            plankData.level = Enums_1.Difficulty.BEGINNER;
            plankData.movementPattern = Enums_1.MovementPattern.CORE;
            plankData.targetMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.CORE,
                Enums_1.MuscleGroup.ABS
            ]);
            plankData.synergistMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.SHOULDERS,
                Enums_1.MuscleGroup.LOWER_BACK
            ]);
            plankData.trackingFeatures = [];
            const benchPressData = new Exercise_1.Exercise();
            benchPressData.name = 'Bench Press';
            benchPressData.description = 'A compound upper-body exercise that targets the chest, shoulders, and triceps.';
            benchPressData.measurementType = Enums_1.MeasurementType.REPS;
            benchPressData.types = [Enums_1.ExerciseType.STRENGTH_COMPOUND];
            benchPressData.level = Enums_1.Difficulty.INTERMEDIATE;
            benchPressData.movementPattern = Enums_1.MovementPattern.PUSH;
            benchPressData.targetMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.CHEST,
                Enums_1.MuscleGroup.SHOULDERS,
                Enums_1.MuscleGroup.TRICEPS
            ]);
            benchPressData.synergistMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.CORE
            ]);
            benchPressData.trackingFeatures = [];
            const deadliftData = new Exercise_1.Exercise();
            deadliftData.name = 'Deadlift';
            deadliftData.description = 'A compound exercise that works the entire posterior chain.';
            deadliftData.measurementType = Enums_1.MeasurementType.REPS;
            deadliftData.types = [Enums_1.ExerciseType.STRENGTH_COMPOUND];
            deadliftData.level = Enums_1.Difficulty.ADVANCED;
            deadliftData.movementPattern = Enums_1.MovementPattern.HINGE;
            deadliftData.targetMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.BACK,
                Enums_1.MuscleGroup.GLUTES,
                Enums_1.MuscleGroup.HAMSTRINGS
            ]);
            deadliftData.synergistMuscleGroups = convertMuscleGroups([
                Enums_1.MuscleGroup.CORE,
                Enums_1.MuscleGroup.LOWER_BACK,
                Enums_1.MuscleGroup.FOREARMS
            ]);
            deadliftData.trackingFeatures = [];
            const exercises = [
                pushupData,
                squatData,
                plankData,
                benchPressData,
                deadliftData
            ];
            for (const exerciseData of exercises) {
                await this.exerciseRepo.save(exerciseData);
            }
            logger_1.default.info(`Successfully seeded ${exercises.length} exercises`);
        }
        else {
            logger_1.default.info(`Database already contains ${count} exercises. Skipping seed.`);
        }
    }
    async seedWorkoutPlans() {
        const count = await this.workoutPlanRepo.count();
        if (count === 0) {
            logger_1.default.info('No workout plans found in database. Seeding workout plans...');
            const pushup = await this.exerciseRepo.findOne({ where: { name: 'Push-up' } });
            const squat = await this.exerciseRepo.findOne({ where: { name: 'Squat' } });
            const plank = await this.exerciseRepo.findOne({ where: { name: 'Plank' } });
            if (!pushup || !squat || !plank) {
                logger_1.default.error('Required exercises not found. Cannot seed workout plans.');
                return;
            }
            const beginnerWorkout = new WorkoutPlan_1.WorkoutPlan();
            beginnerWorkout.name = 'Beginner Full Body Workout';
            beginnerWorkout.description = 'A simple full-body workout for beginners using just bodyweight exercises.';
            beginnerWorkout.difficulty = Enums_1.Difficulty.BEGINNER;
            beginnerWorkout.estimatedDuration = 30;
            beginnerWorkout.isCustom = false;
            beginnerWorkout.workoutCategory = Enums_1.WorkoutCategory.FULL_BODY;
            beginnerWorkout.rating = 4.5;
            beginnerWorkout.ratingCount = 10;
            beginnerWorkout.popularity = 100;
            beginnerWorkout.estimatedCaloriesBurn = 150;
            await this.workoutPlanRepo.save(beginnerWorkout);
            const workoutExercise1 = new WorkoutExercise_1.WorkoutExercise();
            workoutExercise1.workoutPlan = beginnerWorkout;
            workoutExercise1.exercise = pushup;
            workoutExercise1.order = 0;
            workoutExercise1.sets = 3;
            workoutExercise1.repetitions = 10;
            workoutExercise1.duration = 0;
            workoutExercise1.restTime = 60;
            const workoutExercise2 = new WorkoutExercise_1.WorkoutExercise();
            workoutExercise2.workoutPlan = beginnerWorkout;
            workoutExercise2.exercise = squat;
            workoutExercise2.order = 1;
            workoutExercise2.sets = 3;
            workoutExercise2.repetitions = 15;
            workoutExercise2.duration = 0;
            workoutExercise2.restTime = 60;
            const workoutExercise3 = new WorkoutExercise_1.WorkoutExercise();
            workoutExercise3.workoutPlan = beginnerWorkout;
            workoutExercise3.exercise = plank;
            workoutExercise3.order = 2;
            workoutExercise3.sets = 3;
            workoutExercise3.repetitions = 0;
            workoutExercise3.duration = 30;
            workoutExercise3.restTime = 60;
            const workoutExercises = [
                workoutExercise1,
                workoutExercise2,
                workoutExercise3
            ];
            for (const workoutExercise of workoutExercises) {
                await this.workoutExerciseRepo.save(workoutExercise);
            }
            logger_1.default.info('Successfully seeded 1 workout plan with 3 exercises');
        }
        else {
            logger_1.default.info(`Database already contains ${count} workout plans. Skipping seed.`);
        }
    }
}
exports.DatabaseSeeder = DatabaseSeeder;
//# sourceMappingURL=DatabaseSeeder.js.map