import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { achievementController } from '../controllers/achievementController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all achievements for the current user
router.get('/', achievementController.getUserAchievements.bind(achievementController));

export default router; 