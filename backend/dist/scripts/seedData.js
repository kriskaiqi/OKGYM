"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Exercise_1 = require("../models/Exercise");
const Enums_1 = require("../models/shared/Enums");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const data_source_1 = require("../data-source");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
async function seedDatabase() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("Database connection initialized");
        const exercises = [
            {
                name: "Push-ups",
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                description: "A classic exercise that works the chest, shoulders, and triceps.",
                level: Enums_1.Difficulty.INTERMEDIATE,
                detectionCapabilities: {
                    canCountReps: true,
                    canDetectPose: true,
                    detectionModels: [
                        {
                            modelId: "pushup_counter",
                            modelName: "Push-up Counter",
                            modelType: "repCounter",
                            modelPath: "models/pushup/counter_v1.pkl",
                            modelVersion: "1.0.0",
                            preferredFor: ["all"],
                            configParams: {
                                minElbowAngle: 80,
                                maxElbowAngle: 160
                            }
                        }
                    ]
                },
                keyPoints: ["Straight back", "Elbows at 90 degrees", "Head in line with spine"],
                muscleGroups: ["Chest", "Shoulders", "Triceps"],
                equipmentOptions: [],
                trackingFeatures: []
            },
            {
                name: "Squats",
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                description: "A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.",
                level: Enums_1.Difficulty.INTERMEDIATE,
                detectionCapabilities: {
                    canCountReps: true,
                    canDetectPose: true,
                    detectionModels: [
                        {
                            modelId: "squat_counter",
                            modelName: "Squat Counter",
                            modelType: "repCounter",
                            modelPath: "models/squat/counter_v1.pkl",
                            modelVersion: "1.0.0",
                            preferredFor: ["all"],
                            configParams: {
                                minKneeAngle: 70,
                                maxKneeAngle: 170
                            }
                        }
                    ]
                },
                keyPoints: ["Keep back straight", "Knees in line with toes", "Lower until thighs are parallel to ground"],
                muscleGroups: ["Quadriceps", "Hamstrings", "Glutes"],
                equipmentOptions: [],
                trackingFeatures: []
            },
            {
                name: "Plank",
                measurementType: Enums_1.MeasurementType.DURATION,
                types: [Enums_1.ExerciseType.CORE],
                description: "An isometric core exercise that improves stability and strength.",
                level: Enums_1.Difficulty.BEGINNER,
                detectionCapabilities: {
                    canCountReps: false,
                    canDetectPose: true,
                    detectionModels: [
                        {
                            modelId: "plank_form",
                            modelName: "Plank Form Checker",
                            modelType: "poseAnalyzer",
                            modelPath: "models/plank/form_v1.pkl",
                            modelVersion: "1.0.0",
                            preferredFor: ["all"],
                            configParams: {
                                minHipAngle: 160,
                                maxHipAngle: 180
                            }
                        }
                    ]
                },
                keyPoints: ["Keep body straight", "Engage core", "Look slightly forward"],
                muscleGroups: ["Core", "Shoulders"],
                equipmentOptions: [],
                trackingFeatures: []
            },
            {
                name: "Lunges",
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
                description: "A unilateral exercise that targets the quadriceps, hamstrings, and glutes while improving balance.",
                level: Enums_1.Difficulty.INTERMEDIATE,
                detectionCapabilities: {
                    canCountReps: true,
                    canDetectPose: true,
                    detectionModels: [
                        {
                            modelId: "lunge_counter",
                            modelName: "Lunge Counter",
                            modelType: "repCounter",
                            modelPath: "models/lunge/counter_v1.pkl",
                            modelVersion: "1.0.0",
                            preferredFor: ["all"],
                            configParams: {
                                minKneeAngle: 80,
                                maxKneeAngle: 170
                            }
                        }
                    ]
                },
                keyPoints: ["Keep torso upright", "Front knee at 90 degrees", "Back knee close to ground"],
                muscleGroups: ["Quadriceps", "Hamstrings", "Glutes"],
                equipmentOptions: [],
                trackingFeatures: []
            },
            {
                name: "Dumbbell Bicep Curl",
                measurementType: Enums_1.MeasurementType.REPS,
                types: [Enums_1.ExerciseType.STRENGTH_ISOLATION],
                description: "An isolation exercise that targets the biceps.",
                level: Enums_1.Difficulty.BEGINNER,
                detectionCapabilities: {
                    canCountReps: true,
                    canDetectPose: true,
                    detectionModels: [
                        {
                            modelId: "bicep_curl_counter",
                            modelName: "Bicep Curl Counter",
                            modelType: "repCounter",
                            modelPath: "models/bicep_curl/counter_v1.pkl",
                            modelVersion: "1.0.0",
                            preferredFor: ["all"],
                            configParams: {
                                minElbowAngle: 30,
                                maxElbowAngle: 160
                            }
                        }
                    ]
                },
                keyPoints: ["Keep elbows close to body", "Full range of motion", "Controlled movement"],
                muscleGroups: ["Biceps", "Forearms"],
                equipmentOptions: [],
                trackingFeatures: []
            }
        ];
        for (const exerciseData of exercises) {
            const exercise = new Exercise_1.Exercise();
            Object.assign(exercise, exerciseData);
            await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).save(exercise);
            console.log(`Created exercise: ${exercise.name}`);
        }
        const workoutPlans = [
            {
                name: "Full Body Beginner Workout",
                description: "A comprehensive full-body workout for beginners.",
                difficulty: Enums_1.Difficulty.BEGINNER,
                estimatedDuration: 45,
                targetMuscleGroups: ["Full Body"],
                isCustom: false
            },
            {
                name: "Upper Body Strength",
                description: "Focus on building upper body strength with compound movements.",
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                estimatedDuration: 60,
                targetMuscleGroups: ["Chest", "Back", "Shoulders", "Arms"],
                isCustom: false
            },
            {
                name: "Lower Body Power",
                description: "Develop lower body strength and power with these exercises.",
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                estimatedDuration: 50,
                targetMuscleGroups: ["Legs", "Glutes"],
                isCustom: false
            }
        ];
        for (const workoutPlanData of workoutPlans) {
            const workoutPlan = new WorkoutPlan_1.WorkoutPlan();
            Object.assign(workoutPlan, workoutPlanData);
            const savedWorkoutPlan = await data_source_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan).save(workoutPlan);
            const allExercises = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).find();
            const numExercises = Math.floor(Math.random() * 3) + 3;
            const selectedExercises = allExercises.sort(() => 0.5 - Math.random()).slice(0, numExercises);
            for (let i = 0; i < selectedExercises.length; i++) {
                const workoutExercise = new WorkoutExercise_1.WorkoutExercise();
                workoutExercise.exercise = selectedExercises[i];
                workoutExercise.workoutPlan = savedWorkoutPlan;
                workoutExercise.order = i + 1;
                workoutExercise.sets = Math.floor(Math.random() * 2) + 3;
                if (selectedExercises[i].measurementType === Enums_1.MeasurementType.REPS) {
                    workoutExercise.repetitions = Math.floor(Math.random() * 6) + 8;
                }
                else {
                    workoutExercise.duration = (Math.floor(Math.random() * 4) + 3) * 10;
                }
                workoutExercise.restTime = (Math.floor(Math.random() * 3) + 4) * 15;
                await data_source_1.AppDataSource.getRepository(WorkoutExercise_1.WorkoutExercise).save(workoutExercise);
            }
            console.log(`Created workout plan: ${savedWorkoutPlan.name} with ${numExercises} exercises`);
        }
        console.log("Database seeded successfully!");
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
        console.log("Database connection closed");
    }
}
seedDatabase().catch(error => console.error(error));
//# sourceMappingURL=seedData.js.map