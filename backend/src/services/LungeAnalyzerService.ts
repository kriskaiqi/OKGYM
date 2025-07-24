import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { ExerciseAnalysisResponse, ExerciseError } from '../types/exercise';
import { PythonService, ExerciseType } from './PythonService';
import { BaseExerciseAnalyzerService, PoseData } from './BaseExerciseAnalyzer';

/**
 * Specialized analyzer for lunge exercise
 */
export class LungeAnalyzerService extends BaseExerciseAnalyzerService {
  constructor() {
    super();
  }
  
  protected getExerciseType(): ExerciseType {
    return 'lunge';
  }
  
  /**
   * Initialize the analyzer with any necessary setup
   * @override
   */
  public async initialize(): Promise<void> {
    logger.info('LungeAnalyzerService - Initializing');
    try {
      const initSuccess = await this.pythonService.initialize();
      if (initSuccess) {
        this.isInitialized = true;
        logger.info('LungeAnalyzerService - Initialization successful');
      } else {
        logger.error('LungeAnalyzerService - Initialization failed');
      }
    } catch (error) {
      logger.error('LungeAnalyzerService - Error during initialization:', error);
      throw new Error('Failed to initialize LungeAnalyzerService');
    }
  }
  
  /**
   * Validates the pose data before sending it for analysis
   * @override
   */
  protected validatePoseData(poseData: PoseData): ExerciseError | null {
    // Ensure we have pose landmarks
    if (!poseData || !poseData.poseLandmarks || !Array.isArray(poseData.poseLandmarks)) {
      return {
        type: 'INVALID_INPUT',
        severity: 'error',
        message: 'Missing pose landmarks data'
      };
    }
    
    // Ensure we have enough landmarks (33 is the standard for MediaPipe Pose)
    if (poseData.poseLandmarks.length < 33) {
      return {
        type: 'INVALID_INPUT',
        severity: 'error',
        message: `Insufficient landmarks: expected 33, got ${poseData.poseLandmarks.length}`
      };
    }
    
    // Check that landmarks have the required properties
    for (let i = 0; i < poseData.poseLandmarks.length; i++) {
      const landmark = poseData.poseLandmarks[i];
      if (typeof landmark.x !== 'number' || 
          typeof landmark.y !== 'number' || 
          typeof landmark.visibility !== 'number') {
        return {
          type: 'INVALID_LANDMARK',
          severity: 'error',
          message: `Invalid landmark at index ${i}: missing required properties`
        };
      }
    }
    
    // All validations passed
    return null;
  }
  
  /**
   * Reset the repetition counter for this exercise
   * This should be called between sets to reset the counter
   * @override
   */
  public async resetRepCounter(): Promise<boolean> {
    logger.info('RESET_DEBUG: LungeAnalyzerService - Resetting lunge repetition counter');
    const result = await super.resetRepCounter();
    logger.info(`RESET_DEBUG: LungeAnalyzerService - Reset result: ${result}`);
    return result;
  }
} 