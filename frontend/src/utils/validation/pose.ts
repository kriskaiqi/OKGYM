import { MediaPipeLandmark, MediaPipeResults } from '../../types/ai/mediapipe/types';

export interface ValidationError {
  type: 'missing' | 'invalid';
  message: string;
  landmarks?: number[];
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface PoseValidationConfig {
  requiredLandmarks: number[];
  minConfidence: number;
}

export const DEFAULT_POSE_VALIDATION: PoseValidationConfig = {
  requiredLandmarks: [
    11, 12, // shoulders
    23, 24, // hips
    25, 26, // knees
    27, 28  // ankles
  ],
  minConfidence: 0.7
};

export const validatePoseLandmarks = (
  landmarks: MediaPipeLandmark[],
  config: PoseValidationConfig = DEFAULT_POSE_VALIDATION
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: []
  };

  if (!landmarks || landmarks.length === 0) {
    return {
      isValid: false,
      errors: [{
        type: 'missing',
        message: 'No landmarks detected',
        severity: 'error'
      }]
    };
  }

  // Check required landmarks
  const missingLandmarks = config.requiredLandmarks.filter(
    index => !landmarks[index]
  );

  if (missingLandmarks.length > 0) {
    result.isValid = false;
    result.errors.push({
      type: 'missing',
      message: 'Required landmarks are missing',
      landmarks: missingLandmarks,
      severity: 'error'
    });
  }

  return result;
};

export const validatePoseResults = (
  results: unknown,
  config: PoseValidationConfig = DEFAULT_POSE_VALIDATION
): ValidationResult => {
  // Type check
  if (!isPoseResults(results)) {
    return {
      isValid: false,
      errors: [{
        type: 'invalid',
        message: 'Invalid pose results format',
        severity: 'error'
      }]
    };
  }

  // Validate landmarks
  return validatePoseLandmarks(results.poseLandmarks, config);
};

export const isPoseResults = (results: unknown): results is MediaPipeResults => {
  return (
    results !== null &&
    typeof results === 'object' &&
    'poseLandmarks' in results &&
    Array.isArray((results as MediaPipeResults).poseLandmarks) &&
    (results as MediaPipeResults).poseLandmarks.every(
      (landmark): landmark is MediaPipeLandmark =>
        landmark !== null &&
        typeof landmark === 'object' &&
        typeof landmark.x === 'number' &&
        typeof landmark.y === 'number' &&
        typeof landmark.z === 'number' &&
        typeof landmark.visibility === 'number'
    )
  );
};