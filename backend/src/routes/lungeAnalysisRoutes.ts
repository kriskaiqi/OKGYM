import express, { Request, Response } from 'express';
import logger from '../utils/logger';
import { LungeAnalysisController } from '../controllers/LungeAnalysisController';

export const lungeAnalysisRouter = express.Router();
const lungeAnalysisController = new LungeAnalysisController();

/**
 * @route POST /api/analyze/lunge
 * @description Analyze a single frame for lunge form
 * @access Public
 */
lungeAnalysisRouter.post('/analyze/lunge', async (req: Request, res: Response) => {
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
    
    const result = await lungeAnalysisController.analyzeFrame(expandedData);
    res.json(result);
  } catch (error) {
    logger.error('Route error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'ANALYSIS_ERROR',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * @route POST /api/lunge/reset
 * @description Reset the lunge repetition counter
 * @access Public
 */
lungeAnalysisRouter.post('/lunge/reset', async (req: Request, res: Response) => {
  try {
    const success = await lungeAnalysisController.resetRepCounter();
    return res.json({ success });
  } catch (error) {
    logger.error('Error resetting lunge counter:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Failed to reset lunge counter',
        details: error instanceof Error ? error.message : 'Unknown error'
      } 
    });
  }
}); 