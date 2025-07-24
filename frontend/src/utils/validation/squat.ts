import { MediaPipeLandmark } from '../../types/ai/mediapipe/types';
import { 
  ValidationResult, 
  validatePoseLandmarks, 
  PoseValidationConfig, 
  DEFAULT_POSE_VALIDATION 
} from './pose';

export interface SquatValidationConfig extends PoseValidationConfig {
  minKneeAngle: number;
  maxKneeAngle: number;
  minHipAngle: number;
  maxHipAngle: number;
  minAnkleAngle: number;
  maxAnkleAngle: number;
}

export const DEFAULT_SQUAT_VALIDATION: SquatValidationConfig = {
  ...DEFAULT_POSE_VALIDATION,
  minKneeAngle: 90,
  maxKneeAngle: 170,
  minHipAngle: 90,
  maxHipAngle: 170,
  minAnkleAngle: 70,
  maxAnkleAngle: 110
};

const calculateAngle = (
  point1: MediaPipeLandmark,
  point2: MediaPipeLandmark,
  point3: MediaPipeLandmark
): number => {
  const radians = Math.atan2(
    point3.y - point2.y,
    point3.x - point2.x
  ) - Math.atan2(
    point1.y - point2.y,
    point1.x - point2.x
  );

  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

export const validateSquatForm = (
  landmarks: MediaPipeLandmark[],
  config: SquatValidationConfig = DEFAULT_SQUAT_VALIDATION
): ValidationResult => {
  // First validate basic pose landmarks
  const baseValidation = validatePoseLandmarks(landmarks, config);
  
  // We're only interested in critical missing or invalid errors
  baseValidation.errors = baseValidation.errors.filter(err => 
    err.severity === 'error'
  );
  
  // If there are remaining critical errors, return them
  if (baseValidation.errors.length > 0) {
    baseValidation.isValid = false;
    return baseValidation;
  }

  const result: ValidationResult = {
    isValid: true,
    errors: []
  };

  // Calculate angles
  const leftKneeAngle = calculateAngle(
    landmarks[23], // left hip
    landmarks[25], // left knee
    landmarks[27]  // left ankle
  );

  const rightKneeAngle = calculateAngle(
    landmarks[24], // right hip
    landmarks[26], // right knee
    landmarks[28]  // right ankle
  );

  const leftHipAngle = calculateAngle(
    landmarks[11], // left shoulder
    landmarks[23], // left hip
    landmarks[25]  // left knee
  );

  const rightHipAngle = calculateAngle(
    landmarks[12], // right shoulder
    landmarks[24], // right hip
    landmarks[26]  // right knee
  );

  const leftAnkleAngle = calculateAngle(
    landmarks[25], // left knee
    landmarks[27], // left ankle
    landmarks[31]  // left foot
  );

  const rightAnkleAngle = calculateAngle(
    landmarks[26], // right knee
    landmarks[28], // right ankle
    landmarks[32]  // right foot
  );

  // Check knee angles
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  if (avgKneeAngle < config.minKneeAngle || avgKneeAngle > config.maxKneeAngle) {
    result.isValid = false;
    result.errors.push({
      type: 'invalid',
      message: `Knee angle (${Math.round(avgKneeAngle)}°) outside valid range (${config.minKneeAngle}°-${config.maxKneeAngle}°)`,
      landmarks: [25, 26, 27, 28], // knee and ankle landmarks
      severity: 'error'
    });
  }

  // Check hip angles
  const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;
  if (avgHipAngle < config.minHipAngle || avgHipAngle > config.maxHipAngle) {
    result.isValid = false;
    result.errors.push({
      type: 'invalid',
      message: `Hip angle (${Math.round(avgHipAngle)}°) outside valid range (${config.minHipAngle}°-${config.maxHipAngle}°)`,
      landmarks: [23, 24, 25, 26], // hip and knee landmarks
      severity: 'error'
    });
  }

  // Check ankle angles
  const avgAnkleAngle = (leftAnkleAngle + rightAnkleAngle) / 2;
  if (avgAnkleAngle < config.minAnkleAngle || avgAnkleAngle > config.maxAnkleAngle) {
    result.isValid = false;
    result.errors.push({
      type: 'invalid',
      message: `Ankle angle (${Math.round(avgAnkleAngle)}°) outside valid range (${config.minAnkleAngle}°-${config.maxAnkleAngle}°)`,
      landmarks: [27, 28, 31, 32], // ankle and foot landmarks
      severity: 'error'
    });
  }

  return result;
}; 