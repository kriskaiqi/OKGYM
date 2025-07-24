import { ExerciseAnalysisResponse } from '../types/exercise';
import logger from '../utils/logger';
import { PoseData } from '../services/BaseExerciseAnalyzer';
import { ExerciseAnalyzerFactory } from '../services/ExerciseAnalyzerFactory';
import { BaseExerciseAnalyzerService } from '../services/BaseExerciseAnalyzer';

/**
 * Controller for pushup exercise analysis
 */
export class PushupAnalysisController {
  private pushupAnalyzerService: BaseExerciseAnalyzerService;

  constructor() {
    // Get the pushup analyzer from the factory
    this.pushupAnalyzerService = ExerciseAnalyzerFactory.getInstance().getAnalyzer('pushup');
    
    // Initialize service on startup to avoid cold start delay
    this.pushupAnalyzerService.initialize().catch(err => {
      logger.warn('Non-critical error during pushup controller initialization:', err);
    });
    
    logger.info('PushupAnalysisController initialized');
  }

  /**
   * Analyze a single frame of pushup pose data
   */
  public async analyzeFrame(poseData: PoseData): Promise<ExerciseAnalysisResponse> {
    try {
      const startTime = Date.now();
      
      // Process with analyzer service
      const result = await this.pushupAnalyzerService.analyzePoseData(poseData);
      const processingTime = Date.now() - startTime;
      
      // Log performance metrics only for longer processing times
      if (processingTime > 100) {
        logger.info(`Completed pushup analysis in ${processingTime}ms`);
      }
      
      return result;
    } catch (error) {
      logger.error('Error analyzing pushup frame:', error);
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
   * Reset the repetition counter for pushup exercise
   */
  public async resetRepCounter(): Promise<boolean> {
    try {
      logger.info('RESET_DEBUG: PushupAnalysisController - Resetting pushup rep counter');
      const result = await this.pushupAnalyzerService.resetRepCounter();
      logger.info(`RESET_DEBUG: PushupAnalysisController - Reset result: ${result}`);
      return result;
    } catch (error) {
      logger.error('RESET_DEBUG: PushupAnalysisController - Error resetting pushup rep counter:', error);
      return false;
    }
  }
} 