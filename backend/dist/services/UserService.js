"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.UserService = void 0;
const repositories_1 = require("../repositories");
const User_1 = require("../models/User");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const transaction_helper_1 = require("../utils/transaction-helper");
const bcryptjs_1 = require("bcryptjs");
const CacheManager_1 = require("../services/CacheManager");
const config_1 = require("../config");
const performance_1 = require("../utils/performance");
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
const data_source_1 = require("../data-source");
const UserProgress_1 = require("../models/UserProgress");
const UserActivity_1 = require("../models/UserActivity");
const Enums_1 = require("../models/shared/Enums");
class UserService {
    constructor() {
        var _a, _b;
        this.cacheTTL = ((_b = (_a = config_1.config.cache) === null || _a === void 0 ? void 0 : _a.ttl) === null || _b === void 0 ? void 0 : _b.user) || 3600;
    }
    async getAll(filterDto, currentUserId, isAdmin) {
        try {
            if (!isAdmin) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Only administrators can list all users', 403);
            }
            const cacheKey = `users:filters:${JSON.stringify(filterDto || {})}`;
            const cachedResult = await CacheManager_1.cacheManager.get(cacheKey);
            if (cachedResult) {
                logger_1.default.debug('Users list retrieved from cache', { filters: filterDto });
                return cachedResult;
            }
            const [users, count] = await repositories_1.repositories.user.findWithFilters(filterDto || {});
            const transformedUsers = users.map(user => this.toUserResponseDto(user));
            const result = [transformedUsers, count];
            await CacheManager_1.cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to fetch users', {
                error: error instanceof Error ? error.message : String(error),
                filters: filterDto,
                currentUserId
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to fetch users', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async getById(id, currentUserId, isAdmin) {
        try {
            this.ensureUserCanAccess(id, currentUserId, isAdmin);
            const cacheKey = `user:${id}`;
            const cachedUser = await CacheManager_1.cacheManager.get(cacheKey);
            if (cachedUser) {
                logger_1.default.debug('User retrieved from cache', { userId: id });
                return this.toUserResponseDto(cachedUser);
            }
            const user = await repositories_1.repositories.user.findById(id);
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${id} not found`, 404);
            }
            await CacheManager_1.cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
            return this.toUserResponseDto(user);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to get user by ID', {
                error: error instanceof Error ? error.message : String(error),
                userId: id
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to retrieve user', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async getByEmail(email, currentUserId, isAdmin) {
        try {
            const cacheKey = `user:email:${email.toLowerCase()}`;
            const cachedUser = await CacheManager_1.cacheManager.get(cacheKey);
            if (cachedUser) {
                this.ensureUserCanAccess(cachedUser.id, currentUserId, isAdmin);
                logger_1.default.debug('User retrieved from cache by email', { email });
                return this.toUserResponseDto(cachedUser);
            }
            const user = await repositories_1.repositories.user.findByEmail(email);
            if (!user) {
                return null;
            }
            this.ensureUserCanAccess(user.id, currentUserId, isAdmin);
            await CacheManager_1.cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
            await CacheManager_1.cacheManager.set(`user:${user.id}`, user, { ttl: this.cacheTTL });
            return this.toUserResponseDto(user);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to get user by email', {
                error: error instanceof Error ? error.message : String(error),
                email
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to retrieve user by email', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async isEmailAvailable(email) {
        try {
            const user = await repositories_1.repositories.user.findByEmail(email);
            return !user;
        }
        catch (error) {
            logger_1.default.error('Failed to check email availability', {
                error: error instanceof Error ? error.message : String(error),
                email
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to check email availability', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async create(data) {
        return (0, transaction_helper_1.executeTransaction)(async (queryRunner) => {
            try {
                this.validateUserData(data, false);
                const existingUser = await repositories_1.repositories.user.findByEmail(data.email);
                if (existingUser) {
                    throw new errors_1.AppError(errors_1.ErrorType.ALREADY_EXISTS, 'Email is already registered', 409);
                }
                const hashedPassword = await (0, bcryptjs_1.hash)(data.password, 10);
                const userData = Object.assign(Object.assign({}, data), { password: hashedPassword, status: data.status || User_1.UserStatus.ACTIVE, role: data.role || User_1.UserRole.USER });
                const user = await repositories_1.repositories.user.create(userData);
                logger_1.default.info('User created', {
                    userId: user.id,
                    email: user.email
                });
                return this.toUserResponseDto(user);
            }
            catch (error) {
                if (error instanceof errors_1.AppError) {
                    throw error;
                }
                logger_1.default.error('Failed to create user', {
                    error: error instanceof Error ? error.message : String(error),
                    email: data.email
                });
                throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to create user', 500, error instanceof Error ? { message: error.message } : undefined);
            }
        });
    }
    async update(id, data, currentUserId, isAdmin) {
        try {
            this.ensureUserCanAccess(id, currentUserId, isAdmin);
            this.validateUserData(data, true);
            const existingUser = await repositories_1.repositories.user.findById(id);
            if (!existingUser) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${id} not found`, 404);
            }
            if (data.isAdmin !== undefined && data.isAdmin !== existingUser.isAdmin && !isAdmin) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Only administrators can change user admin status', 403);
            }
            if (data.email && data.email !== existingUser.email) {
                const emailExists = await repositories_1.repositories.user.findByEmail(data.email);
                if (emailExists) {
                    throw new errors_1.AppError(errors_1.ErrorType.ALREADY_EXISTS, 'Email is already registered', 409);
                }
            }
            let updateData = Object.assign({}, data);
            if (data.password) {
                updateData.password = await (0, bcryptjs_1.hash)(data.password, 10);
            }
            const updatedUser = await repositories_1.repositories.user.update(id, updateData);
            if (!updatedUser) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${id} not found`, 404);
            }
            await this.invalidateUserCache(id);
            logger_1.default.info('User updated', {
                userId: id,
                fields: Object.keys(data),
                updatedBy: currentUserId
            });
            return this.toUserResponseDto(updatedUser);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to update user', {
                error: error instanceof Error ? error.message : String(error),
                userId: id
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to update user', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async updateFitnessProfile(id, data, currentUserId, isAdmin) {
        try {
            this.ensureUserCanAccess(id, currentUserId, isAdmin);
            let dateOfBirth = null;
            if (data.dateOfBirth) {
                dateOfBirth = data.dateOfBirth;
                delete data.dateOfBirth;
            }
            if (data.birthYear) {
            }
            if (data.preferences) {
                delete data.preferences;
            }
            this.validateFitnessProfile(data);
            const existingUser = await repositories_1.repositories.user.findById(id);
            if (!existingUser) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${id} not found`, 404);
            }
            const currentPreferences = existingUser.preferences || {};
            const updatedPreferences = Object.assign(Object.assign({}, currentPreferences), data);
            if (dateOfBirth) {
                updatedPreferences['dateOfBirth'] = dateOfBirth;
                if (!data.birthYear) {
                    const birthYear = new Date(dateOfBirth).getFullYear();
                    logger_1.default.info(`Extracted birth year ${birthYear} from date ${dateOfBirth}`);
                    data.birthYear = birthYear;
                }
            }
            const directUpdates = {
                preferences: updatedPreferences
            };
            if (data.gender) {
                directUpdates.gender = data.gender;
            }
            if (data.heightCm) {
                directUpdates.height = data.heightCm;
            }
            if (data.activityLevel) {
                directUpdates.activityLevel = data.activityLevel;
            }
            if (data.fitnessGoals && data.fitnessGoals.length > 0) {
                directUpdates.mainGoal = data.fitnessGoals[0];
            }
            if (data.birthYear) {
                directUpdates.birthYear = data.birthYear;
                logger_1.default.info(`Updating birthYear to ${data.birthYear}`);
            }
            logger_1.default.info('Updating user fitness profile with both preferences and direct columns', {
                userId: id,
                preferences: Object.keys(updatedPreferences),
                directColumns: Object.keys(directUpdates).filter(k => k !== 'preferences')
            });
            const updatedUser = await repositories_1.repositories.user.update(id, directUpdates);
            if (!updatedUser) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${id} not found`, 404);
            }
            await this.invalidateUserCache(id);
            logger_1.default.info('User fitness profile updated', {
                userId: id,
                fields: Object.keys(data),
                updatedBy: currentUserId
            });
            return this.toUserResponseDto(updatedUser);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to update fitness profile', {
                error: error instanceof Error ? error.message : String(error),
                userId: id
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to update fitness profile', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async updatePreferences(id, preferences, currentUserId, isAdmin) {
        try {
            this.ensureUserCanAccess(id, currentUserId, isAdmin);
            const existingUser = await repositories_1.repositories.user.findById(id);
            if (!existingUser) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${id} not found`, 404);
            }
            const currentPreferences = existingUser.preferences || {};
            const updatedPreferences = Object.assign(Object.assign({}, currentPreferences), preferences);
            const updatedUser = await repositories_1.repositories.user.update(id, {
                preferences: updatedPreferences
            });
            if (!updatedUser) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${id} not found`, 404);
            }
            await this.invalidateUserCache(id);
            logger_1.default.info('User preferences updated', {
                userId: id,
                fields: Object.keys(preferences),
                updatedBy: currentUserId
            });
            return this.toUserResponseDto(updatedUser);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to update preferences', {
                error: error instanceof Error ? error.message : String(error),
                userId: id
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to update preferences', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async changePassword(id, currentPassword, newPassword, currentUserId, isAdmin) {
        try {
            this.ensureUserCanAccess(id, currentUserId, isAdmin);
            this.validatePassword(newPassword);
            const user = await repositories_1.repositories.user.findById(id);
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${id} not found`, 404);
            }
            if (!isAdmin) {
                const isPasswordValid = await (0, bcryptjs_1.compare)(currentPassword, user.password);
                if (!isPasswordValid) {
                    throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'Current password is incorrect', 401);
                }
            }
            const hashedPassword = await (0, bcryptjs_1.hash)(newPassword, 10);
            await repositories_1.repositories.user.update(id, { password: hashedPassword });
            await this.invalidateUserCache(id);
            logger_1.default.info('User password changed', {
                userId: id,
                updatedBy: currentUserId,
                byAdmin: isAdmin
            });
            return true;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to change password', {
                error: error instanceof Error ? error.message : String(error),
                userId: id
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to change password', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async delete(id, currentUserId, isAdmin) {
        try {
            this.ensureUserCanAccess(id, currentUserId, isAdmin);
            await this.canDelete(id);
            const result = await repositories_1.repositories.user.update(id, {
                isPremium: false
            });
            if (!result) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${id} not found`, 404);
            }
            await this.invalidateUserCache(id);
            logger_1.default.info('User deleted (soft delete)', {
                userId: id,
                deletedBy: currentUserId
            });
            return true;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to delete user', {
                error: error instanceof Error ? error.message : String(error),
                userId: id
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to delete user', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    validateUserData(data, isUpdate) {
        if (!isUpdate) {
            if (!data.email) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Email is required', 400);
            }
            if (!data.password) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Password is required', 400);
            }
            if (!data.firstName) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'First name is required', 400);
            }
            if (!data.lastName) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Last name is required', 400);
            }
            this.validatePassword(data.password);
        }
        else {
            if (data.password) {
                this.validatePassword(data.password);
            }
        }
        if (data.email && !this.isValidEmail(data.email)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid email format', 400);
        }
        if (data.role && !Object.values(User_1.UserRole).includes(data.role)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid user role', 400);
        }
        if (data.status && !Object.values(User_1.UserStatus).includes(data.status)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid user status', 400);
        }
    }
    validatePassword(password) {
        if (!password || password.length < 8) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Password must be at least 8 characters long', 400);
        }
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (!hasLetter || !hasNumber) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Password must contain at least one letter and one number', 400);
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    validateFitnessProfile(data) {
        if (data.age !== undefined) {
            if (typeof data.age !== 'number' || data.age < 1 || data.age > 120) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Age must be between 1 and 120', 400);
            }
        }
        if (data.heightCm !== undefined) {
            if (typeof data.heightCm !== 'number' || data.heightCm < 30 || data.heightCm > 300) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Height must be between 30 and 300 cm', 400);
            }
        }
        if (data.weightKg !== undefined) {
            if (typeof data.weightKg !== 'number' || data.weightKg < 20 || data.weightKg > 300) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Weight must be between 20 and 300 kg', 400);
            }
        }
        if (data.gender && !Object.values(Enums_1.Gender).includes(data.gender)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid gender value', 400);
        }
        if (data.activityLevel && !Object.values(Enums_1.ActivityLevel).includes(data.activityLevel)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid activity level', 400);
        }
        if (data.fitnessGoals) {
            if (!Array.isArray(data.fitnessGoals)) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Fitness goals must be an array', 400);
            }
            for (const goal of data.fitnessGoals) {
                if (!Object.values(Enums_1.FitnessGoal).includes(goal)) {
                    throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, `Invalid fitness goal: ${goal}`, 400);
                }
            }
        }
        if (data.fitnessLevel && !Object.values(Enums_1.Difficulty).includes(data.fitnessLevel)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid fitness level', 400);
        }
        if (data.preferredLocation && !Object.values(Enums_1.WorkoutLocation).includes(data.preferredLocation)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid preferred workout location', 400);
        }
        if (data.exercisePreferences) {
            if (!Array.isArray(data.exercisePreferences)) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Exercise preferences must be an array', 400);
            }
            for (const pref of data.exercisePreferences) {
                if (!Object.values(Enums_1.ExercisePreference).includes(pref)) {
                    throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, `Invalid exercise preference: ${pref}`, 400);
                }
            }
        }
        if (data.targetBodyAreas) {
            if (!Array.isArray(data.targetBodyAreas)) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Target body areas must be an array', 400);
            }
            for (const area of data.targetBodyAreas) {
                if (!Object.values(Enums_1.BodyArea).includes(area)) {
                    throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, `Invalid target body area: ${area}`, 400);
                }
            }
        }
        if (data.preferredUnit && !Object.values(Enums_1.MeasurementUnit).includes(data.preferredUnit)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid preferred measurement unit', 400);
        }
        if (data.preferredTheme && !Object.values(Enums_1.AppTheme).includes(data.preferredTheme)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid preferred app theme', 400);
        }
    }
    async canDelete(id) {
        try {
            return true;
        }
        catch (error) {
            logger_1.default.error('Error checking if user can be deleted', {
                error: error instanceof Error ? error.message : String(error),
                userId: id
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to check if user can be deleted', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    ensureUserCanAccess(targetUserId, currentUserId, isAdmin) {
        if (isAdmin) {
            return;
        }
        if (targetUserId !== currentUserId) {
            throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'You do not have permission to access this user data', 403);
        }
    }
    toUserResponseDto(user) {
        if (!user)
            return null;
        const { password } = user, userDto = __rest(user, ["password"]);
        return userDto;
    }
    async invalidateUserCache(userId) {
        try {
            const cachePattern = `user:${userId}*`;
            await CacheManager_1.cacheManager.deleteByPattern(cachePattern);
            logger_1.default.debug('User cache invalidated', { userId, pattern: cachePattern });
        }
        catch (error) {
            logger_1.default.warn('Failed to invalidate user cache', {
                error: error instanceof Error ? error.message : String(error),
                userId
            });
        }
    }
    async batchGetByIds(ids, currentUserId, isAdmin) {
        if (!ids.length)
            return {};
        try {
            const uniqueIds = [...new Set(ids)];
            if (!isAdmin && !uniqueIds.every(id => id === currentUserId)) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'You do not have permission to access other user data', 403);
            }
            const result = {};
            const uncachedIds = [];
            await Promise.all(uniqueIds.map(async (id) => {
                const cacheKey = `user:${id}`;
                const cachedUser = await CacheManager_1.cacheManager.get(cacheKey);
                if (cachedUser) {
                    result[id] = this.toUserResponseDto(cachedUser);
                }
                else {
                    uncachedIds.push(id);
                }
            }));
            if (uncachedIds.length) {
                const users = await Promise.all(uncachedIds.map(id => repositories_1.repositories.user.findById(id)));
                await Promise.all(users.filter(Boolean).map(async (user) => {
                    if (!user)
                        return;
                    const cacheKey = `user:${user.id}`;
                    await CacheManager_1.cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
                    result[user.id] = this.toUserResponseDto(user);
                }));
            }
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to batch get users by IDs', {
                error: error instanceof Error ? error.message : String(error),
                userIds: ids
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to retrieve users', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async getUserProgress(userId) {
        try {
            const cacheKey = `user:${userId}:progress`;
            const cachedProgress = await CacheManager_1.cacheManager.get(cacheKey);
            if (cachedProgress) {
                logger_1.default.debug('User progress retrieved from cache', { userId });
                return cachedProgress;
            }
            const user = await repositories_1.repositories.user.findById(userId);
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${userId} not found`, 404);
            }
            const progressRepository = data_source_1.AppDataSource.getRepository(UserProgress_1.UserProgress);
            const progress = await RelationshipLoader_1.RelationshipLoader.loadRelationship('User', 'progress', userId, progressRepository);
            const progressData = {
                metrics: progress,
            };
            await CacheManager_1.cacheManager.set(cacheKey, progressData, { ttl: 3600 });
            return progressData;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to get user progress', {
                error: error instanceof Error ? error.message : String(error),
                userId
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to retrieve user progress data', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async getUserActivity(userId, limit = 10) {
        try {
            const validLimit = Math.min(Math.max(limit, 1), 50);
            const cacheKey = `user:${userId}:activity:${validLimit}`;
            const cachedActivity = await CacheManager_1.cacheManager.get(cacheKey);
            if (cachedActivity) {
                logger_1.default.debug('User activity retrieved from cache', { userId, limit: validLimit });
                return cachedActivity;
            }
            const user = await repositories_1.repositories.user.findById(userId);
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${userId} not found`, 404);
            }
            const activityRepository = data_source_1.AppDataSource.getRepository(UserActivity_1.UserActivity);
            const activity = await RelationshipLoader_1.RelationshipLoader.loadRelationship('User', 'activity', userId, activityRepository);
            const sortedActivity = activity
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, validLimit);
            await CacheManager_1.cacheManager.set(cacheKey, sortedActivity, { ttl: 1800 });
            return sortedActivity;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to get user activity', {
                error: error instanceof Error ? error.message : String(error),
                userId,
                limit
            });
            throw new errors_1.AppError(errors_1.ErrorType.DATABASE_ERROR, 'Failed to retrieve user activity data', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async getUserProfile(userId) {
        console.log('👉 UserService.getUserProfile called for user', userId, 'at', new Date().toISOString());
        try {
            logger_1.default.info(`Getting fresh user profile data for user ${userId}`);
            const user = await this.getById(userId, userId, false);
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${userId} not found`, 404);
            }
            const options = { useCache: false };
            const [fitnessGoals, bodyMetrics, favoriteWorkouts, recentActivities, achievements] = await Promise.all([
                RelationshipLoader_1.RelationshipLoader.loadUserFitnessGoals(userId, options),
                RelationshipLoader_1.RelationshipLoader.loadUserBodyMetrics(userId, options),
                RelationshipLoader_1.RelationshipLoader.loadUserFavoriteWorkouts(userId, options),
                RelationshipLoader_1.RelationshipLoader.loadUserRecentActivity(userId, 5, options),
                RelationshipLoader_1.RelationshipLoader.loadUserAchievements(userId, options)
            ]);
            const userStats = await this.calculateUserStats(userId, bodyMetrics, achievements);
            logger_1.default.info(`User stats calculated: totalWorkouts=${userStats.totalWorkouts}`);
            const profile = {
                user,
                stats: userStats,
                fitnessGoals,
                bodyMetrics: bodyMetrics.slice(0, 10),
                favoriteWorkouts,
                recentActivities,
                achievements: achievements.filter(a => a.isUnlocked).slice(0, 5)
            };
            return profile;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to get user profile', {
                error: error instanceof Error ? error.message : String(error),
                userId
            });
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to retrieve user profile', 500, error instanceof Error ? { message: error.message } : undefined);
        }
    }
    async calculateUserStats(userId, bodyMetrics = [], achievements = []) {
        try {
            const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({
                where: { id: userId }
            });
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'User not found', 404);
            }
            const stats = user.stats || {};
            let currentWeight = stats.currentWeight;
            let startingWeight = stats.startingWeight;
            const weightMetric = bodyMetrics.find(m => m.type === 'WEIGHT');
            if (weightMetric && weightMetric.value) {
                currentWeight = weightMetric.value;
                if (!startingWeight) {
                    startingWeight = currentWeight;
                }
            }
            const userStats = {
                currentWeight,
                startingWeight,
                weightHistory: stats.weightHistory || [],
                weightUnit: stats.weightUnit || 'METRIC',
                lastWorkoutDate: stats.lastWorkoutDate
            };
            logger_1.default.info(`User stats calculated: currentWeight=${userStats.currentWeight || 'not set'}`);
            return userStats;
        }
        catch (error) {
            logger_1.default.error('Error calculating user stats', {
                error: error instanceof Error ? error.message : String(error),
                userId
            });
            return {
                currentWeight: null,
                startingWeight: null,
                weightHistory: [],
                weightUnit: 'METRIC'
            };
        }
    }
    async loadUserProfile(user, includeRelationships = true) {
        try {
            const userProfile = Object.assign({}, user);
            if (userProfile.preferences && userProfile.preferences['dateOfBirth']) {
                userProfile.dateOfBirth = new Date(userProfile.preferences['dateOfBirth']);
                console.log(`Loaded dateOfBirth from preferences: ${userProfile.dateOfBirth}`);
            }
            else if (userProfile.birthYear) {
                userProfile.dateOfBirth = new Date(userProfile.birthYear, 0, 1);
                console.log(`Created dateOfBirth from birthYear: ${userProfile.dateOfBirth}`);
            }
            return userProfile;
        }
        catch (error) {
            logger_1.default.error('Error loading user profile', {
                error: error instanceof Error ? error.message : String(error),
                userId: user.id
            });
            return user;
        }
    }
}
exports.UserService = UserService;
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "getAll", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 50 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "getById", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 50 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "getByEmail", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 300 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "create", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "update", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 150 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, Boolean]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "batchGetByIds", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 100 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "getUserProgress", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 100 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "getUserActivity", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "getUserProfile", null);
//# sourceMappingURL=UserService.js.map