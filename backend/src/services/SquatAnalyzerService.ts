import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { ExerciseAnalysisResponse } from '../types/exercise';
import { PythonService, ExerciseType } from './PythonService';
import { BaseExerciseAnalyzerService, PoseData } from './BaseExerciseAnalyzer';

/**
 * Specialized analyzer for squat exercise
 */
export class SquatAnalyzerService extends BaseExerciseAnalyzerService {
  constructor() {
    super();
  }
  
  protected getExerciseType(): ExerciseType {
    return 'squat';
  }

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
      logger.error('Error analyzing squat pose:', error);
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
    logger.info('RESET_DEBUG: SquatAnalyzerService - Resetting squat repetition counter');
    const result = await super.resetRepCounter();
    logger.info(`RESET_DEBUG: SquatAnalyzerService - Reset result: ${result}`);
    return result;
  }
} 