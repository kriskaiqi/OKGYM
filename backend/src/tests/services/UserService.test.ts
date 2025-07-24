import { UserService } from '../../services/UserService';
import { repositories } from '../../repositories';
import { cacheManager } from '../../services/CacheManager';
import { UserRole, UserStatus } from '../../models/User';
import { AppError, ErrorType } from '../../utils/errors';
import { FitnessGoal, Gender, Difficulty, AppTheme } from '../../models/shared/Enums';
import logger from '../../utils/logger';

// Mock dependencies
jest.mock('../../repositories', () => ({
  repositories: {
    user: {
      findWithFilters: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn()
    }
  }
}));

jest.mock('../../services/CacheManager', () => ({
  cacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deleteByPattern: jest.fn()
  }
}));

jest.mock('../../utils/logger');
jest.mock('../../utils/performance', () => ({
  SimpleTrack: (options: any) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
  SimplePerformanceMetrics: {
    recordSuccess: jest.fn(),
    recordFailure: jest.fn(),
    recordTime: jest.fn(),
    getReport: jest.fn().mockReturnValue({ metrics: {} }),
    resetMetrics: jest.fn(),
  }
}));

// Mock the transaction helper
jest.mock('../../utils/transaction-helper', () => ({
  executeTransaction: jest.fn((callback) => callback()),
  executeTransactionBatch: jest.fn(),
  isInTransaction: jest.fn()
}));

describe('UserService', () => {
  let userService: UserService;
  const mockUserId = 'test-user-id';
  const mockAdminId = 'admin-user-id';
  
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed_password',
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    isAdmin: false,
    isPremium: false,
    gender: Gender.MALE,
    birthdate: new Date('1990-01-01'),
    height: 180,
    weight: 80,
    fitnessGoal: FitnessGoal.WEIGHT_LOSS,
    activityLevel: 'moderate',
    fitnessLevel: Difficulty.INTERMEDIATE,
    preferredWorkoutDuration: 60,
    workoutsPerWeek: 4,
    workoutPreferences: [],
    equipmentAvailable: [],
    dietaryRestrictions: [],
    healthConditions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    theme: AppTheme.LIGHT,
    programEnrollments: [],
  };

  // Create a version of mockUser without the password field for response expectations
  const { password, ...mockUserResponse } = mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Initialize service
    userService = new UserService();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      // Mock cache miss
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      
      // Mock repository response
      (repositories.user.findWithFilters as jest.Mock).mockResolvedValue([[mockUser], 1]);
      
      // Call method with required arguments
      const result = await userService.getAll({}, mockUserId, true);
      
      // Assertions
      expect(repositories.user.findWithFilters).toHaveBeenCalledWith({});
      expect(result).toEqual([[mockUserResponse], 1]);
    });

    it('should handle errors and log them', async () => {
      // Mock cache miss
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      
      // Mock repository error
      const error = new Error('Database error');
      (repositories.user.findWithFilters as jest.Mock).mockRejectedValue(error);
      
      // Test error handling with required arguments
      await expect(userService.getAll({}, mockUserId, true)).rejects.toThrow('Failed to fetch users');
      expect(logger.error).toHaveBeenCalledWith('Failed to fetch users', expect.objectContaining({
        error: error.message,
        filters: {},
        currentUserId: mockUserId
      }));
    });
  });

  describe('getById', () => {
    it('should return a user by id', async () => {
      // Mock repository response
      (repositories.user.findById as jest.Mock).mockResolvedValue(mockUser);
      
      // Call method with all required parameters
      const result = await userService.getById(mockUserId, mockUserId, true);
      
      // Assertions
      expect(repositories.user.findById).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockUserResponse);
    });

    it('should throw an error if user is not found', async () => {
      // Mock repository response for not found
      (repositories.user.findById as jest.Mock).mockResolvedValue(null);
      
      // Test error handling with all required parameters
      await expect(userService.getById(mockUserId, mockUserId, true)).rejects.toThrow(`User with ID ${mockUserId} not found`);
    });

    it('should handle errors and log them', async () => {
      // Mock repository error
      const error = new Error('Database error');
      (repositories.user.findById as jest.Mock).mockRejectedValue(error);
      
      // Test error handling with all required parameters
      await expect(userService.getById(mockUserId, mockUserId, true)).rejects.toThrow('Failed to retrieve user');
      expect(logger.error).toHaveBeenCalledWith('Failed to get user by ID', { 
        error: error.message, 
        userId: mockUserId 
      });
    });
  });

  describe('getByEmail', () => {
    it('should return a user by email', async () => {
      const userEmail = 'test@example.com';
      
      // Mock repository response
      (repositories.user.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      
      // Call method with all required parameters
      const result = await userService.getByEmail(userEmail, mockUserId, true);
      
      // Assertions
      expect(repositories.user.findByEmail).toHaveBeenCalledWith(userEmail);
      expect(result).toEqual(mockUserResponse);
    });

    it('should return null if user is not found', async () => {
      const userEmail = 'nonexistent@example.com';
      
      // Mock repository response for not found
      (repositories.user.findByEmail as jest.Mock).mockResolvedValue(null);
      
      // Call method with all required parameters
      const result = await userService.getByEmail(userEmail, mockUserId, true);
      
      // Assertions
      expect(result).toBeNull();
    });

    it('should handle errors and log them', async () => {
      const userEmail = 'test@example.com';
      
      // Mock repository error
      const error = new Error('Database error');
      (repositories.user.findByEmail as jest.Mock).mockRejectedValue(error);
      
      // Test error handling with all required parameters
      await expect(userService.getByEmail(userEmail, mockUserId, true)).rejects.toThrow('Failed to retrieve user by email');
      expect(logger.error).toHaveBeenCalledWith('Failed to get user by email', { 
        error: error.message, 
        email: userEmail 
      });
    });
  });

  describe('create', () => {
    const newUserData = {
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'User',
      password: 'password123',
      role: UserRole.USER,
    };

    it('should create a new user', async () => {
      // Mock email check
      (repositories.user.findByEmail as jest.Mock).mockResolvedValue(null);
      
      // Mock user creation
      const mockCreatedUser = { 
        id: 'new-user-id', 
        ...newUserData,
        password: 'hashed_password' // This would be the hashed password
      };
      (repositories.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      
      // Call method
      const result = await userService.create(newUserData);
      
      // Assertions
      expect(repositories.user.findByEmail).toHaveBeenCalledWith(newUserData.email);
      expect(repositories.user.create).toHaveBeenCalled();
      
      // The password should be removed from the response
      const { password, ...expectedUser } = mockCreatedUser;
      expect(result).toEqual(expectedUser);
    });

    it('should handle errors and log them', async () => {
      // Mock email check
      (repositories.user.findByEmail as jest.Mock).mockResolvedValue(null);
      
      // Mock repository error
      const error = new Error('Database error');
      (repositories.user.create as jest.Mock).mockRejectedValue(error);
      
      // Test error handling
      await expect(userService.create(newUserData)).rejects.toThrow('Failed to create user');
      expect(logger.error).toHaveBeenCalledWith('Failed to create user', expect.objectContaining({
        error: error.message,
        email: newUserData.email
      }));
    });
  });

  describe('update', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name'
    };
    
    const updatedMockUser = { 
      ...mockUser, 
      ...updateData 
    };

    it('should update user information', async () => {
      // Mock repository responses
      (repositories.user.findById as jest.Mock).mockResolvedValue(mockUser);
      
      const updatedMockUserResponse = { ...mockUserResponse, ...updateData };
      
      (repositories.user.update as jest.Mock).mockResolvedValue(updatedMockUser);
      
      // Call method with all required parameters
      const result = await userService.update(mockUserId, updateData, mockUserId, true);
      
      // Assertions
      expect(repositories.user.findById).toHaveBeenCalledWith(mockUserId);
      expect(repositories.user.update).toHaveBeenCalledWith(mockUserId, updateData);
      expect(result).toEqual(updatedMockUserResponse);
    });

    it('should throw an error if user is not found', async () => {
      // Mock repository response for not found
      (repositories.user.findById as jest.Mock).mockResolvedValue(null);
      
      // Test error handling with all required parameters
      await expect(userService.update(mockUserId, updateData, mockUserId, true)).rejects.toThrow(`User with ID ${mockUserId} not found`);
      expect(repositories.user.update).not.toHaveBeenCalled();
    });

    it('should handle errors and log them', async () => {
      // Mock repository response and error
      (repositories.user.findById as jest.Mock).mockResolvedValue(mockUser);
      const error = new Error('Database error');
      (repositories.user.update as jest.Mock).mockRejectedValue(error);
      
      // Test error handling with all required parameters
      await expect(userService.update(mockUserId, updateData, mockUserId, true)).rejects.toThrow('Failed to update user');
      expect(logger.error).toHaveBeenCalledWith('Failed to update user', { 
        error: error.message, 
        userId: mockUserId 
      });
    });
  });

  describe('batchGetByIds', () => {
    const userIds = [mockUserId];

    it('should return users for the given ids', async () => {
      // Mock cache miss
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      
      // Mock repository response
      (repositories.user.findById as jest.Mock).mockResolvedValue(mockUser);
      
      // Call method with all required parameters
      const result = await userService.batchGetByIds(userIds, mockAdminId, true);
      
      // Assertions
      expect(repositories.user.findById).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual({ [mockUserId]: mockUserResponse });
    });

    it('should return empty object if no users found', async () => {
      // Mock cache miss
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      
      // Mock repository response for not found
      (repositories.user.findById as jest.Mock).mockResolvedValue(null);
      
      // Call method
      const result = await userService.batchGetByIds(userIds, mockAdminId, true);
      
      // Assertions
      expect(result).toEqual({});
    });

    it('should handle errors and log them', async () => {
      // Mock cache miss
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      
      // Mock repository error
      const error = new Error('Database error');
      (repositories.user.findById as jest.Mock).mockRejectedValue(error);
      
      // Test error handling
      await expect(userService.batchGetByIds(userIds, mockAdminId, true)).rejects.toThrow('Failed to retrieve users');
      expect(logger.error).toHaveBeenCalledWith('Failed to batch get users by IDs', expect.objectContaining({
        error: error.message,
        userIds
      }));
    });
  });
}); 