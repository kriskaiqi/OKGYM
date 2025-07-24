import express, { Request, Response } from 'express';
import logger from '../utils/logger';
import { LateralRaiseAnalysisController } from '../controllers/LateralRaiseAnalysisController';

export const lateralRaiseAnalysisRouter = express.Router();
const lateralRaiseController = new LateralRaiseAnalysisController();

// POST endpoint for analyzing lateral raise poses
lateralRaiseAnalysisRouter.post('/analyze/lateral_raise', async (req: Request, res: Response) => {
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
    logger.info(`Processing ${landmarks.length} landmarks for lateral raise analysis`);
    
    // Transform the landmarks to the expected format
    const poseData = {
      poseLandmarks: landmarks,
      timestamp: Date.now(),
      isMirrored: false
    };
    
    // Analyze the pose data using the controller
    const result = await lateralRaiseController.analyzeFrame(poseData);
    
    // Return the result
    return res.json(result);
  } catch (error) {
    logger.error('Error analyzing lateral raise pose:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'ANALYSIS_ERROR',
        message: 'Failed to analyze lateral raise pose',
        severity: 'error'
      } 
    });
  }
});

// POST endpoint for resetting lateral raise counter
lateralRaiseAnalysisRouter.post('/lateral_raise/reset', async (req: Request, res: Response) => {
  try {
    // Reset the rep counter
    const success = await lateralRaiseController.resetRepCounter();
    
    if (success) {
      return res.json({ success: true });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: { 
          type: 'RESET_ERROR',
          message: 'Failed to reset lateral raise counter',
          severity: 'error'
        } 
      });
    }
  } catch (error) {
    logger.error('Error resetting lateral raise counter:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'RESET_ERROR',
        message: 'Failed to reset lateral raise counter',
        severity: 'error'
      } 
    });
  }
}); 