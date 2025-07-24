"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const authService_1 = require("../services/authService");
const CacheManager_1 = require("../services/CacheManager");
const MetricsService_1 = require("../services/MetricsService");
const auth_1 = require("../middleware/auth");
const UserRepository_1 = require("../repositories/UserRepository");
const router = express_1.default.Router();
const userRepository = new UserRepository_1.UserRepository();
const metricsService = new MetricsService_1.MetricsService();
const authService = new authService_1.AuthService(userRepository, CacheManager_1.cacheManager, metricsService);
const authController = new AuthController_1.AuthController(authService);
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/profile', auth_1.authenticate, (req, res) => authController.getProfile(req, res));
router.put('/profile/fitness', auth_1.authenticate, (req, res) => authController.updateFitnessProfile(req, res));
exports.authRoutes = router;
//# sourceMappingURL=auth.routes.js.map