"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Workout_1 = require("../models/Workout");
const WorkoutSession_1 = require("../models/WorkoutSession");
const Achievement_1 = require("../models/Achievement");
const FitnessGoal_1 = require("../models/FitnessGoal");
const BodyMetric_1 = require("../models/BodyMetric");
const Notification_1 = require("../models/Notification");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const bcryptjs_1 = require("bcryptjs");
async function seedDashboard() {
    try {
        await database_1.AppDataSource.initialize();
        console.log('Connected to database');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const hashedPassword = await (0, bcryptjs_1.hash)('test123', 10);
        const testUser = await userRepository.save({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: hashedPassword,
            isAdmin: false
        });
        const workoutRepository = database_1.AppDataSource.getRepository(Workout_1.Workout);
        const workouts = await workoutRepository.save([
            {
                name: 'Full Body Workout',
                description: 'A complete full body workout for beginners',
                duration: 45,
                difficulty: 'beginner',
                popularity: 100,
                exercises: [
                    { id: '1', name: 'Push-ups', sets: 3, reps: 10, restTime: 60 },
                    { id: '2', name: 'Squats', sets: 3, reps: 12, restTime: 60 }
                ],
                targetMuscles: ['chest', 'legs', 'shoulders'],
                equipment: ['none'],
                tags: ['beginner', 'full-body']
            },
            {
                name: 'Advanced HIIT',
                description: 'High-intensity interval training for advanced users',
                duration: 30,
                difficulty: 'advanced',
                popularity: 85,
                exercises: [
                    { id: '3', name: 'Burpees', sets: 4, reps: 15, restTime: 45 },
                    { id: '4', name: 'Mountain Climbers', sets: 4, reps: 20, restTime: 45 }
                ],
                targetMuscles: ['full-body'],
                equipment: ['none'],
                tags: ['advanced', 'hiit']
            }
        ]);
        const workoutPlanRepository = database_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
        const workoutPlan = await workoutPlanRepository.save({
            name: 'Beginner Plan',
            description: 'A beginner-friendly workout plan',
            exercises: [
                { exerciseId: '1', sets: 3, reps: 10 },
                { exerciseId: '2', sets: 3, reps: 12 }
            ]
        });
        const sessionRepository = database_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSession);
        const sessions = await sessionRepository.save([
            {
                user: testUser,
                workoutPlan,
                status: 'COMPLETED',
                startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
                totalDuration: 3600,
                caloriesBurned: 300,
                summary: {
                    totalExercises: 2,
                    uniqueExercises: 2,
                    totalDuration: 3600,
                    caloriesBurned: 300,
                    exerciseSummaries: [
                        {
                            exerciseId: '1',
                            name: 'Push-ups',
                            totalAttempts: 3,
                            bestResult: { repetitions: 10, duration: 60, formScore: 0.9 }
                        }
                    ]
                }
            },
            {
                user: testUser,
                workoutPlan,
                status: 'scheduled',
                startTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        ]);
        const achievementRepository = database_1.AppDataSource.getRepository(Achievement_1.Achievement);
        await achievementRepository.save([
            {
                user: testUser,
                title: 'First Workout',
                description: 'Complete your first workout',
                icon: '🎯',
                progress: 1,
                total: 1,
                earned: true
            },
            {
                user: testUser,
                title: 'Workout Streak',
                description: 'Complete workouts for 7 days in a row',
                icon: '🔥',
                progress: 1,
                total: 7,
                earned: false
            }
        ]);
        const goalRepository = database_1.AppDataSource.getRepository(FitnessGoal_1.FitnessGoal);
        await goalRepository.save([
            {
                user: testUser,
                title: 'Weight Goal',
                target: 75,
                current: 80,
                unit: 'kg',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                progress: 50
            }
        ]);
        const metricRepository = database_1.AppDataSource.getRepository(BodyMetric_1.BodyMetric);
        await metricRepository.save([
            {
                user: testUser,
                weight: 80,
                bodyFat: 20,
                muscleMass: 35,
                date: new Date()
            }
        ]);
        const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
        await notificationRepository.save([
            {
                user: testUser,
                type: 'achievement',
                title: 'Achievement Unlocked!',
                message: 'Congratulations! You completed your first workout.',
                read: false,
                timestamp: new Date()
            },
            {
                user: testUser,
                type: 'reminder',
                title: 'Workout Reminder',
                message: 'You have a workout scheduled for tomorrow.',
                read: true,
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
            }
        ]);
        console.log('Dashboard data seeded successfully');
    }
    catch (error) {
        console.error('Error seeding dashboard data:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
seedDashboard();
//# sourceMappingURL=seedDashboard.js.map