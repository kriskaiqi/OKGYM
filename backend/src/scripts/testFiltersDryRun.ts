import { UserFilterDto } from '../dto/UserDto';
import logger from '../utils/logger';
import { UserRole, UserStatus } from '../models/User';
import { Gender, ActivityLevel, WorkoutLocation, ExercisePreference, BodyArea, Difficulty } from '../models/shared/Enums';

/**
 * Dry-run test of the user filtering functionality
 * This script tests the filter structure without requiring a database connection
 */
async function testFiltersDryRun() {
  try {
    logger.info("Starting user filter dry-run tests...");
    
    testBasicFilters();
    testPaginationAndSorting();
    testDemographicFilters();
    testPreferenceFilters();
    testCombinedFilters();
    
    logger.info("All filter dry-run tests completed successfully");
  } catch (error) {
    logger.error("Error in filter dry-run tests", { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Test basic filters: role, status, search term
 */
function testBasicFilters() {
  logger.info("Testing basic filters...");

  // Test role filter
  const roleFilter: UserFilterDto = {
    role: UserRole.TRAINER
  };
  
  // Test status filter
  const statusFilter: UserFilterDto = {
    status: UserStatus.INACTIVE
  };
  
  // Test search term
  const searchFilter: UserFilterDto = {
    searchTerm: "John"
  };
  
  logger.info("Basic filter test objects created successfully", {
    roleFilter,
    statusFilter,
    searchFilter
  });
}

/**
 * Test pagination and sorting
 */
function testPaginationAndSorting() {
  logger.info("Testing pagination and sorting...");

  // Test pagination
  const paginationFilter: UserFilterDto = {
    limit: 10,
    offset: 20
  };
  
  // Test sorting ASC
  const sortingAscFilter: UserFilterDto = {
    sortBy: "firstName",
    sortDirection: "ASC"
  };
  
  // Test sorting DESC
  const sortingDescFilter: UserFilterDto = {
    sortBy: "lastName",
    sortDirection: "DESC"
  };
  
  logger.info("Pagination and sorting test objects created successfully", {
    paginationFilter,
    sortingAscFilter,
    sortingDescFilter
  });
}

/**
 * Test demographic filters: gender, activity level, fitness level
 */
function testDemographicFilters() {
  logger.info("Testing demographic filters...");

  // Test gender filter
  const genderFilter: UserFilterDto = {
    gender: Gender.FEMALE
  };
  
  // Test activity level filter
  const activityFilter: UserFilterDto = {
    activityLevel: ActivityLevel.VERY_ACTIVE
  };
  
  // Test fitness level filter
  const fitnessFilter: UserFilterDto = {
    minimumFitnessLevel: Difficulty.INTERMEDIATE
  };
  
  logger.info("Demographic filter test objects created successfully", {
    genderFilter,
    activityFilter,
    fitnessFilter
  });
}

/**
 * Test preference filters: location, exercise preferences, target body areas
 */
function testPreferenceFilters() {
  logger.info("Testing preference filters...");

  // Test location preference
  const locationFilter: UserFilterDto = {
    preferredLocation: WorkoutLocation.GYM,
    includePreferences: true
  };
  
  // Test exercise preferences
  const exerciseFilter: UserFilterDto = {
    exercisePreferences: [ExercisePreference.NO_EQUIPMENT, ExercisePreference.LOW_IMPACT],
    includePreferences: true
  };
  
  // Test target body areas
  const bodyAreaFilter: UserFilterDto = {
    targetBodyAreas: [BodyArea.CORE, BodyArea.LEGS],
    includePreferences: true
  };
  
  logger.info("Preference filter test objects created successfully", {
    locationFilter,
    exerciseFilter,
    bodyAreaFilter
  });
}

/**
 * Test combined filters
 */
function testCombinedFilters() {
  logger.info("Testing combined filters...");

  // Combination of role, gender, and fitness level
  const combinedFilter: UserFilterDto = {
    role: UserRole.USER,
    gender: Gender.FEMALE,
    minimumFitnessLevel: Difficulty.BEGINNER,
    includePreferences: true
  };
  
  // Complex combination
  const complexFilter: UserFilterDto = {
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    gender: Gender.MALE,
    minimumFitnessLevel: Difficulty.INTERMEDIATE,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    preferredLocation: WorkoutLocation.HOME,
    exercisePreferences: [ExercisePreference.STRENGTH_FOCUSED, ExercisePreference.LOW_IMPACT],
    targetBodyAreas: [BodyArea.ARMS, BodyArea.CHEST],
    limit: 5,
    offset: 0,
    sortBy: "firstName",
    sortDirection: "ASC",
    includePreferences: true,
    includeFitnessGoals: true
  };
  
  logger.info("Combined filter test objects created successfully", {
    combinedFilter,
    complexFilter
  });
}

// Run the test
testFiltersDryRun()
  .then(() => console.log("Dry-run test script completed"))
  .catch(err => console.error("Dry-run test script failed:", err)); 