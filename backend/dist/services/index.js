"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = void 0;
__exportStar(require("./interfaces/BaseService"), exports);
__exportStar(require("./UserService"), exports);
__exportStar(require("./authService"), exports);
__exportStar(require("./ExerciseService"), exports);
__exportStar(require("./MetricTrackingService"), exports);
const UserService_1 = require("./UserService");
const authService_1 = require("./authService");
const MetricTrackingService_1 = require("./MetricTrackingService");
const CacheManager_1 = require("./CacheManager");
const MetricsService_1 = require("./MetricsService");
const UserRepository_1 = require("../repositories/UserRepository");
const metricsService = new MetricsService_1.MetricsService();
exports.services = {
    user: new UserService_1.UserService(),
    auth: new authService_1.AuthService(new UserRepository_1.UserRepository(), CacheManager_1.cacheManager, metricsService),
    metricTracking: new MetricTrackingService_1.MetricTrackingService(),
};
//# sourceMappingURL=index.js.map