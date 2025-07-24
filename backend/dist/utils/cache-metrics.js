"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheMetrics = exports.CacheMetrics = void 0;
const logger_1 = __importDefault(require("./logger"));
class CacheMetrics {
    static getInstance() {
        if (!CacheMetrics.instance) {
            CacheMetrics.instance = new CacheMetrics();
        }
        return CacheMetrics.instance;
    }
    constructor() {
        this.hits = 0;
        this.misses = 0;
        this.sets = 0;
        this.deletes = 0;
        this.errors = 0;
        this.getLatencyTotal = 0;
        this.setLatencyTotal = 0;
        this.deleteLatencyTotal = 0;
        this.domainHits = {};
        this.domainMisses = {};
        setInterval(() => this.reportMetrics(), 5 * 60 * 1000);
    }
    recordHit(domain = 'default', latencyMs = 0) {
        this.hits++;
        this.getLatencyTotal += latencyMs;
        this.domainHits[domain] = (this.domainHits[domain] || 0) + 1;
    }
    recordMiss(domain = 'default', latencyMs = 0) {
        this.misses++;
        this.getLatencyTotal += latencyMs;
        this.domainMisses[domain] = (this.domainMisses[domain] || 0) + 1;
    }
    recordSet(latencyMs = 0) {
        this.sets++;
        this.setLatencyTotal += latencyMs;
    }
    recordDelete(latencyMs = 0) {
        this.deletes++;
        this.deleteLatencyTotal += latencyMs;
    }
    recordError() {
        this.errors++;
    }
    getHitRate() {
        const total = this.hits + this.misses;
        if (total === 0)
            return 0;
        return Math.round((this.hits / total) * 100);
    }
    getDomainHitRates() {
        const result = {};
        const domains = new Set([
            ...Object.keys(this.domainHits),
            ...Object.keys(this.domainMisses)
        ]);
        domains.forEach(domain => {
            const hits = this.domainHits[domain] || 0;
            const misses = this.domainMisses[domain] || 0;
            const total = hits + misses;
            if (total === 0) {
                result[domain] = 0;
            }
            else {
                result[domain] = Math.round((hits / total) * 100);
            }
        });
        return result;
    }
    getAverageGetLatency() {
        const total = this.hits + this.misses;
        if (total === 0)
            return 0;
        return Math.round(this.getLatencyTotal / total);
    }
    getAverageSetLatency() {
        if (this.sets === 0)
            return 0;
        return Math.round(this.setLatencyTotal / this.sets);
    }
    getAverageDeleteLatency() {
        if (this.deletes === 0)
            return 0;
        return Math.round(this.deleteLatencyTotal / this.deletes);
    }
    reset() {
        this.hits = 0;
        this.misses = 0;
        this.sets = 0;
        this.deletes = 0;
        this.errors = 0;
        this.getLatencyTotal = 0;
        this.setLatencyTotal = 0;
        this.deleteLatencyTotal = 0;
        this.domainHits = {};
        this.domainMisses = {};
    }
    reportMetrics() {
        const totalOperations = this.hits + this.misses + this.sets + this.deletes;
        if (totalOperations === 0)
            return;
        logger_1.default.info('Cache Metrics Report', {
            hitRate: `${this.getHitRate()}%`,
            operations: {
                total: totalOperations,
                hits: this.hits,
                misses: this.misses,
                sets: this.sets,
                deletes: this.deletes,
                errors: this.errors
            },
            latency: {
                get: `${this.getAverageGetLatency()}ms`,
                set: `${this.getAverageSetLatency()}ms`,
                delete: `${this.getAverageDeleteLatency()}ms`
            },
            domainHitRates: this.getDomainHitRates()
        });
    }
}
exports.CacheMetrics = CacheMetrics;
exports.cacheMetrics = CacheMetrics.getInstance();
//# sourceMappingURL=cache-metrics.js.map