import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { MediaPipeResults } from '../../../../types/ai/mediapipe';
import BaseExerciseAnalyzer from '../BaseExerciseAnalyzer';
import { ExerciseError, ExerciseAnalysisResult, ERROR_TYPES } from '../../../../types/ai/exercise';
import { logger } from '../../../../utils/logger';
import { LateralRaiseMetricsDisplay } from './LateralRaiseMetricsDisplay';
import { LateralRaiseMetrics } from '../../../../types/lateral_raise';
import { AudioCueType, ExerciseType } from '../../../../hooks/useAudioCues';
import { useAudioCueContext } from '../../../../contexts/AudioCueContext';
import ExerciseAnalysisLayout from '../../layout/ExerciseAnalysisLayout';

// Define a more flexible error type for internal component use
interface LateralRaiseError {
  type: string;
  message: string;
  severity: string;
}

export interface LateralRaiseAnalysisResult {
  stage: string;
  metrics: Record<string, number>;
  errors: LateralRaiseError[];
  formScore: number;
  repCount: number;
}

// Skip frames to reduce server load
const FRAME_SKIP_COUNT = 2;

// Track if connection attempt is in progress
let isConnecting = false;

interface LateralRaiseAnalyzerProps {
  onAnalysisComplete: (results: ExerciseAnalysisResult) => void;
  onError: (error: ExerciseError | null) => void;
  isAnalyzing?: boolean;
  targetReps?: number; // Add prop for target repetitions
}

// Add reset counter to Window interface
declare global {
  interface Window {
    resetLateralRaiseCounter?: () => void;
  }
}

const LateralRaiseAnalyzer = forwardRef<{ resetCounter: () => void }, LateralRaiseAnalyzerProps>(
  ({ onAnalysisComplete, onError, isAnalyzing = true, targetReps = 10 }, ref) => {
    // State
    const [apiReady, setApiReady] = useState(false);
    const frameCounter = useRef<number>(0);
    const [showMetrics, setShowMetrics] = useState(true);
    const [currentMetrics, setCurrentMetrics] = useState<LateralRaiseMetrics>({});
    const [currentErrors, setCurrentErrors] = useState<LateralRaiseError[]>([]);
    
    // Track rep count for audio cues
    const [lastRepCount, setLastRepCount] = useState(0);
    
    // Track detected error types to avoid repeating audio cues
    const [detectedErrorTypes, setDetectedErrorTypes] = useState<Set<string>>(new Set());
    
    // Access audio cue context
    const { playCue, playExerciseTypeCue } = useAudioCueContext();
    
    // Create a ref to store the filtered exercise errors
    const exerciseErrorsRef = useRef<ExerciseError[]>([]);
    
    // Create HTTP-based API connection
    const connectAPI = useCallback(() => {
      if (isConnecting) return;
      isConnecting = true;
    
      try {
        logger.info('Setting up HTTP-based API connection for lateral raise analysis');
        
        // Simulate connection established
        setApiReady(true);
        isConnecting = false;
        
        // Log success
        logger.info('API connection ready for lateral raise analysis');
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
        fetch('http://localhost:3001/api/lateral_raise/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseType: 'lateral_raise' })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            logger.info('Successfully reset lateral raise counter');
            
            // Reset local state explicitly
            setCurrentMetrics(prevMetrics => ({
              ...prevMetrics,
              repCount: 0
            }));
            setCurrentErrors([]);
            setLastRepCount(0);
            setDetectedErrorTypes(new Set());
            
            // Also update metrics display if needed
            if (showMetrics) {
              setShowMetrics(true); // Ensure metrics remain visible
            }
          } else {
            logger.error('Failed to reset lateral raise counter:', data.error);
          }
        })
        .catch(error => {
          logger.error('Error resetting lateral raise counter:', error);
        });
      } catch (error) {
        logger.error('Error preparing reset counter request:', error);
      }
    }, [showMetrics]);
    
    // Expose reset method to parent
    useImperativeHandle(ref, () => ({ resetCounter }), [resetCounter]);
    
    // Setup reset event listener
    useEffect(() => {
      window.addEventListener('workout_set_complete', resetCounter);
      window.resetLateralRaiseCounter = resetCounter;
    
      return () => {
        window.removeEventListener('workout_set_complete', resetCounter);
        delete window.resetLateralRaiseCounter;
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
        // Extract metrics and ensure values are properly initialized
        const resultData = data.result;
        
        // Create a copy of the metrics with a guaranteed repCount value
        const updatedMetrics = {
          ...(resultData.metrics || {}),
          repCount: resultData.repCount || 0,
          stage: resultData.stage,
          formScore: resultData.formScore
        };
        
        // Log the rep count for debugging
        logger.info(`Received rep count: ${updatedMetrics.repCount}`);
        
        // We need to store the raw errors for the metrics display
        const rawErrors = resultData.errors || [];
        
        // But we need to convert to ExerciseError for the BaseExerciseAnalyzer
        // by filtering to only include the allowed error types
        const exerciseErrors: ExerciseError[] = rawErrors
          .filter((error: LateralRaiseError) => 
            ERROR_TYPES.includes(error.type as any))
          .map((error: LateralRaiseError) => ({
            type: error.type as typeof ERROR_TYPES[number],
            message: error.message,
            severity: error.severity as any
          }));
        
        // Store the filtered errors in the ref
        exerciseErrorsRef.current = exerciseErrors;
        
        // Update our state with the latest metrics and errors
        setCurrentMetrics(updatedMetrics);
        setCurrentErrors(rawErrors);
        
        // Extract rep count to check for changes
        const newRepCount = resultData.repCount || 0;
        
        // Check if rep count has increased
        if (newRepCount > lastRepCount) {
          // First rep - play form guidance for isolation exercise
          if (newRepCount === 1) {
            playExerciseTypeCue(ExerciseType.ISOLATION, 0, targetReps);
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
        
        // Handle form errors with specific audio cues
        if (resultData.errors && resultData.errors.length > 0) {
          // Get current error types
          const currentErrorTypes = new Set<string>(resultData.errors.map((e: any) => e.type as string));
          
          // Find new error types that weren't previously detected
          const newErrors = Array.from(currentErrorTypes).filter(type => !detectedErrorTypes.has(type));
          
          // Play specific audio cue for form correction errors only
          if (newErrors.length > 0) {
            setTimeout(() => {
              // Play audio cues only for specific form errors
              if (newErrors.includes('uneven_arms')) {
                playCue(AudioCueType.MOVEMENT_CONTROL); // "Control the movement"
              } else if (newErrors.includes('insufficient_raise')) {
                playCue(AudioCueType.FULL_ROM); // "Full range of motion"
              } else if (newErrors.includes('excessive_raise')) {
                playCue(AudioCueType.PEAK_CONTRACTION); // "Squeeze at the top"
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
        onAnalysisComplete(resultData);
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
        fetch('http://localhost:3001/api/analyze/lateral_raise', {
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
            exerciseType="lateral_raise"
          />
        }
        metricsComponent={
          showMetrics && (
            <LateralRaiseMetricsDisplay 
              metrics={currentMetrics} 
              errors={currentErrors}
            />
          )
        }
      />
    );
  }
);

export default LateralRaiseAnalyzer; 