"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserService_1 = require("../../services/UserService");
const repositories_1 = require("../../repositories");
const CacheManager_1 = require("../../services/CacheManager");
const User_1 = require("../../models/User");
const Enums_1 = require("../../models/shared/Enums");
const logger_1 = __importDefault(require("../../utils/logger"));
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
    SimpleTrack: (options) => (target, propertyKey, descriptor) => descriptor,
    SimplePerformanceMetrics: {
        recordSuccess: jest.fn(),
        recordFailure: jest.fn(),
        recordTime: jest.fn(),
        getReport: jest.fn().mockReturnValue({ metrics: {} }),
        resetMetrics: jest.fn(),
    }
}));
jest.mock('../../utils/transaction-helper', () => ({
    executeTransaction: jest.fn((callback) => callback()),
    executeTransactionBatch: jest.fn(),
    isInTransaction: jest.fn()
}));
describe('UserService', () => {
    let userService;
    const mockUserId = 'test-user-id';
    const mockAdminId = 'admin-user-id';
    const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashed_password',
        status: User_1.UserStatus.ACTIVE,
        role: User_1.UserRole.USER,
        isAdmin: false,
        isPremium: false,
        gender: Enums_1.Gender.MALE,
        birthdate: new Date('1990-01-01'),
        height: 180,
        weight: 80,
        fitnessGoal: Enums_1.FitnessGoal.WEIGHT_LOSS,
        activityLevel: 'moderate',
        fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
        preferredWorkoutDuration: 60,
        workoutsPerWeek: 4,
        workoutPreferences: [],
        equipmentAvailable: [],
        dietaryRestrictions: [],
        healthConditions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        theme: Enums_1.AppTheme.LIGHT,
        programEnrollments: [],
    };
    const { password } = mockUser, mockUserResponse = __rest(mockUser, ["password"]);
    beforeEach(() => {
        jest.clearAllMocks();
        userService = new UserService_1.UserService();
    });
    describe('getAll', () => {
        it('should return all users', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            repositories_1.repositories.user.findWithFilters.mockResolvedValue([[mockUser], 1]);
            const result = await userService.getAll({}, mockUserId, true);
            expect(repositories_1.repositories.user.findWithFilters).toHaveBeenCalledWith({});
            expect(result).toEqual([[mockUserResponse], 1]);
        });
        it('should handle errors and log them', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            const error = new Error('Database error');
            repositories_1.repositories.user.findWithFilters.mockRejectedValue(error);
            await expect(userService.getAll({}, mockUserId, true)).rejects.toThrow('Failed to fetch users');
            expect(logger_1.default.error).toHaveBeenCalledWith('Failed to fetch users', expect.objectContaining({
                error: error.message,
                filters: {},
                currentUserId: mockUserId
            }));
        });
    });
    describe('getById', () => {
        it('should return a user by id', async () => {
            repositories_1.repositories.user.findById.mockResolvedValue(mockUser);
            const result = await userService.getById(mockUserId, mockUserId, true);
            expect(repositories_1.repositories.user.findById).toHaveBeenCalledWith(mockUserId);
            expect(result).toEqual(mockUserResponse);
        });
        it('should throw an error if user is not found', async () => {
            repositories_1.repositories.user.findById.mockResolvedValue(null);
            await expect(userService.getById(mockUserId, mockUserId, true)).rejects.toThrow(`User with ID ${mockUserId} not found`);
        });
        it('should handle errors and log them', async () => {
            const error = new Error('Database error');
            repositories_1.repositories.user.findById.mockRejectedValue(error);
            await expect(userService.getById(mockUserId, mockUserId, true)).rejects.toThrow('Failed to retrieve user');
            expect(logger_1.default.error).toHaveBeenCalledWith('Failed to get user by ID', {
                error: error.message,
                userId: mockUserId
            });
        });
    });
    describe('getByEmail', () => {
        it('should return a user by email', async () => {
            const userEmail = 'test@example.com';
            repositories_1.repositories.user.findByEmail.mockResolvedValue(mockUser);
            const result = await userService.getByEmail(userEmail, mockUserId, true);
            expect(repositories_1.repositories.user.findByEmail).toHaveBeenCalledWith(userEmail);
            expect(result).toEqual(mockUserResponse);
        });
        it('should return null if user is not found', async () => {
            const userEmail = 'nonexistent@example.com';
            repositories_1.repositories.user.findByEmail.mockResolvedValue(null);
            const result = await userService.getByEmail(userEmail, mockUserId, true);
            expect(result).toBeNull();
        });
        it('should handle errors and log them', async () => {
            const userEmail = 'test@example.com';
            const error = new Error('Database error');
            repositories_1.repositories.user.findByEmail.mockRejectedValue(error);
            await expect(userService.getByEmail(userEmail, mockUserId, true)).rejects.toThrow('Failed to retrieve user by email');
            expect(logger_1.default.error).toHaveBeenCalledWith('Failed to get user by email', {
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
            role: User_1.UserRole.USER,
        };
        it('should create a new user', async () => {
            repositories_1.repositories.user.findByEmail.mockResolvedValue(null);
            const mockCreatedUser = Object.assign(Object.assign({ id: 'new-user-id' }, newUserData), { password: 'hashed_password' });
            repositories_1.repositories.user.create.mockResolvedValue(mockCreatedUser);
            const result = await userService.create(newUserData);
            expect(repositories_1.repositories.user.findByEmail).toHaveBeenCalledWith(newUserData.email);
            expect(repositories_1.repositories.user.create).toHaveBeenCalled();
            const { password } = mockCreatedUser, expectedUser = __rest(mockCreatedUser, ["password"]);
            expect(result).toEqual(expectedUser);
        });
        it('should handle errors and log them', async () => {
            repositories_1.repositories.user.findByEmail.mockResolvedValue(null);
            const error = new Error('Database error');
            repositories_1.repositories.user.create.mockRejectedValue(error);
            await expect(userService.create(newUserData)).rejects.toThrow('Failed to create user');
            expect(logger_1.default.error).toHaveBeenCalledWith('Failed to create user', expect.objectContaining({
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
        const updatedMockUser = Object.assign(Object.assign({}, mockUser), updateData);
        it('should update user information', async () => {
            repositories_1.repositories.user.findById.mockResolvedValue(mockUser);
            const updatedMockUserResponse = Object.assign(Object.assign({}, mockUserResponse), updateData);
            repositories_1.repositories.user.update.mockResolvedValue(updatedMockUser);
            const result = await userService.update(mockUserId, updateData, mockUserId, true);
            expect(repositories_1.repositories.user.findById).toHaveBeenCalledWith(mockUserId);
            expect(repositories_1.repositories.user.update).toHaveBeenCalledWith(mockUserId, updateData);
            expect(result).toEqual(updatedMockUserResponse);
        });
        it('should throw an error if user is not found', async () => {
            repositories_1.repositories.user.findById.mockResolvedValue(null);
            await expect(userService.update(mockUserId, updateData, mockUserId, true)).rejects.toThrow(`User with ID ${mockUserId} not found`);
            expect(repositories_1.repositories.user.update).not.toHaveBeenCalled();
        });
        it('should handle errors and log them', async () => {
            repositories_1.repositories.user.findById.mockResolvedValue(mockUser);
            const error = new Error('Database error');
            repositories_1.repositories.user.update.mockRejectedValue(error);
            await expect(userService.update(mockUserId, updateData, mockUserId, true)).rejects.toThrow('Failed to update user');
            expect(logger_1.default.error).toHaveBeenCalledWith('Failed to update user', {
                error: error.message,
                userId: mockUserId
            });
        });
    });
    describe('batchGetByIds', () => {
        const userIds = [mockUserId];
        it('should return users for the given ids', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            repositories_1.repositories.user.findById.mockResolvedValue(mockUser);
            const result = await userService.batchGetByIds(userIds, mockAdminId, true);
            expect(repositories_1.repositories.user.findById).toHaveBeenCalledWith(mockUserId);
            expect(result).toEqual({ [mockUserId]: mockUserResponse });
        });
        it('should return empty object if no users found', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            repositories_1.repositories.user.findById.mockResolvedValue(null);
            const result = await userService.batchGetByIds(userIds, mockAdminId, true);
            expect(result).toEqual({});
        });
        it('should handle errors and log them', async () => {
            CacheManager_1.cacheManager.get.mockResolvedValue(null);
            const error = new Error('Database error');
            repositories_1.repositories.user.findById.mockRejectedValue(error);
            await expect(userService.batchGetByIds(userIds, mockAdminId, true)).rejects.toThrow('Failed to retrieve users');
            expect(logger_1.default.error).toHaveBeenCalledWith('Failed to batch get users by IDs', expect.objectContaining({
                error: error.message,
                userIds
            }));
        });
    });
});
//# sourceMappingURL=UserService.test.js.map