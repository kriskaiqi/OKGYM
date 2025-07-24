import { ShoulderPressAnalyzerService } from '../services/ShoulderPressAnalyzerService';
import { ExerciseAnalysisResponse } from '../types/exercise';
import logger from '../utils/logger';
import { PoseData } from '../services/BaseExerciseAnalyzer';

/**
 * Controller for shoulder press exercise analysis
 */
export class ShoulderPressAnalysisController {
  private analyzer: ShoulderPressAnalyzerService;

  constructor() {
    this.analyzer = new ShoulderPressAnalyzerService();
    logger.info('ShoulderPressAnalysisController initialized');
  }

  /**
   * Analyze a single frame of shoulder press pose data
   */
  public async analyzeFrame(poseData: PoseData): Promise<ExerciseAnalysisResponse> {
    return this.analyzer.analyzePoseData(poseData);
  }

  /**
   * Reset the repetition counter for shoulder press exercise
   */
  public async resetRepCounter(): Promise<boolean> {
    try {
      logger.info('RESET_DEBUG: ShoulderPressAnalysisController - Resetting shoulder press rep counter');
      const result = await this.analyzer.resetRepCounter();
      logger.info(`RESET_DEBUG: ShoulderPressAnalysisController - Reset result: ${result}`);
      return result;
    } catch (error) {
      logger.error('RESET_DEBUG: ShoulderPressAnalysisController - Error resetting shoulder press rep counter:', error);
      return false;
    }
  }
} 