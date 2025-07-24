"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const User_1 = require("../models/User");
const bcryptjs_1 = require("bcryptjs");
const Enums_1 = require("../models/shared/Enums");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedUsers() {
    try {
        await data_source_1.AppDataSource.initialize();
        logger_1.default.info('Connected to database');
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const existingCount = await userRepository.count();
        logger_1.default.info(`Found ${existingCount} existing users`);
        if (existingCount > 0) {
            logger_1.default.info('Users already seeded, skipping...');
            return;
        }
        const adminPassword = await (0, bcryptjs_1.hash)('admin123', 10);
        const admin = new User_1.User();
        admin.firstName = 'Admin';
        admin.lastName = 'User';
        admin.email = 'admin@okgym.com';
        admin.password = adminPassword;
        admin.isAdmin = true;
        admin.isPremium = true;
        const usersToCreate = [
            createUser({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: await (0, bcryptjs_1.hash)('password123', 10),
                isAdmin: false,
                isPremium: true,
                gender: Enums_1.Gender.MALE,
                birthYear: 1985,
                height: 180,
                fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
                mainGoal: Enums_1.FitnessGoal.MUSCLE_BUILDING,
                activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
                preferences: {
                    workoutLocation: Enums_1.WorkoutLocation.GYM,
                    preferredExerciseTypes: [Enums_1.ExercisePreference.STRENGTH_FOCUSED],
                    workoutDuration: 60,
                    restTime: 90,
                    workoutFrequency: 4,
                    measurementUnit: Enums_1.MeasurementUnit.METRIC,
                    theme: Enums_1.AppTheme.DARK,
                    notifications: {
                        pushEnabled: true,
                        emailEnabled: true,
                        smsEnabled: false,
                        workoutReminders: true,
                        progressUpdates: true,
                        achievementAlerts: true,
                        friendActivity: false,
                        systemAnnouncements: true
                    }
                }
            }),
            createUser({
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                password: await (0, bcryptjs_1.hash)('password123', 10),
                isAdmin: false,
                isPremium: false,
                gender: Enums_1.Gender.FEMALE,
                birthYear: 1990,
                height: 165,
                fitnessLevel: Enums_1.Difficulty.BEGINNER,
                mainGoal: Enums_1.FitnessGoal.WEIGHT_LOSS,
                activityLevel: Enums_1.ActivityLevel.LIGHTLY_ACTIVE,
                preferences: {
                    workoutLocation: Enums_1.WorkoutLocation.HOME,
                    preferredExerciseTypes: [Enums_1.ExercisePreference.CARDIO_FOCUSED, Enums_1.ExercisePreference.LOW_IMPACT],
                    workoutDuration: 45,
                    restTime: 60,
                    workoutFrequency: 3,
                    measurementUnit: Enums_1.MeasurementUnit.METRIC,
                    theme: Enums_1.AppTheme.LIGHT
                }
            }),
            createUser({
                firstName: 'Michael',
                lastName: 'Johnson',
                email: 'michael@example.com',
                password: await (0, bcryptjs_1.hash)('password123', 10),
                isAdmin: false,
                isPremium: true,
                gender: Enums_1.Gender.MALE,
                birthYear: 1982,
                height: 185,
                fitnessLevel: Enums_1.Difficulty.ADVANCED,
                mainGoal: Enums_1.FitnessGoal.STRENGTH_GAIN,
                activityLevel: Enums_1.ActivityLevel.VERY_ACTIVE,
                preferences: {
                    workoutLocation: Enums_1.WorkoutLocation.GYM,
                    preferredExerciseTypes: [Enums_1.ExercisePreference.STRENGTH_FOCUSED, Enums_1.ExercisePreference.CARDIO_FOCUSED],
                    workoutDuration: 75,
                    restTime: 60,
                    workoutFrequency: 5,
                    measurementUnit: Enums_1.MeasurementUnit.METRIC,
                    theme: Enums_1.AppTheme.DARK
                }
            }),
            createUser({
                firstName: 'Emily',
                lastName: 'Brown',
                email: 'emily@example.com',
                password: await (0, bcryptjs_1.hash)('password123', 10),
                isAdmin: false,
                isPremium: true,
                gender: Enums_1.Gender.FEMALE,
                birthYear: 1993,
                height: 170,
                fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
                mainGoal: Enums_1.FitnessGoal.ENDURANCE,
                activityLevel: Enums_1.ActivityLevel.VERY_ACTIVE,
                preferences: {
                    workoutLocation: Enums_1.WorkoutLocation.OUTDOORS,
                    preferredExerciseTypes: [Enums_1.ExercisePreference.CARDIO_FOCUSED],
                    workoutDuration: 60,
                    restTime: 45,
                    workoutFrequency: 4,
                    measurementUnit: Enums_1.MeasurementUnit.METRIC,
                    theme: Enums_1.AppTheme.SYSTEM
                }
            }),
            createUser({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: await (0, bcryptjs_1.hash)('test123', 10),
                isAdmin: false,
                isPremium: false,
                gender: Enums_1.Gender.OTHER,
                birthYear: 1995,
                height: 175,
                fitnessLevel: Enums_1.Difficulty.BEGINNER,
                mainGoal: Enums_1.FitnessGoal.GENERAL_FITNESS,
                activityLevel: Enums_1.ActivityLevel.LIGHTLY_ACTIVE,
                preferences: {
                    workoutLocation: Enums_1.WorkoutLocation.HOME,
                    preferredExerciseTypes: [Enums_1.ExercisePreference.NO_EQUIPMENT, Enums_1.ExercisePreference.QUIET],
                    workoutDuration: 30,
                    restTime: 30,
                    workoutFrequency: 3,
                    measurementUnit: Enums_1.MeasurementUnit.METRIC,
                    theme: Enums_1.AppTheme.LIGHT
                }
            })
        ];
        await userRepository.save(admin);
        logger_1.default.info('Admin user created');
        const createdUsers = await userRepository.save(usersToCreate);
        logger_1.default.info(`Created ${createdUsers.length} users`);
        logger_1.default.info('User seeding completed successfully');
    }
    catch (error) {
        logger_1.default.error('Error seeding users:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed');
        }
    }
}
function createUser(userData) {
    const user = new User_1.User();
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.email = userData.email;
    user.password = userData.password;
    user.isAdmin = userData.isAdmin;
    user.isPremium = userData.isPremium;
    if (userData.gender)
        user.gender = userData.gender;
    if (userData.birthYear)
        user.birthYear = userData.birthYear;
    if (userData.height)
        user.height = userData.height;
    if (userData.fitnessLevel)
        user.fitnessLevel = userData.fitnessLevel;
    if (userData.mainGoal)
        user.mainGoal = userData.mainGoal;
    if (userData.activityLevel)
        user.activityLevel = userData.activityLevel;
    if (userData.preferences)
        user.preferences = userData.preferences;
    user.stats = new User_1.UserStats();
    return user;
}
seedUsers()
    .then(() => process.exit(0))
    .catch(error => {
    console.error('Seed script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seedUsers.js.map