"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const services_1 = require("../services");
const errors_1 = require("../utils/errors");
const response_formatter_1 = require("../utils/response-formatter");
const UserDto_1 = require("../dto/UserDto");
const logger_1 = __importDefault(require("../utils/logger"));
const repositories_1 = require("../repositories");
class UserController {
    async getUsers(req, res, next) {
        var _a, _b;
        try {
            const currentUserId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || '';
            const isAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.isAdmin) || false;
            if (!isAdmin) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Only administrators can list users', 403);
            }
            const rawFilters = req.query;
            const filterDto = UserDto_1.UserFilterDto.formatQueryParams(rawFilters);
            logger_1.default.debug('User filter request received', {
                userId: currentUserId,
                filters: Object.assign(Object.assign({}, filterDto), { searchTerm: filterDto.searchTerm ? `${filterDto.searchTerm.substring(0, 3)}...` : undefined })
            });
            if (!filterDto.limit)
                filterDto.limit = 20;
            if (filterDto.offset === undefined)
                filterDto.offset = 0;
            if (filterDto.limit > 100) {
                filterDto.limit = 100;
            }
            const startTime = Date.now();
            const [users, total] = await services_1.services.user.getAll(filterDto, currentUserId, isAdmin);
            const duration = Date.now() - startTime;
            if (duration > 1000) {
                logger_1.default.warn('Slow user filter query detected', {
                    duration,
                    filters: filterDto,
                    resultCount: users.length,
                    totalCount: total
                });
            }
            const metadata = {
                limit: filterDto.limit,
                offset: filterDto.offset || 0,
                totalItems: total,
                totalPages: Math.ceil(total / filterDto.limit),
                page: Math.floor(filterDto.offset / filterDto.limit) + 1
            };
            (0, response_formatter_1.formatResponse)(res, {
                data: users,
                metadata,
                message: users.length > 0
                    ? `Successfully retrieved ${users.length} users`
                    : 'No users found matching the criteria'
            });
        }
        catch (error) {
            logger_1.default.error('Error in getUsers controller', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            next(error);
        }
    }
    async getUserById(req, res, next) {
        var _a, _b;
        try {
            const userId = req.params.id;
            const currentUserId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || '';
            const isAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.isAdmin) || false;
            const user = await services_1.services.user.getById(userId, currentUserId, isAdmin);
            (0, response_formatter_1.formatResponse)(res, { data: user });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        var _a;
        try {
            console.log('\n\n');
            console.log('🚨🚨🚨 PROFILE REQUEST RECEIVED 🚨🚨🚨');
            console.log('Time:', new Date().toISOString());
            console.log('Query params:', req.query);
            console.log('Method:', req.method);
            console.log('Headers:', JSON.stringify({
                'cache-control': req.headers['cache-control'],
                'pragma': req.headers['pragma'],
                'accept': req.headers['accept'],
                'user-agent': req.headers['user-agent']
            }, null, 2));
            const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!currentUserId) {
                console.log('❌ User not authenticated');
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            console.log(`🔍 Getting profile for user: ${currentUserId}`);
            const profile = await services_1.services.user.getUserProfile(currentUserId);
            console.log('✅ Profile data retrieved successfully:', JSON.stringify({
                user: profile.user ? { id: profile.user.id, email: profile.user.email } : null,
                stats: profile.stats ? { totalWorkouts: profile.stats.totalWorkouts } : null,
                relationships: {
                    fitnessGoals: Array.isArray(profile.fitnessGoals) ? profile.fitnessGoals.length : 0,
                    bodyMetrics: Array.isArray(profile.bodyMetrics) ? profile.bodyMetrics.length : 0,
                    favoriteWorkouts: Array.isArray(profile.favoriteWorkouts) ? profile.favoriteWorkouts.length : 0,
                    recentActivities: Array.isArray(profile.recentActivities) ? profile.recentActivities.length : 0,
                    achievements: Array.isArray(profile.achievements) ? profile.achievements.length : 0,
                }
            }, null, 2));
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Surrogate-Control', 'no-store');
            res.setHeader('Vary', '*');
            res.setHeader('Age', '0');
            console.log('✅ No-cache headers set');
            (0, response_formatter_1.formatResponse)(res, { data: profile });
            console.log('✅ Response sent');
            console.log('\n\n');
        }
        catch (error) {
            console.log('❌ Error in getProfile:', error);
            next(error);
        }
    }
    async createUser(req, res, next) {
        try {
            const userDto = req.body;
            const createdUser = await services_1.services.user.create(userDto);
            (0, response_formatter_1.formatResponse)(res, {
                data: createdUser,
                message: 'User created successfully'
            }, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        var _a, _b;
        try {
            const userId = req.params.id;
            const currentUserId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || '';
            const isAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.isAdmin) || false;
            const userDto = req.body;
            const updatedUser = await services_1.services.user.update(userId, userDto, currentUserId, isAdmin);
            (0, response_formatter_1.formatResponse)(res, {
                data: updatedUser,
                message: 'User updated successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        var _a;
        try {
            const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!currentUserId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const userDto = req.body;
            const updatedUser = await services_1.services.user.update(currentUserId, userDto, currentUserId, false);
            (0, response_formatter_1.formatResponse)(res, {
                data: updatedUser,
                message: 'Profile updated successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateFitnessProfile(req, res, next) {
        var _a, _b, _c;
        try {
            const userId = req.params.id || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            const currentUserId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || '';
            const isAdmin = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.isAdmin) || false;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'User ID is required', 400);
            }
            const fitnessProfileDto = req.body;
            const updatedUser = await services_1.services.user.updateFitnessProfile(userId, fitnessProfileDto, currentUserId, isAdmin);
            (0, response_formatter_1.formatResponse)(res, {
                data: updatedUser,
                message: 'Fitness profile updated successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updatePreferences(req, res, next) {
        var _a, _b, _c;
        try {
            const userId = req.params.id || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            const currentUserId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || '';
            const isAdmin = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.isAdmin) || false;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'User ID is required', 400);
            }
            const preferencesDto = req.body;
            const updatedUser = await services_1.services.user.updatePreferences(userId, preferencesDto, currentUserId, isAdmin);
            (0, response_formatter_1.formatResponse)(res, {
                data: updatedUser,
                message: 'Preferences updated successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateStats(req, res, next) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const statsDto = req.body;
            logger_1.default.info(`Updating user stats for ${userId}`, {
                stats: Object.keys(statsDto)
            });
            const user = await services_1.services.user.getById(userId, userId, false);
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'User not found', 404);
            }
            const currentStats = user.stats || {};
            const updatedStats = Object.assign(Object.assign({}, currentStats), statsDto);
            if (currentStats.startingWeight !== undefined && statsDto.startingWeight !== undefined) {
                updatedStats.startingWeight = currentStats.startingWeight;
                logger_1.default.info(`Protected startingWeight from being overwritten: original=${currentStats.startingWeight}, attempted=${statsDto.startingWeight}`);
            }
            if (statsDto.weightHistory) {
                if (!currentStats.weightHistory) {
                    currentStats.weightHistory = [];
                }
                if (Array.isArray(statsDto.weightHistory)) {
                    const processedEntries = statsDto.weightHistory.map((entry) => ({
                        weight: entry.weight,
                        date: entry.date instanceof Date ? entry.date : new Date(entry.date)
                    }));
                    updatedStats.weightHistory = [
                        ...currentStats.weightHistory,
                        ...processedEntries
                    ];
                }
                else {
                    const entry = statsDto.weightHistory;
                    updatedStats.weightHistory = [
                        ...currentStats.weightHistory,
                        {
                            weight: entry.weight,
                            date: entry.date instanceof Date ? entry.date : new Date(entry.date)
                        }
                    ];
                }
            }
            const updatedUser = await services_1.services.user.update(userId, { stats: updatedStats }, userId, false);
            (0, response_formatter_1.formatResponse)(res, {
                data: updatedUser,
                message: 'Stats updated successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error updating user stats', error);
            next(error);
        }
    }
    async changePassword(req, res, next) {
        var _a, _b, _c;
        try {
            const userId = req.params.id || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            const currentUserId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || '';
            const isAdmin = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.isAdmin) || false;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'User ID is required', 400);
            }
            const { currentPassword, newPassword } = req.body;
            await services_1.services.user.changePassword(userId, currentPassword, newPassword, currentUserId, isAdmin);
            (0, response_formatter_1.formatResponse)(res, {
                message: 'Password changed successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        var _a, _b;
        try {
            const userId = req.params.id;
            const currentUserId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || '';
            const isAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.isAdmin) || false;
            await services_1.services.user.delete(userId, currentUserId, isAdmin);
            (0, response_formatter_1.formatResponse)(res, {
                message: 'User deleted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async checkEmailAvailability(req, res, next) {
        try {
            const email = req.query.email;
            if (!email) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Email is required', 400);
            }
            const isAvailable = await services_1.services.user.isEmailAvailable(email);
            (0, response_formatter_1.formatResponse)(res, {
                data: { available: isAvailable }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserProgress(req, res, next) {
        var _a;
        try {
            const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!currentUserId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const progressData = await services_1.services.user.getUserProgress(currentUserId);
            (0, response_formatter_1.formatResponse)(res, {
                data: progressData,
                message: 'User progress retrieved successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error in getUserProgress controller', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            next(error);
        }
    }
    async getUserActivity(req, res, next) {
        var _a;
        try {
            const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!currentUserId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const activityData = await services_1.services.user.getUserActivity(currentUserId, limit);
            (0, response_formatter_1.formatResponse)(res, {
                data: activityData,
                message: 'User activity retrieved successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error in getUserActivity controller', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            next(error);
        }
    }
    async cleanupPreferences(req, res, next) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
            }
            const { removeFields } = req.body;
            if (!Array.isArray(removeFields)) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'removeFields must be an array', 400);
            }
            const user = await repositories_1.repositories.user.findById(userId);
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `User with ID ${userId} not found`, 404);
            }
            if (!user.preferences) {
                (0, response_formatter_1.formatResponse)(res, {
                    message: 'No preferences to cleanup'
                });
                return;
            }
            const updatedPreferences = Object.assign({}, user.preferences);
            let changesCount = 0;
            for (const field of removeFields) {
                if (updatedPreferences[field] !== undefined) {
                    delete updatedPreferences[field];
                    changesCount++;
                }
            }
            if (changesCount > 0) {
                await repositories_1.repositories.user.update(userId, {
                    preferences: updatedPreferences
                });
                logger_1.default.info('Updated user preferences via cleanup', {
                    userId,
                    removedFields: removeFields.filter(field => updatedPreferences[field] === undefined)
                });
            }
            (0, response_formatter_1.formatResponse)(res, {
                message: `Preferences cleaned up (${changesCount} fields removed)`
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map