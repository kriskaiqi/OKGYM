import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { MediaPipeResults } from '../../../../types/ai/mediapipe';
import BaseExerciseAnalyzer from '../BaseExerciseAnalyzer';
import { ExerciseError, ExerciseAnalysisResult } from '../../../../types/ai/exercise';
import { logger } from '../../../../utils/logger';
import { PlankMetricsDisplay } from './PlankMetricsDisplay';
import { PlankMetrics } from '../../../../types/plank';
import { AudioCueType, ExerciseType } from '../../../../hooks/useAudioCues';
import { useAudioCueContext } from '../../../../contexts/AudioCueContext';
import ExerciseAnalysisLayout from '../../layout/ExerciseAnalysisLayout';

export interface PlankAnalysisResult {
  stage: string;
  metrics: Record<string, number>;
  errors: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
  formScore: number;
  durationInSeconds: number;
}

// Skip frames to reduce server load
const FRAME_SKIP_COUNT = 2;

// Track if connection attempt is in progress
let isConnecting = false;

interface PlankAnalyzerProps {
  onAnalysisComplete: (results: ExerciseAnalysisResult) => void;
  onError: (error: ExerciseError | null) => void;
  isAnalyzing?: boolean;
}

// Add reset counter to Window interface
declare global {
  interface Window {
    resetPlankTimer?: () => void;
  }
}

// Duration milestones for audio cues (in seconds)
const DURATION_MILESTONES = [15, 30, 60, 90, 120, 180, 240, 300];

const PlankAnalyzer = forwardRef<{ resetTimer: () => void }, PlankAnalyzerProps>(
  ({ onAnalysisComplete, onError, isAnalyzing = true }, ref) => {
    // State
    const [apiReady, setApiReady] = useState(false);
    const frameCounter = useRef<number>(0);
    const [showMetrics, setShowMetrics] = useState(true);
    const [currentMetrics, setCurrentMetrics] = useState<PlankMetrics>({});
    const [currentErrors, setCurrentErrors] = useState<Array<{type: string; message: string; severity: string}>>([]);
    const [durationInSeconds, setDurationInSeconds] = useState(0);
    const durationTimer = useRef<NodeJS.Timeout | null>(null);
    const isActive = useRef(false);
    
    // Track detected error types to avoid repeating audio cues
    const [detectedErrorTypes, setDetectedErrorTypes] = useState<Set<string>>(new Set());
    
    // Track which milestones have already been announced
    const [announcedMilestones, setAnnouncedMilestones] = useState<Set<number>>(new Set());
    
    // Access audio cue context
    const { playCue, playExerciseTypeCue } = useAudioCueContext();
    
    // Create HTTP-based API connection
    const connectAPI = useCallback(() => {
      if (isConnecting) return;
      isConnecting = true;
    
      try {
        logger.info('Setting up HTTP-based API connection for plank analysis');
        
        // Simulate connection established
        setApiReady(true);
        isConnecting = false;
        
        // Log success
        logger.info('API connection ready for plank analysis');
      } catch (error) {
        logger.error('Error setting up API connection:', error);
        isConnecting = false;
        
        // Retry after delay
        setTimeout(connectAPI, 3000);
      }
    }, []);
    
    // Reset timer via HTTP API
    const resetTimer = useCallback(() => {
      try {
        fetch('http://localhost:3001/api/plank/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            exerciseType: 'plank',
            command: 'reset_counter'
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            logger.info('Successfully reset plank timer');
            setDurationInSeconds(0);
            // Clear the interval
            if (durationTimer.current) {
              clearInterval(durationTimer.current);
              durationTimer.current = null;
            }
            isActive.current = false;
            
            // Reset audio cue tracking state
            setDetectedErrorTypes(new Set());
            setAnnouncedMilestones(new Set());
          } else {
            logger.error('Failed to reset plank timer:', data.error);
          }
        })
        .catch(error => {
          logger.error('Error resetting plank timer:', error);
        });
      } catch (error) {
        logger.error('Error preparing reset timer request:', error);
      }
    }, []);
    
    // Expose reset method to parent
    useImperativeHandle(ref, () => ({ resetTimer }), [resetTimer]);
    
    // Setup reset event listener
    useEffect(() => {
      window.addEventListener('workout_set_complete', resetTimer);
      window.resetPlankTimer = resetTimer;
    
      return () => {
        window.removeEventListener('workout_set_complete', resetTimer);
        delete window.resetPlankTimer;
      };
    }, [resetTimer]);
    
    // Check for duration milestones and play cues
    useEffect(() => {
      // Find the next milestone we haven't announced yet
      const nextMilestone = DURATION_MILESTONES.find(milestone => 
        durationInSeconds >= milestone && !Array.from(announcedMilestones).includes(milestone)
      );
      
      if (nextMilestone && isAnalyzing) {
        // Play appropriate audio cue based on the milestone
        if (nextMilestone <= 30) {
          // Early milestone
          playCue(AudioCueType.CONFIDENCE_BOOST); // "You've got this!"
        } else if (nextMilestone >= 60 && nextMilestone < 180) {
          // Mid milestone
          playCue(AudioCueType.PROGRESS_UPDATE); // "Almost there!"
        } else {
          // Late milestone (impressive hold time)
          playCue(AudioCueType.ACHIEVEMENT); // "Achievement unlocked!"
        }
        
        // Mark this milestone as announced
        setAnnouncedMilestones(prev => new Set([...Array.from(prev), nextMilestone]));
      }
    }, [durationInSeconds, announcedMilestones, isAnalyzing, playCue]);
    
    // Setup timer functionality
    useEffect(() => {
      // Only run timer when analyzing is active
      if (isAnalyzing && isActive.current && !durationTimer.current) {
        logger.info('Starting plank timer');
        durationTimer.current = setInterval(() => {
          setDurationInSeconds(prev => prev + 1);
        }, 1000);
      } else if (!isAnalyzing && durationTimer.current) {
        logger.info('Stopping plank timer');
        clearInterval(durationTimer.current);
        durationTimer.current = null;
      }
      
      return () => {
        if (durationTimer.current) {
          clearInterval(durationTimer.current);
          durationTimer.current = null;
        }
      };
    }, [isAnalyzing]);
    
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
        // Extract holdTime from the backend result
        const backendHoldTime = data.result.holdTime || data.result.durationInSeconds || 0;
        
        // If we detect a proper form, start the timer if not already started
        if (data.result.stage === 'correct' && !isActive.current) {
          isActive.current = true;
          // If timer isn't running, start it
          if (!durationTimer.current && isAnalyzing) {
            durationTimer.current = setInterval(() => {
              setDurationInSeconds(prev => prev + 1);
            }, 1000);
          }
          
          // Play form guidance when starting with correct form
          if (backendHoldTime === 0) {
            playExerciseTypeCue(ExerciseType.CORE, 0, 60); // Core exercise guidance
          }
        } 
        // If form is incorrect and timer is running, pause it
        else if (data.result.stage !== 'correct' && isActive.current) {
          isActive.current = false;
          if (durationTimer.current) {
            clearInterval(durationTimer.current);
            durationTimer.current = null;
          }
        }
        
        // Create a copy of the metrics and ensure holdTime is included
        const updatedMetrics = {
          ...(data.result.metrics || {}),
          // Use backend holdTime as the source of truth if available
          holdTime: backendHoldTime,
          durationInSeconds: backendHoldTime
        };
        
        // Update our state with the latest metrics and errors
        setCurrentMetrics(updatedMetrics);
        setCurrentErrors(data.result.errors || []);
        
        // Update the hold time from backend
        if (backendHoldTime > 0) {
          setDurationInSeconds(backendHoldTime);
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
              if (newErrors.includes('high_back')) {
                playCue(AudioCueType.CORE_ENGAGEMENT); // "Engage your core"
              } else if (newErrors.includes('low_back')) {
                playCue(AudioCueType.BACK_STRAIGHT); // "Keep your back straight"
              }
              
              // Update detected error types
              const updatedErrorTypes = new Set<string>([...Array.from(detectedErrorTypes), ...newErrors]);
              setDetectedErrorTypes(updatedErrorTypes);
            }, 800); // Small delay to avoid audio overlapping
          }
        } else {
          // If correct form is restored, reset error types to allow new cues
          setDetectedErrorTypes(new Set());
        }
        
        // Modify the result to include durationInSeconds instead of repCount
        const modifiedResult = {
          ...data.result,
          durationInSeconds: backendHoldTime,
          repCount: 0 // Set to 0 as plank doesn't have reps
        };
        
        // Pass to callback
        onAnalysisComplete(modifiedResult);
      }
      
      if (data.error) {
        onError({
          type: 'ANALYSIS_ERROR', 
          message: data.error.message, 
          severity: 'error'
        });
      }
    }, [onAnalysisComplete, onError, isAnalyzing, playExerciseTypeCue, playCue, detectedErrorTypes]);
    
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
        // Format payload for HTTP API - Match the format used by bicep/lunge
        const payload = {
          landmarks: results.poseLandmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0,
            visibility: lm.visibility || 0
          }))
        };
        
        // Debug logging
        logger.info(`Sending plank payload with ${payload.landmarks.length} landmarks`);
        
        // Log payload size for debugging
        const payloadSize = new Blob([JSON.stringify(payload)]).size;
        if (payloadSize > 16000) {
          logger.warn(`Large payload: ${payloadSize} bytes`);
        }
        
        // Use HTTP API - Match how bicep/lunge implementations send data
        fetch('http://localhost:3001/api/analyze/plank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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
            metrics={{
              ...currentMetrics,
              formScore: currentMetrics.formScore || 0,
              holdTime: durationInSeconds
            }}
            errors={currentErrors as ExerciseError[]}
            exerciseType="plank"
          />
        }
        metricsComponent={
          showMetrics && (
            <PlankMetricsDisplay 
              metrics={currentMetrics} 
              errors={currentErrors}
              durationInSeconds={durationInSeconds}
            />
          )
        }
      />
    );
  }
);

export default PlankAnalyzer; 