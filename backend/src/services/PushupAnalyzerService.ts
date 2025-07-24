import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { ExerciseAnalysisResponse, ExerciseError } from '../types/exercise';
import { PythonService, ExerciseType } from './PythonService';
import { BaseExerciseAnalyzerService, PoseData } from './BaseExerciseAnalyzer';

/**
 * Specialized analyzer for pushup exercise
 */
export class PushupAnalyzerService extends BaseExerciseAnalyzerService {
  constructor() {
    super();
    logger.info('PushupAnalyzerService initialized');
  }
  
  protected getExerciseType(): ExerciseType {
    return 'pushup';
  }

  public async analyzePoseData(poseData: PoseData): Promise<ExerciseAnalysisResponse> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        logger.error('Failed to initialize pushup analyzer:', error);
        return {
          success: false,
          error: {
            type: 'ANALYSIS_ERROR',
            severity: 'error',
            message: 'Failed to initialize pushup analyzer'
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
      logger.error('Error analyzing pushup pose:', error);
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
    logger.info('RESET_DEBUG: PushupAnalyzerService - Resetting pushup repetition counter');
    const result = await super.resetRepCounter();
    logger.info(`RESET_DEBUG: PushupAnalyzerService - Reset result: ${result}`);
    return result;
  }

  /**
   * Validates the pose data for pushup analysis
   * @param poseData The pose data to validate
   * @returns ExerciseError or null if valid
   */
  protected validatePoseData(poseData: PoseData): ExerciseError | null {
    // Basic validation
    const baseValidation = super.validatePoseData(poseData);
    if (baseValidation) {
      return baseValidation;
    }
    
    // We'll let the Python analyzer handle the detailed validation
    // and just do basic checks here
    return null;
  }
} 