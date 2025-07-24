"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = require("../../services/authService");
const data_source_1 = require("../../data-source");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../../utils/logger"));
const bcryptjs_2 = __importDefault(require("bcryptjs"));
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
    let authService;
    let mockUserRepository;
    let userRepositoryMock;
    let cacheManagerMock;
    let metricsServiceMock;
    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        };
        data_source_1.AppDataSource.getRepository.mockReturnValue(mockUserRepository);
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
        };
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
        authService = new authService_1.AuthService(userRepositoryMock, cacheManagerMock, metricsServiceMock);
    });
    describe('register', () => {
        const registerData = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
        };
        it('should register a new user successfully', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            const mockUser = Object.assign(Object.assign({ id: 'user-123' }, registerData), { password: 'hashed_password123', isAdmin: false, isPremium: false });
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            const result = await authService.register(registerData);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: registerData.email },
            });
            expect(mockUserRepository.create).toHaveBeenCalledWith(Object.assign(Object.assign({}, registerData), { password: 'hashed_password123', isAdmin: false, isPremium: false }));
            expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalled();
            expect(logger_1.default.info).toHaveBeenCalled();
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token', 'mocked_token');
            expect(result.user).not.toHaveProperty('password');
        });
        it('should throw error if user already exists', async () => {
            mockUserRepository.findOne.mockResolvedValue({
                id: 'existing-user',
                email: registerData.email,
            });
            await expect(authService.register(registerData)).rejects.toThrow('User already exists');
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: registerData.email },
            });
            expect(mockUserRepository.create).not.toHaveBeenCalled();
            expect(mockUserRepository.save).not.toHaveBeenCalled();
            expect(logger_1.default.error).toHaveBeenCalled();
        });
    });
    describe('login', () => {
        it('should authenticate a user successfully', async () => {
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
            userRepositoryMock.findOne.mockResolvedValue(storedUser);
            bcryptjs_2.default.compare.mockResolvedValue(true);
            jsonwebtoken_1.default.sign.mockReturnValue('fake_token');
            const result = await authService.login(loginData);
            expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
                where: { email: loginData.email }
            });
            expect(bcryptjs_2.default.compare).toHaveBeenCalledWith(loginData.password, storedUser.password);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user).toBeDefined();
            expect(result.user).not.toHaveProperty('password');
        });
        it('should throw error if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(authService.login({
                email: 'test@example.com',
                password: 'password123'
            })).rejects.toThrow('Invalid credentials');
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(bcryptjs_1.compare).not.toHaveBeenCalled();
            expect(logger_1.default.error).toHaveBeenCalled();
        });
        it('should throw error if password is invalid', async () => {
            mockUserRepository.findOne.mockResolvedValue({
                id: 'user-123',
                email: 'test@example.com',
                password: 'hashed_password',
                firstName: 'Test',
                lastName: 'User',
                isAdmin: false,
            });
            bcryptjs_1.compare.mockResolvedValue(false);
            await expect(authService.login({
                email: 'test@example.com',
                password: 'password123'
            })).rejects.toThrow('Invalid credentials');
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(bcryptjs_1.compare).toHaveBeenCalledWith('password123', 'hashed_password');
            expect(jsonwebtoken_1.default.sign).not.toHaveBeenCalled();
            expect(logger_1.default.error).toHaveBeenCalled();
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
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            const result = await authService.getUserById(userId);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(result).not.toHaveProperty('password');
            expect(result).toHaveProperty('id', userId);
        });
        it('should return null if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            const result = await authService.getUserById(userId);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(result).toBeNull();
        });
        it('should handle errors gracefully', async () => {
            const error = new Error('Database error');
            mockUserRepository.findOne.mockRejectedValue(error);
            await expect(authService.getUserById(userId)).rejects.toThrow();
            expect(logger_1.default.error).toHaveBeenCalled();
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
            mockUserRepository.find.mockResolvedValue(mockUsers);
            const result = await authService.getAllUsers();
            expect(mockUserRepository.find).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            result.forEach(user => {
                expect(user).not.toHaveProperty('password');
            });
            expect(result[0]).toHaveProperty('id', 'user-1');
            expect(result[1]).toHaveProperty('id', 'user-2');
        });
        it('should handle errors gracefully', async () => {
            const error = new Error('Database error');
            mockUserRepository.find.mockRejectedValue(error);
            await expect(authService.getAllUsers()).rejects.toThrow();
            expect(logger_1.default.error).toHaveBeenCalled();
        });
    });
    describe('initializeAdmin', () => {
        it('should create admin if it does not exist', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            const mockAdmin = {
                id: 'admin-123',
                email: 'admin@okgym.com',
                password: 'hashed_admin123',
                firstName: 'Admin',
                lastName: 'User',
                isAdmin: true,
                isPremium: true,
            };
            mockUserRepository.create.mockReturnValue(mockAdmin);
            mockUserRepository.save.mockResolvedValue(mockAdmin);
            await authService.initializeAdmin();
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'admin@okgym.com' },
            });
            expect(bcryptjs_1.hash).toHaveBeenCalledWith('admin123', 10);
            expect(mockUserRepository.create).toHaveBeenCalled();
            expect(mockUserRepository.save).toHaveBeenCalled();
            expect(logger_1.default.info).toHaveBeenCalledWith('Initialized database with admin account');
        });
        it('should not create admin if it already exists', async () => {
            mockUserRepository.findOne.mockResolvedValue({
                id: 'admin-123',
                email: 'admin@okgym.com',
            });
            await authService.initializeAdmin();
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'admin@okgym.com' },
            });
            expect(mockUserRepository.create).not.toHaveBeenCalled();
            expect(mockUserRepository.save).not.toHaveBeenCalled();
            expect(logger_1.default.info).toHaveBeenCalledWith('Admin account already exists');
        });
        it('should handle errors gracefully', async () => {
            const error = new Error('Database error');
            mockUserRepository.findOne.mockRejectedValue(error);
            await expect(authService.initializeAdmin()).rejects.toThrow();
            expect(logger_1.default.error).toHaveBeenCalled();
        });
    });
    describe('updateFitnessProfile', () => {
        const userId = 'user-123';
        const fitnessProfile = {
            mainGoal: 'LOSE_WEIGHT',
            fitnessLevel: 'BEGINNER',
            activityLevel: 'MODERATE',
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
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            const updatedUser = Object.assign(Object.assign({}, mockUser), { mainGoal: fitnessProfile.mainGoal, fitnessLevel: fitnessProfile.fitnessLevel, activityLevel: fitnessProfile.activityLevel, preferences: fitnessProfile.preferences });
            mockUserRepository.save.mockResolvedValue(updatedUser);
            const result = await authService.updateFitnessProfile(userId, fitnessProfile);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUserRepository.save).toHaveBeenCalled();
            expect(logger_1.default.info).toHaveBeenCalledWith('Updating fitness profile for user:', { userId });
            expect(logger_1.default.info).toHaveBeenCalledWith('Fitness profile updated successfully', { userId });
            expect(result).toHaveProperty('mainGoal', fitnessProfile.mainGoal);
            expect(result).toHaveProperty('fitnessLevel', fitnessProfile.fitnessLevel);
            expect(result).toHaveProperty('activityLevel', fitnessProfile.activityLevel);
            expect(result).toHaveProperty('preferences', fitnessProfile.preferences);
            expect(result).not.toHaveProperty('password');
        });
        it('should throw error if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(authService.updateFitnessProfile(userId, fitnessProfile)).rejects.toThrow('User not found');
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUserRepository.save).not.toHaveBeenCalled();
            expect(logger_1.default.warn).toHaveBeenCalledWith('Update failed: User not found', { userId });
        });
    });
});
//# sourceMappingURL=AuthService.test.js.map