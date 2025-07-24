"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceMetrics = exports.ServiceMetrics = void 0;
const logger_1 = __importDefault(require("./logger"));
class ServiceMetrics {
    static getInstance() {
        if (!ServiceMetrics.instance) {
            ServiceMetrics.instance = new ServiceMetrics();
        }
        return ServiceMetrics.instance;
    }
    constructor() {
        this.callCounts = {};
        this.successCounts = {};
        this.failureCounts = {};
        this.totalDurations = {};
        this.maxDurations = {};
        this.minDurations = {};
        this.lastCallTimestamps = {};
        this.callsPerMinute = {};
        this.minuteMarkers = {};
        setInterval(() => this.reportMetrics(), 10 * 60 * 1000);
    }
    recordStart(service, method) {
        const key = `${service}.${method}`;
        const startTime = Date.now();
        const currentMinute = Math.floor(startTime / 60000);
        if (!this.callsPerMinute[key]) {
            this.callsPerMinute[key] = [];
            this.minuteMarkers[key] = currentMinute;
        }
        else if (this.minuteMarkers[key] !== currentMinute) {
            this.callsPerMinute[key].unshift(0);
            if (this.callsPerMinute[key].length > 10) {
                this.callsPerMinute[key].pop();
            }
            this.minuteMarkers[key] = currentMinute;
        }
        this.callsPerMinute[key][0] = (this.callsPerMinute[key][0] || 0) + 1;
        this.lastCallTimestamps[key] = startTime;
        return { startTime, key };
    }
    recordEnd(tracking, success) {
        const { startTime, key } = tracking;
        const duration = Date.now() - startTime;
        if (!this.callCounts[key]) {
            this.callCounts[key] = 0;
            this.successCounts[key] = 0;
            this.failureCounts[key] = 0;
            this.totalDurations[key] = 0;
            this.maxDurations[key] = 0;
            this.minDurations[key] = { value: 0, hasValue: false };
        }
        this.callCounts[key]++;
        this.totalDurations[key] += duration;
        if (success) {
            this.successCounts[key]++;
        }
        else {
            this.failureCounts[key]++;
        }
        if (duration > this.maxDurations[key]) {
            this.maxDurations[key] = duration;
        }
        if (!this.minDurations[key].hasValue || duration < this.minDurations[key].value) {
            this.minDurations[key] = { value: duration, hasValue: true };
        }
    }
    async trackAsync(service, method, fn) {
        const tracking = this.recordStart(service, method);
        try {
            const result = await fn();
            this.recordEnd(tracking, true);
            return result;
        }
        catch (error) {
            this.recordEnd(tracking, false);
            throw error;
        }
    }
    track(service, method, fn) {
        const tracking = this.recordStart(service, method);
        try {
            const result = fn();
            this.recordEnd(tracking, true);
            return result;
        }
        catch (error) {
            this.recordEnd(tracking, false);
            throw error;
        }
    }
    getSuccessRate(service, method) {
        const key = `${service}.${method}`;
        if (!this.callCounts[key] || this.callCounts[key] === 0) {
            return null;
        }
        return Math.round((this.successCounts[key] / this.callCounts[key]) * 100);
    }
    getAverageDuration(service, method) {
        const key = `${service}.${method}`;
        if (!this.callCounts[key] || this.callCounts[key] === 0) {
            return null;
        }
        return Math.round(this.totalDurations[key] / this.callCounts[key]);
    }
    getMaxDuration(service, method) {
        const key = `${service}.${method}`;
        if (!this.callCounts[key] || this.callCounts[key] === 0) {
            return null;
        }
        return this.maxDurations[key];
    }
    getMinDuration(service, method) {
        const key = `${service}.${method}`;
        if (!this.callCounts[key] || !this.minDurations[key].hasValue) {
            return null;
        }
        return this.minDurations[key].value;
    }
    getCallsPerMinute(service, method) {
        const key = `${service}.${method}`;
        if (!this.callsPerMinute[key]) {
            return null;
        }
        return [...this.callsPerMinute[key]];
    }
    getServiceMetrics(service) {
        const metrics = {};
        const serviceKeyPrefix = `${service}.`;
        const methods = Object.keys(this.callCounts)
            .filter(key => key.startsWith(serviceKeyPrefix))
            .map(key => key.substring(serviceKeyPrefix.length));
        methods.forEach(method => {
            metrics[method] = {
                calls: this.callCounts[`${service}.${method}`] || 0,
                successRate: this.getSuccessRate(service, method),
                avgDuration: this.getAverageDuration(service, method),
                maxDuration: this.getMaxDuration(service, method),
                minDuration: this.getMinDuration(service, method),
                recentCallsPerMinute: this.getCallsPerMinute(service, method)
            };
        });
        return metrics;
    }
    getAllMetrics() {
        const metrics = {};
        const services = new Set();
        Object.keys(this.callCounts).forEach(key => {
            const serviceName = key.split('.')[0];
            services.add(serviceName);
        });
        services.forEach(service => {
            metrics[service] = this.getServiceMetrics(service);
        });
        return metrics;
    }
    reset() {
        this.callCounts = {};
        this.successCounts = {};
        this.failureCounts = {};
        this.totalDurations = {};
        this.maxDurations = {};
        this.minDurations = {};
        this.lastCallTimestamps = {};
        this.callsPerMinute = {};
        this.minuteMarkers = {};
    }
    reportMetrics() {
        const metrics = this.getAllMetrics();
        const serviceCount = Object.keys(metrics).length;
        if (serviceCount === 0)
            return;
        logger_1.default.info('Service Performance Report', { metrics });
    }
}
exports.ServiceMetrics = ServiceMetrics;
exports.serviceMetrics = ServiceMetrics.getInstance();
//# sourceMappingURL=service-metrics.js.map