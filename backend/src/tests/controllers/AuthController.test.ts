import { Request, Response } from 'express';
import { AuthController } from '../../controllers/AuthController';
import { AuthService } from '../../services/authService';
import { UserRepository } from '../../repositories/UserRepository';
import { MetricsService } from '../../services/MetricsService';
import logger from '../../utils/logger';

// Mock dependencies
jest.mock('../../services/authService');
jest.mock('../../repositories/UserRepository');
jest.mock('../../services/MetricsService');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Helper to create mock request and response objects
const mockRequestResponse = () => {
  const req: Partial<Request> = {
    body: {},
    params: {},
  };
  
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  
  return { req, res };
};

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockMetricsService: jest.Mocked<MetricsService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mocks
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockMetricsService = new MetricsService() as jest.Mocked<MetricsService>;
    
    // Create mock for AuthService with constructor params
    mockAuthService = new AuthService(
      mockUserRepository,
      { 
        get: jest.fn(), 
        set: jest.fn(), 
        delete: jest.fn(),
        getStats: jest.fn()
      },
      mockMetricsService
    ) as jest.Mocked<AuthService>;
    
    // Create instance of controller
    authController = new AuthController(mockAuthService);
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should return 201 and user data when registration is successful', async () => {
      const { req, res } = mockRequestResponse();
      req.body = registerData;
      
      const mockRegisterResult = {
        user: {
          id: 'user-123',
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
        },
        token: 'jwt-token',
      };
      
      // Mock service method
      mockAuthService.register = jest.fn().mockResolvedValue(mockRegisterResult);
      
      // Call controller method
      await authController.register(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockRegisterResult);
    });

    it('should return 409 when user already exists', async () => {
      const { req, res } = mockRequestResponse();
      req.body = registerData;
      
      // Mock service method to throw error
      const error = new Error('User already exists');
      mockAuthService.register = jest.fn().mockRejectedValue(error);
      
      // Call controller method
      await authController.register(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'User already exists'
        }
      });
    });

    it('should return 500 when an unexpected error occurs', async () => {
      const { req, res } = mockRequestResponse();
      req.body = registerData;
      
      // Mock service method to throw error
      const error = new Error('Registration failed');
      mockAuthService.register = jest.fn().mockRejectedValue(error);
      
      // Call controller method
      await authController.register(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Registration failed'
        }
      });
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user data and token when login is successful', async () => {
      const { req, res } = mockRequestResponse();
      req.body = loginData;
      
      const mockLoginResult = {
        user: {
          id: 'user-123',
          email: loginData.email,
          firstName: 'Test',
          lastName: 'User',
        },
        token: 'jwt-token',
      };
      
      // Mock service method
      mockAuthService.login = jest.fn().mockResolvedValue(mockLoginResult);
      
      // Call controller method
      await authController.login(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(res.json).toHaveBeenCalledWith(mockLoginResult);
    });

    it('should return 401 with invalid credentials', async () => {
      const { req, res } = mockRequestResponse();
      req.body = loginData;
      
      // Mock service method to throw error
      const error = new Error('Invalid credentials');
      mockAuthService.login = jest.fn().mockRejectedValue(error);
      
      // Call controller method
      await authController.login(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid credentials'
        }
      });
    });

    it('should return 500 when an unexpected error occurs', async () => {
      const { req, res } = mockRequestResponse();
      req.body = loginData;
      
      // Mock service method to throw error
      const error = new Error('Login failed');
      mockAuthService.login = jest.fn().mockRejectedValue(error);
      
      // Call controller method
      await authController.login(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Login failed'
        }
      });
    });
  });

  describe('getProfile', () => {
    const userId = 'user-123';
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should return user profile when successful', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: userId };
      
      // Mock service method
      mockAuthService.getUserById = jest.fn().mockResolvedValue(mockUser);
      
      // Call controller method
      await authController.getProfile(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 400 when userId is missing', async () => {
      const { req, res } = mockRequestResponse();
      req.params = {}; // No userId
      
      // Call controller method
      await authController.getProfile(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.getUserById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    it('should return 404 when user not found', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: userId };
      
      // Mock service method
      mockAuthService.getUserById = jest.fn().mockResolvedValue(null);
      
      // Call controller method
      await authController.getProfile(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 when an unexpected error occurs', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: userId };
      
      // Mock service method to throw error
      const error = new Error('Database error');
      mockAuthService.getUserById = jest.fn().mockRejectedValue(error);
      
      // Call controller method
      await authController.getProfile(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'An error occurred while fetching user profile' 
      });
    });
  });

  describe('getAllUsers', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        firstName: 'User',
        lastName: 'One',
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two',
      },
    ];

    it('should return all users when successful', async () => {
      const { req, res } = mockRequestResponse();
      
      // Mock service method
      mockAuthService.getAllUsers = jest.fn().mockResolvedValue(mockUsers);
      
      // Call controller method
      await authController.getAllUsers(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
    });

    it('should return 500 when an unexpected error occurs', async () => {
      const { req, res } = mockRequestResponse();
      
      // Mock service method to throw error
      const error = new Error('Database error');
      mockAuthService.getAllUsers = jest.fn().mockRejectedValue(error);
      
      // Call controller method
      await authController.getAllUsers(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.getAllUsers).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'An error occurred while fetching users' 
      });
    });
  });

  describe('updateFitnessProfile', () => {
    const userId = 'user-123';
    const fitnessProfile = {
      mainGoal: 'lose_weight',
      fitnessLevel: 'beginner',
      activityLevel: 'moderate',
    };
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      ...fitnessProfile,
    };

    it('should update fitness profile successfully', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { userId };
      req.body = fitnessProfile;
      
      // Mock service method
      mockAuthService.updateFitnessProfile = jest.fn().mockResolvedValue(mockUser);
      
      // Call controller method
      await authController.updateFitnessProfile(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.updateFitnessProfile).toHaveBeenCalledWith({
        userId,
        fitnessProfile,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 400 when userId is missing', async () => {
      const { req, res } = mockRequestResponse();
      req.params = {}; // No userId
      req.body = fitnessProfile;
      
      // Call controller method
      await authController.updateFitnessProfile(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.updateFitnessProfile).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    it('should return 400 when fitness profile data is missing', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { userId };
      req.body = null; // No fitness profile data
      
      // Call controller method
      await authController.updateFitnessProfile(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.updateFitnessProfile).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fitness profile data is required' });
    });

    it('should return 404 when user not found', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { userId };
      req.body = fitnessProfile;
      
      // Mock service method to throw 'User not found' error
      const error = new Error('User not found');
      mockAuthService.updateFitnessProfile = jest.fn().mockRejectedValue(error);
      
      // Call controller method
      await authController.updateFitnessProfile(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.updateFitnessProfile).toHaveBeenCalledWith({
        userId,
        fitnessProfile,
      });
      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 when an unexpected error occurs', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { userId };
      req.body = fitnessProfile;
      
      // Mock service method to throw error
      const error = new Error('Database error');
      mockAuthService.updateFitnessProfile = jest.fn().mockRejectedValue(error);
      
      // Call controller method
      await authController.updateFitnessProfile(req as Request, res as Response);
      
      // Assertions
      expect(mockAuthService.updateFitnessProfile).toHaveBeenCalledWith({
        userId,
        fitnessProfile,
      });
      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'An error occurred while updating fitness profile' 
      });
    });
  });
}); 