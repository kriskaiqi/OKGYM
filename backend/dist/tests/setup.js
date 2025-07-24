"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Enums_1 = require("../models/shared/Enums");
dotenv_1.default.config({ path: '.env.test' });
jest.setTimeout(30000);
jest.mock('../config/database', () => ({
    AppDataSource: {
        isInitialized: true,
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
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
}));
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn().mockImplementation((token, secret) => {
        if (token && token.startsWith('valid')) {
            return { userId: 'test-user-id', userRole: Enums_1.UserRole.USER };
        }
        else if (token && token.startsWith('admin')) {
            return { userId: 'admin-user-id', userRole: Enums_1.UserRole.ADMIN };
        }
        else {
            throw new Error('Invalid token');
        }
    }),
    sign: jest.fn().mockImplementation((payload, secret, options) => {
        if (payload.userRole === Enums_1.UserRole.ADMIN) {
            return 'admin-token';
        }
        else {
            return 'valid-token';
        }
    }),
}));
const originalConsoleError = console.error;
console.error = (...args) => {
    var _a, _b;
    if (((_a = args[0]) === null || _a === void 0 ? void 0 : _a.includes('expected error message')) ||
        ((_b = args[0]) === null || _b === void 0 ? void 0 : _b.includes('another expected error'))) {
        return;
    }
    originalConsoleError(...args);
};
//# sourceMappingURL=setup.js.map