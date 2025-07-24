"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const formatValidationErrors = (errors) => {
    const formattedErrors = {};
    for (const error of errors) {
        const property = error.property;
        const messages = [];
        if (error.constraints) {
            messages.push(...Object.values(error.constraints));
        }
        if (error.children && error.children.length > 0) {
            const nestedErrors = formatValidationErrors(error.children);
            for (const [nestedProp, nestedMessages] of Object.entries(nestedErrors)) {
                const fullProp = `${property}.${nestedProp}`;
                formattedErrors[fullProp] = nestedMessages;
            }
        }
        if (messages.length > 0) {
            formattedErrors[property] = messages;
        }
    }
    return formattedErrors;
};
function validateRequest(dtoClass, source = 'body', options = {}) {
    return async (req, res, next) => {
        try {
            const data = req[source];
            const dtoObject = (0, class_transformer_1.plainToInstance)(dtoClass, data);
            const errors = await (0, class_validator_1.validate)(dtoObject, {
                skipMissingProperties: options.skipMissingProperties || false,
                whitelist: true,
                forbidNonWhitelisted: true
            });
            if (errors.length > 0) {
                const formattedErrors = formatValidationErrors(errors);
                logger_1.default.warn('Validation failed', {
                    path: req.path,
                    method: req.method,
                    errors: formattedErrors
                });
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Validation failed', 400, formattedErrors);
            }
            req[source] = dtoObject;
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=validation.js.map