"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = require("../config");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'Invalid token format', 401);
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
            req.user = decoded;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errors_1.AppError(errors_1.ErrorType.TOKEN_EXPIRED, 'Token expired', 401);
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errors_1.AppError(errors_1.ErrorType.INVALID_TOKEN, 'Invalid token', 401);
            }
            else {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'Token verification failed', 401);
            }
        }
    }
    catch (error) {
        logger_1.default.warn('Authentication failed', { error });
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        var _a, _b;
        try {
            if (!req.user) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'Not authenticated', 401);
            }
            if (!roles.includes(req.user.role)) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Not authorized to access this resource', 403);
            }
            next();
        }
        catch (error) {
            logger_1.default.warn('Authorization failed', {
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                requiredRoles: roles,
                userRole: (_b = req.user) === null || _b === void 0 ? void 0 : _b.role
            });
            next(error);
        }
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=authMiddleware.js.map