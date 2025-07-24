import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { BaseExerciseAnalyzerService, PoseData } from './BaseExerciseAnalyzer';
import { PythonService, ExerciseType } from './PythonService';
import { ExerciseAnalysisResponse } from '../types/exercise';
import { ExerciseError } from '../types/exercise';

/**
 * Specialized analyzer for lateral raise exercise
 */
export class LateralRaiseAnalyzerService extends BaseExerciseAnalyzerService {
  constructor() {
    super();
    logger.info('LateralRaiseAnalyzerService initialized');
  }
  
  /**
   * Returns the exercise type for this analyzer
   */
  protected getExerciseType(): ExerciseType {
    return 'lateral_raise';
  }
  
  /**
   * Analyzes pose data for lateral raise exercise
   */
  public async analyzePoseData(poseData: PoseData): Promise<ExerciseAnalysisResponse> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        logger.error('Failed to initialize during pose analysis:', error);
        return {
          success: false,
          error: {
            type: 'ANALYSIS_ERROR',
            severity: 'error',
            message: 'Failed to initialize pose analyzer'
          }
        };
      }
    }

    try {
      const validationError = this.validatePoseData(poseData);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      // Pass the exercise type to the Python service
      return await this.pythonService.analyzePose(this.getExerciseType(), poseData);
    } catch (error) {
      logger.error('Error analyzing lateral raise pose:', error);
      return {
        success: false,
        error: {
          type: 'ANALYSIS_ERROR',
          severity: 'error',
          message: error instanceof Error ? error.message : 'Failed to analyze pose'
        }
      };
    }
  }

  /**
   * Reset the repetition counter for this exercise
   * This should be called between sets to reset the counter
   * @override
   */
  public async resetRepCounter(): Promise<boolean> {
    logger.info('RESET_DEBUG: LateralRaiseAnalyzerService - Resetting lateral raise repetition counter');
    const result = await super.resetRepCounter();
    logger.info(`RESET_DEBUG: LateralRaiseAnalyzerService - Reset result: ${result}`);
    return result;
  }

  /**
   * Validate the pose data for lateral raise-specific requirements
   * @override
   */
  protected validatePoseData(poseData: PoseData): ExerciseError | null {
    // Basic validation from the parent class
    const baseError = super.validatePoseData(poseData);
    if (baseError) return baseError;

    // Lateral raise-specific validation could be added here
    return null;
  }
} 