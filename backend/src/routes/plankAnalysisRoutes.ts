import express, { Request, Response } from 'express';
import logger from '../utils/logger';
import { PlankAnalysisController } from '../controllers/PlankAnalysisController';

export const plankAnalysisRouter = express.Router();
const plankAnalysisController = new PlankAnalysisController();

// POST endpoint for analyzing plank poses
plankAnalysisRouter.post('/analyze/plank', async (req: Request, res: Response) => {
  try {
    // Convert from minimal format to format expected by analyzer - match lunge implementation
    const expandedData = {
      poseLandmarks: req.body.landmarks.map((point: any) => ({
        x: point.x,
        y: point.y,
        z: point.z || 0,
        visibility: point.visibility || 0.9
      })),
      isMirrored: false,
      timestamp: Date.now(),
      frameId: 0
    };
    
    // Log for debugging
    logger.debug(`Processing plank analysis request with ${expandedData.poseLandmarks.length} landmarks`);
    
    // Analyze the pose data using the controller
    const result = await plankAnalysisController.analyzeFrame(expandedData);
    
    // Return the result
    return res.json(result);
  } catch (error) {
    logger.error('Error analyzing plank pose:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'ANALYSIS_ERROR',
        severity: 'error',
        message: 'Failed to analyze plank pose',
        details: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

// POST endpoint for resetting plank timer
plankAnalysisRouter.post('/plank/reset', async (req: Request, res: Response) => {
  try {
    // Reset the timer using the controller
    const success = await plankAnalysisController.resetTimer();
    
    return res.json({ success });
  } catch (error) {
    logger.error('Error resetting plank timer:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'ANALYSIS_ERROR',
        severity: 'error',
        message: 'Failed to reset plank timer',
        details: error instanceof Error ? error.message : String(error)
      } 
    });
  }
}); 