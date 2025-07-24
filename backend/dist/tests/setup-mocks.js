jest.mock('typeorm', () => {
    const originalModule = jest.requireActual('typeorm');
    class MockDataSource {
        constructor(options) {
            this.options = options;
        }
        async initialize() {
            return this;
        }
        getRepository() {
            return {
                create: jest.fn(),
                save: jest.fn(),
                find: jest.fn(),
                findOne: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            };
        }
    }
    return Object.assign(Object.assign({}, originalModule), { DataSource: MockDataSource });
});
jest.mock('../utils/transaction-helper', () => {
    return require('./__mocks__/transaction-helper');
});
jest.mock('../config/database', () => {
    return require('./__mocks__/database');
});
jest.mock('../services/CacheManager', () => {
    return {
        cacheManager: {
            get: jest.fn().mockImplementation(() => null),
            set: jest.fn().mockImplementation(() => Promise.resolve(true)),
            delete: jest.fn().mockImplementation(() => Promise.resolve(true)),
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
jest.mock('../utils/logger', () => {
    return {
        __esModule: true,
        default: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        }
    };
});
jest.mock('../utils/performance', () => {
    return {
        __esModule: true,
        SimpleTrack: () => (target, propertyKey, descriptor) => descriptor,
        trackExecution: jest.fn().mockImplementation((name, fn) => fn()),
        recordMetric: jest.fn(),
    };
});
//# sourceMappingURL=setup-mocks.js.map