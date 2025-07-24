import { Request, Response, NextFunction } from 'express';
import { achievementService } from '../services/AchievementService';
import { AppError, ErrorType } from '../utils/errors';
import logger from '../utils/logger';
import { UserRole } from '../models/shared/Enums';

// Define interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
    isAdmin?: boolean;
  };
}

/**
 * Controller for handling achievement-related endpoints
 */
export class AchievementController {
  /**
   * Get all achievements for the authenticated user
   * Achievement status is calculated on-demand
   */
  async getUserAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      logger.info(`Fetching achievements for user ${userId}`);
      
      const achievements = await achievementService.getUserAchievements(userId);
      
      res.status(200).json({
        success: true,
        data: achievements
      });
    } catch (error) {
      logger.error('Error in getUserAchievements:', error);
      next(new AppError(ErrorType.SERVICE_ERROR, 'Failed to get user achievements', 500, error));
    }
  }
}

// Export singleton instance
export const achievementController = new AchievementController(); 