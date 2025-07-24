export const AI_CONFIG = {
  MEDIAPIPE: {
    MODEL_COMPLEXITY: 1,
    SMOOTH_LANDMARKS: true,
    MIN_DETECTION_CONFIDENCE: 0.5,
    MIN_TRACKING_CONFIDENCE: 0.5
  },
  SQUAT: {
    IMPORTANT_LANDMARKS: [
      'nose',
      'left_shoulder', 'right_shoulder',
      'left_hip', 'right_hip',
      'left_knee', 'right_knee',
      'left_ankle', 'right_ankle'
    ],
    THRESHOLDS: {
      FOOT_SHOULDER_RATIO: {
        MIN: 1.0,
        MAX: 1.5
      },
      KNEE_FOOT_RATIO: {
        UP: { MIN: 0.9, MAX: 1.1 },
        MIDDLE: { MIN: 0.85, MAX: 1.15 },
        DOWN: { MIN: 0.8, MAX: 1.2 }
      },
      VISIBILITY: 0.5
    }
  },
  ANALYSIS: {
    FRAME_RATE: 10,
    RESOLUTION: {
      WIDTH: 640,
      HEIGHT: 480
    }
  }
}; 