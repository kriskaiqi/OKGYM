"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const User_1 = require("../models/User");
const Enums_1 = require("../models/shared/Enums");
async function testFiltersDryRun() {
    try {
        logger_1.default.info("Starting user filter dry-run tests...");
        testBasicFilters();
        testPaginationAndSorting();
        testDemographicFilters();
        testPreferenceFilters();
        testCombinedFilters();
        logger_1.default.info("All filter dry-run tests completed successfully");
    }
    catch (error) {
        logger_1.default.error("Error in filter dry-run tests", {
            error: error instanceof Error ? error.message : String(error)
        });
    }
}
function testBasicFilters() {
    logger_1.default.info("Testing basic filters...");
    const roleFilter = {
        role: User_1.UserRole.TRAINER
    };
    const statusFilter = {
        status: User_1.UserStatus.INACTIVE
    };
    const searchFilter = {
        searchTerm: "John"
    };
    logger_1.default.info("Basic filter test objects created successfully", {
        roleFilter,
        statusFilter,
        searchFilter
    });
}
function testPaginationAndSorting() {
    logger_1.default.info("Testing pagination and sorting...");
    const paginationFilter = {
        limit: 10,
        offset: 20
    };
    const sortingAscFilter = {
        sortBy: "firstName",
        sortDirection: "ASC"
    };
    const sortingDescFilter = {
        sortBy: "lastName",
        sortDirection: "DESC"
    };
    logger_1.default.info("Pagination and sorting test objects created successfully", {
        paginationFilter,
        sortingAscFilter,
        sortingDescFilter
    });
}
function testDemographicFilters() {
    logger_1.default.info("Testing demographic filters...");
    const genderFilter = {
        gender: Enums_1.Gender.FEMALE
    };
    const activityFilter = {
        activityLevel: Enums_1.ActivityLevel.VERY_ACTIVE
    };
    const fitnessFilter = {
        minimumFitnessLevel: Enums_1.Difficulty.INTERMEDIATE
    };
    logger_1.default.info("Demographic filter test objects created successfully", {
        genderFilter,
        activityFilter,
        fitnessFilter
    });
}
function testPreferenceFilters() {
    logger_1.default.info("Testing preference filters...");
    const locationFilter = {
        preferredLocation: Enums_1.WorkoutLocation.GYM,
        includePreferences: true
    };
    const exerciseFilter = {
        exercisePreferences: [Enums_1.ExercisePreference.NO_EQUIPMENT, Enums_1.ExercisePreference.LOW_IMPACT],
        includePreferences: true
    };
    const bodyAreaFilter = {
        targetBodyAreas: [Enums_1.BodyArea.CORE, Enums_1.BodyArea.LEGS],
        includePreferences: true
    };
    logger_1.default.info("Preference filter test objects created successfully", {
        locationFilter,
        exerciseFilter,
        bodyAreaFilter
    });
}
function testCombinedFilters() {
    logger_1.default.info("Testing combined filters...");
    const combinedFilter = {
        role: User_1.UserRole.USER,
        gender: Enums_1.Gender.FEMALE,
        minimumFitnessLevel: Enums_1.Difficulty.BEGINNER,
        includePreferences: true
    };
    const complexFilter = {
        role: User_1.UserRole.USER,
        status: User_1.UserStatus.ACTIVE,
        gender: Enums_1.Gender.MALE,
        minimumFitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
        activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
        preferredLocation: Enums_1.WorkoutLocation.HOME,
        exercisePreferences: [Enums_1.ExercisePreference.STRENGTH_FOCUSED, Enums_1.ExercisePreference.LOW_IMPACT],
        targetBodyAreas: [Enums_1.BodyArea.ARMS, Enums_1.BodyArea.CHEST],
        limit: 5,
        offset: 0,
        sortBy: "firstName",
        sortDirection: "ASC",
        includePreferences: true,
        includeFitnessGoals: true
    };
    logger_1.default.info("Combined filter test objects created successfully", {
        combinedFilter,
        complexFilter
    });
}
testFiltersDryRun()
    .then(() => console.log("Dry-run test script completed"))
    .catch(err => console.error("Dry-run test script failed:", err));
//# sourceMappingURL=testFiltersDryRun.js.map