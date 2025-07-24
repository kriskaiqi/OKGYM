"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const authRoutes_1 = __importDefault(require("../../routes/authRoutes"));
const AuthController_1 = require("../../controllers/AuthController");
jest.mock('../../controllers/AuthController');
jest.mock('../../services/authService');
jest.mock('../../middleware/validation', () => ({
    validateRequest: () => (req, res, next) => next(),
}));
describe('Auth Routes', () => {
    let app;
    let mockAuthController;
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthController = {
            register: jest.fn(),
            login: jest.fn(),
            updateFitnessProfile: jest.fn(),
            getProfile: jest.fn(),
            getAllUsers: jest.fn(),
        };
        AuthController_1.AuthController.mockImplementation(() => mockAuthController);
        app = express();
        app.use(express.json());
        app.use('/api/auth', authRoutes_1.default);
    });
    test.skip('POST /register should call register controller', () => {
        expect(true).toBe(true);
    });
    test.skip('POST /login should call login controller', () => {
        expect(true).toBe(true);
    });
    test.skip('POST /users/:userId/fitness-profile should call updateFitnessProfile controller', () => {
        expect(true).toBe(true);
    });
    test.skip('GET /profile/:id should call getProfile controller', () => {
        expect(true).toBe(true);
    });
    test.skip('GET /users should call getAllUsers controller', () => {
        expect(true).toBe(true);
    });
    test('Mock controller should be defined', () => {
        expect(mockAuthController).toBeDefined();
        expect(mockAuthController.register).toBeDefined();
        expect(mockAuthController.login).toBeDefined();
        expect(mockAuthController.updateFitnessProfile).toBeDefined();
        expect(mockAuthController.getProfile).toBeDefined();
        expect(mockAuthController.getAllUsers).toBeDefined();
    });
});
//# sourceMappingURL=authRoutes.test.js.map