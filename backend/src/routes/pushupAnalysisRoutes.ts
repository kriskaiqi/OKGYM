import express, { Request, Response } from 'express';
import logger from '../utils/logger';
import { PushupAnalysisController } from '../controllers/PushupAnalysisController';

export const pushupAnalysisRouter = express.Router();
const pushupController = new PushupAnalysisController();

// POST endpoint for analyzing pushup poses
pushupAnalysisRouter.post('/analyze/pushup', async (req: Request, res: Response) => {
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
    logger.info(`Processing ${landmarks.length} landmarks for pushup analysis`);
    
    // Transform the landmarks to the expected format
    const poseData = {
      poseLandmarks: landmarks.map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z || 0,
        visibility: lm.visibility || 0.9
      })),
      timestamp: Date.now(),
      isMirrored: false
    };
    
    // Analyze the pose data
    const result = await pushupController.analyzeFrame(poseData);
    
    // Return the result
    return res.json(result);
  } catch (error) {
    logger.error('Error analyzing pushup pose:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'ANALYSIS_ERROR',
        message: 'Failed to analyze pushup pose',
        severity: 'error',
        details: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

// POST endpoint for resetting pushup counter
pushupAnalysisRouter.post('/pushup/reset', async (req: Request, res: Response) => {
  try {
    logger.info('RESET_DEBUG: Resetting pushup counter via API');
    const result = await pushupController.resetRepCounter();
    
    return res.json({ 
      success: result, 
      message: result ? 'Successfully reset pushup counter' : 'Failed to reset pushup counter' 
    });
  } catch (error) {
    logger.error('RESET_DEBUG: Error resetting pushup counter:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        type: 'RESET_ERROR',
        severity: 'error',
        message: 'Failed to reset pushup counter' 
      } 
    });
  }
}); 