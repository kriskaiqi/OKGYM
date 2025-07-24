import logger from '../utils/logger';
import { ExerciseAnalyzerFactory } from '../services/ExerciseAnalyzerFactory';
import { PlankAnalyzerService } from '../services/PlankAnalyzerService';
import { PoseData } from '../services/BaseExerciseAnalyzer';

/**
 * Controller for plank exercise analysis
 */
export class PlankAnalysisController {
  private plankAnalyzerService: PlankAnalyzerService;
  
  constructor() {
    logger.info('Initializing PlankAnalysisController and its analyzer service');
    
    // Get analyzer from factory
    const analyzerFactory = ExerciseAnalyzerFactory.getInstance();
    this.plankAnalyzerService = analyzerFactory.getAnalyzer('plank') as PlankAnalyzerService;
    
    // Initialize the analyzer service
    this.plankAnalyzerService.initialize()
      .then(() => {
        logger.info('PlankAnalysisController initialized successfully');
      })
      .catch(err => {
        logger.warn('Non-critical error during PlankAnalysisController initialization:', err);
      });
  }
  
  /**
   * Analyze a frame of pose data
   * @param poseData Data from the pose detection
   * @returns Analysis result
   */
  public async analyzeFrame(poseData: PoseData) {
    try {
      logger.debug('PlankAnalysisController - Analyzing frame');
      const result = await this.plankAnalyzerService.analyzePoseData(poseData);
      return result;
    } catch (error) {
      logger.error('Error in plank pose analysis:', error);
      return {
        success: false,
        error: {
          type: 'ANALYSIS_ERROR',
          severity: 'error',
          message: 'Error analyzing plank pose',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Reset the plank timer
   * @returns Success status
   */
  public async resetTimer() {
    try {
      logger.info('RESET_DEBUG: PlankAnalysisController - Resetting plank timer');
      const success = await this.plankAnalyzerService.resetTimer();
      return success;
    } catch (error) {
      logger.error('Error resetting plank timer:', error);
      return false;
    }
  }
  
  /**
   * Reset rep counter (alias for resetTimer)
   * @returns Success status
   */
  public async resetRepCounter() {
    return this.resetTimer();
  }
} 