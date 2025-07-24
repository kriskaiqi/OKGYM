import { Request, Response } from 'express';
import logger from '../utils/logger';
import { ExerciseAnalysisResponse } from '../types/exercise';
import { ExerciseAnalyzerFactory } from '../services/ExerciseAnalyzerFactory';
import { BaseExerciseAnalyzerService } from '../services/BaseExerciseAnalyzer';

export class BenchPressAnalysisController {
  private benchPressAnalyzerService: BaseExerciseAnalyzerService;

  constructor() {
    // Get the bench press analyzer from the factory
    this.benchPressAnalyzerService = ExerciseAnalyzerFactory.getInstance().getAnalyzer('bench_press');
    
    // Initialize service on startup to avoid cold start delay
    this.benchPressAnalyzerService.initialize().catch(err => {
      logger.warn('Non-critical error during bench press controller initialization:', err);
    });
  }

  /**
   * Analyze a single frame for bench press form
   */
  public async analyzeFrame(data: any): Promise<ExerciseAnalysisResponse> {
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

      // Add timestamp and mirroring information
      const poseData = { 
        poseLandmarks, 
        timestamp: Date.now(),
        isMirrored: !!isMirrored // Ensure boolean type
      };
      
      // Process with analyzer service
      const result = await this.benchPressAnalyzerService.analyzePoseData(poseData);
      const processingTime = Date.now() - startTime;
      
      // Log performance metrics only for longer processing times
      if (processingTime > 100) {
        logger.info(`Completed bench press analysis in ${processingTime}ms`);
      }
      
      return result;
    } catch (error) {
      logger.error('Error analyzing bench press frame:', error);
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
      logger.info('RESET_DEBUG: BenchPressAnalysisController - Resetting repetition counter');
      const result = await this.benchPressAnalyzerService.resetRepCounter();
      logger.info(`RESET_DEBUG: BenchPressAnalysisController - Reset result: ${result}`);
      return result;
    } catch (error) {
      logger.error('RESET_DEBUG: Error in bench press resetRepCounter:', error);
      return false;
    }
  }
} 