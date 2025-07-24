"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdConverter = void 0;
const class_validator_1 = require("class-validator");
const logger_1 = __importDefault(require("./logger"));
class IdConverter {
    static convertId(id) {
        if (typeof id === 'number') {
            return id;
        }
        if (typeof id === 'string') {
            if ((0, class_validator_1.isUUID)(id)) {
                return id;
            }
            if (/^\d+$/.test(id)) {
                try {
                    const numericId = parseInt(id, 10);
                    if (Number.isSafeInteger(numericId)) {
                        return numericId;
                    }
                }
                catch (error) {
                    logger_1.default.warn(`Failed to parse numeric ID string: ${id}`);
                }
            }
        }
        return id;
    }
    static idMatches(sourceId, targetId) {
        if (sourceId === targetId) {
            return true;
        }
        if (String(sourceId) === String(targetId)) {
            return true;
        }
        const sourceAsNumber = typeof sourceId === 'string' ? parseInt(sourceId, 10) : sourceId;
        const targetAsNumber = typeof targetId === 'string' ? parseInt(targetId, 10) : targetId;
        if (!isNaN(sourceAsNumber) && !isNaN(targetAsNumber)) {
            return sourceAsNumber === targetAsNumber;
        }
        return false;
    }
}
exports.IdConverter = IdConverter;
//# sourceMappingURL=idConverter.js.map