import express, { Request, Response } from 'express';
import logger from '../utils/logger';
import { BenchPressAnalysisController } from '../controllers/BenchPressAnalysisController';

export const benchPressAnalysisRouter = express.Router();
const benchPressController = new BenchPressAnalysisController();

// POST endpoint for analyzing bench press poses
benchPressAnalysisRouter.post('/analyze/bench_press', async (req: Request, res: Response) => {
  try {
    // Get landmarks from request body
    const { landmarks } = req.body;
    
    if (!landmarks || !Array.isArray(landmarks)) {
      logger.error('Invalid request body: landmarks must be an array');
      return res.status(400).json({ 
        success: false, 
        error: { 
          type: 'INVALID_INPUT',
          message: 'Invalid request body: landmarks must be an array',
          severity: 'error'
        } 
      });
    }
    
    // Log the number of landmarks for debugging
    logger.info(`Processing ${landmarks.length} landmarks for bench press analysis`);
    
    // Transform the landmarks to the expected format
    const poseData = {
      poseLandmarks: landmarks,
      timestamp: Date.now(),
      isMirrored: false
    };
    
    // Analyze the pose data
    const result = await benchPressController.analyzeFrame(poseData);
    
    // Return the result
    return res.json(result);
  } catch (error) {
    logger.error('Error analyzing bench press pose:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'ANALYSIS_ERROR',
        message: 'Failed to analyze bench press pose',
        severity: 'error'
      } 
    });
  }
});

// POST endpoint for resetting bench press counter
benchPressAnalysisRouter.post('/bench_press/reset', async (req: Request, res: Response) => {
  try {
    // Reset the rep counter
    const success = await benchPressController.resetRepCounter();
    
    if (success) {
      return res.json({ success: true });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: { 
          type: 'RESET_ERROR',
          message: 'Failed to reset bench press counter',
          severity: 'error'
        } 
      });
    }
  } catch (error) {
    logger.error('Error resetting bench press counter:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'RESET_ERROR',
        message: 'Failed to reset bench press counter',
        severity: 'error'
      } 
    });
  }
}); 