"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTransactionMocking = setupTransactionMocking;
const errors_1 = require("../../utils/errors");
function setupTransactionMocking() {
    jest.resetModules();
    jest.mock('../../utils/logger', () => ({
        __esModule: true,
        default: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn()
        }
    }));
    jest.mock('../../utils/performance', () => ({
        SimpleTrack: () => (target, propertyKey, descriptor) => descriptor,
        SimplePerformanceTracker: {
            getInstance: () => ({
                trackOperation: jest.fn(),
                logSlowOperationsSummary: jest.fn()
            })
        }
    }));
    jest.mock('../../utils/cache-metrics', () => ({
        CacheMetrics: {
            getInstance: () => ({
                trackHit: jest.fn(),
                trackMiss: jest.fn(),
                reportMetrics: jest.fn()
            })
        }
    }));
    jest.mock('../../utils/transaction-helper', () => {
        return {
            executeTransaction: jest.fn().mockImplementation(async (callback) => {
                try {
                    const queryRunner = {
                        manager: {
                            save: jest.fn().mockImplementation((entity, data) => {
                                if (Array.isArray(data)) {
                                    return Promise.resolve(data.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))));
                                }
                                return Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 }));
                            }),
                            findOne: jest.fn().mockResolvedValue(null),
                            find: jest.fn().mockResolvedValue([])
                        },
                        connect: jest.fn().mockResolvedValue(undefined),
                        startTransaction: jest.fn().mockResolvedValue(undefined),
                        commitTransaction: jest.fn().mockResolvedValue(undefined),
                        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
                        release: jest.fn().mockResolvedValue(undefined),
                        isTransactionActive: true,
                    };
                    const result = await callback(queryRunner);
                    return result;
                }
                catch (error) {
                    if (error instanceof errors_1.AppError) {
                        throw error;
                    }
                    throw new errors_1.AppError(errors_1.ErrorType.TRANSACTION_ERROR, 'Mock transaction failed', 500, { originalError: error instanceof Error ? error.message : String(error) });
                }
            }),
            executeTransactionBatch: jest.fn().mockImplementation(async (operations) => {
                const results = [];
                const mockManager = {
                    save: jest.fn().mockImplementation((entity, data) => {
                        if (Array.isArray(data)) {
                            return Promise.resolve(data.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))));
                        }
                        return Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 }));
                    }),
                    findOne: jest.fn().mockResolvedValue(null),
                    find: jest.fn().mockResolvedValue([])
                };
                for (const operation of operations) {
                    const result = await operation(mockManager);
                    results.push(result);
                }
                return results;
            }),
            isInTransaction: jest.fn().mockReturnValue(true)
        };
    });
    jest.mock('../../config/database', () => {
        return {
            AppDataSource: {
                isInitialized: true,
                createQueryRunner: jest.fn().mockImplementation(() => ({
                    manager: {
                        save: jest.fn().mockImplementation((entity, data) => {
                            if (Array.isArray(data)) {
                                return Promise.resolve(data.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))));
                            }
                            return Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 }));
                        })
                    },
                    connect: jest.fn().mockResolvedValue(undefined),
                    startTransaction: jest.fn().mockResolvedValue(undefined),
                    commitTransaction: jest.fn().mockResolvedValue(undefined),
                    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
                    release: jest.fn().mockResolvedValue(undefined),
                    isTransactionActive: true,
                }))
            }
        };
    });
    jest.mock('../../services/CacheManager', () => {
        return {
            cacheManager: {
                get: jest.fn().mockImplementation(() => null),
                set: jest.fn().mockImplementation(() => Promise.resolve(true)),
                delete: jest.fn().mockImplementation(() => Promise.resolve(true)),
                deleteByPattern: jest.fn().mockImplementation(() => Promise.resolve(true)),
                flush: jest.fn().mockImplementation(() => Promise.resolve(true)),
                stats: jest.fn().mockImplementation(() => ({
                    hits: 0,
                    misses: 0,
                    keys: 0,
                    ksize: 0,
                    vsize: 0
                }))
            }
        };
    });
}
//# sourceMappingURL=test-helpers.js.map