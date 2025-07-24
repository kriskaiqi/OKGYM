import { SitupAnalyzerService } from '../services/SitupAnalyzerService';
import { ExerciseAnalysisResponse } from '../types/exercise';
import logger from '../utils/logger';
import { PoseData } from '../services/BaseExerciseAnalyzer';

/**
 * Controller for situp exercise analysis
 */
export class SitupAnalysisController {
  private analyzer: SitupAnalyzerService;

  constructor() {
    this.analyzer = new SitupAnalyzerService();
    logger.info('SitupAnalysisController initialized');
  }

  /**
   * Analyze a single frame of situp pose data
   */
  public async analyzeFrame(poseData: PoseData): Promise<ExerciseAnalysisResponse> {
    try {
      // Log processing start
      if (poseData.poseLandmarks && poseData.poseLandmarks.length > 0) {
        logger.info(`Processing ${poseData.poseLandmarks.length} landmarks for situp analysis`);
      }
      
      const startTime = Date.now();
      
      // Process with analyzer service
      const result = await this.analyzer.analyzePoseData(poseData);
      const processingTime = Date.now() - startTime;
      
      // Log performance metrics only for longer processing times
      if (processingTime > 100) {
        logger.info(`Completed situp analysis in ${processingTime}ms: success=${result.success}, has result=${!!result.result}`);
      }
      
      return result;
    } catch (error) {
      logger.error('Error analyzing situp frame:', error);
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
   * Reset the repetition counter for situp exercise
   */
  public async resetRepCounter(): Promise<boolean> {
    try {
      logger.info('RESET_DEBUG: SitupAnalysisController - Resetting situp rep counter');
      const result = await this.analyzer.resetRepCounter();
      logger.info(`RESET_DEBUG: SitupAnalysisController - Reset result: ${result}`);
      return result;
    } catch (error) {
      logger.error('RESET_DEBUG: SitupAnalysisController - Error resetting situp rep counter:', error);
      return false;
    }
  }
} 