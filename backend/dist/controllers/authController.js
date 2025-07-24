"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const response_formatter_1 = require("../utils/response-formatter");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = async (req, res) => {
            try {
                logger_1.default.info('User registration request received');
                const { email, password, firstName, lastName, fitnessProfile } = req.body;
                if (!email || !password || !firstName || !lastName) {
                    res.status(400).json((0, response_formatter_1.formatErrorResponse)('Missing required fields'));
                    return;
                }
                const result = await this.authService.register({
                    email,
                    password,
                    firstName,
                    lastName,
                    fitnessProfile
                });
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/api/auth/refresh'
                });
                res.status(201).json((0, response_formatter_1.formatSuccessResponse)({
                    user: result.user,
                    token: result.token
                }, 'User registered successfully'));
            }
            catch (error) {
                logger_1.default.error('Registration error', error);
                if (error instanceof errors_1.AppError) {
                    res.status(error.statusCode || 400).json((0, response_formatter_1.formatErrorResponse)(error.message));
                    return;
                }
                res.status(500).json((0, response_formatter_1.formatErrorResponse)('Registration failed'));
            }
        };
        this.login = async (req, res) => {
            try {
                logger_1.default.info('Login request received');
                const { email, password } = req.body;
                if (!email || !password) {
                    res.status(400).json((0, response_formatter_1.formatErrorResponse)('Email and password are required'));
                    return;
                }
                const result = await this.authService.login({ email, password });
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/api/auth/refresh'
                });
                res.status(200).json((0, response_formatter_1.formatSuccessResponse)({
                    user: result.user,
                    token: result.token
                }, 'Login successful'));
            }
            catch (error) {
                logger_1.default.error('Login error', error);
                if (error instanceof errors_1.AppError) {
                    res.status(error.statusCode || 401).json((0, response_formatter_1.formatErrorResponse)(error.message));
                    return;
                }
                res.status(500).json((0, response_formatter_1.formatErrorResponse)('Login failed'));
            }
        };
        this.refreshToken = async (req, res) => {
            try {
                logger_1.default.info('Token refresh request received');
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    res.status(401).json((0, response_formatter_1.formatErrorResponse)('Refresh token required'));
                    return;
                }
                const result = await this.authService.refreshToken({ refreshToken });
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/api/auth/refresh'
                });
                res.status(200).json((0, response_formatter_1.formatSuccessResponse)({
                    token: result.token
                }, 'Token refreshed successfully'));
            }
            catch (error) {
                logger_1.default.error('Token refresh error', error);
                if (error instanceof errors_1.AppError) {
                    res.status(error.statusCode || 401).json((0, response_formatter_1.formatErrorResponse)(error.message));
                    return;
                }
                res.status(500).json((0, response_formatter_1.formatErrorResponse)('Token refresh failed'));
            }
        };
        this.logout = async (req, res) => {
            var _a;
            try {
                logger_1.default.info('Logout request received');
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const refreshToken = req.cookies.refreshToken;
                if (!userId || !refreshToken) {
                    res.status(400).json((0, response_formatter_1.formatErrorResponse)('User ID and refresh token required'));
                    return;
                }
                await this.authService.logout(userId, refreshToken);
                res.clearCookie('refreshToken', {
                    path: '/api/auth/refresh'
                });
                res.status(200).json((0, response_formatter_1.formatSuccessResponse)(null, 'Logout successful'));
            }
            catch (error) {
                logger_1.default.error('Logout error', error);
                if (error instanceof errors_1.AppError) {
                    res.status(error.statusCode || 500).json((0, response_formatter_1.formatErrorResponse)(error.message));
                    return;
                }
                res.status(500).json((0, response_formatter_1.formatErrorResponse)('Logout failed'));
            }
        };
        this.getProfile = async (req, res) => {
            var _a;
            try {
                logger_1.default.info('Get profile request received');
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json((0, response_formatter_1.formatErrorResponse)('Authentication required'));
                    return;
                }
                const user = await this.authService.getUserById(userId);
                if (!user) {
                    res.status(404).json((0, response_formatter_1.formatErrorResponse)('User not found'));
                    return;
                }
                res.status(200).json((0, response_formatter_1.formatSuccessResponse)({ user }, 'Profile retrieved successfully'));
            }
            catch (error) {
                logger_1.default.error('Get profile error', error);
                if (error instanceof errors_1.AppError) {
                    res.status(error.statusCode || 500).json((0, response_formatter_1.formatErrorResponse)(error.message));
                    return;
                }
                res.status(500).json((0, response_formatter_1.formatErrorResponse)('Failed to retrieve profile'));
            }
        };
        this.updateFitnessProfile = async (req, res) => {
            var _a;
            try {
                logger_1.default.info('Update fitness profile request received');
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json((0, response_formatter_1.formatErrorResponse)('Authentication required'));
                    return;
                }
                const updatedUser = await this.authService.updateFitnessProfile(userId, req.body);
                res.status(200).json((0, response_formatter_1.formatSuccessResponse)({ user: updatedUser }, 'Fitness profile updated successfully'));
            }
            catch (error) {
                logger_1.default.error('Update fitness profile error', error);
                if (error instanceof errors_1.AppError) {
                    res.status(error.statusCode || 500).json((0, response_formatter_1.formatErrorResponse)(error.message));
                    return;
                }
                res.status(500).json((0, response_formatter_1.formatErrorResponse)('Failed to update fitness profile'));
            }
        };
        this.getUserProfile = async (req, res) => {
            try {
                logger_1.default.info('Get user profile by ID request received');
                const userId = req.params.id;
                if (!userId) {
                    res.status(400).json((0, response_formatter_1.formatErrorResponse)('User ID is required'));
                    return;
                }
                const user = await this.authService.getUserById(userId);
                if (!user) {
                    res.status(404).json((0, response_formatter_1.formatErrorResponse)('User not found'));
                    return;
                }
                res.status(200).json((0, response_formatter_1.formatSuccessResponse)({ user }, 'Profile retrieved successfully'));
            }
            catch (error) {
                logger_1.default.error('Get user profile error', error);
                if (error instanceof errors_1.AppError) {
                    res.status(error.statusCode || 500).json((0, response_formatter_1.formatErrorResponse)(error.message));
                    return;
                }
                res.status(500).json((0, response_formatter_1.formatErrorResponse)('Failed to retrieve profile'));
            }
        };
        this.getAllUsers = async (req, res) => {
            try {
                logger_1.default.info('Get all users request received');
                const users = await this.authService.getAllUsers();
                res.status(200).json((0, response_formatter_1.formatSuccessResponse)({ users }, 'Users retrieved successfully'));
            }
            catch (error) {
                logger_1.default.error('Get all users error', error);
                if (error instanceof errors_1.AppError) {
                    res.status(error.statusCode || 500).json((0, response_formatter_1.formatErrorResponse)(error.message));
                    return;
                }
                res.status(500).json((0, response_formatter_1.formatErrorResponse)('Failed to retrieve users'));
            }
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map