import axios from 'axios';
import * as dotenv from 'dotenv';
import { UserRole, UserStatus } from '../models/User';
import { Gender, ActivityLevel, FitnessGoal, WorkoutLocation, ExercisePreference, BodyArea, Difficulty } from '../models/shared/Enums';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

// API configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
let authToken: string;

/**
 * Test script for user API endpoints with filtering
 */
async function testUserApi() {
  try {
    logger.info("Starting User API tests...");
    
    // Login as admin
    await login();
    
    // Test user filters API endpoints
    await testBasicFilters();
    await testPaginationAndSorting();
    await testDemographicFilters();
    await testPreferenceFilters();
    await testCombinedFilters();
    
    logger.info("All User API tests completed successfully");
  } catch (error) {
    logger.error("Error in User API tests", { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Login as admin to get auth token
 */
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Password123'
    });
    
    authToken = response.data.data.token;
    logger.info("Admin login successful");
  } catch (error) {
    logger.error("Login failed", { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw new Error("Login failed. Cannot continue tests.");
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint: string, params: any = {}) {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      params
    });
    
    return response.data;
  } catch (error) {
    logger.error(`API request failed: ${endpoint}`, { 
      error: error instanceof Error ? error.message : String(error),
      params
    });
    throw error;
  }
}

/**
 * Test basic filters: role, status, search term
 */
async function testBasicFilters() {
  logger.info("Testing basic filters API...");

  // Test role filter
  const trainersResponse = await apiRequest('/users', { role: UserRole.TRAINER });
  logger.info(`API found ${trainersResponse.data.length} trainers`);
  
  // Test status filter
  const inactiveResponse = await apiRequest('/users', { status: UserStatus.INACTIVE });
  logger.info(`API found ${inactiveResponse.data.length} inactive users`);
  
  // Test search term
  const searchResponse = await apiRequest('/users', { searchTerm: 'Jane' });
  logger.info(`API found ${searchResponse.data.length} users matching 'Jane'`);
}

/**
 * Test pagination and sorting
 */
async function testPaginationAndSorting() {
  logger.info("Testing pagination and sorting API...");

  // Test pagination
  const page1Response = await apiRequest('/users', { limit: 3, offset: 0 });
  const page2Response = await apiRequest('/users', { limit: 3, offset: 3 });
  
  logger.info(`API Page 1: ${page1Response.data.length} users, Total: ${page1Response.metadata.totalItems}`);
  logger.info(`API Page 2: ${page2Response.data.length} users, Total: ${page2Response.metadata.totalItems}`);
  
  // Test sorting
  const ascResponse = await apiRequest('/users', { sortBy: 'firstName', sortDirection: 'ASC' });
  const descResponse = await apiRequest('/users', { sortBy: 'firstName', sortDirection: 'DESC' });
  
  logger.info(`API Sorted ASC first user: ${ascResponse.data[0]?.firstName}`);
  logger.info(`API Sorted DESC first user: ${descResponse.data[0]?.firstName}`);
}

/**
 * Test demographic filters: gender, activity level, fitness level
 */
async function testDemographicFilters() {
  logger.info("Testing demographic filters API...");

  // Test gender filter
  const femaleResponse = await apiRequest('/users', { gender: Gender.FEMALE });
  logger.info(`API found ${femaleResponse.data.length} female users`);
  
  // Test activity level filter
  const activeResponse = await apiRequest('/users', { activityLevel: ActivityLevel.VERY_ACTIVE });
  logger.info(`API found ${activeResponse.data.length} very active users`);
  
  // Test fitness level filter
  const beginnerResponse = await apiRequest('/users', { minimumFitnessLevel: Difficulty.BEGINNER });
  logger.info(`API found ${beginnerResponse.data.length} beginner users`);
}

/**
 * Test preference filters: location, exercise preferences, target body areas
 */
async function testPreferenceFilters() {
  logger.info("Testing preference filters API...");

  // Test location preference
  const gymResponse = await apiRequest('/users', { 
    preferredLocation: WorkoutLocation.GYM,
    includePreferences: true
  });
  logger.info(`API found ${gymResponse.data.length} users who prefer gym workouts`);
  
  // Test exercise preferences
  const cardioResponse = await apiRequest('/users', { 
    exercisePreferences: [ExercisePreference.CARDIO_FOCUSED],
    includePreferences: true
  });
  logger.info(`API found ${cardioResponse.data.length} users who prefer cardio`);
  
  // Test target body areas
  const coreResponse = await apiRequest('/users', { 
    targetBodyAreas: [BodyArea.CORE],
    includePreferences: true
  });
  logger.info(`API found ${coreResponse.data.length} users who target core`);
}

/**
 * Test combined filters
 */
async function testCombinedFilters() {
  logger.info("Testing combined filters API...");

  // Combination of role, gender, and fitness level
  const combinedResponse = await apiRequest('/users', {
    role: UserRole.USER,
    gender: Gender.FEMALE,
    fitnessLevel: Difficulty.BEGINNER,
    includePreferences: true
  });
  logger.info(`API found ${combinedResponse.data.length} female beginner users`);
  
  // Complex combination with pagination and sorting
  const complexResponse = await apiRequest('/users', {
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    preferredLocation: WorkoutLocation.HOME,
    exercisePreferences: [ExercisePreference.NO_EQUIPMENT],
    limit: 5,
    offset: 0,
    sortBy: "firstName",
    sortDirection: "ASC",
    includePreferences: true
  });
  logger.info(`API Complex filter found ${complexResponse.data.length} users out of ${complexResponse.metadata.totalItems} total`);
}

// Run the test
testUserApi()
  .then(() => console.log("API test script completed"))
  .catch(err => console.error("API test script failed:", err)); 