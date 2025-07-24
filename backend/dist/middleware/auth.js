"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainerAndAbove = exports.adminOnly = exports.authorize = exports.authenticate = void 0;
const express = require('express');
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const Enums_1 = require("../models/shared/Enums");
const logger_1 = __importDefault(require("../utils/logger"));
const response_formatter_1 = require("../utils/response-formatter");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger_1.default.warn('Authentication failed: No token provided');
            return (0, response_formatter_1.formatErrorResponseAndSend)(res, { message: 'Authentication required' }, 401);
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;
        const jwtSecret = config_1.config.jwt.secret;
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            logger_1.default.warn('Authentication failed: Token expired');
            return (0, response_formatter_1.formatErrorResponseAndSend)(res, { message: 'Token expired' }, 401);
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            isAdmin: decoded.role === Enums_1.UserRole.ADMIN
        };
        logger_1.default.debug('User authenticated', { id: decoded.id, role: decoded.role });
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication error', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return (0, response_formatter_1.formatErrorResponseAndSend)(res, { message: 'Invalid token' }, 401);
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return (0, response_formatter_1.formatErrorResponseAndSend)(res, { message: 'Token expired' }, 401);
        }
        return (0, response_formatter_1.formatErrorResponseAndSend)(res, { message: 'Authentication error' }, 500);
    }
};
exports.authenticate = authenticate;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                logger_1.default.warn('Authorization failed: No authenticated user');
                return (0, response_formatter_1.formatErrorResponseAndSend)(res, { message: 'Authentication required' }, 401);
            }
            if (!allowedRoles.includes(req.user.role)) {
                logger_1.default.warn('Authorization failed: Insufficient privileges', {
                    id: req.user.id,
                    role: req.user.role,
                    requiredRoles: allowedRoles
                });
                return (0, response_formatter_1.formatErrorResponseAndSend)(res, { message: 'Insufficient privileges' }, 403);
            }
            logger_1.default.debug('User authorized', {
                id: req.user.id,
                role: req.user.role
            });
            next();
        }
        catch (error) {
            logger_1.default.error('Authorization error', error);
            return (0, response_formatter_1.formatErrorResponseAndSend)(res, { message: 'Authorization error' }, 500);
        }
    };
};
exports.authorize = authorize;
const adminOnly = (req, res, next) => {
    (0, exports.authorize)([Enums_1.UserRole.ADMIN])(req, res, next);
};
exports.adminOnly = adminOnly;
const trainerAndAbove = (req, res, next) => {
    (0, exports.authorize)([Enums_1.UserRole.ADMIN, Enums_1.UserRole.TRAINER])(req, res, next);
};
exports.trainerAndAbove = trainerAndAbove;
//# sourceMappingURL=auth.js.map