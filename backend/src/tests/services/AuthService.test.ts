import { AuthService } from '../../services/authService';
import { User } from '../../models/User';
import { AppDataSource } from '../../data-source';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger';
import { UserRepository } from '../../repositories/UserRepository';
import { MetricsService } from '../../services/MetricsService';
import { AppError, ErrorType } from '../../utils/errors';
import bcrypt from 'bcryptjs';
import { cacheManager } from '../../services/CacheManager';
import { FitnessGoal, Difficulty, ActivityLevel } from '../../models/shared/Enums';

// Mock dependencies
jest.mock('../../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_token'),
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: Partial<Repository<User>>;
  let userRepositoryMock: any;
  let cacheManagerMock: any;
  let metricsServiceMock: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock repository
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    // Mock AppDataSource.getRepository to return our mock repository
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

    // Create mocks
    userRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      findWithFilters: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getByEmail: jest.fn(),
      findByUsername: jest.fn(),
      searchUsers: jest.fn()
    } as unknown as UserRepository;

    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPattern: jest.fn(),
      clear: jest.fn(),
      getStats: jest.fn(),
      close: jest.fn()
    };

    metricsServiceMock = {
      trackMetric: jest.fn(),
      trackTiming: jest.fn(),
      incrementCounter: jest.fn(),
      recordError: jest.fn(),
      trackEvent: jest.fn(),
      startTimer: jest.fn()
    };

    // Create instance of service
    authService = new AuthService(
      userRepositoryMock,
      cacheManagerMock,
      metricsServiceMock
    );
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should register a new user successfully', async () => {
      // Mock user doesn't exist
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Mock user creation
      const mockUser = {
        id: 'user-123',
        ...registerData,
        password: 'hashed_password123',
        isAdmin: false,
        isPremium: false,
      };
      (mockUserRepository.create as jest.Mock).mockReturnValue(mockUser);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(mockUser);

      // Call the service method
      const result = await authService.register(registerData);

      // Assertions
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerData,
        password: 'hashed_password123',
        isAdmin: false,
        isPremium: false,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(jwt.sign).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
      
      // Check result structure
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mocked_token');
      
      // Check user DTO doesn't contain password
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if user already exists', async () => {
      // Mock user exists
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: registerData.email,
      });

      // Call the service method and expect it to throw
      await expect(authService.register(registerData)).rejects.toThrow('User already exists');
      
      // Verify repository methods were called correctly
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should authenticate a user successfully', async () => {
      // Mock data
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const storedUser = {
        id: 'user-123',
        email: loginData.email,
        password: 'hashed_password',
        userRole: 'USER'
      };

      // Setup mocks
      userRepositoryMock.findOne.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fake_token');

      // Execute
      const result = await authService.login(loginData);

      // Assert
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email: loginData.email }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, storedUser.password);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if user not found', async () => {
      // Mock user doesn't exist
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(authService.login({
        email: 'test@example.com',
        password: 'password123'
      })).rejects.toThrow('Invalid credentials');
      
      // Verify repository methods were called correctly
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(compare).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      // Mock user exists
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        isAdmin: false,
      });
      
      // Mock password is invalid
      (compare as jest.Mock).mockResolvedValue(false);

      // Call the service method and expect it to throw
      await expect(authService.login({
        email: 'test@example.com',
        password: 'password123'
      })).rejects.toThrow('Invalid credentials');
      
      // Verify repository methods were called correctly
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    const userId = 'user-123';
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      password: 'hashed_password',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should return user by ID', async () => {
      // Mock user exists
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Call the service method
      const result = await authService.getUserById(userId);

      // Assertions
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      
      // Check result doesn't contain password
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id', userId);
    });

    it('should return null if user not found', async () => {
      // Mock user doesn't exist
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Call the service method
      const result = await authService.getUserById(userId);

      // Assertions
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      // Mock repository throws error
      const error = new Error('Database error');
      (mockUserRepository.findOne as jest.Mock).mockRejectedValue(error);

      // Call the service method and expect it to throw
      await expect(authService.getUserById(userId)).rejects.toThrow();
      
      // Verify error was logged
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        password: 'hashed_password1',
        firstName: 'User',
        lastName: 'One',
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        password: 'hashed_password2',
        firstName: 'User',
        lastName: 'Two',
      },
    ];

    it('should return all users without passwords', async () => {
      // Mock repository returns users
      (mockUserRepository.find as jest.Mock).mockResolvedValue(mockUsers);

      // Call the service method
      const result = await authService.getAllUsers();

      // Assertions
      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      
      // Check passwords are removed
      result.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
      
      // Check user IDs are preserved
      expect(result[0]).toHaveProperty('id', 'user-1');
      expect(result[1]).toHaveProperty('id', 'user-2');
    });

    it('should handle errors gracefully', async () => {
      // Mock repository throws error
      const error = new Error('Database error');
      (mockUserRepository.find as jest.Mock).mockRejectedValue(error);

      // Call the service method and expect it to throw
      await expect(authService.getAllUsers()).rejects.toThrow();
      
      // Verify error was logged
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('initializeAdmin', () => {
    it('should create admin if it does not exist', async () => {
      // Mock admin doesn't exist
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
      
      // Mock admin creation
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@okgym.com',
        password: 'hashed_admin123',
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
        isPremium: true,
      };
      (mockUserRepository.create as jest.Mock).mockReturnValue(mockAdmin);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(mockAdmin);

      // Call the service method
      await authService.initializeAdmin();

      // Assertions
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@okgym.com' },
      });
      expect(hash).toHaveBeenCalledWith('admin123', 10);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Initialized database with admin account');
    });

    it('should not create admin if it already exists', async () => {
      // Mock admin exists
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'admin-123',
        email: 'admin@okgym.com',
      });

      // Call the service method
      await authService.initializeAdmin();

      // Assertions
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@okgym.com' },
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Admin account already exists');
    });

    it('should handle errors gracefully', async () => {
      // Mock repository throws error
      const error = new Error('Database error');
      (mockUserRepository.findOne as jest.Mock).mockRejectedValue(error);

      // Call the service method and expect it to throw
      await expect(authService.initializeAdmin()).rejects.toThrow();
      
      // Verify error was logged
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateFitnessProfile', () => {
    const userId = 'user-123';
    const fitnessProfile = {
      mainGoal: 'LOSE_WEIGHT' as FitnessGoal,
      fitnessLevel: 'BEGINNER' as Difficulty,
      activityLevel: 'MODERATE' as ActivityLevel,
      preferences: {
        workoutDuration: 30,
        workoutFrequency: 3
      }
    };

    const mockUser = {
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      mainGoal: null,
      fitnessLevel: null,
      activityLevel: null,
      preferences: {},
    };

    it('should update fitness profile successfully', async () => {
      // Mock user exists
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock updated user
      const updatedUser = {
        ...mockUser,
        mainGoal: fitnessProfile.mainGoal,
        fitnessLevel: fitnessProfile.fitnessLevel,
        activityLevel: fitnessProfile.activityLevel,
        preferences: fitnessProfile.preferences
      };
      (mockUserRepository.save as jest.Mock).mockResolvedValue(updatedUser);

      // Call the service method
      const result = await authService.updateFitnessProfile(userId, fitnessProfile);

      // Assertions
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Updating fitness profile for user:',
        { userId }
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Fitness profile updated successfully',
        { userId }
      );
      
      // Check result contains updated fitness profile
      expect(result).toHaveProperty('mainGoal', fitnessProfile.mainGoal);
      expect(result).toHaveProperty('fitnessLevel', fitnessProfile.fitnessLevel);
      expect(result).toHaveProperty('activityLevel', fitnessProfile.activityLevel);
      expect(result).toHaveProperty('preferences', fitnessProfile.preferences);
      
      // Check result doesn't contain password
      expect(result).not.toHaveProperty('password');
    });

    it('should throw error if user not found', async () => {
      // Mock user doesn't exist
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(authService.updateFitnessProfile(userId, fitnessProfile)).rejects.toThrow('User not found');
      
      // Verify repository methods were called correctly
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'Update failed: User not found',
        { userId }
      );
    });
  });
}); 