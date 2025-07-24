import { Results, PoseConfig } from '@mediapipe/pose';
import { CameraOptions } from '@mediapipe/camera_utils';

// Re-export MediaPipe types for easier access
export type MediaPipeResults = Results;
export type MediaPipeConfig = PoseConfig;
export type { CameraOptions };

// Export types from the types.ts file
export type { MediaPipeLandmark } from './types';
export { 
  IMPORTANT_LANDMARKS,
  isMediaPipeResults
} from './types';

// Simplified landmark validation - no longer checks for visibility or missing landmarks
// Just verifies that landmarks array exists and has content
export const validateLandmarks = (landmarks: any[]): boolean => {
  return Array.isArray(landmarks) && landmarks.length > 0;
}; 