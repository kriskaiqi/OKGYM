import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { MediaPipeResults } from '../../../../types/ai/mediapipe';
import BaseExerciseAnalyzer from '../BaseExerciseAnalyzer';
import { ExerciseError, ExerciseAnalysisResult } from '../../../../types/ai/exercise';
import { logger } from '../../../../utils/logger';
import { ShoulderPressMetricsDisplay } from './ShoulderPressMetricsDisplay';
import { ShoulderPressMetrics } from '../../../../types/shoulder_press';
import { AudioCueType, ExerciseType } from '../../../../hooks/useAudioCues';
import { useAudioCueContext } from '../../../../contexts/AudioCueContext';
import ExerciseAnalysisLayout from '../../layout/ExerciseAnalysisLayout';

export interface ShoulderPressAnalysisResult {
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

interface ShoulderPressAnalyzerProps {
  onAnalysisComplete: (results: ExerciseAnalysisResult) => void;
  onError: (error: ExerciseError | null) => void;
  isAnalyzing?: boolean;
  targetReps?: number; // Add prop for target repetitions
}

// Add reset counter to Window interface
declare global {
  interface Window {
    resetShoulderPressCounter?: () => void;
  }
}

const ShoulderPressAnalyzer = forwardRef<{ resetCounter: () => void }, ShoulderPressAnalyzerProps>(
  ({ onAnalysisComplete, onError, isAnalyzing = true, targetReps = 10 }, ref) => {
    // State
    const [apiReady, setApiReady] = useState(false);
    const frameCounter = useRef<number>(0);
    const [showMetrics, setShowMetrics] = useState(true);
    const [currentMetrics, setCurrentMetrics] = useState<ShoulderPressMetrics>({});
    const [currentErrors, setCurrentErrors] = useState<ExerciseError[]>([]);
    
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
        logger.info('Setting up HTTP-based API connection for shoulder press analysis');
        
        // Simulate connection established
        setApiReady(true);
        isConnecting = false;
        
        // Log success
        logger.info('API connection ready for shoulder press analysis');
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
        fetch('http://localhost:3001/api/shoulder_press/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseType: 'shoulder_press' })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            logger.info('Successfully reset shoulder press counter');
            // Reset metrics, errors, and audio state tracking
            setCurrentMetrics({});
            setCurrentErrors([]);
            setLastRepCount(0);
            setDetectedErrorTypes(new Set());
          } else {
            logger.error('Failed to reset shoulder press counter:', data.error);
          }
        })
        .catch(error => {
          logger.error('Error resetting shoulder press counter:', error);
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
      window.resetShoulderPressCounter = resetCounter;
    
      return () => {
        window.removeEventListener('workout_set_complete', resetCounter);
        delete window.resetShoulderPressCounter;
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
        // Create a copy of the metrics and ensure repCount and other important values are included
        const updatedMetrics = {
          ...(data.result.metrics || {}),
          repCount: data.result.repCount,
          formScore: data.result.formScore,
          stage: data.result.stage
        };
        
        // Update our state with the latest metrics and errors
        setCurrentMetrics(updatedMetrics);
        
        // Convert errors to proper ExerciseError type
        const typedErrors: ExerciseError[] = data.result.errors ? data.result.errors.map((err: any) => ({
          type: err.type,
          message: err.message,
          severity: err.severity
        } as ExerciseError)) : [];
        
        setCurrentErrors(typedErrors);
        
        // Extract rep count to check for changes
        const newRepCount = data.result.repCount || 0;
        
        // Check if rep count has increased
        if (newRepCount > lastRepCount) {
          // First rep - play form guidance for upper body push
          if (newRepCount === 1) {
            playExerciseTypeCue(ExerciseType.UPPER_BODY_PUSH, 0, targetReps);
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
        if (data.result.errors && data.result.errors.length > 0) {
          // Get current error types
          const currentErrorTypes = new Set<string>(data.result.errors.map((e: any) => e.type as string));
          
          // Find new error types that weren't previously detected
          const newErrors = Array.from(currentErrorTypes).filter(type => !detectedErrorTypes.has(type));
          
          // Play specific audio cue for form correction errors only
          if (newErrors.length > 0) {
            setTimeout(() => {
              // Play audio cues only for specific form errors
              if (newErrors.includes('uneven_pressing')) {
                playCue(AudioCueType.MOVEMENT_CONTROL); // "Control the movement"
              } else if (newErrors.includes('incorrect_form')) {
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
        fetch('http://localhost:3001/api/analyze/shoulder_press', {
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
            errors={currentErrors}
            exerciseType="shoulder_press"
          />
        }
        metricsComponent={
          showMetrics && (
            <ShoulderPressMetricsDisplay 
              metrics={currentMetrics} 
              errors={currentErrors}
            />
          )
        }
      />
    );
  }
);

export default ShoulderPressAnalyzer; 