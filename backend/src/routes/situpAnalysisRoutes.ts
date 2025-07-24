import express, { Request, Response } from 'express';
import logger from '../utils/logger';
import { SitupAnalysisController } from '../controllers/SitupAnalysisController';

export const situpAnalysisRouter = express.Router();
const situpController = new SitupAnalysisController();

// POST endpoint for analyzing situp poses
situpAnalysisRouter.post('/analyze/situp', async (req: Request, res: Response) => {
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
    logger.debug(`Processing situp analysis request with ${expandedData.poseLandmarks.length} landmarks`);
    
    // Analyze the pose data using the controller
    const result = await situpController.analyzeFrame(expandedData);
    
    // Return the result
    return res.json(result);
  } catch (error) {
    logger.error('Error analyzing situp pose:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'ANALYSIS_ERROR',
        severity: 'error',
        message: 'Failed to analyze situp pose',
        details: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

// POST endpoint for resetting situp counter
situpAnalysisRouter.post('/situp/reset', async (req: Request, res: Response) => {
  try {
    logger.info('RESET_DEBUG: Resetting situp counter via API');
    const result = await situpController.resetRepCounter();
    
    return res.json({ 
      success: result, 
      message: result ? 'Successfully reset situp counter' : 'Failed to reset situp counter' 
    });
  } catch (error) {
    logger.error('RESET_DEBUG: Error resetting situp counter:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'RESET_ERROR',
        severity: 'error',
        message: 'Failed to reset situp counter' 
      } 
    });
  }
}); 