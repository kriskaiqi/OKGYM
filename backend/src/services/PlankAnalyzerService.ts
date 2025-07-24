import logger from '../utils/logger';
import { BaseExerciseAnalyzerService, PoseData } from './BaseExerciseAnalyzer';
import { ExerciseType } from './PythonService';
import { ExerciseAnalysisResponse } from '../types/exercise';

export class PlankAnalyzerService extends BaseExerciseAnalyzerService {
  private accumulatedDuration: number = 0;
  private lastTimestamp: number = 0;
  private isInCorrectForm: boolean = false;

  constructor() {
    super();
    logger.info('PlankAnalyzerService initialized');
  }

  /**
   * Get the exercise type for plank
   * @returns The exercise type
   */
  protected getExerciseType(): ExerciseType {
    return 'plank';
  }

  /**
   * Maps plank-specific stages from Python to standard ExerciseStage types
   * @param plankStage The plank stage from Python
   * @returns A standard ExerciseStage value
   */
  private mapPlankStageToExerciseStage(plankStage: string): 'up' | 'down' | 'middle' | 'unknown' {
    switch (plankStage) {
      case 'correct':
        return 'up';  // 'up' represents correct form in plank
      case 'high_back':
        return 'down'; // 'down' represents high back error
      case 'low_back':
        return 'middle'; // 'middle' represents low back error
      default:
        return 'unknown';
    }
  }

  /**
   * Analyze pose data for plank exercise
   * @param poseData The pose data to analyze
   * @returns Analysis result
   */
  public async analyzePoseData(poseData: PoseData): Promise<ExerciseAnalysisResponse> {
    // First, use the base class implementation to initialize and validate
    const baseResult = await super.analyzePoseData(poseData);
    
    // If validation failed or another error occurred, return the base result
    if (!baseResult.success || !baseResult.result) {
      return baseResult;
    }
    
    try {
      // Get the raw result with plank-specific stages before they're mapped to standard stages
      const rawResult = baseResult.result;
      
      // Extract the original plank stage from the raw result
      // The Python analyzer stores this in metrics.originalData.stage
      const originalData = rawResult.metrics?.originalData as any || {};
      const plankStage = originalData.stage || 'unknown';
      
      // Get the current timestamp
      const currentTimestamp = Date.now();
      
      // If this is the first frame or a reset occurred, initialize lastTimestamp
      if (this.lastTimestamp === 0) {
        this.lastTimestamp = currentTimestamp;
      }

      // Check if the current form is correct based on the original plank stage
      const isCurrentlyCorrect = plankStage === 'correct';
      
      // If form is correct, accumulate duration
      if (isCurrentlyCorrect && this.isInCorrectForm) {
        const elapsedSeconds = (currentTimestamp - this.lastTimestamp) / 1000;
        this.accumulatedDuration += elapsedSeconds;
      }
      
      // Update form state
      this.isInCorrectForm = isCurrentlyCorrect;
      
      // Ensure metrics object exists
      if (!rawResult.metrics) {
        rawResult.metrics = {};
      }
      
      // Add duration and plank stage to metrics
      rawResult.metrics.durationInSeconds = Math.floor(this.accumulatedDuration);
      (rawResult.metrics as any).plankStage = plankStage; // Use type assertion for custom property
      
      // Map the plank stage to a standard ExerciseStage
      rawResult.stage = this.mapPlankStageToExerciseStage(plankStage);
      
      // Update timestamp for next calculation
      this.lastTimestamp = currentTimestamp;

      return baseResult;
    } catch (error) {
      logger.error(`Error in plank-specific pose analysis: ${error}`);
      return {
        success: false,
        error: {
          type: 'ANALYSIS_ERROR',
          severity: 'error',
          message: `Error in plank-specific analysis: ${error instanceof Error ? error.message : String(error)}`
        }
      };
    }
  }

  /**
   * Reset the plank timer
   * @returns Success status
   */
  public async resetTimer(): Promise<boolean> {
    try {
      // Reset local state variables
      this.accumulatedDuration = 0;
      this.lastTimestamp = 0;
      this.isInCorrectForm = false;
      
      // Propagate reset to Python service via base class method
      const pythonServiceResult = await super.resetRepCounter();
      
      logger.info('Plank timer reset successfully');
      return pythonServiceResult;
    } catch (error) {
      logger.error(`Error resetting plank timer: ${error}`);
      return false;
    }
  }

  /**
   * Reset rep counter - overrides the base class method
   * For plank, this resets the timer instead of rep counter
   * @returns Success status
   */
  public async resetRepCounter(): Promise<boolean> {
    return this.resetTimer();
  }
} 