import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validation';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/shared/Enums';
import { AuthService } from '../services/authService';
import { repositories } from '../repositories';
import { cacheManager } from '../services/CacheManager';
import { MetricsService } from '../services/MetricsService';

const router = Router();
const userRepository = repositories.user;
const metricsService = new MetricsService();
const authService = new AuthService(userRepository, cacheManager, metricsService);
const authController = new AuthController(authService);

// Register new user
router.post(
  '/register',
  validateRequest(RegisterDto),
  (req, res) => authController.register(req, res)
);

// Login user
router.post(
  '/login',
  validateRequest(LoginDto),
  (req, res) => authController.login(req, res)
);

// Update fitness profile
router.post(
  '/users/:userId/fitness-profile', 
  authenticate,
  (req, res) => authController.updateFitnessProfile(req, res)
);

// Get user profile
router.get(
  '/profile/:id', 
  authenticate,
  (req, res) => authController.getUserProfile(req, res)
);

// Get all users (admin only)
router.get(
  '/users', 
  authenticate,
  authorize([UserRole.ADMIN]),
  (req, res) => authController.getAllUsers(req, res)
);

export default router; 