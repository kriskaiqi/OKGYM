"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class MetricsService {
    trackMetric(name, value) {
        logger_1.default.debug(`Tracking metric: ${name} = ${value}`);
    }
    trackTiming(name, startTime) {
        const duration = Date.now() - startTime;
        logger_1.default.debug(`Timing for ${name}: ${duration}ms`);
        return duration;
    }
    incrementCounter(name) {
        logger_1.default.debug(`Incrementing counter: ${name}`);
    }
    recordError(name, error) {
        logger_1.default.error(`Error metric: ${name}`, error);
    }
}
exports.MetricsService = MetricsService;
//# sourceMappingURL=MetricsService.js.map