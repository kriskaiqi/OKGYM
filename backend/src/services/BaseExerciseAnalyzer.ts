import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { ExerciseAnalysisResponse, ExerciseError } from '../types/exercise';
import { PythonService, ExerciseType } from './PythonService';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseData {
  poseLandmarks: PoseLandmark[];
  timestamp: number;
  isMirrored?: boolean; // Flag indicating if the landmarks have been pre-mirrored
}

/**
 * Abstract base class for exercise analyzers
 * This will allow for creating specialized analyzers for different exercises
 */
export abstract class BaseExerciseAnalyzerService {
  protected pythonService: PythonService;
  protected isInitialized: boolean = false;
  
  constructor() {
    // All exercise analyzers share a single Python service
    this.pythonService = new PythonService();
  }
  
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const initialized = await this.pythonService.initialize();
      if (!initialized) {
        throw new AppError('Failed to initialize Python service', 500);
      }
      this.isInitialized = true;
      logger.info(`${this.constructor.name} initialized successfully`);
    } catch (error) {
      logger.error(`Failed to initialize ${this.constructor.name}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to initialize pose analyzer', 500);
    }
  }
  
  protected validatePoseData(poseData: PoseData): ExerciseError | null {
    if (!poseData || !Array.isArray(poseData.poseLandmarks)) {
      return {
        type: 'INVALID_INPUT',
        severity: 'error',
        message: 'Invalid pose data: missing landmarks'
      };
    }

    for (const landmark of poseData.poseLandmarks) {
      if (typeof landmark.x !== 'number' || 
          typeof landmark.y !== 'number' || 
          typeof landmark.z !== 'number' || 
          typeof landmark.visibility !== 'number') {
        return {
          type: 'INVALID_LANDMARK',
          severity: 'error',
          message: 'Invalid landmark data: missing coordinates or visibility'
        };
      }
    }

    return null;
  }
  
  // Implementation of analyzePoseData that can be used by derived classes
  public async analyzePoseData(poseData: PoseData): Promise<ExerciseAnalysisResponse> {
    // Initialize if not already initialized
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
            message: 'Failed to initialize exercise analyzer'
          }
        };
      }
    }
    
    // Validate the pose data
    const validationError = this.validatePoseData(poseData);
    if (validationError) {
      return { 
        success: false,
        error: validationError 
      };
    }
    
    try {
      // Get the exercise type
      const exerciseType = this.getExerciseType();
      
      // Analyze the pose using the Python service
      return await this.pythonService.analyzePose(exerciseType, poseData);
    } catch (error) {
      logger.error(`Error analyzing pose data for ${this.getExerciseType()}:`, error);
      return {
        success: false,
        error: {
          type: 'ANALYSIS_ERROR',
          severity: 'error',
          message: error instanceof Error ? error.message : 'Failed to analyze pose data'
        }
      };
    }
  }
  
  // Abstract method to return the exercise type
  protected abstract getExerciseType(): ExerciseType;
  
  /**
   * Reset the repetition counter for an exercise
   * This should be called between sets to reset the counter
   */
  public async resetRepCounter(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        try {
          logger.info('RESET_DEBUG: Service not initialized, initializing before reset');
          await this.initialize();
        } catch (error) {
          logger.error('RESET_DEBUG: Failed to initialize during rep counter reset:', error);
          return false;
        }
      }

      logger.info(`RESET_DEBUG: BaseExerciseAnalyzerService - Resetting repetition counter for ${this.getExerciseType()}`);
      const result = await this.pythonService.resetRepCounter(this.getExerciseType());
      logger.info(`RESET_DEBUG: Python service reset result: ${result}`);
      return result;
    } catch (error) {
      logger.error(`RESET_DEBUG: Error resetting rep counter for ${this.getExerciseType()}:`, error);
      return false;
    }
  }
} 