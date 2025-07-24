"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.ErrorType = void 0;
exports.normalizeError = normalizeError;
exports.extractDatabaseErrorDetails = extractDatabaseErrorDetails;
var ErrorType;
(function (ErrorType) {
    ErrorType["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ErrorType["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    ErrorType["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorType["INVALID_TOKEN"] = "INVALID_TOKEN";
    ErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorType["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorType["INVALID_REQUEST"] = "INVALID_REQUEST";
    ErrorType["NOT_FOUND"] = "NOT_FOUND";
    ErrorType["ALREADY_EXISTS"] = "ALREADY_EXISTS";
    ErrorType["CONFLICT"] = "CONFLICT";
    ErrorType["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorType["TRANSACTION_ERROR"] = "TRANSACTION_ERROR";
    ErrorType["SERVICE_ERROR"] = "SERVICE_ERROR";
    ErrorType["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorType["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorType["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorType["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    ErrorType["BUSINESS_RULE_VIOLATION"] = "BUSINESS_RULE_VIOLATION";
    ErrorType["OPERATION_NOT_ALLOWED"] = "OPERATION_NOT_ALLOWED";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
class AppError extends Error {
    constructor(type, message, statusCode = 500, details) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            error: Object.assign({ type: this.type, message: this.message }, (this.details ? { details: this.details } : {}))
        };
    }
    toObject() {
        return {
            name: this.name,
            type: this.type,
            statusCode: this.statusCode,
            message: this.message,
            details: this.details,
            stack: this.stack
        };
    }
    static authentication(message = 'Authentication failed', details) {
        return new AppError(ErrorType.AUTHENTICATION_ERROR, message, 401, details);
    }
    static authorization(message = 'You do not have permission to perform this action', details) {
        return new AppError(ErrorType.AUTHORIZATION_ERROR, message, 403, details);
    }
    static notFound(message = 'Resource not found', details) {
        return new AppError(ErrorType.NOT_FOUND, message, 404, details);
    }
    static validation(message = 'Validation failed', details) {
        return new AppError(ErrorType.VALIDATION_ERROR, message, 400, details);
    }
    static conflict(message = 'Resource already exists', details) {
        return new AppError(ErrorType.CONFLICT, message, 409, details);
    }
    static database(message = 'Database operation failed', details) {
        return new AppError(ErrorType.DATABASE_ERROR, message, 500, details);
    }
    static businessRule(message, details) {
        return new AppError(ErrorType.BUSINESS_RULE_VIOLATION, message, 422, details);
    }
}
exports.AppError = AppError;
function normalizeError(error, defaultMessage = 'An unexpected error occurred') {
    if (error instanceof AppError) {
        return error;
    }
    if (error instanceof Error) {
        return new AppError(ErrorType.INTERNAL_ERROR, error.message || defaultMessage, 500, { originalError: error.name, stack: error.stack });
    }
    return new AppError(ErrorType.INTERNAL_ERROR, typeof error === 'string' ? error : defaultMessage, 500, { originalError: error });
}
function extractDatabaseErrorDetails(error) {
    const details = {
        originalError: error.name || 'DatabaseError'
    };
    if (error.code === '23505') {
        details.constraint = error.constraint;
        details.type = 'UniqueViolation';
        details.message = 'A record with this data already exists';
    }
    if (error.code === '23503') {
        details.constraint = error.constraint;
        details.type = 'ForeignKeyViolation';
        details.message = 'Referenced record does not exist';
    }
    return details;
}
//# sourceMappingURL=errors.js.map