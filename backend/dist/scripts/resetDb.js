"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Exercise_1 = require("../models/Exercise");
const Enums_1 = require("../models/shared/Enums");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const data_source_1 = require("../data-source");
async function resetDatabase() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("Database connection established");
        await data_source_1.AppDataSource.dropDatabase();
        console.log("Dropped existing database");
        await data_source_1.AppDataSource.synchronize();
        console.log("Database schema synchronized");
        const exerciseRepo = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const exercises = await exerciseRepo
            .createQueryBuilder()
            .insert()
            .into(Exercise_1.Exercise)
            .values([
            {
                name: "Push-ups",
                description: "A classic bodyweight exercise that targets the chest, shoulders, and triceps.",
                type: Enums_1.ExerciseType.REPS,
                defaultDuration: 60,
                detectionCapabilities: {
                    canCountReps: false,
                    canDetectPose: false
                },
                keyPoints: ["Keep body straight", "Lower chest to ground", "Push back up"],
                difficulty: "2",
                muscleGroups: ["Chest", "Shoulders", "Triceps"],
                equipment: [],
                videoUrl: undefined,
                thumbnailUrl: undefined,
                detectionConfig: undefined
            },
            {
                name: "Plank",
                description: "An isometric core exercise that improves stability and strength.",
                type: Enums_1.ExerciseType.TIME,
                defaultDuration: 30,
                detectionCapabilities: {
                    canDetectPose: false
                },
                keyPoints: ["Keep body straight", "Engage core", "Hold position"],
                difficulty: "1",
                muscleGroups: ["Core", "Shoulders"],
                equipment: [],
                videoUrl: undefined,
                thumbnailUrl: undefined,
                detectionConfig: undefined
            },
            {
                name: "Squats",
                description: "A fundamental lower body exercise that targets multiple muscle groups.",
                type: Enums_1.ExerciseType.REPS,
                defaultDuration: 60,
                detectionCapabilities: {
                    canCountReps: false,
                    canDetectPose: false
                },
                keyPoints: ["Keep back straight", "Lower until thighs parallel", "Push through heels"],
                difficulty: "2",
                muscleGroups: ["Quadriceps", "Hamstrings", "Glutes"],
                equipment: [],
                videoUrl: undefined,
                thumbnailUrl: undefined,
                detectionConfig: undefined
            }
        ])
            .execute();
        const createdExercises = await exerciseRepo.find();
        console.log("Created exercises:", createdExercises.map(e => ({ id: e.id, name: e.name })));
        const workoutPlan = await data_source_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan).save({
            name: "Test Full Body Workout",
            description: "A basic full body workout for testing",
            difficulty: "2",
            targetMuscleGroup: "full body",
            estimatedDuration: 300,
            isCustom: false
        });
        const workoutExercises = await data_source_1.AppDataSource.getRepository(WorkoutExercise_1.WorkoutExercise).save([
            {
                exercise: createdExercises[0],
                workoutPlan,
                order: 1,
                repetitions: 10,
                duration: 0,
                notes: "Focus on form"
            },
            {
                exercise: createdExercises[1],
                workoutPlan,
                order: 2,
                repetitions: 0,
                duration: 30,
                notes: "Hold position"
            },
            {
                exercise: createdExercises[2],
                workoutPlan,
                order: 3,
                repetitions: 12,
                duration: 0,
                notes: "Keep proper form"
            }
        ]);
        console.log("Created workout plan:", {
            id: workoutPlan.id,
            name: workoutPlan.name,
            exercises: workoutExercises.map(we => ({
                name: we.exercise.name,
                order: we.order
            }))
        });
        await data_source_1.AppDataSource.destroy();
        console.log("Database reset complete!");
    }
    catch (error) {
        console.error("Error resetting database:", error);
        process.exit(1);
    }
}
resetDatabase();
//# sourceMappingURL=resetDb.js.map