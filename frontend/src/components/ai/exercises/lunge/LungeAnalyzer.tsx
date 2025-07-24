import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { MediaPipeResults } from '../../../../types/ai/mediapipe';
import BaseExerciseAnalyzer from '../BaseExerciseAnalyzer';
import { ExerciseError, ExerciseAnalysisResult, ERROR_TYPES, ERROR_SEVERITIES } from '../../../../types/ai/exercise';
import { logger } from '../../../../utils/logger';
import { LungeMetricsDisplay } from './LungeMetricsDisplay';
import { LungeMetrics, LungeErrorFlags } from '../../../../types/lunge';
import { AudioCueType, ExerciseType } from '../../../../hooks/useAudioCues';
import { useAudioCueContext } from '../../../../contexts/AudioCueContext';
import ExerciseAnalysisLayout from '../../layout/ExerciseAnalysisLayout';

export interface LungeAnalysisResult {
  stage: string;
  metrics: Record<string, number>;
  errors: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
  formScore: number;
  repCount: number;
}

// Skip frames to reduce server load
const FRAME_SKIP_COUNT = 2;

// Track if connection attempt is in progress
let isConnecting = false;

interface LungeAnalyzerProps {
  onAnalysisComplete: (results: ExerciseAnalysisResult) => void;
  onError: (error: ExerciseError | null) => void;
  isAnalyzing?: boolean;
  targetReps?: number; // Add prop for target repetitions
}

// Add reset counter to Window interface
declare global {
  interface Window {
    resetLungeCounter?: () => void;
  }
}

const LungeAnalyzer = forwardRef<{ resetCounter: () => void }, LungeAnalyzerProps>(
  ({ onAnalysisComplete, onError, isAnalyzing = true, targetReps = 10 }, ref) => {
    // State
    const [apiReady, setApiReady] = useState(false);
    const frameCounter = useRef<number>(0);
    const [showMetrics, setShowMetrics] = useState(true);
    const [currentMetrics, setCurrentMetrics] = useState<LungeMetrics>({});
    const [currentErrors, setCurrentErrors] = useState<Array<{type: string; message: string; severity: string}>>([]);
    const [currentErrorFlags, setCurrentErrorFlags] = useState<LungeErrorFlags>({});
    
    // Track rep count for audio cues
    const [lastRepCount, setLastRepCount] = useState(0);
    
    // Track detected error types to avoid repeating audio cues
    const [detectedErrorTypes, setDetectedErrorTypes] = useState<Set<string>>(new Set());
    
    // Access audio cue context
    const { playCue, playExerciseTypeCue } = useAudioCueContext();
    
    // Create a ref to store the filtered exercise errors in the correct format
    const exerciseErrorsRef = useRef<ExerciseError[]>([]);
    
    // Create HTTP-based API connection
    const connectAPI = useCallback(() => {
      if (isConnecting) return;
      isConnecting = true;
    
      try {
        logger.info('Setting up HTTP-based API connection for lunge analysis');
        
        // Simulate connection established
        setApiReady(true);
        isConnecting = false;
        
        // Log success
        logger.info('API connection ready for lunge analysis');
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
        fetch('http://localhost:3001/api/lunge/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseType: 'lunge' })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            logger.info('Successfully reset lunge counter');
            // Reset metrics, errors, and rep tracking state
            setCurrentMetrics({});
            setCurrentErrors([]);
            setCurrentErrorFlags({});
            setLastRepCount(0);
            setDetectedErrorTypes(new Set());
          } else {
            logger.error('Failed to reset lunge counter:', data.error);
          }
        })
        .catch(error => {
          logger.error('Error resetting lunge counter:', error);
        });
      } catch (error) {
        logger.error('Error preparing reset counter request:', error);
      }
    }, []);
    
    // Expose reset method to parent
    useImperativeHandle(ref, () => ({ resetCounter }), [resetCounter]);
    
    // Setup reset event listener
    useEffect(() => {
      window.addEventListener('workout_set_complete', resetCounter);
      window.resetLungeCounter = resetCounter;
    
      return () => {
        window.removeEventListener('workout_set_complete', resetCounter);
        delete window.resetLungeCounter;
      };
    }, [resetCounter]);
    
    // Setup connection and monitoring
    useEffect(() => {
      connectAPI();
      
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
        // Create a copy of the metrics and ensure repCount is included
        const updatedMetrics = {
          ...(data.result.metrics || {}),
          repCount: data.result.repCount,
          formScore: data.result.formScore,
          stage: data.result.stage
        };
        
        // Update our state with the latest metrics and errors
        setCurrentMetrics(updatedMetrics);
        setCurrentErrors(data.result.errors || []);
        
        // Convert errors to ExerciseError format for the BaseExerciseAnalyzer
        const exerciseErrors: ExerciseError[] = (data.result.errors || [])
          .filter((error: any) => {
            // Only include errors with types that match our defined ERROR_TYPES
            return ERROR_TYPES.includes(error.type as any);
          })
          .map((error: any) => ({
            type: error.type as typeof ERROR_TYPES[number],
            message: error.message,
            severity: (ERROR_SEVERITIES.includes(error.severity as any) 
              ? error.severity 
              : 'medium') as typeof ERROR_SEVERITIES[number]
          }));
        
        // Store the converted errors in the ref
        exerciseErrorsRef.current = exerciseErrors;
        
        // Extract rep count to check for changes
        const newRepCount = data.result.repCount || 0;
        
        // Check if rep count has increased
        if (newRepCount > lastRepCount) {
          // First rep - play form guidance for lower body
          if (newRepCount === 1) {
            playExerciseTypeCue(ExerciseType.LOWER_BODY, 0, targetReps);
          } 
          // Halfway point - if target is substantial
          else if (targetReps > 4 && newRepCount === Math.floor(targetReps / 2)) {
            playCue(AudioCueType.HALFWAY_POINT);
          }
          // Later reps - motivation
          else if (targetReps > 0 && newRepCount / targetReps >= 0.7 && newRepCount / targetReps < 0.9) {
            playCue(AudioCueType.PUSH_THROUGH);
          } 
          // Final rep
          else if (targetReps > 0 && newRepCount === targetReps) {
            playCue(AudioCueType.FINAL_REP);
          }
          
          // Reset detected errors when rep count increases
          setDetectedErrorTypes(new Set());
        }
        
        // Extract error flags from the result if available
        const errorFlags: LungeErrorFlags = {};
        if (data.result.errorFlags) {
          setCurrentErrorFlags(data.result.errorFlags);
        } else {
          // Default handling for backwards compatibility with Python scripts that don't send errorFlags
          // Use the more specific error type from the data structure
          type ErrorType = { type: string; message: string; severity: string };
          const kneeAngleError = data.result.errors.some((e: ErrorType) => e.type === 'knee_angle');
          const kneeOverToeError = data.result.errors.some((e: ErrorType) => e.type === 'knee_over_toe');
          
          setCurrentErrorFlags({
            kneeAngleError,
            kneeOverToeError,
            leftKneeError: kneeAngleError && data.result.errors.some((e: ErrorType) => e.message.includes('left')),
            rightKneeError: kneeAngleError && data.result.errors.some((e: ErrorType) => e.message.includes('right'))
          });
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
              if (newErrors.includes('knee_angle')) {
                playCue(AudioCueType.MOVEMENT_CONTROL); // "Control the movement"
              } else if (newErrors.includes('knee_over_toe')) {
                playCue(AudioCueType.FULL_ROM); // "Full range of motion"
              }
              
              // Update detected error types
              const updatedErrorTypes = new Set<string>([...Array.from(detectedErrorTypes), ...newErrors]);
              setDetectedErrorTypes(updatedErrorTypes);
            }, 800); // Small delay to avoid audio overlapping
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
    }, [onAnalysisComplete, onError, lastRepCount, targetReps, playCue, playExerciseTypeCue, detectedErrorTypes]);
    
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
        // Format payload for HTTP API 
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
        
        // Use HTTP API
        fetch('http://localhost:3001/api/analyze/lunge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadJson
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(handleAnalysisResponse)
        .catch(err => logger.error('API error:', err));
      } catch (error) {
        logger.error('Error preparing pose data:', error);
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
            onResults={handleResults}
            onAnalysisComplete={onAnalysisComplete}
            onError={onError}
            metrics={currentMetrics}
            errors={exerciseErrorsRef.current}
            exerciseType="lunge"
          />
        }
        metricsComponent={
          showMetrics && (
            <LungeMetricsDisplay 
              metrics={currentMetrics} 
              errors={currentErrors}
              errorFlags={currentErrorFlags}
            />
          )
        }
      />
    );
  }
);

export default LungeAnalyzer; 