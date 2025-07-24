"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const validateRequest = (dtoClass, source = 'body') => {
    return async (req, res, next) => {
        const data = source === 'body' ? req.body : req.query;
        const dtoObject = (0, class_transformer_1.plainToClass)(dtoClass, data);
        const errors = await (0, class_validator_1.validate)(dtoObject);
        if (errors.length > 0) {
            const errorMessages = errors.map(error => ({
                property: error.property,
                constraints: error.constraints
            }));
            return res.status(400).json({
                message: 'Validation failed',
                errors: errorMessages
            });
        }
        if (source === 'body') {
            req.body = dtoObject;
        }
        else {
            req.query = dtoObject;
        }
        next();
        return;
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map