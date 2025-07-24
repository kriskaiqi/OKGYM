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
exports.AuthService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errors_1 = require("../utils/errors");
const performance_1 = require("../utils/performance");
const Enums_1 = require("../models/shared/Enums");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const performance_2 = require("../utils/performance");
const metricsTracker = performance_2.SimplePerformanceTracker.getInstance();
class AuthService {
    constructor(userRepository, cacheManager, metricsService) {
        var _a, _b, _c, _d, _e;
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
        this.metricsService = metricsService;
        this.tokenExpiration = ((_a = config_1.config.jwt) === null || _a === void 0 ? void 0 : _a.expiresIn) || '1h';
        this.refreshTokenExpiration = ((_b = config_1.config.jwt) === null || _b === void 0 ? void 0 : _b.refreshExpiresIn) || '7d';
        this.jwtSecret = ((_c = config_1.config.jwt) === null || _c === void 0 ? void 0 : _c.secret) || 'developmentsecret';
        this.cacheTTL = typeof ((_d = config_1.config.cache) === null || _d === void 0 ? void 0 : _d.ttl) === 'object'
            ? config_1.config.cache.ttl.user || 3600
            : ((_e = config_1.config.cache) === null || _e === void 0 ? void 0 : _e.ttl) || 3600;
    }
    async initializeAdmin() {
        logger_1.default.info('Admin user initialization skipped - using seed system instead');
    }
    async register(data) {
        return await metricsTracker.trackAsync('authService_register', 500, async () => {
            logger_1.default.info(`Registering user: ${data.email}`);
            const existingUser = await this.userRepository.findOne({
                where: { email: data.email }
            });
            if (existingUser) {
                throw new errors_1.AppError(errors_1.ErrorType.CONFLICT, 'User already exists', 409);
            }
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            const user = new User_1.User();
            user.email = data.email;
            user.password = hashedPassword;
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            user.userRole = Enums_1.UserRole.USER;
            const savedUser = await this.userRepository.save(user);
            const token = this.generateToken(savedUser);
            const refreshToken = this.generateRefreshToken();
            await this.storeRefreshToken(savedUser.id, refreshToken);
            logger_1.default.info('User registered successfully', { email: data.email });
            const userDto = this.mapUserToDTO(savedUser);
            if (!userDto) {
                throw new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to create user', 500);
            }
            return {
                user: userDto,
                token,
                refreshToken
            };
        });
    }
    async updateFitnessProfile(userId, data) {
        logger_1.default.info('Updating fitness profile for user:', { userId });
        return await metricsTracker.trackAsync('authService_updateFitnessProfile', 500, async () => {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'User not found', 404);
            }
            if (data.mainGoal) {
                user.mainGoal = data.mainGoal;
            }
            if (data.fitnessLevel) {
                user.fitnessLevel = data.fitnessLevel;
            }
            if (data.activityLevel) {
                user.activityLevel = data.activityLevel;
            }
            if (data.gender) {
                user.gender = data.gender;
            }
            if (data.height) {
                user.height = data.height;
            }
            if (data.birthYear) {
                user.birthYear = data.birthYear;
            }
            if (data.preferences) {
                if (!user.preferences) {
                    user.preferences = {};
                }
                user.preferences = Object.assign(Object.assign({}, user.preferences), data.preferences);
            }
            const updatedUser = await this.userRepository.save(user);
            const cacheKey = `user:${user.id}`;
            await this.cacheManager.delete(cacheKey);
            logger_1.default.info('Fitness profile updated successfully', { userId: user.id });
            const userDto = this.mapUserToDTO(updatedUser);
            if (!userDto) {
                throw new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to update user profile', 500);
            }
            return userDto;
        });
    }
    async login(data) {
        return await metricsTracker.trackAsync('authService_login', 500, async () => {
            logger_1.default.info(`Login attempt for user: ${data.email}`);
            const user = await this.userRepository.findOne({
                where: { email: data.email }
            });
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'Invalid credentials', 401);
            }
            const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
            if (!isPasswordValid) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'Invalid credentials', 401);
            }
            const token = this.generateToken(user);
            const refreshToken = this.generateRefreshToken();
            await this.storeRefreshToken(user.id, refreshToken);
            const userDto = this.mapUserToDTO(user);
            if (!userDto) {
                throw new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to get user data', 500);
            }
            return {
                user: userDto,
                token,
                refreshToken
            };
        });
    }
    async refreshToken(data) {
        return await metricsTracker.trackAsync('authService_refreshToken', 500, async () => {
            logger_1.default.info('Token refresh requested');
            const userId = await this.isRefreshTokenValid(data.refreshToken);
            if (!userId) {
                throw new errors_1.AppError(errors_1.ErrorType.INVALID_TOKEN, 'Invalid refresh token', 401);
            }
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'User not found', 404);
            }
            const newToken = this.generateToken(user);
            const newRefreshToken = this.generateRefreshToken();
            await this.invalidateRefreshToken(userId, data.refreshToken);
            await this.storeRefreshToken(userId, newRefreshToken);
            return {
                token: newToken,
                refreshToken: newRefreshToken
            };
        });
    }
    async logout(userId, refreshToken) {
        await metricsTracker.trackAsync('authService_logout', 500, async () => {
            logger_1.default.info(`Logout for user: ${userId}`);
            await this.invalidateRefreshToken(userId, refreshToken);
        });
    }
    async getUserById(userId) {
        return await metricsTracker.trackAsync('authService_getUserById', 500, async () => {
            logger_1.default.info(`Getting user by ID: ${userId}`);
            const cacheKey = `user:${userId}`;
            const cachedUser = await this.cacheManager.get(cacheKey);
            if (cachedUser) {
                logger_1.default.debug(`User ${userId} found in cache`);
                return this.mapUserToDTO(cachedUser);
            }
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return null;
            }
            await this.cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
            return this.mapUserToDTO(user);
        });
    }
    async getAllUsers() {
        return await metricsTracker.trackAsync('authService_getAllUsers', 500, async () => {
            logger_1.default.info('Getting all users');
            const cacheKey = 'all:users';
            const cachedUsers = await this.cacheManager.get(cacheKey);
            if (cachedUsers && Array.isArray(cachedUsers)) {
                logger_1.default.debug('All users found in cache');
                return cachedUsers.map((user) => this.mapUserToDTO(user)).filter(Boolean);
            }
            const users = await this.userRepository.find();
            await this.cacheManager.set(cacheKey, users, { ttl: this.cacheTTL });
            return users.map((user) => this.mapUserToDTO(user)).filter(Boolean);
        });
    }
    async isRefreshTokenValid(refreshToken) {
        const cacheKey = `refresh_token:${refreshToken}`;
        const userId = await this.cacheManager.get(cacheKey);
        return userId || null;
    }
    async storeRefreshToken(userId, refreshToken) {
        const tokenKey = `refresh_token:${refreshToken}`;
        const userTokensKey = `user_tokens:${userId}`;
        try {
            await this.cacheManager.set(tokenKey, userId, { ttl: this.cacheTTL });
            const userTokens = await this.cacheManager.get(userTokensKey) || [];
            const tokens = Array.isArray(userTokens) ? userTokens : [];
            tokens.push(refreshToken);
            await this.cacheManager.set(userTokensKey, tokens, { ttl: this.cacheTTL });
        }
        catch (error) {
            logger_1.default.error(`Failed to store refresh token for user: ${userId}`, error);
            throw new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to complete authentication', 500);
        }
    }
    async invalidateRefreshToken(userId, refreshToken) {
        const tokenKey = `refresh_token:${refreshToken}`;
        const userTokensKey = `user_tokens:${userId}`;
        try {
            await this.cacheManager.delete(tokenKey);
            const userTokens = await this.cacheManager.get(userTokensKey) || [];
            const tokens = Array.isArray(userTokens) ? userTokens : [];
            const updatedTokens = tokens.filter((token) => token !== refreshToken);
            await this.cacheManager.set(userTokensKey, updatedTokens, { ttl: this.cacheTTL });
        }
        catch (error) {
            logger_1.default.error(`Failed to invalidate refresh token for user: ${userId}`, error);
            throw new errors_1.AppError(errors_1.ErrorType.INTERNAL_ERROR, 'Failed to complete logout', 500);
        }
    }
    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.userRole
        };
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, { expiresIn: this.tokenExpiration });
    }
    generateRefreshToken() {
        return crypto_1.default.randomBytes(40).toString('hex');
    }
    mapUserToDTO(user) {
        if (!user)
            return null;
        if (Array.isArray(user)) {
            return user.map(u => {
                const { password } = u, userDTO = __rest(u, ["password"]);
                return userDTO;
            })[0];
        }
        const { password } = user, userDTO = __rest(user, ["password"]);
        return userDTO;
    }
}
exports.AuthService = AuthService;
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "initializeAdmin", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "register", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "updateFitnessProfile", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "login", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "refreshToken", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "logout", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "getUserById", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "getAllUsers", null);
//# sourceMappingURL=authService.js.map