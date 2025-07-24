import express, { Request, Response } from 'express';
import logger from '../utils/logger';
import { ShoulderPressAnalysisController } from '../controllers/ShoulderPressAnalysisController';

export const shoulderPressAnalysisRouter = express.Router();
const shoulderPressController = new ShoulderPressAnalysisController();

// POST endpoint for analyzing shoulder press poses
shoulderPressAnalysisRouter.post('/analyze/shoulder_press', async (req: Request, res: Response) => {
  try {
    // Convert from minimal format to format expected by analyzer
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
    logger.debug(`Processing shoulder press analysis request with ${expandedData.poseLandmarks.length} landmarks`);
    
    // Analyze the pose data using the controller
    const result = await shoulderPressController.analyzeFrame(expandedData);
    
    // Return the result
    return res.json(result);
  } catch (error) {
    logger.error('Error analyzing shoulder press pose:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'ANALYSIS_ERROR',
        severity: 'error',
        message: 'Failed to analyze shoulder press pose',
        details: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

// POST endpoint for resetting shoulder press counter
shoulderPressAnalysisRouter.post('/shoulder_press/reset', async (req: Request, res: Response) => {
  try {
    logger.info('RESET_DEBUG: Resetting shoulder press counter via API');
    const result = await shoulderPressController.resetRepCounter();
    
    return res.json({ 
      success: result, 
      message: result ? 'Successfully reset shoulder press counter' : 'Failed to reset shoulder press counter' 
    });
  } catch (error) {
    logger.error('RESET_DEBUG: Error resetting shoulder press counter:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'RESET_ERROR',
        severity: 'error',
        message: 'Failed to reset shoulder press counter' 
      } 
    });
  }
}); 