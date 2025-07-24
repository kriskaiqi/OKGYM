"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const User_1 = require("../models/User");
const repositories_1 = require("../repositories");
const Enums_1 = require("../models/shared/Enums");
const bcryptjs_1 = require("bcryptjs");
const logger_1 = __importDefault(require("../utils/logger"));
async function testUserFilters() {
    try {
        logger_1.default.info("Initializing database connection...");
        await data_source_1.AppDataSource.initialize();
        logger_1.default.info("Database connection established");
        const existingCount = await repositories_1.repositories.user.count();
        if (existingCount < 10) {
            logger_1.default.info("Creating test users...");
            await createTestUsers();
        }
        else {
            logger_1.default.info(`Using ${existingCount} existing users for testing`);
        }
        await testBasicFilters();
        await testPaginationAndSorting();
        await testDemographicFilters();
        await testPreferenceFilters();
        await testCombinedFilters();
        logger_1.default.info("All filter tests completed successfully");
    }
    catch (error) {
        logger_1.default.error("Error testing user filters", {
            error: error instanceof Error ? error.message : String(error)
        });
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
        }
    }
}
async function createTestUsers() {
    const users = [
        {
            email: "admin@example.com",
            firstName: "Admin",
            lastName: "User",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.ADMIN,
            status: User_1.UserStatus.ACTIVE,
            isAdmin: true,
            isPremium: true,
            gender: Enums_1.Gender.PREFER_NOT_TO_SAY,
            birthYear: 1985,
            height: 175,
            activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
            fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
            mainGoal: Enums_1.FitnessGoal.GENERAL_FITNESS,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.GYM,
                preferredExerciseTypes: [Enums_1.ExercisePreference.STRENGTH_FOCUSED, Enums_1.ExercisePreference.NO_EQUIPMENT],
                targetBodyAreas: [Enums_1.BodyArea.FULL_BODY, Enums_1.BodyArea.CORE]
            }
        },
        {
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.USER,
            status: User_1.UserStatus.ACTIVE,
            isAdmin: false,
            isPremium: true,
            gender: Enums_1.Gender.MALE,
            birthYear: 1990,
            height: 180,
            activityLevel: Enums_1.ActivityLevel.VERY_ACTIVE,
            fitnessLevel: Enums_1.Difficulty.ADVANCED,
            mainGoal: Enums_1.FitnessGoal.MUSCLE_BUILDING,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.GYM,
                preferredExerciseTypes: [Enums_1.ExercisePreference.STRENGTH_FOCUSED, Enums_1.ExercisePreference.NO_EQUIPMENT],
                targetBodyAreas: [Enums_1.BodyArea.ARMS, Enums_1.BodyArea.CHEST, Enums_1.BodyArea.BACK]
            }
        },
        {
            email: "jane@example.com",
            firstName: "Jane",
            lastName: "Smith",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.USER,
            status: User_1.UserStatus.ACTIVE,
            isAdmin: false,
            isPremium: true,
            gender: Enums_1.Gender.FEMALE,
            birthYear: 1992,
            height: 165,
            activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
            fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
            mainGoal: Enums_1.FitnessGoal.FAT_LOSS,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.HOME,
                preferredExerciseTypes: [Enums_1.ExercisePreference.CARDIO_FOCUSED, Enums_1.ExercisePreference.LOW_IMPACT],
                targetBodyAreas: [Enums_1.BodyArea.LEGS, Enums_1.BodyArea.CORE, Enums_1.BodyArea.GLUTES]
            }
        },
        {
            email: "trainer@example.com",
            firstName: "Michael",
            lastName: "Johnson",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.TRAINER,
            status: User_1.UserStatus.ACTIVE,
            isAdmin: false,
            isPremium: true,
            gender: Enums_1.Gender.MALE,
            birthYear: 1988,
            height: 175,
            activityLevel: Enums_1.ActivityLevel.VERY_ACTIVE,
            fitnessLevel: Enums_1.Difficulty.ADVANCED,
            mainGoal: Enums_1.FitnessGoal.ATHLETICISM,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.GYM,
                preferredExerciseTypes: [Enums_1.ExercisePreference.STRENGTH_FOCUSED, Enums_1.ExercisePreference.LOW_IMPACT, Enums_1.ExercisePreference.NO_EQUIPMENT],
                targetBodyAreas: [Enums_1.BodyArea.FULL_BODY]
            }
        },
        {
            email: "emily@example.com",
            firstName: "Emily",
            lastName: "Wilson",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.USER,
            status: User_1.UserStatus.ACTIVE,
            isAdmin: false,
            isPremium: false,
            gender: Enums_1.Gender.FEMALE,
            birthYear: 1995,
            height: 160,
            activityLevel: Enums_1.ActivityLevel.LIGHTLY_ACTIVE,
            fitnessLevel: Enums_1.Difficulty.BEGINNER,
            mainGoal: Enums_1.FitnessGoal.FLEXIBILITY,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.HOME,
                preferredExerciseTypes: [Enums_1.ExercisePreference.LOW_IMPACT, Enums_1.ExercisePreference.QUIET],
                targetBodyAreas: [Enums_1.BodyArea.CORE, Enums_1.BodyArea.FULL_BODY]
            }
        },
        {
            email: "david@example.com",
            firstName: "David",
            lastName: "Brown",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.USER,
            status: User_1.UserStatus.INACTIVE,
            isAdmin: false,
            isPremium: false,
            gender: Enums_1.Gender.MALE,
            birthYear: 1987,
            height: 178,
            activityLevel: Enums_1.ActivityLevel.SEDENTARY,
            fitnessLevel: Enums_1.Difficulty.BEGINNER,
            mainGoal: Enums_1.FitnessGoal.FAT_LOSS,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.OUTDOORS,
                preferredExerciseTypes: [Enums_1.ExercisePreference.CARDIO_FOCUSED],
                targetBodyAreas: [Enums_1.BodyArea.LEGS, Enums_1.BodyArea.CORE]
            }
        },
        {
            email: "sarah@example.com",
            firstName: "Sarah",
            lastName: "Taylor",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.CONTENT_CREATOR,
            status: User_1.UserStatus.PENDING,
            isAdmin: false,
            isPremium: true,
            gender: Enums_1.Gender.FEMALE,
            birthYear: 1991,
            height: 170,
            activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
            fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
            mainGoal: Enums_1.FitnessGoal.GENERAL_FITNESS,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.GYM,
                preferredExerciseTypes: [Enums_1.ExercisePreference.STRENGTH_FOCUSED, Enums_1.ExercisePreference.LOW_IMPACT],
                targetBodyAreas: [Enums_1.BodyArea.FULL_BODY]
            }
        },
        {
            email: "robert@example.com",
            firstName: "Robert",
            lastName: "Miller",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.USER,
            status: User_1.UserStatus.SUSPENDED,
            isAdmin: false,
            isPremium: false,
            gender: Enums_1.Gender.MALE,
            birthYear: 1993,
            height: 183,
            activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
            fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
            mainGoal: Enums_1.FitnessGoal.MUSCLE_BUILDING,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.GYM,
                preferredExerciseTypes: [Enums_1.ExercisePreference.STRENGTH_FOCUSED],
                targetBodyAreas: [Enums_1.BodyArea.ARMS, Enums_1.BodyArea.CHEST, Enums_1.BodyArea.BACK]
            }
        },
        {
            email: "emma@example.com",
            firstName: "Emma",
            lastName: "Garcia",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.USER,
            status: User_1.UserStatus.ACTIVE,
            isAdmin: false,
            isPremium: true,
            gender: Enums_1.Gender.FEMALE,
            birthYear: 1994,
            height: 167,
            activityLevel: Enums_1.ActivityLevel.VERY_ACTIVE,
            fitnessLevel: Enums_1.Difficulty.ADVANCED,
            mainGoal: Enums_1.FitnessGoal.ATHLETICISM,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.OUTDOORS,
                preferredExerciseTypes: [Enums_1.ExercisePreference.CARDIO_FOCUSED, Enums_1.ExercisePreference.LOW_IMPACT],
                targetBodyAreas: [Enums_1.BodyArea.LEGS, Enums_1.BodyArea.CORE]
            }
        },
        {
            email: "william@example.com",
            firstName: "William",
            lastName: "Davis",
            password: await (0, bcryptjs_1.hash)("Password123", 10),
            role: User_1.UserRole.USER,
            status: User_1.UserStatus.ACTIVE,
            isAdmin: false,
            isPremium: false,
            gender: Enums_1.Gender.MALE,
            birthYear: 1997,
            height: 175,
            activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
            fitnessLevel: Enums_1.Difficulty.BEGINNER,
            mainGoal: Enums_1.FitnessGoal.GENERAL_FITNESS,
            preferences: {
                workoutLocation: Enums_1.WorkoutLocation.HOME,
                preferredExerciseTypes: [Enums_1.ExercisePreference.NO_EQUIPMENT, Enums_1.ExercisePreference.LOW_IMPACT],
                targetBodyAreas: [Enums_1.BodyArea.FULL_BODY]
            }
        }
    ];
    for (const userData of users) {
        const existingUser = await repositories_1.repositories.user.findByEmail(userData.email);
        if (!existingUser) {
            await repositories_1.repositories.user.create(userData);
            logger_1.default.info(`Created test user: ${userData.email}`);
        }
        else {
            logger_1.default.info(`Test user already exists: ${userData.email}`);
        }
    }
}
async function testBasicFilters() {
    logger_1.default.info("Testing basic filters...");
    const trainers = await repositories_1.repositories.user.findWithFilters({ role: User_1.UserRole.TRAINER });
    logger_1.default.info(`Found ${trainers[0].length} trainers`);
    if (trainers[0].length === 0) {
        logger_1.default.error("Test failed: No trainers found");
    }
    const inactiveUsers = await repositories_1.repositories.user.findWithFilters({ status: User_1.UserStatus.INACTIVE });
    logger_1.default.info(`Found ${inactiveUsers[0].length} inactive users`);
    if (inactiveUsers[0].length === 0) {
        logger_1.default.error("Test failed: No inactive users found");
    }
    const janeUsers = await repositories_1.repositories.user.findWithFilters({ searchTerm: "Jane" });
    logger_1.default.info(`Found ${janeUsers[0].length} users matching 'Jane'`);
    if (janeUsers[0].length === 0) {
        logger_1.default.error("Test failed: No users found matching 'Jane'");
    }
}
async function testPaginationAndSorting() {
    var _a, _b, _c, _d;
    logger_1.default.info("Testing pagination and sorting...");
    const page1 = await repositories_1.repositories.user.findWithFilters({ limit: 3, offset: 0 });
    const page2 = await repositories_1.repositories.user.findWithFilters({ limit: 3, offset: 3 });
    logger_1.default.info(`Page 1: ${page1[0].length} users, Total: ${page1[1]}`);
    logger_1.default.info(`Page 2: ${page2[0].length} users, Total: ${page2[1]}`);
    if (page1[0].length !== 3 || page2[0].length === 0) {
        logger_1.default.error("Test failed: Pagination not working correctly");
    }
    const ascUsers = await repositories_1.repositories.user.findWithFilters({ sortBy: "firstName", sortDirection: "ASC" });
    const descUsers = await repositories_1.repositories.user.findWithFilters({ sortBy: "firstName", sortDirection: "DESC" });
    logger_1.default.info(`Sorted ASC first user: ${(_a = ascUsers[0][0]) === null || _a === void 0 ? void 0 : _a.firstName}`);
    logger_1.default.info(`Sorted DESC first user: ${(_b = descUsers[0][0]) === null || _b === void 0 ? void 0 : _b.firstName}`);
    if (((_c = ascUsers[0][0]) === null || _c === void 0 ? void 0 : _c.firstName) === ((_d = descUsers[0][0]) === null || _d === void 0 ? void 0 : _d.firstName)) {
        logger_1.default.error("Test failed: Sorting not working correctly");
    }
}
async function testDemographicFilters() {
    logger_1.default.info("Testing demographic filters...");
    const femaleUsers = await repositories_1.repositories.user.findWithFilters({ gender: Enums_1.Gender.FEMALE });
    logger_1.default.info(`Found ${femaleUsers[0].length} female users`);
    if (femaleUsers[0].length === 0) {
        logger_1.default.error("Test failed: No female users found");
    }
    const veryActiveUsers = await repositories_1.repositories.user.findWithFilters({ activityLevel: Enums_1.ActivityLevel.VERY_ACTIVE });
    logger_1.default.info(`Found ${veryActiveUsers[0].length} very active users`);
    if (veryActiveUsers[0].length === 0) {
        logger_1.default.error("Test failed: No very active users found");
    }
    const beginnerUsers = await repositories_1.repositories.user.findWithFilters({ minimumFitnessLevel: Enums_1.Difficulty.BEGINNER });
    logger_1.default.info(`Found ${beginnerUsers[0].length} users with minimum fitness level: beginner`);
    if (beginnerUsers[0].length === 0) {
        logger_1.default.error("Test failed: No beginner users found");
    }
}
async function testPreferenceFilters() {
    logger_1.default.info("Testing preference filters...");
    const gymUsers = await repositories_1.repositories.user.findWithFilters({
        preferredLocation: Enums_1.WorkoutLocation.GYM,
        includePreferences: true
    });
    logger_1.default.info(`Found ${gymUsers[0].length} users who prefer gym workouts`);
    if (gymUsers[0].length === 0) {
        logger_1.default.error("Test failed: No users found who prefer gym workouts");
    }
    logger_1.default.info("\nTesting exercise preference filter");
    await testExercisePreference();
    const coreUsers = await repositories_1.repositories.user.findWithFilters({
        targetBodyAreas: [Enums_1.BodyArea.CORE],
        includePreferences: true
    });
    logger_1.default.info(`Found ${coreUsers[0].length} users who target core`);
    if (coreUsers[0].length === 0) {
        logger_1.default.error("Test failed: No users found who target core");
    }
    logger_1.default.info("\nTesting filter with no equipment preference");
    await testNoEquipmentPreference();
}
async function testCombinedFilters() {
    logger_1.default.info("Testing combined filters...");
    const activeFemaleBeginnersFilter = {
        role: User_1.UserRole.USER,
        gender: Enums_1.Gender.FEMALE,
        fitnessLevel: Enums_1.Difficulty.BEGINNER,
        includePreferences: true
    };
    const activeFemaleBeginnersResult = await repositories_1.repositories.user.findWithFilters(activeFemaleBeginnersFilter);
    logger_1.default.info(`Found ${activeFemaleBeginnersResult[0].length} active female beginners`);
    const complexFilter = {
        role: User_1.UserRole.USER,
        status: User_1.UserStatus.ACTIVE,
        preferredLocation: Enums_1.WorkoutLocation.HOME,
        exercisePreferences: [Enums_1.ExercisePreference.NO_EQUIPMENT],
        limit: 5,
        offset: 0,
        sortBy: "firstName",
        sortDirection: "ASC",
        includePreferences: true
    };
    const complexResult = await repositories_1.repositories.user.findWithFilters(complexFilter);
    logger_1.default.info(`Complex filter found ${complexResult[0].length} users out of ${complexResult[1]} total`);
}
async function testExercisePreference() {
    logger_1.default.info("\nTesting exercise preference filter");
    await testUserFilters();
}
async function testNoEquipmentPreference() {
    logger_1.default.info("\nTesting filter with no equipment preference");
    await testUserFilters();
}
testUserFilters()
    .then(() => console.log("Test script completed"))
    .catch(err => console.error("Test script failed:", err));
//# sourceMappingURL=testUserFilters.js.map