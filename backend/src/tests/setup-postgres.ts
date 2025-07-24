import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { Exercise } from '../models/Exercise';
import { Equipment } from '../models/Equipment';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Media } from '../models/Media';
import { TrainingProgram } from '../models/TrainingProgram';
import { ProgramWorkout } from '../models/ProgramWorkout';
import { WorkoutTag } from '../models/WorkoutTag';
import { ProgramEnrollment } from '../models/ProgramEnrollment';
import { ExerciseDetails } from '../models/ExerciseDetails';
import { MetricTracking } from '../models/MetricTracking';
import { Feedback } from '../models/Feedback';
import { ExerciseRelation } from '../models/ExerciseRelation';
import { UserRole } from '../models/shared/Enums';
import { WorkoutSession } from '../models/WorkoutSession';
import { Achievement, UserAchievement } from '../models/Achievement';
import { FitnessGoal } from '../models/FitnessGoal';
import { BodyMetric } from '../models/BodyMetric';
import { Notification } from '../models/Notification';
import { WorkoutRating } from '../models/WorkoutRating';
import { ExerciseFormAnalysis } from '../models/ExerciseFormAnalysis';

// Load environment variables from .env.test file
dotenv.config({ path: '.env.test' });

// Increase timeout for tests
jest.setTimeout(30000);

// Create PostgreSQL data source for testing
export const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'okgym_test',
  schema: process.env.DB_SCHEMA || 'public',
  entities: [
    User,
    WorkoutPlan,
    WorkoutExercise,
    Exercise,
    Equipment,
    ExerciseCategory,
    Media,
    TrainingProgram,
    ProgramWorkout,
    WorkoutTag,
    ProgramEnrollment,
    ExerciseDetails,
    MetricTracking,
    Feedback,
    ExerciseRelation,
    WorkoutSession,
    Achievement,
    UserAchievement,
    FitnessGoal,
    BodyMetric,
    Notification,
    WorkoutRating,
    ExerciseFormAnalysis
  ],
  synchronize: true,
  dropSchema: true,
  logging: false
});

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementation((token, secret) => {
    // If token starts with 'valid', it's a valid token
    if (token && token.startsWith('valid')) {
      return { userId: 'test-user-id', userRole: UserRole.USER };
    }
    // If token starts with 'admin', it's a valid admin token
    else if (token && token.startsWith('admin')) {
      return { userId: 'admin-user-id', userRole: UserRole.ADMIN };
    }
    // Otherwise, it's invalid
    else {
      throw new Error('Invalid token');
    }
  }),
  sign: jest.fn().mockImplementation((payload, secret, options) => {
    if (payload.userRole === UserRole.ADMIN) {
      return 'admin-token';
    } else {
      return 'valid-token';
    }
  }),
}));

// Setup and teardown logic
beforeAll(async () => {
  try {
    await testDataSource.initialize();
    console.log('PostgreSQL connection initialized for tests');
  } catch (error) {
    console.error('Error during PostgreSQL DataSource initialization:', error);
    throw error;
  }
});

afterAll(async () => {
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
    console.log('PostgreSQL connection closed');
  }
});

// Mock console.error to avoid noisy logs during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    // Filter out expected errors
    args[0]?.includes('expected error message') ||
    args[0]?.includes('another expected error')
  ) {
    return;
  }
  originalConsoleError(...args);
}; 