import { LateralRaiseAnalyzerService } from '../services/LateralRaiseAnalyzerService';
import { ExerciseAnalysisResponse } from '../types/exercise';
import logger from '../utils/logger';
import { PoseData } from '../services/BaseExerciseAnalyzer';

/**
 * Controller for lateral raise analysis
 */
export class LateralRaiseAnalysisController {
  private lateralRaiseAnalyzerService: LateralRaiseAnalyzerService;

  constructor() {
    this.lateralRaiseAnalyzerService = new LateralRaiseAnalyzerService();
    
    // Initialize service on startup to avoid cold start delay
    this.lateralRaiseAnalyzerService.initialize().catch(err => {
      logger.warn('Non-critical error during controller initialization:', err);
    });
    
    logger.info('LateralRaiseAnalysisController initialized');
  }

  /**
   * Analyze a single frame of pose data
   * @param poseData The pose data to analyze
   * @returns Analysis results
   */
  async analyzeFrame(poseData: PoseData): Promise<ExerciseAnalysisResponse> {
    try {
      const startTime = Date.now();
      
      // Ensure the service is initialized
      if (!this.lateralRaiseAnalyzerService) {
        logger.error('Lateral raise analyzer service not initialized');
        return {
          success: false,
          error: {
            type: 'ANALYSIS_ERROR',
            severity: 'error',
            message: 'Analyzer service not initialized'
          }
        };
      }
      
      // Process data and get results
      const result = await this.lateralRaiseAnalyzerService.analyzePoseData(poseData);
      const processingTime = Date.now() - startTime;
      
      // Log performance metrics for longer processing times
      if (processingTime > 100) {
        logger.info(`Completed lateral raise analysis in ${processingTime}ms: success=${result.success}`);
      }
      
      return result;
    } catch (error) {
      logger.error('Error in lateral raise analysis controller:', error);
      return {
        success: false,
        error: {
          type: 'ANALYSIS_ERROR',
          severity: 'error',
          message: error instanceof Error ? error.message : 'Unknown error in lateral raise analysis'
        }
      };
    }
  }

  /**
   * Reset the repetition counter
   * @returns True if successful
   */
  async resetRepCounter(): Promise<boolean> {
    try {
      logger.info('RESET_DEBUG: LateralRaiseAnalysisController - Resetting repetition counter');
      
      // Ensure the service is initialized
      if (!this.lateralRaiseAnalyzerService) {
        logger.error('RESET_DEBUG: Lateral raise analyzer service not initialized');
        return false;
      }
      
      const result = await this.lateralRaiseAnalyzerService.resetRepCounter();
      logger.info(`RESET_DEBUG: Reset operation result: ${result}`);
      return result;
    } catch (error) {
      logger.error('RESET_DEBUG: Error resetting lateral raise rep counter:', error);
      return false;
    }
  }
} 