import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { 
  MediaPipeResults, 
} from '../../../../types/ai/mediapipe';
import BaseExerciseAnalyzer from '../BaseExerciseAnalyzer';
import { ExerciseError, ExerciseAnalysisResult } from '../../../../types/ai/exercise';
import { logger } from '../../../../utils/logger';
import BicepMetricsDisplay from './BicepMetricsDisplay';
import { BicepMetrics } from '../../../../types/bicep';
import { AudioCueType, ExerciseType } from '../../../../hooks/useAudioCues';
import { useAudioCueContext } from '../../../../contexts/AudioCueContext';
import ExerciseAnalysisLayout from '../../layout/ExerciseAnalysisLayout';

// Add the resetBicepCounter property to Window interface
declare global {
  interface Window {
    resetBicepCounter?: () => void;
  }
}

export interface BicepAnalysisResult {
  stage: string;
  metrics: Record<string, any>;
  errors: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
  formScore: number;
  repCount: number;
}

// Skip frames to reduce server load - only send every 3rd frame
const FRAME_SKIP_COUNT = 2;

// Track if connection attempt is in progress
let isConnecting = false;

interface BicepAnalyzerProps {
  onAnalysisComplete: (results: ExerciseAnalysisResult) => void;
  onError: (error: ExerciseError | null) => void;
  isAnalyzing?: boolean;
  targetReps?: number; // Add prop for target repetitions
}

const BicepAnalyzer = forwardRef<{ resetCounter: () => void }, BicepAnalyzerProps>(
  ({ onAnalysisComplete, onError, isAnalyzing = true, targetReps = 10 }, ref) => {
    // Minimal state
    const [apiReady, setApiReady] = useState(false);
    const frameCounter = useRef<number>(0);
    
    // Analysis state
    const [showMetrics, setShowMetrics] = useState(true);
    
    // Add state for tracking current metrics and errors
    const [currentMetrics, setCurrentMetrics] = useState<BicepMetrics>({});
    const [currentErrors, setCurrentErrors] = useState<Array<{type: string; message: string; severity: string}>>([]);
    
    // Track rep count for audio cues
    const [lastRepCount, setLastRepCount] = useState(0);
    
    // Track detected error types to avoid repeating audio cues
    const [detectedErrorTypes, setDetectedErrorTypes] = useState<Set<string>>(new Set());
    
    // Access audio cue context
    const { playCue, playExerciseTypeCue } = useAudioCueContext();
    
    // Create HTTP-based API connection
    const connectAPI = useCallback(() => {
      if (isConnecting) return;
      isConnecting = true;
      
      try {
        logger.info('Setting up HTTP-based API connection for bicep analysis');
        
        // Simulate connection established
        setApiReady(true);
        isConnecting = false;
        
        // Log success
        logger.info('API connection ready for bicep analysis');
      } catch (error) {
        logger.error('Error setting up API connection:', error);
        isConnecting = false;
        
        // Retry after delay
        setTimeout(connectAPI, 3000);
      }
    }, []);
    
    // Reset counter via HTTP API
    const resetCounter = useCallback(() => {
      try {
        // Use HTTP endpoint instead of WebSocket
        fetch('http://localhost:3001/api/bicep/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseType: 'bicep' })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            logger.info('Successfully reset bicep counter');
            // Reset metrics and errors
            setCurrentMetrics({});
            setCurrentErrors([]);
            setLastRepCount(0);
          } else {
            logger.error('Failed to reset bicep counter:', data.error);
          }
        })
        .catch(error => {
          logger.error('Error resetting bicep counter:', error);
        });
      } catch (error) {
        logger.error('Error preparing reset counter request:', error);
      }
    }, []);

    // Expose the reset method to parent components via ref
    useImperativeHandle(ref, () => ({
      resetCounter: resetCounter
    }), [resetCounter]);

    // Expose the reset counter method
    useEffect(() => {
      // Add event listener for set completion
      const handleSetComplete = () => {
        resetCounter();
      };
      
      window.addEventListener('workout_set_complete', handleSetComplete);
      
      // Also expose the reset function globally for debugging
      window.resetBicepCounter = resetCounter;
      
      return () => {
        window.removeEventListener('workout_set_complete', handleSetComplete);
        delete window.resetBicepCounter;
      };
    }, [resetCounter]);

    // Handle connection monitoring with minimal code
    useEffect(() => {
      // Ensure we have a connection on mount
      connectAPI();
      
      // Very simple connection checker - just verify every 5 seconds
      const interval = setInterval(() => {
        if (!apiReady) {
          connectAPI();
        }
      }, 5000);
      
      return () => {
        clearInterval(interval);
      };
    }, [connectAPI, apiReady]);
    
    // Handler for API response
    const handleAnalysisResponse = useCallback((data: any) => {
      if (data.result) {
        // Extract rep count to check for changes
        const newRepCount = data.result.repCount || 0;
        
        // Create a complete metrics object with all required fields
        const updatedMetrics = {
          ...(data.result.metrics || {}),
          repCount: data.result.repCount,
          stage: data.result.stage,
          formScore: data.result.formScore
        };
        
        // Update our state with the latest metrics and errors
        setCurrentMetrics(updatedMetrics);
        setCurrentErrors(data.result.errors || []);
        
        // Debug log
        logger.info(`Received stage value: ${data.result.stage}`);
        logger.info(`Received form score: ${data.result.formScore}`);
        
        // Check if rep count has increased
        if (newRepCount > lastRepCount) {
          // Play audio cue for bicep curl (upper body pull)
          if (newRepCount === 1) {
            // First rep - play form guidance
            // Audio: PEAK_CONTRACTION - "Squeeze at the top"
            playExerciseTypeCue(ExerciseType.UPPER_BODY_PULL, 0, targetReps);
          } else if (targetReps > 0 && newRepCount / targetReps >= 0.7 && newRepCount / targetReps < 0.9) {
            // Later reps - motivation (dynamically calculated based on target)
            // Audio: PUSH_THROUGH - "Push through!"
            playCue(AudioCueType.PUSH_THROUGH);
          } else if (targetReps > 0 && newRepCount === targetReps) {
            // Final rep based on actual target
            // Audio: FINAL_REP - "Last rep!"
            playCue(AudioCueType.FINAL_REP);
          }
          
          // Reset detected errors when rep count increases
          setDetectedErrorTypes(new Set());
        }
        
        // Handle form errors with specific audio cues
        if (data.result.errors && data.result.errors.length > 0) {
          // Get current error types
          const currentErrorTypes = new Set<string>(data.result.errors.map((e: any) => e.type as string));
          
          // Find new error types that weren't previously detected
          const newErrors = Array.from(currentErrorTypes).filter(type => !detectedErrorTypes.has(type));
          
          // Play specific audio cue for form correction errors only
          if (newErrors.length > 0) {
            setTimeout(() => {
              // Play audio cues only for specific form errors
              if (newErrors.includes('lean_back')) {
                // Audio: BACK_STRAIGHT - "Keep your back straight"
                playCue(AudioCueType.BACK_STRAIGHT);
              } else if (newErrors.includes('loose_upper_arm')) {
                // Audio: ELBOW_POSITION - "Elbows at 90 degrees"
                playCue(AudioCueType.ELBOW_POSITION);
              }
              // Remove peak contraction audio cue
              
              // Update detected error types
              const updatedErrorTypes = new Set<string>([...Array.from(detectedErrorTypes), ...newErrors]);
              setDetectedErrorTypes(updatedErrorTypes);
            }, 800);
          }
        }
        
        // Update last rep count
        setLastRepCount(newRepCount);
        
        // Pass to callback
        onAnalysisComplete(data.result);
      }
      
      if (data.error) {
        onError({
          type: 'ANALYSIS_ERROR', 
          message: data.error.message, 
          severity: 'error'
        });
      }
    }, [onAnalysisComplete, onError, lastRepCount, playCue, playExerciseTypeCue, targetReps, detectedErrorTypes]);
    
    // Process pose results via HTTP API
    const handleResults = useCallback((results: MediaPipeResults) => {
      if (!isAnalyzing || !apiReady || !results.poseLandmarks) {
        return;
      }
      
      frameCounter.current++;
      if (frameCounter.current % (FRAME_SKIP_COUNT + 1) !== 0) {
        return;
      }
      
      try {
        // Format payload to match backend expectations - exactly like the squat implementation
        const payload = {
          landmarks: results.poseLandmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0,
            visibility: lm.visibility || 0
          }))
        };
        
        // Log payload size for debugging
        const payloadJson = JSON.stringify(payload);
        const payloadSize = new Blob([payloadJson]).size;
        if (payloadSize > 16000) {
          logger.warn(`Large payload: ${payloadSize} bytes`);
        }
        
        // Send data to backend via fetch API
        fetch('http://localhost:3001/api/analyze/bicep', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(handleAnalysisResponse)
        .catch(error => {
          logger.error('Error sending pose data via API:', error);
        });
      } catch (error) {
        logger.error('Error preparing pose data for API:', error);
      }
    }, [apiReady, isAnalyzing, handleAnalysisResponse]);

    // Toggle metrics display
    const toggleMetrics = useCallback(() => {
      setShowMetrics(prev => !prev);
    }, []);

    return (
      <ExerciseAnalysisLayout
        videoComponent={
          <BaseExerciseAnalyzer 
            onAnalysisComplete={onAnalysisComplete}
            onError={onError}
            onResults={handleResults}
            metrics={currentMetrics}
            errors={currentErrors as ExerciseError[]}
            exerciseType="bicep_curl"
          />
        }
        metricsComponent={
          showMetrics && (
            <BicepMetricsDisplay 
              metrics={currentMetrics} 
              errors={currentErrors}
            />
          )
        }
      />
    );
  }
);

export default BicepAnalyzer; 