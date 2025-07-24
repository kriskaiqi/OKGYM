import { Request, Response } from 'express';
import logger from '../utils/logger';
import { BicepAnalysisResponse } from '../types/bicep';
import { ExerciseAnalyzerFactory } from '../services/ExerciseAnalyzerFactory';
import { BaseExerciseAnalyzerService } from '../services/BaseExerciseAnalyzer';

export class BicepAnalysisController {
  private bicepAnalyzerService: BaseExerciseAnalyzerService;

  constructor() {
    // Get the bicep analyzer from the factory
    this.bicepAnalyzerService = ExerciseAnalyzerFactory.getInstance().getAnalyzer('bicep');
    
    // Initialize service on startup to avoid cold start delay
    // Immediately initialize to prevent timing issues during first-time use
    logger.info('Initializing BicepAnalysisController and its analyzer service');
    this.bicepAnalyzerService.initialize()
      .then(() => {
        logger.info('BicepAnalysisController initialized successfully');
      })
      .catch(err => {
        logger.warn('Non-critical error during BicepAnalysisController initialization:', err);
      });
  }

  /**
   * Analyze a single frame for bicep form
   */
  public async analyzeFrame(data: any): Promise<BicepAnalysisResponse> {
    try {
      const startTime = Date.now();
      const { poseLandmarks, isMirrored } = data;

      if (!poseLandmarks || !Array.isArray(poseLandmarks)) {
        logger.error('Invalid landmarks received:', data);
        return {
          success: false,
          error: {
            type: 'INVALID_INPUT',
            severity: 'error',
            message: 'Invalid or missing pose landmarks'
          }
        };
      }

      // Validate landmarks have required structure
      const firstLandmark = poseLandmarks[0];
      if (!firstLandmark || 
          typeof firstLandmark.x !== 'number' || 
          typeof firstLandmark.y !== 'number' || 
          typeof firstLandmark.visibility !== 'number') {
        logger.error('Malformed landmarks:', poseLandmarks[0]);
        return {
          success: false,
          error: {
            type: 'INVALID_LANDMARK',
            severity: 'error',
            message: 'Malformed landmark structure'
          }
        };
      }

      // Log landmark count with reduced frequency (only log ~10% of frames)
      if (Math.random() < 0.1) {
        logger.info(`Processing ${poseLandmarks.length} landmarks for bicep analysis (pre-mirrored: ${isMirrored ? 'yes' : 'no'})`);
      }

      // Add mirroring information to be passed to the analyzer
      const poseData = { 
        poseLandmarks, 
        timestamp: Date.now(),
        isMirrored: !!isMirrored // Ensure boolean type
      };
      
      // Process data with priority on immediate response - log less frequently
      if (Math.random() < 0.1) {
        logger.info(`Starting bicep pose analysis at ${new Date().toISOString()}`);
      }
      
      const result = await this.bicepAnalyzerService.analyzePoseData(poseData);
      const processingTime = Date.now() - startTime;
      
      // Log performance metrics only for longer processing times or important results
      if (processingTime > 100 || (result.success && result.result?.repCount && result.result.repCount > 0)) {
        logger.info(`Completed bicep pose analysis in ${processingTime}ms: success=${result.success}, has result=${!!result.result}`);
      }
      
      // Only log important results like rep count changes or errors
      if (result.success && result.result) {
        // Only log if rep count is greater than 0 or on ~10% of frames
        if ((result.result.repCount && result.result.repCount > 0) || Math.random() < 0.1) {
          logger.info(`Sending bicep analysis result: stage=${result.result.stage}, score=${result.result.formScore}, reps=${result.result.repCount}`);
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Error in bicep analyzeFrame:', error);
      return {
        success: false,
        error: {
          type: 'ANALYSIS_ERROR',
          severity: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Reset the repetition counter
   * This should be called between sets to reset the counter
   */
  public async resetRepCounter(): Promise<boolean> {
    try {
      logger.info('RESET_DEBUG: BicepAnalysisController - Resetting repetition counter');
      const result = await this.bicepAnalyzerService.resetRepCounter();
      logger.info(`RESET_DEBUG: Reset operation result: ${result}`);
      return result;
    } catch (error) {
      logger.error('RESET_DEBUG: Error in resetRepCounter controller method:', error);
      return false;
    }
  }
} 