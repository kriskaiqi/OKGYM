"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedWorkouts = seedWorkouts;
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const Exercise_1 = require("../models/Exercise");
const Equipment_1 = require("../models/Equipment");
const data_source_1 = require("../data-source");
const Enums_1 = require("../models/shared/Enums");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedWorkouts() {
    try {
        const workoutRepository = data_source_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
        const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const workoutExerciseRepository = data_source_1.AppDataSource.getRepository(WorkoutExercise_1.WorkoutExercise);
        const equipmentRepository = data_source_1.AppDataSource.getRepository(Equipment_1.Equipment);
        const existingCount = await workoutRepository.count();
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} workout plans. Skipping seed.`);
            return;
        }
        const allExercises = await exerciseRepository.find();
        if (allExercises.length === 0) {
            logger_1.default.warn('No exercises found in the database. Cannot create workout exercises.');
            return;
        }
        const allEquipment = await equipmentRepository.find();
        const findExercisesByType = (types) => {
            return allExercises.filter(exercise => exercise.types.some(type => types.includes(type)));
        };
        const findExercisesByName = (nameSubstrings) => {
            return allExercises.filter(exercise => nameSubstrings.some(substr => exercise.name.toLowerCase().includes(substr.toLowerCase())));
        };
        const sampleWorkouts = [
            {
                name: 'Full Body Workout for Beginners',
                description: 'A comprehensive full-body workout designed for beginners to build strength and endurance across all major muscle groups.',
                difficulty: Enums_1.Difficulty.BEGINNER,
                workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
                splitType: Enums_1.SplitType.FULL_BODY,
                estimatedDuration: 45,
                isCustom: false,
                rating: 4.5,
                ratingCount: 120,
                popularity: 95,
                estimatedCaloriesBurn: 350,
                fitnessGoals: [Enums_1.FitnessGoal.STRENGTH_GAIN, Enums_1.FitnessGoal.GENERAL_FITNESS],
                structure: {
                    warmupDuration: 5,
                    cooldownDuration: 5,
                    sets: {
                        averageSets: 3,
                        restBetweenSets: 60,
                        supersets: false
                    },
                    progression: {
                        type: "linear",
                        incrementScheme: "weekly"
                    }
                },
                exercises: [
                    {
                        nameSubstring: 'Push-up',
                        order: 1,
                        sets: 3,
                        repetitions: 10,
                        restTime: 60,
                        notes: 'Focus on proper form, modify by performing on knees if needed.'
                    },
                    {
                        nameSubstring: 'Bodyweight Squat',
                        order: 2,
                        sets: 3,
                        repetitions: 12,
                        restTime: 60,
                        notes: 'Lower until thighs are parallel to ground if possible.'
                    },
                    {
                        nameSubstring: 'Plank',
                        order: 3,
                        sets: 3,
                        duration: 30,
                        restTime: 60,
                        notes: 'Hold position with straight line from head to heels.'
                    },
                    {
                        nameSubstring: 'Lunge',
                        order: 4,
                        sets: 2,
                        repetitions: 10,
                        restTime: 60,
                        notes: '10 reps each leg.'
                    },
                    {
                        nameSubstring: 'Bicycle',
                        order: 5,
                        sets: 2,
                        repetitions: 15,
                        restTime: 60,
                        notes: 'Slow and controlled movement.'
                    }
                ]
            },
            {
                name: 'Upper Body Strength',
                description: 'Focus on building upper body strength with emphasis on chest, shoulders, and arms.',
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                workoutCategory: Enums_1.WorkoutCategory.UPPER_BODY,
                splitType: Enums_1.SplitType.UPPER_LOWER,
                estimatedDuration: 60,
                isCustom: false,
                rating: 4.7,
                ratingCount: 85,
                popularity: 88,
                estimatedCaloriesBurn: 400,
                fitnessGoals: [Enums_1.FitnessGoal.STRENGTH_GAIN, Enums_1.FitnessGoal.MUSCLE_BUILDING],
                structure: {
                    warmupDuration: 8,
                    cooldownDuration: 5,
                    sets: {
                        averageSets: 4,
                        restBetweenSets: 90,
                        supersets: true
                    },
                    progression: {
                        type: "linear",
                        incrementScheme: "weekly"
                    }
                },
                exercises: [
                    {
                        nameSubstring: 'Bench Press',
                        order: 1,
                        sets: 4,
                        repetitions: 8,
                        restTime: 90,
                        notes: 'Use a weight that is challenging for 8 reps.'
                    },
                    {
                        nameSubstring: 'Pull-up',
                        order: 2,
                        sets: 3,
                        repetitions: 8,
                        restTime: 90,
                        notes: 'Use assisted pull-up machine if needed.'
                    },
                    {
                        nameSubstring: 'Shoulder Press',
                        order: 3,
                        sets: 3,
                        repetitions: 10,
                        restTime: 90,
                        notes: 'Keep core engaged to avoid arching back.'
                    },
                    {
                        nameSubstring: 'Push-up',
                        order: 4,
                        sets: 3,
                        repetitions: 12,
                        restTime: 60,
                        notes: 'Perform until near failure on each set.'
                    }
                ]
            },
            {
                name: 'HIIT Cardio Burner',
                description: 'High-intensity interval training to maximize calorie burn and improve cardiovascular fitness.',
                difficulty: Enums_1.Difficulty.ADVANCED,
                workoutCategory: Enums_1.WorkoutCategory.HIIT,
                splitType: Enums_1.SplitType.FULL_BODY,
                estimatedDuration: 30,
                isCustom: false,
                rating: 4.8,
                ratingCount: 150,
                popularity: 98,
                estimatedCaloriesBurn: 450,
                fitnessGoals: [Enums_1.FitnessGoal.FAT_LOSS, Enums_1.FitnessGoal.ENDURANCE],
                structure: {
                    warmupDuration: 5,
                    cooldownDuration: 5,
                    sets: {
                        averageSets: 1,
                        restBetweenSets: 20,
                        supersets: false
                    },
                    progression: {
                        type: "intensity",
                        incrementScheme: "weekly"
                    }
                },
                exercises: [
                    {
                        nameSubstring: 'Mountain Climber',
                        order: 1,
                        sets: 1,
                        duration: 45,
                        restTime: 15,
                        notes: 'Perform at maximum intensity for 45 seconds.'
                    },
                    {
                        nameSubstring: 'Squat',
                        order: 2,
                        sets: 1,
                        duration: 45,
                        restTime: 15,
                        notes: 'Bodyweight squats as quickly as possible with good form.'
                    },
                    {
                        nameSubstring: 'Push-up',
                        order: 3,
                        sets: 1,
                        duration: 45,
                        restTime: 15,
                        notes: 'Perform as many as possible in the time frame.'
                    },
                    {
                        nameSubstring: 'Kettlebell Swing',
                        order: 4,
                        sets: 1,
                        duration: 45,
                        restTime: 15,
                        notes: 'Focus on hip drive and power generation.'
                    },
                    {
                        nameSubstring: 'Plank',
                        order: 5,
                        sets: 1,
                        duration: 45,
                        restTime: 15,
                        notes: 'Hold for full duration.'
                    }
                ]
            },
            {
                name: 'Lower Body Power',
                description: 'Build strength and power in your legs and glutes with this focused workout.',
                difficulty: Enums_1.Difficulty.INTERMEDIATE,
                workoutCategory: Enums_1.WorkoutCategory.LOWER_BODY,
                splitType: Enums_1.SplitType.UPPER_LOWER,
                estimatedDuration: 50,
                isCustom: false,
                rating: 4.6,
                ratingCount: 95,
                popularity: 90,
                estimatedCaloriesBurn: 380,
                fitnessGoals: [Enums_1.FitnessGoal.STRENGTH_GAIN, Enums_1.FitnessGoal.POWER_DEVELOPMENT],
                structure: {
                    warmupDuration: 10,
                    cooldownDuration: 5,
                    sets: {
                        averageSets: 4,
                        restBetweenSets: 120,
                        supersets: false
                    },
                    progression: {
                        type: "linear",
                        incrementScheme: "weekly"
                    }
                },
                exercises: [
                    {
                        nameSubstring: 'Deadlift',
                        order: 1,
                        sets: 4,
                        repetitions: 6,
                        restTime: 120,
                        notes: 'Focus on form and hip hinge pattern.'
                    },
                    {
                        nameSubstring: 'Squat',
                        order: 2,
                        sets: 4,
                        repetitions: 8,
                        restTime: 120,
                        notes: 'Keep chest up, descend to parallel.'
                    },
                    {
                        nameSubstring: 'Lunge',
                        order: 3,
                        sets: 3,
                        repetitions: 10,
                        restTime: 90,
                        notes: '10 reps each leg.'
                    },
                    {
                        nameSubstring: 'Kettlebell Swing',
                        order: 4,
                        sets: 3,
                        repetitions: 15,
                        restTime: 90,
                        notes: 'Explosive hip drive, maintain neutral spine.'
                    }
                ]
            },
            {
                name: 'Core Strength Builder',
                description: 'Strengthen your core with this targeted abdominal and lower back workout.',
                difficulty: Enums_1.Difficulty.BEGINNER,
                workoutCategory: Enums_1.WorkoutCategory.CORE,
                splitType: Enums_1.SplitType.BODY_PART,
                estimatedDuration: 30,
                isCustom: false,
                rating: 4.3,
                ratingCount: 110,
                popularity: 85,
                estimatedCaloriesBurn: 200,
                fitnessGoals: [Enums_1.FitnessGoal.STRENGTH_GAIN, Enums_1.FitnessGoal.GENERAL_FITNESS],
                structure: {
                    warmupDuration: 5,
                    cooldownDuration: 5,
                    sets: {
                        averageSets: 3,
                        restBetweenSets: 45,
                        supersets: true
                    },
                    progression: {
                        type: "duration",
                        incrementScheme: "weekly"
                    }
                },
                exercises: [
                    {
                        nameSubstring: 'Plank',
                        order: 1,
                        sets: 3,
                        duration: 30,
                        restTime: 45,
                        notes: 'Focus on maintaining a straight line from head to heels.'
                    },
                    {
                        nameSubstring: 'Bicycle',
                        order: 2,
                        sets: 3,
                        repetitions: 20,
                        restTime: 45,
                        notes: 'Slow and controlled movement.'
                    },
                    {
                        nameSubstring: 'Russian Twist',
                        order: 3,
                        sets: 3,
                        repetitions: 16,
                        restTime: 45,
                        notes: '8 twists each side.'
                    },
                    {
                        nameSubstring: 'Mountain Climber',
                        order: 4,
                        sets: 3,
                        duration: 30,
                        restTime: 45,
                        notes: 'Keep hips low, alternating legs quickly.'
                    }
                ]
            }
        ];
        for (const workoutData of sampleWorkouts) {
            const workout = new WorkoutPlan_1.WorkoutPlan();
            Object.assign(workout, {
                name: workoutData.name,
                description: workoutData.description,
                difficulty: workoutData.difficulty,
                workoutCategory: workoutData.workoutCategory,
                splitType: workoutData.splitType,
                estimatedDuration: workoutData.estimatedDuration,
                isCustom: workoutData.isCustom,
                rating: workoutData.rating,
                ratingCount: workoutData.ratingCount,
                popularity: workoutData.popularity,
                estimatedCaloriesBurn: workoutData.estimatedCaloriesBurn,
                structure: workoutData.structure
            });
            const savedWorkout = await workoutRepository.save(workout);
            logger_1.default.info(`Created workout plan: ${savedWorkout.name}`);
            for (const exerciseConfig of workoutData.exercises) {
                const matchingExercises = findExercisesByName([exerciseConfig.nameSubstring]);
                if (matchingExercises.length === 0) {
                    logger_1.default.warn(`No exercise found matching "${exerciseConfig.nameSubstring}" for workout "${workoutData.name}"`);
                    continue;
                }
                const exercise = matchingExercises[0];
                const workoutExercise = new WorkoutExercise_1.WorkoutExercise();
                workoutExercise.exercise = exercise;
                workoutExercise.workoutPlan = savedWorkout;
                workoutExercise.order = exerciseConfig.order;
                workoutExercise.sets = exerciseConfig.sets;
                if (exercise.measurementType === 'REPS' && exerciseConfig.repetitions) {
                    workoutExercise.repetitions = exerciseConfig.repetitions;
                }
                else if (exercise.measurementType === 'DURATION' && exerciseConfig.duration) {
                    workoutExercise.duration = exerciseConfig.duration;
                }
                else if (exerciseConfig.repetitions) {
                    workoutExercise.repetitions = exerciseConfig.repetitions;
                }
                else if (exerciseConfig.duration) {
                    workoutExercise.duration = exerciseConfig.duration;
                }
                workoutExercise.restTime = exerciseConfig.restTime || 60;
                if (exerciseConfig.notes) {
                    workoutExercise.notes = exerciseConfig.notes;
                }
                workoutExercise.intensity = {
                    level: "moderate",
                    weight: 0,
                    rateOfPerceivedExertion: 7
                };
                await workoutExerciseRepository.save(workoutExercise);
            }
            logger_1.default.info(`Added ${workoutData.exercises.length} exercises to workout: ${savedWorkout.name}`);
        }
        logger_1.default.info(`Successfully seeded ${sampleWorkouts.length} workout plans with exercises`);
    }
    catch (error) {
        logger_1.default.error('Error seeding workout plans:', error);
        throw error;
    }
}
//# sourceMappingURL=seedWorkouts.js.map