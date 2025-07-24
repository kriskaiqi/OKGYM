"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthController_1 = require("../../controllers/AuthController");
const authService_1 = require("../../services/authService");
const UserRepository_1 = require("../../repositories/UserRepository");
const MetricsService_1 = require("../../services/MetricsService");
const logger_1 = __importDefault(require("../../utils/logger"));
jest.mock('../../services/authService');
jest.mock('../../repositories/UserRepository');
jest.mock('../../services/MetricsService');
jest.mock('../../utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
}));
const mockRequestResponse = () => {
    const req = {
        body: {},
        params: {},
    };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis(),
    };
    return { req, res };
};
describe('AuthController', () => {
    let authController;
    let mockAuthService;
    let mockUserRepository;
    let mockMetricsService;
    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = new UserRepository_1.UserRepository();
        mockMetricsService = new MetricsService_1.MetricsService();
        mockAuthService = new authService_1.AuthService(mockUserRepository, {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            getStats: jest.fn()
        }, mockMetricsService);
        authController = new AuthController_1.AuthController(mockAuthService);
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
            mockAuthService.register = jest.fn().mockResolvedValue(mockRegisterResult);
            await authController.register(req, res);
            expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockRegisterResult);
        });
        it('should return 409 when user already exists', async () => {
            const { req, res } = mockRequestResponse();
            req.body = registerData;
            const error = new Error('User already exists');
            mockAuthService.register = jest.fn().mockRejectedValue(error);
            await authController.register(req, res);
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
            const error = new Error('Registration failed');
            mockAuthService.register = jest.fn().mockRejectedValue(error);
            await authController.register(req, res);
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
            mockAuthService.login = jest.fn().mockResolvedValue(mockLoginResult);
            await authController.login(req, res);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
            expect(res.json).toHaveBeenCalledWith(mockLoginResult);
        });
        it('should return 401 with invalid credentials', async () => {
            const { req, res } = mockRequestResponse();
            req.body = loginData;
            const error = new Error('Invalid credentials');
            mockAuthService.login = jest.fn().mockRejectedValue(error);
            await authController.login(req, res);
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
            const error = new Error('Login failed');
            mockAuthService.login = jest.fn().mockRejectedValue(error);
            await authController.login(req, res);
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
            mockAuthService.getUserById = jest.fn().mockResolvedValue(mockUser);
            await authController.getProfile(req, res);
            expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ user: mockUser });
        });
        it('should return 400 when userId is missing', async () => {
            const { req, res } = mockRequestResponse();
            req.params = {};
            await authController.getProfile(req, res);
            expect(mockAuthService.getUserById).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
        });
        it('should return 404 when user not found', async () => {
            const { req, res } = mockRequestResponse();
            req.params = { id: userId };
            mockAuthService.getUserById = jest.fn().mockResolvedValue(null);
            await authController.getProfile(req, res);
            expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
        it('should return 500 when an unexpected error occurs', async () => {
            const { req, res } = mockRequestResponse();
            req.params = { id: userId };
            const error = new Error('Database error');
            mockAuthService.getUserById = jest.fn().mockRejectedValue(error);
            await authController.getProfile(req, res);
            expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
            expect(logger_1.default.error).toHaveBeenCalled();
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
            mockAuthService.getAllUsers = jest.fn().mockResolvedValue(mockUsers);
            await authController.getAllUsers(req, res);
            expect(mockAuthService.getAllUsers).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
        });
        it('should return 500 when an unexpected error occurs', async () => {
            const { req, res } = mockRequestResponse();
            const error = new Error('Database error');
            mockAuthService.getAllUsers = jest.fn().mockRejectedValue(error);
            await authController.getAllUsers(req, res);
            expect(mockAuthService.getAllUsers).toHaveBeenCalled();
            expect(logger_1.default.error).toHaveBeenCalled();
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
        const mockUser = Object.assign({ id: userId, email: 'test@example.com', firstName: 'Test', lastName: 'User' }, fitnessProfile);
        it('should update fitness profile successfully', async () => {
            const { req, res } = mockRequestResponse();
            req.params = { userId };
            req.body = fitnessProfile;
            mockAuthService.updateFitnessProfile = jest.fn().mockResolvedValue(mockUser);
            await authController.updateFitnessProfile(req, res);
            expect(mockAuthService.updateFitnessProfile).toHaveBeenCalledWith({
                userId,
                fitnessProfile,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ user: mockUser });
        });
        it('should return 400 when userId is missing', async () => {
            const { req, res } = mockRequestResponse();
            req.params = {};
            req.body = fitnessProfile;
            await authController.updateFitnessProfile(req, res);
            expect(mockAuthService.updateFitnessProfile).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
        });
        it('should return 400 when fitness profile data is missing', async () => {
            const { req, res } = mockRequestResponse();
            req.params = { userId };
            req.body = null;
            await authController.updateFitnessProfile(req, res);
            expect(mockAuthService.updateFitnessProfile).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Fitness profile data is required' });
        });
        it('should return 404 when user not found', async () => {
            const { req, res } = mockRequestResponse();
            req.params = { userId };
            req.body = fitnessProfile;
            const error = new Error('User not found');
            mockAuthService.updateFitnessProfile = jest.fn().mockRejectedValue(error);
            await authController.updateFitnessProfile(req, res);
            expect(mockAuthService.updateFitnessProfile).toHaveBeenCalledWith({
                userId,
                fitnessProfile,
            });
            expect(logger_1.default.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
        it('should return 500 when an unexpected error occurs', async () => {
            const { req, res } = mockRequestResponse();
            req.params = { userId };
            req.body = fitnessProfile;
            const error = new Error('Database error');
            mockAuthService.updateFitnessProfile = jest.fn().mockRejectedValue(error);
            await authController.updateFitnessProfile(req, res);
            expect(mockAuthService.updateFitnessProfile).toHaveBeenCalledWith({
                userId,
                fitnessProfile,
            });
            expect(logger_1.default.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'An error occurred while updating fitness profile'
            });
        });
    });
});
//# sourceMappingURL=AuthController.test.js.map