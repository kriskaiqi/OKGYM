// MediaPipe pose landmarks type
export interface MediaPipeLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

// MediaPipe pose results type
export interface MediaPipeResults {
  poseLandmarks: MediaPipeLandmark[];
  poseWorldLandmarks?: MediaPipeLandmark[];
  segmentationMask?: ImageData;
}

// Configuration options for MediaPipe Pose
export interface MediaPipeConfig {
  modelComplexity: number;
  smoothLandmarks: boolean;
  enableSegmentation: boolean;
  smoothSegmentation: boolean;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}

// Important landmarks that we need for analysis
export const IMPORTANT_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28
};

// Type guard to check if results are valid MediaPipeResults
export function isMediaPipeResults(results: any): results is MediaPipeResults {
  return results && 
         Array.isArray(results.poseLandmarks) && 
         results.poseLandmarks.length > 0;
} 