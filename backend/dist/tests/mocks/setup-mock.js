"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDataSource = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_mock_1 = require("./typeorm-mock");
const Enums_1 = require("../../models/shared/Enums");
dotenv_1.default.config({ path: '.env.test' });
jest.setTimeout(30000);
exports.testDataSource = typeorm_mock_1.mockDataSource;
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
beforeAll(async () => {
    try {
        await exports.testDataSource.initialize();
        console.log('Mock database connection initialized');
    }
    catch (error) {
        console.error('Error during MockDataSource initialization:', error);
        throw error;
    }
});
afterAll(async () => {
    if (exports.testDataSource.isInitialized) {
        await exports.testDataSource.destroy();
        console.log('Mock database connection closed');
    }
});
const originalConsoleError = console.error;
console.error = (...args) => {
    var _a, _b;
    if (((_a = args[0]) === null || _a === void 0 ? void 0 : _a.includes('expected error message')) ||
        ((_b = args[0]) === null || _b === void 0 ? void 0 : _b.includes('another expected error'))) {
        return;
    }
    originalConsoleError(...args);
};
//# sourceMappingURL=setup-mock.js.map