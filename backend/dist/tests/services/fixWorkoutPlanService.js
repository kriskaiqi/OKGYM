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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchWorkoutPlanService = patchWorkoutPlanService;
const logger_1 = __importDefault(require("../../utils/logger"));
if (typeof logger_1.default.info !== 'function') {
    logger_1.default.info = jest.fn();
}
if (typeof logger_1.default.error !== 'function') {
    logger_1.default.error = jest.fn();
}
if (typeof logger_1.default.warn !== 'function') {
    logger_1.default.warn = jest.fn();
}
if (typeof logger_1.default.debug !== 'function') {
    logger_1.default.debug = jest.fn();
}
const performance = __importStar(require("../../utils/performance"));
if (!performance.SimpleTrack) {
    performance.SimpleTrack = function (options = {}) {
        return function (target, propertyKey, descriptor) {
            return descriptor;
        };
    };
}
const CacheManager_1 = require("../../services/CacheManager");
if (!CacheManager_1.cacheManager.get || typeof CacheManager_1.cacheManager.get !== 'function') {
    CacheManager_1.cacheManager.get = jest.fn().mockResolvedValue(null);
    CacheManager_1.cacheManager.set = jest.fn().mockResolvedValue(undefined);
    CacheManager_1.cacheManager.delete = jest.fn().mockResolvedValue(undefined);
    CacheManager_1.cacheManager.deleteByPattern = jest.fn().mockResolvedValue(undefined);
}
const transactionHelper = __importStar(require("../../utils/transaction-helper"));
if (!transactionHelper.executeTransaction || typeof transactionHelper.executeTransaction !== 'function') {
    transactionHelper.executeTransaction = jest.fn(async (callback) => {
        return await callback({
            manager: {
                save: jest.fn().mockResolvedValue([])
            }
        });
    });
}
else {
    const originalExecuteTransaction = transactionHelper.executeTransaction;
    transactionHelper.executeTransaction = jest.fn(async (callback) => {
        try {
            return await callback({
                manager: {
                    save: jest.fn().mockResolvedValue([])
                }
            });
        }
        catch (error) {
            console.error("Mock transaction failed", error);
            throw error;
        }
    });
}
function patchWorkoutPlanService(service) {
    service.handleError = jest.fn().mockImplementation((error, message) => {
        console.error(`Error handled: ${message}`, error);
        return null;
    });
    return service;
}
//# sourceMappingURL=fixWorkoutPlanService.js.map