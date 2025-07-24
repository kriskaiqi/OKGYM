import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import { MediaPipeConfig } from '../types/ai/mediapipe';
import { ExerciseError } from '../types/ai/exercise';
import { logger } from '../utils/logger';

// Simple context type with minimal needed functions
export interface PoseDetectionContextType {
  pose: Pose | null;
  isPoseModelReady: boolean;
  error: ExerciseError | null;
  registerResultsHandler: (handler: (results: Results) => void) => void;
  unregisterResultsHandler: () => void;
}

// Create context
const PoseDetectionContext = createContext<PoseDetectionContextType | null>(null);

// Default configuration - set to balanced performance
const DEFAULT_POSE_CONFIG: MediaPipeConfig = {
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
};

export const PoseDetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State and refs
  const [isPoseModelReady, setIsPoseModelReady] = useState(false);
  const [error, setError] = useState<ExerciseError | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const resultsHandlerRef = useRef<((results: Results) => void) | null>(null);

  // Initialize pose detection once
  useEffect(() => {
    let mounted = true;
    
    const initializePose = async () => {
      if (poseRef.current) return;
      
      try {
        logger.info('Initializing pose detection');
        
        // Create pose instance
        const pose = new Pose({
          locateFile: (file) => `/mediapipe/${file}`
        });
        
        // Configure pose
        await pose.setOptions(DEFAULT_POSE_CONFIG);
        
        // Set up results handler
        pose.onResults((results) => {
          if (resultsHandlerRef.current) {
            try {
              resultsHandlerRef.current(results);
            } catch (err) {
              logger.error('Error in results handler:', err);
            }
          }
        });
        
        // Store reference and update state
        poseRef.current = pose;
        if (mounted) {
          setIsPoseModelReady(true);
          logger.info('Pose model initialized successfully');
        }
      } catch (error) {
          logger.error('Error initializing pose:', error);
        if (mounted) {
          setError({
            type: 'ANALYSIS_ERROR',
            severity: 'error',
            message: 'Failed to initialize pose detection'
          });
        }
      }
    };
    
    initializePose();
    
    // Cleanup
    return () => {
      mounted = false;
      if (poseRef.current) {
        try {
          poseRef.current.close();
          poseRef.current = null;
        } catch (err) {
          logger.warn('Error closing pose:', err);
        }
      }
    };
  }, []);
  
  // Register results handler
  const registerResultsHandler = (handler: (results: Results) => void) => {
    if (!handler) return;
    resultsHandlerRef.current = handler;
  };

  // Unregister results handler
  const unregisterResultsHandler = () => {
    resultsHandlerRef.current = null;
  };

  // Create context value
  const contextValue: PoseDetectionContextType = {
    pose: poseRef.current,
    isPoseModelReady,
    error,
    registerResultsHandler,
    unregisterResultsHandler
  };
  
  return (
    <PoseDetectionContext.Provider value={contextValue}>
      {children}
    </PoseDetectionContext.Provider>
  );
};

// Hook to use the pose detection context
export const usePoseDetection = () => {
  const context = useContext(PoseDetectionContext);
  
  if (!context) {
    throw new Error('usePoseDetection must be used within a PoseDetectionProvider');
  }
  
  return context;
}; 