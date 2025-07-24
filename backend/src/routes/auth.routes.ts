import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { User } from '../models/User';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AuthService } from '../services/authService';
import { cacheManager } from '../services/CacheManager';
import { MetricsService } from '../services/MetricsService';
import { authenticate } from '../middleware/auth';
import logger from '../utils/logger';
import { UserRepository } from '../repositories/UserRepository';

// Initialize the router
const router = express.Router();

// Initialize dependencies
const userRepository = new UserRepository();
const metricsService = new MetricsService();
const authService = new AuthService(userRepository, cacheManager, metricsService);
const authController = new AuthController(authService);

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', (req, res) => authController.logout(req, res));

/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res));

/**
 * @route PUT /api/auth/profile/fitness
 * @desc Update user fitness profile
 * @access Private
 */
router.put('/profile/fitness', authenticate, (req, res) => authController.updateFitnessProfile(req, res));

export const authRoutes = router; 