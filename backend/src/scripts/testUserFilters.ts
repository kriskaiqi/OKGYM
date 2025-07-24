import { AppDataSource } from "../data-source";
import { User, UserRole, UserStatus } from "../models/User";
import { repositories } from "../repositories";
import { Gender, ActivityLevel, FitnessGoal, WorkoutLocation, ExercisePreference, BodyArea, Difficulty } from "../models/shared/Enums";
import { hash } from "bcryptjs";
import logger from "../utils/logger";

/**
 * Test script for user filtering functionality
 * Creates test users and executes various filter combinations
 */
async function testUserFilters() {
  try {
    // Initialize database connection
    logger.info("Initializing database connection...");
    await AppDataSource.initialize();
    logger.info("Database connection established");

    // Create test users if they don't exist
    const existingCount = await repositories.user.count();
    if (existingCount < 10) {
      logger.info("Creating test users...");
      await createTestUsers();
    } else {
      logger.info(`Using ${existingCount} existing users for testing`);
    }

    // Test filters
    await testBasicFilters();
    await testPaginationAndSorting();
    await testDemographicFilters();
    await testPreferenceFilters();
    await testCombinedFilters();

    logger.info("All filter tests completed successfully");
  } catch (error) {
    logger.error("Error testing user filters", { 
      error: error instanceof Error ? error.message : String(error) 
    });
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  }
}

/**
 * Create a diverse set of test users
 */
async function createTestUsers() {
  const users = [
    {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      password: await hash("Password123", 10),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isAdmin: true,
      isPremium: true,
      gender: Gender.PREFER_NOT_TO_SAY,
      birthYear: 1985,
      height: 175,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      fitnessLevel: Difficulty.INTERMEDIATE,
      mainGoal: FitnessGoal.GENERAL_FITNESS,
      preferences: {
        workoutLocation: WorkoutLocation.GYM,
        preferredExerciseTypes: [ExercisePreference.STRENGTH_FOCUSED, ExercisePreference.NO_EQUIPMENT],
        targetBodyAreas: [BodyArea.FULL_BODY, BodyArea.CORE]
      }
    },
    {
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      password: await hash("Password123", 10),
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      isAdmin: false,
      isPremium: true,
      gender: Gender.MALE,
      birthYear: 1990,
      height: 180,
      activityLevel: ActivityLevel.VERY_ACTIVE,
      fitnessLevel: Difficulty.ADVANCED,
      mainGoal: FitnessGoal.MUSCLE_BUILDING,
      preferences: {
        workoutLocation: WorkoutLocation.GYM,
        preferredExerciseTypes: [ExercisePreference.STRENGTH_FOCUSED, ExercisePreference.NO_EQUIPMENT],
        targetBodyAreas: [BodyArea.ARMS, BodyArea.CHEST, BodyArea.BACK]
      }
    },
    {
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      password: await hash("Password123", 10),
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      isAdmin: false,
      isPremium: true,
      gender: Gender.FEMALE,
      birthYear: 1992,
      height: 165,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      fitnessLevel: Difficulty.INTERMEDIATE,
      mainGoal: FitnessGoal.FAT_LOSS,
      preferences: {
        workoutLocation: WorkoutLocation.HOME,
        preferredExerciseTypes: [ExercisePreference.CARDIO_FOCUSED, ExercisePreference.LOW_IMPACT],
        targetBodyAreas: [BodyArea.LEGS, BodyArea.CORE, BodyArea.GLUTES]
      }
    },
    {
      email: "trainer@example.com",
      firstName: "Michael",
      lastName: "Johnson",
      password: await hash("Password123", 10),
      role: UserRole.TRAINER,
      status: UserStatus.ACTIVE,
      isAdmin: false,
      isPremium: true,
      gender: Gender.MALE,
      birthYear: 1988,
      height: 175,
      activityLevel: ActivityLevel.VERY_ACTIVE,
      fitnessLevel: Difficulty.ADVANCED,
      mainGoal: FitnessGoal.ATHLETICISM,
      preferences: {
        workoutLocation: WorkoutLocation.GYM,
        preferredExerciseTypes: [ExercisePreference.STRENGTH_FOCUSED, ExercisePreference.LOW_IMPACT, ExercisePreference.NO_EQUIPMENT],
        targetBodyAreas: [BodyArea.FULL_BODY]
      }
    },
    {
      email: "emily@example.com",
      firstName: "Emily",
      lastName: "Wilson",
      password: await hash("Password123", 10),
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      isAdmin: false,
      isPremium: false,
      gender: Gender.FEMALE,
      birthYear: 1995,
      height: 160,
      activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
      fitnessLevel: Difficulty.BEGINNER,
      mainGoal: FitnessGoal.FLEXIBILITY,
      preferences: {
        workoutLocation: WorkoutLocation.HOME,
        preferredExerciseTypes: [ExercisePreference.LOW_IMPACT, ExercisePreference.QUIET],
        targetBodyAreas: [BodyArea.CORE, BodyArea.FULL_BODY]
      }
    },
    {
      email: "david@example.com",
      firstName: "David",
      lastName: "Brown",
      password: await hash("Password123", 10),
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      isAdmin: false,
      isPremium: false,
      gender: Gender.MALE,
      birthYear: 1987,
      height: 178,
      activityLevel: ActivityLevel.SEDENTARY,
      fitnessLevel: Difficulty.BEGINNER,
      mainGoal: FitnessGoal.FAT_LOSS,
      preferences: {
        workoutLocation: WorkoutLocation.OUTDOORS,
        preferredExerciseTypes: [ExercisePreference.CARDIO_FOCUSED],
        targetBodyAreas: [BodyArea.LEGS, BodyArea.CORE]
      }
    },
    {
      email: "sarah@example.com",
      firstName: "Sarah",
      lastName: "Taylor",
      password: await hash("Password123", 10),
      role: UserRole.CONTENT_CREATOR,
      status: UserStatus.PENDING,
      isAdmin: false,
      isPremium: true,
      gender: Gender.FEMALE,
      birthYear: 1991,
      height: 170,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      fitnessLevel: Difficulty.INTERMEDIATE,
      mainGoal: FitnessGoal.GENERAL_FITNESS,
      preferences: {
        workoutLocation: WorkoutLocation.GYM,
        preferredExerciseTypes: [ExercisePreference.STRENGTH_FOCUSED, ExercisePreference.LOW_IMPACT],
        targetBodyAreas: [BodyArea.FULL_BODY]
      }
    },
    {
      email: "robert@example.com",
      firstName: "Robert",
      lastName: "Miller",
      password: await hash("Password123", 10),
      role: UserRole.USER,
      status: UserStatus.SUSPENDED,
      isAdmin: false,
      isPremium: false,
      gender: Gender.MALE,
      birthYear: 1993,
      height: 183,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      fitnessLevel: Difficulty.INTERMEDIATE,
      mainGoal: FitnessGoal.MUSCLE_BUILDING,
      preferences: {
        workoutLocation: WorkoutLocation.GYM,
        preferredExerciseTypes: [ExercisePreference.STRENGTH_FOCUSED],
        targetBodyAreas: [BodyArea.ARMS, BodyArea.CHEST, BodyArea.BACK]
      }
    },
    {
      email: "emma@example.com",
      firstName: "Emma",
      lastName: "Garcia",
      password: await hash("Password123", 10),
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      isAdmin: false,
      isPremium: true,
      gender: Gender.FEMALE,
      birthYear: 1994,
      height: 167,
      activityLevel: ActivityLevel.VERY_ACTIVE,
      fitnessLevel: Difficulty.ADVANCED,
      mainGoal: FitnessGoal.ATHLETICISM,
      preferences: {
        workoutLocation: WorkoutLocation.OUTDOORS,
        preferredExerciseTypes: [ExercisePreference.CARDIO_FOCUSED, ExercisePreference.LOW_IMPACT],
        targetBodyAreas: [BodyArea.LEGS, BodyArea.CORE]
      }
    },
    {
      email: "william@example.com",
      firstName: "William",
      lastName: "Davis",
      password: await hash("Password123", 10),
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      isAdmin: false,
      isPremium: false,
      gender: Gender.MALE,
      birthYear: 1997,
      height: 175,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      fitnessLevel: Difficulty.BEGINNER,
      mainGoal: FitnessGoal.GENERAL_FITNESS,
      preferences: {
        workoutLocation: WorkoutLocation.HOME,
        preferredExerciseTypes: [ExercisePreference.NO_EQUIPMENT, ExercisePreference.LOW_IMPACT],
        targetBodyAreas: [BodyArea.FULL_BODY]
      }
    }
  ];

  // Create each user
  for (const userData of users) {
    const existingUser = await repositories.user.findByEmail(userData.email);
    if (!existingUser) {
      await repositories.user.create(userData);
      logger.info(`Created test user: ${userData.email}`);
    } else {
      logger.info(`Test user already exists: ${userData.email}`);
    }
  }
}

/**
 * Test basic filters: role, status, search term
 */
async function testBasicFilters() {
  logger.info("Testing basic filters...");

  // Test role filter
  const trainers = await repositories.user.findWithFilters({ role: UserRole.TRAINER });
  logger.info(`Found ${trainers[0].length} trainers`);
  if (trainers[0].length === 0) {
    logger.error("Test failed: No trainers found");
  }

  // Test status filter
  const inactiveUsers = await repositories.user.findWithFilters({ status: UserStatus.INACTIVE });
  logger.info(`Found ${inactiveUsers[0].length} inactive users`);
  if (inactiveUsers[0].length === 0) {
    logger.error("Test failed: No inactive users found");
  }

  // Test search by name
  const janeUsers = await repositories.user.findWithFilters({ searchTerm: "Jane" });
  logger.info(`Found ${janeUsers[0].length} users matching 'Jane'`);
  if (janeUsers[0].length === 0) {
    logger.error("Test failed: No users found matching 'Jane'");
  }
}

/**
 * Test pagination and sorting
 */
async function testPaginationAndSorting() {
  logger.info("Testing pagination and sorting...");

  // Test pagination
  const page1 = await repositories.user.findWithFilters({ limit: 3, offset: 0 });
  const page2 = await repositories.user.findWithFilters({ limit: 3, offset: 3 });
  
  logger.info(`Page 1: ${page1[0].length} users, Total: ${page1[1]}`);
  logger.info(`Page 2: ${page2[0].length} users, Total: ${page2[1]}`);
  
  if (page1[0].length !== 3 || page2[0].length === 0) {
    logger.error("Test failed: Pagination not working correctly");
  }

  // Test sorting
  const ascUsers = await repositories.user.findWithFilters({ sortBy: "firstName", sortDirection: "ASC" });
  const descUsers = await repositories.user.findWithFilters({ sortBy: "firstName", sortDirection: "DESC" });
  
  logger.info(`Sorted ASC first user: ${ascUsers[0][0]?.firstName}`);
  logger.info(`Sorted DESC first user: ${descUsers[0][0]?.firstName}`);
  
  if (ascUsers[0][0]?.firstName === descUsers[0][0]?.firstName) {
    logger.error("Test failed: Sorting not working correctly");
  }
}

/**
 * Test demographic filters: gender, activity level, fitness level
 */
async function testDemographicFilters() {
  logger.info("Testing demographic filters...");

  // Test gender filter
  const femaleUsers = await repositories.user.findWithFilters({ gender: Gender.FEMALE });
  logger.info(`Found ${femaleUsers[0].length} female users`);
  if (femaleUsers[0].length === 0) {
    logger.error("Test failed: No female users found");
  }

  // Test activity level filter
  const veryActiveUsers = await repositories.user.findWithFilters({ activityLevel: ActivityLevel.VERY_ACTIVE });
  logger.info(`Found ${veryActiveUsers[0].length} very active users`);
  if (veryActiveUsers[0].length === 0) {
    logger.error("Test failed: No very active users found");
  }

  // Test fitness level filter
  const beginnerUsers = await repositories.user.findWithFilters({ minimumFitnessLevel: Difficulty.BEGINNER });
  logger.info(`Found ${beginnerUsers[0].length} users with minimum fitness level: beginner`);
  if (beginnerUsers[0].length === 0) {
    logger.error("Test failed: No beginner users found");
  }
}

/**
 * Test preference filters: location, exercise preferences, target body areas
 */
async function testPreferenceFilters() {
  logger.info("Testing preference filters...");

  // Test location preference
  const gymUsers = await repositories.user.findWithFilters({ 
    preferredLocation: WorkoutLocation.GYM,
    includePreferences: true
  });
  logger.info(`Found ${gymUsers[0].length} users who prefer gym workouts`);
  if (gymUsers[0].length === 0) {
    logger.error("Test failed: No users found who prefer gym workouts");
  }

  // Test exercise preference filter
  logger.info("\nTesting exercise preference filter");
  await testExercisePreference();
  
  // Test target body areas
  const coreUsers = await repositories.user.findWithFilters({ 
    targetBodyAreas: [BodyArea.CORE],
    includePreferences: true
  });
  logger.info(`Found ${coreUsers[0].length} users who target core`);
  if (coreUsers[0].length === 0) {
    logger.error("Test failed: No users found who target core");
  }

  // Test filter with no equipment preference
  logger.info("\nTesting filter with no equipment preference");
  await testNoEquipmentPreference();
}

/**
 * Test combined filters
 */
async function testCombinedFilters() {
  logger.info("Testing combined filters...");

  // Combination of role, gender, and activity level
  const activeFemaleBeginnersFilter = {
    role: UserRole.USER,
    gender: Gender.FEMALE,
    fitnessLevel: Difficulty.BEGINNER,
    includePreferences: true
  };
  
  const activeFemaleBeginnersResult = await repositories.user.findWithFilters(activeFemaleBeginnersFilter);
  logger.info(`Found ${activeFemaleBeginnersResult[0].length} active female beginners`);
  
  // Complex combination with pagination and sorting
  const complexFilter = {
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    preferredLocation: WorkoutLocation.HOME,
    exercisePreferences: [ExercisePreference.NO_EQUIPMENT],
    limit: 5,
    offset: 0,
    sortBy: "firstName",
    sortDirection: "ASC" as "ASC" | "DESC",
    includePreferences: true
  };
  
  const complexResult = await repositories.user.findWithFilters(complexFilter);
  logger.info(`Complex filter found ${complexResult[0].length} users out of ${complexResult[1]} total`);
}

// Fix the helper function to call testUserFilters
async function testExercisePreference() {
  logger.info("\nTesting exercise preference filter");
  await testUserFilters();
}

// Fix the second test helper
async function testNoEquipmentPreference() {
  logger.info("\nTesting filter with no equipment preference");
  await testUserFilters();
}

// Run the test
testUserFilters()
  .then(() => console.log("Test script completed"))
  .catch(err => console.error("Test script failed:", err)); 