import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { BaseExerciseAnalyzerService, PoseData } from './BaseExerciseAnalyzer';
import { PythonService, ExerciseType } from './PythonService';
import { ExerciseAnalysisResponse } from '../types/exercise';
import { BicepAnalysisResult, BicepMetrics } from '../types/bicep';
import { ExerciseError } from '../types/exercise';

/**
 * Specialized analyzer for bicep curl exercise
 */
export class BicepAnalyzerService extends BaseExerciseAnalyzerService {
  constructor() {
    super();
  }
  
  /**
   * Returns the exercise type for this analyzer
   */
  protected getExerciseType(): ExerciseType {
    return 'bicep';
  }
  
  /**
   * Analyzes pose data for bicep curl exercise
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
      
      // Handle mirroring if needed
      if (poseData.isMirrored === false) {
        // If landmarks are NOT already mirrored, we need to mirror them for the Python service
        logger.info('Landmarks not pre-mirrored, applying mirroring now');
        poseData.poseLandmarks = poseData.poseLandmarks.map(landmark => ({
          ...landmark,
          // Flip the x-coordinate (1.0 - x) to mirror the points
          x: 1.0 - landmark.x
        }));
        // Set the flag to true since we've now mirrored the landmarks
        poseData.isMirrored = true;
      } else {
        // Log whether the landmarks are pre-mirrored, but only ~5% of the time
        if (Math.random() < 0.05) {
          logger.info('Processing pre-mirrored landmarks (x-coordinates already flipped)');
        }
      }

      // Pass the exercise type to the Python service
      return await this.pythonService.analyzePose(this.getExerciseType(), poseData);
    } catch (error) {
      logger.error('Error analyzing bicep pose:', error);
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
    logger.info('RESET_DEBUG: BicepAnalyzerService - Resetting bicep repetition counter');
    const result = await super.resetRepCounter();
    logger.info(`RESET_DEBUG: BicepAnalyzerService - Reset result: ${result}`);
    return result;
  }
} 