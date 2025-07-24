"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplePerformance = exports.SimplePerformanceTracker = void 0;
exports.SimpleTrack = SimpleTrack;
const logger_1 = __importDefault(require("./logger"));
class SimplePerformanceTracker {
    static getInstance() {
        if (!SimplePerformanceTracker.instance) {
            SimplePerformanceTracker.instance = new SimplePerformanceTracker();
        }
        return SimplePerformanceTracker.instance;
    }
    constructor() {
        this.slowOperations = {};
        this.successCounts = {};
        this.failureCounts = {};
        setInterval(() => this.logSlowOperationsSummary(), 60 * 60 * 1000);
    }
    async trackAsync(operationName, slowThreshold, fn) {
        const start = Date.now();
        try {
            const result = await fn();
            this.successCounts[operationName] = (this.successCounts[operationName] || 0) + 1;
            return result;
        }
        catch (error) {
            this.failureCounts[operationName] = (this.failureCounts[operationName] || 0) + 1;
            throw error;
        }
        finally {
            const duration = Date.now() - start;
            if (duration >= slowThreshold) {
                this.trackSlowOperation(operationName, duration);
                logger_1.default.warn(`Slow operation: ${operationName} took ${duration}ms`);
            }
        }
    }
    trackSlowOperation(operation, duration) {
        if (!this.slowOperations[operation]) {
            this.slowOperations[operation] = {
                count: 0,
                avgDuration: 0,
                lastOccurrence: new Date()
            };
        }
        const stats = this.slowOperations[operation];
        const newCount = stats.count + 1;
        stats.avgDuration = (stats.avgDuration * stats.count + duration) / newCount;
        stats.count = newCount;
        stats.lastOccurrence = new Date();
    }
    getBasicReport() {
        const report = {
            slowOperations: {},
            errorRates: {}
        };
        Object.keys(this.slowOperations).forEach(op => {
            report.slowOperations[op] = {
                count: this.slowOperations[op].count,
                avgDuration: Math.round(this.slowOperations[op].avgDuration),
                lastOccurrence: this.slowOperations[op].lastOccurrence
            };
        });
        Object.keys(this.successCounts).forEach(op => {
            const successCount = this.successCounts[op] || 0;
            const failureCount = this.failureCounts[op] || 0;
            const total = successCount + failureCount;
            if (total > 0) {
                const errorRate = Math.round((failureCount / total) * 100);
                if (errorRate > 0) {
                    report.errorRates[op] = {
                        errorRate,
                        total,
                        failures: failureCount
                    };
                }
            }
        });
        return report;
    }
    reset() {
        this.slowOperations = {};
        this.successCounts = {};
        this.failureCounts = {};
    }
    logSlowOperationsSummary() {
        const slowOps = Object.keys(this.slowOperations);
        if (slowOps.length === 0)
            return;
        logger_1.default.info(`Performance Summary: ${slowOps.length} slow operations detected`, {
            slowOperations: this.slowOperations
        });
    }
}
exports.SimplePerformanceTracker = SimplePerformanceTracker;
exports.simplePerformance = SimplePerformanceTracker.getInstance();
function SimpleTrack(options = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const slowThreshold = options.slowThreshold || 100;
        const operationName = `${target.constructor.name}.${propertyKey}`;
        descriptor.value = async function (...args) {
            return exports.simplePerformance.trackAsync(operationName, slowThreshold, () => originalMethod.apply(this, args));
        };
        return descriptor;
    };
}
//# sourceMappingURL=performance.js.map