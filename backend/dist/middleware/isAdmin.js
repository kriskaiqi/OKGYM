"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const errors_1 = require("../utils/errors");
const Enums_1 = require("../models/shared/Enums");
const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.AppError(errors_1.ErrorType.AUTHENTICATION_ERROR, 'User not authenticated', 401);
        }
        if (req.user.role !== Enums_1.UserRole.ADMIN) {
            throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Admin privileges required', 403);
        }
        return next();
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Authorization error'
        });
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=isAdmin.js.map