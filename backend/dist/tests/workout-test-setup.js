"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDataSource = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Enums_1 = require("../models/shared/Enums");
dotenv_1.default.config({ path: '.env.test' });
jest.setTimeout(30000);
exports.testDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_DATABASE || 'okgym_test',
    schema: process.env.DB_SCHEMA || 'public',
    entities: [
        User_1.User,
        WorkoutPlan_1.WorkoutPlan,
        WorkoutExercise_1.WorkoutExercise,
        Exercise_1.Exercise,
        ExerciseCategory_1.ExerciseCategory
    ],
    synchronize: true,
    dropSchema: true,
    logging: false
});
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
        console.log('WorkoutPlan Test PostgreSQL connection initialized');
    }
    catch (error) {
        console.error('Error during PostgreSQL DataSource initialization:', error);
        throw error;
    }
});
afterAll(async () => {
    if (exports.testDataSource.isInitialized) {
        await exports.testDataSource.destroy();
        console.log('PostgreSQL connection closed');
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
//# sourceMappingURL=workout-test-setup.js.map