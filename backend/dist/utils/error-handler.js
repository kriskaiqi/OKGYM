"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApiError = void 0;
const errors_1 = require("./errors");
const logger_1 = __importDefault(require("./logger"));
const handleApiError = (error, req, res) => {
    var _a;
    const requestInfo = {
        path: req.path,
        method: req.method,
        query: req.query,
        ip: req.ip,
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
    };
    if (error instanceof errors_1.AppError) {
        if (error.statusCode >= 500) {
            logger_1.default.error(`API Error: ${error.message}`, {
                type: error.type,
                requestInfo,
                details: error.details,
                stack: error.stack
            });
        }
        else {
            logger_1.default.warn(`API Error: ${error.message}`, {
                type: error.type,
                requestInfo,
                details: error.details
            });
        }
        return res.status(error.statusCode).json({
            success: false,
            error: Object.assign({ type: error.type, message: error.message }, (process.env.NODE_ENV !== 'production' && { details: error.details }))
        });
    }
    if ((error === null || error === void 0 ? void 0 : error.name) === 'ValidationError' || (error === null || error === void 0 ? void 0 : error.name) === 'BadRequestError') {
        const details = error.errors || error.constraints || error.children || error.message;
        logger_1.default.warn(`Validation Error in API request`, {
            requestInfo,
            details
        });
        return res.status(400).json({
            success: false,
            error: {
                type: errors_1.ErrorType.VALIDATION_ERROR,
                message: 'Validation failed',
                details: process.env.NODE_ENV !== 'production' ? details : undefined
            }
        });
    }
    logger_1.default.error(`Unexpected Error in API request`, {
        error: error.message || String(error),
        requestInfo,
        stack: error.stack
    });
    const errorMessage = process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message || String(error);
    return res.status(500).json({
        success: false,
        error: Object.assign({ type: errors_1.ErrorType.INTERNAL_SERVER_ERROR, message: errorMessage }, (process.env.NODE_ENV !== 'production' && { stack: error.stack }))
    });
};
exports.handleApiError = handleApiError;
//# sourceMappingURL=error-handler.js.map