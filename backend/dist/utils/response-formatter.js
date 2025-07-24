"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatResponse = formatResponse;
exports.formatSuccessResponse = formatSuccessResponse;
exports.formatPaginatedResponse = formatPaginatedResponse;
exports.formatErrorResponseAndSend = formatErrorResponseAndSend;
exports.formatErrorResponseObject = formatErrorResponseObject;
exports.formatErrorResponse = formatErrorResponse;
exports.createPaginationMetadata = createPaginationMetadata;
function formatResponse(res, options, statusCode = 200) {
    const response = Object.assign({ success: true }, options);
    res.status(statusCode).json(response);
}
function formatSuccessResponse(data, message) {
    return Object.assign({ success: true, data }, (message && { message }));
}
function formatPaginatedResponse(data, total, page = 1, pageSize = 20) {
    return {
        success: true,
        data,
        metadata: createPaginationMetadata(total, page, pageSize)
    };
}
function formatErrorResponseAndSend(res, options, statusCode = 500) {
    const response = {
        success: false,
        error: Object.assign({}, options)
    };
    res.status(statusCode).json(response);
}
function formatErrorResponseObject(message, type, details) {
    return {
        success: false,
        error: Object.assign(Object.assign({ message }, (type && { type })), (details && { details }))
    };
}
function formatErrorResponse(message) {
    const errorMessage = message instanceof Error ? message.message : message;
    return {
        success: false,
        error: {
            message: errorMessage
        }
    };
}
function createPaginationMetadata(total, page = 1, pageSize = 20) {
    return {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total
    };
}
//# sourceMappingURL=response-formatter.js.map