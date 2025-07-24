"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDataSource = void 0;
const User_1 = require("../models/User");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const Exercise_1 = require("../models/Exercise");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Enums_1 = require("../models/shared/Enums");
const mockRepositories = {
    userRepo: {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
    },
    workoutPlanRepo: {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
    },
    workoutExerciseRepo: {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
    },
    exerciseRepo: {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
    },
    exerciseCategoryRepo: {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
    }
};
exports.testDataSource = {
    getRepository: (entity) => {
        switch (entity) {
            case User_1.User:
                return mockRepositories.userRepo;
            case WorkoutPlan_1.WorkoutPlan:
                return mockRepositories.workoutPlanRepo;
            case WorkoutExercise_1.WorkoutExercise:
                return mockRepositories.workoutExerciseRepo;
            case Exercise_1.Exercise:
                return mockRepositories.exerciseRepo;
            case ExerciseCategory_1.ExerciseCategory:
                return mockRepositories.exerciseCategoryRepo;
            default:
                throw new Error(`Repository for entity ${entity.name} not mocked`);
        }
    },
    initialize: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
    isInitialized: true
};
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
    })
}));
beforeEach(() => {
    Object.values(mockRepositories).forEach(repo => {
        Object.values(repo).forEach(method => {
            if (typeof method === 'function' && method.mockClear) {
                method.mockClear();
            }
        });
    });
});
console.error = jest.fn();
//# sourceMappingURL=workout-plan-mock.js.map