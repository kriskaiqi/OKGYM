import { Request, Response } from 'express';
import { AIService } from '../services/AIService';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export class AIController {
    private aiService: AIService;

    constructor() {
        this.aiService = new AIService();
    }

    /**
     * Analyze exercise form from video data
     */
    async analyzeExerciseForm(req: Request, res: Response): Promise<void> {
        try {
            const { exerciseType, exerciseId } = req.body;
            const userId = req.user.id; // Assuming user is authenticated
            const videoData = req.file?.buffer; // Assuming using multer for file upload

            if (!videoData) {
                throw new AppError('No video data provided', 400);
            }

            if (!exerciseType || !exerciseId) {
                throw new AppError('Exercise type and ID are required', 400);
            }

            const analysis = await this.aiService.analyzeExerciseForm(
                exerciseType,
                videoData,
                userId,
                exerciseId
            );

            res.status(200).json({
                success: true,
                data: analysis
            });
        } catch (error) {
            logger.error('Error in analyzeExerciseForm controller:', error);
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    }

    /**
     * Get exercise form analysis history
     */
    async getExerciseHistory(req: Request, res: Response): Promise<void> {
        try {
            const { exerciseId } = req.params;
            const userId = req.user.id; // Assuming user is authenticated

            if (!exerciseId) {
                throw new AppError('Exercise ID is required', 400);
            }

            const history = await this.aiService.getExerciseHistory(userId, exerciseId);

            res.status(200).json({
                success: true,
                data: history
            });
        } catch (error) {
            logger.error('Error in getExerciseHistory controller:', error);
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    }
} 