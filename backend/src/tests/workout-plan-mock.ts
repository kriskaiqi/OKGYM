import { User } from '../models/User';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { Exercise } from '../models/Exercise';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { UserRole } from '../models/shared/Enums';

// Mock repositories
const mockRepositories = {
  userRepo: {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn()
  },
  workoutPlanRepo: {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn()
  },
  workoutExerciseRepo: {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn()
  },
  exerciseRepo: {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn()
  },
  exerciseCategoryRepo: {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn()
  }
};

// Mock DataSource with getRepository method
export const testDataSource = {
  getRepository: (entity: any) => {
    switch(entity) {
      case User:
        return mockRepositories.userRepo;
      case WorkoutPlan:
        return mockRepositories.workoutPlanRepo;
      case WorkoutExercise:
        return mockRepositories.workoutExerciseRepo;
      case Exercise:
        return mockRepositories.exerciseRepo;
      case ExerciseCategory:
        return mockRepositories.exerciseCategoryRepo;
      default:
        throw new Error(`Repository for entity ${entity.name} not mocked`);
    }
  },
  initialize: jest.fn().mockResolvedValue(true),
  destroy: jest.fn().mockResolvedValue(true),
  isInitialized: true
};

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token && token.startsWith('valid')) {
      return { userId: 'test-user-id', userRole: UserRole.USER };
    } else if (token && token.startsWith('admin')) {
      return { userId: 'admin-user-id', userRole: UserRole.ADMIN };
    } else {
      throw new Error('Invalid token');
    }
  }),
  sign: jest.fn().mockImplementation((payload, secret, options) => {
    if (payload.userRole === UserRole.ADMIN) {
      return 'admin-token';
    } else {
      return 'valid-token';
    }
  })
}));

// Setup and teardown
beforeEach(() => {
  // Reset all mocks before each test
  Object.values(mockRepositories).forEach(repo => {
    Object.values(repo).forEach(method => {
      if (typeof method === 'function' && method.mockClear) {
        method.mockClear();
      }
    });
  });
});

console.error = jest.fn(); // Mock console.error to avoid noise 