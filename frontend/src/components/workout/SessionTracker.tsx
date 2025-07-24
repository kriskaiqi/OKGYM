import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  LinearProgress, 
  Divider, 
  Chip, 
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Collapse,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Check,
  Close,
  Save,
  Timer,
  FitnessCenter,
  DirectionsRun,
  RestartAlt,
  Cancel,
  ArrowBack,
  ArrowForward,
  ExpandMore,
  ExpandLess,
  Warning
} from '@mui/icons-material';
import sessionService from '../../services/sessionService';
import { WorkoutSession, WorkoutPlan, SessionStatus, WorkoutExercise } from '../../types/workout';
import { Exercise, ExerciseStatus, PlannedExercise, ActualExercise } from '../../types/exercise';
import { useSnackbar } from 'notistack';
import { useTimer, useCountdown } from '../../hooks';
import { useWorkoutSession } from '../../App';
import { PoseDetectionProvider } from '../../contexts/PoseDetectionContext';
import { AnalysisStateProvider } from '../../contexts/AnalysisStateContext';
import SquatAnalyzer from '../../components/ai/exercises/squat/SquatAnalyzer';
import BicepAnalyzer from '../../components/ai/exercises/bicep/BicepAnalyzer';
import LungeAnalyzer from '../../components/ai/exercises/lunge/LungeAnalyzer';
import PlankAnalyzer from '../../components/ai/exercises/plank/PlankAnalyzer';
import SitupAnalyzer from '../../components/ai/exercises/situp/SitupAnalyzer';
import ShoulderPressAnalyzer from '../../components/ai/exercises/shoulder_press/ShoulderPressAnalyzer';
import PushupAnalyzer from '../../components/ai/exercises/pushup/PushupAnalyzer';
import LateralRaiseAnalyzer from '../../components/ai/exercises/lateral-raise/LateralRaiseAnalyzer';
import { logger } from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isSquatExercise, isBicepCurlExercise, isLungeExercise, isPlankExercise, isSitupExercise, isShoulderPressExercise, isBenchPressExercise, isPushupExercise, isLateralRaiseExercise } from '../../utils/exercise/exerciseTypeUtils';
import BenchPressAnalyzer from '../../components/ai/exercises/bench_press/BenchPressAnalyzer';
import { AudioCueType, ExerciseType, EXERCISE_TYPE_CUES } from '../../hooks/useAudioCues';
import { getExerciseType } from '../../utils/exerciseUtils';
import { useAudioCueContext } from '../../contexts/AudioCueContext';

interface SessionTrackerProps {
  workoutPlanId: string | number;
  existingSession: WorkoutSession;
  onComplete?: (session: WorkoutSession) => void;
  onCancel?: (pausedSession?: WorkoutSession) => void;
  onSessionActiveChange?: (isActive: boolean) => void;
}

// Add type definition for exercise attempt
interface ExerciseAttempt {
  repetitions?: number;
  duration?: number;
  weight?: number;
  formScore: number;
  timestamp: string;
  setNumber?: number;
  notes?: string;
}

// Define the navigation guard interface
export interface NavigationGuard {
  handleNavigation: (callback: () => void) => boolean;
  isSessionActive: () => boolean;
}

// Add a static property to the component type
interface SessionTrackerComponent extends React.ForwardRefExoticComponent<SessionTrackerProps & React.RefAttributes<any>> {
  navigationGuard: true; // This is a constant property that's always true when added to the component
}

const SessionTracker = forwardRef<any, SessionTrackerProps>((props, ref) => {
  const { 
    workoutPlanId, 
    existingSession, 
    onComplete, 
    onCancel,
    onSessionActiveChange
  } = props;
  
  // Get global workout session context
  const { pauseActiveSession, setWorkoutCompleted } = useWorkoutSession();
  
  // Add audio cue context
  const { playCue, playExerciseTypeCue } = useAudioCueContext();
  
  // Initialize state
  const [session, setSession] = useState<WorkoutSession | null>(existingSession || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseExpanded, setExerciseExpanded] = useState(true);
  
  // Add state validation tracking to detect and handle incomplete sessions
  const [isSessionValid, setIsSessionValid] = useState(false);
  
  // Exercise tracking state
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState<number | string>(0);
  const [weight, setWeight] = useState<number | string>(0);
  const [formScore, setFormScore] = useState<number>(7);
  const [notes, setNotes] = useState('');
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'complete' | 'cancel' | null>(null);
  
  // Notifications
  const { enqueueSnackbar } = useSnackbar();
  
  // Timers
  const { time, isRunning, start, pause, reset } = useTimer();
  const { 
    timeLeft, 
    isActive: isRestActive, 
    startCountdown, 
    stopCountdown, 
    resetCountdown 
  } = useCountdown();
  
  // Helper refs
  const sessionStartedRef = useRef(false);
  const isProcessingRef = useRef(false);
  
  // Create a ref to store exercise results
  const exerciseResultsCache = useRef<{[exerciseId: string]: any}>({});
  
  // Add a new state to track current set per exercise
  const [exerciseSetMap, setExerciseSetMap] = useState<Record<string, number>>({});
  
  // New state for navigation confirmation dialog
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [navigationCallback, setNavigationCallback] = useState<(() => void) | null>(null);
  
  // Add state for analysis results
  const [analysisActive, setAnalysisActive] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Add timer state for duration tracking
  const [durationTimer, setDurationTimer] = useState<number | string>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create refs for each exercise analyzer
  const squatAnalyzerRef = useRef<{ resetCounter: () => void } | null>(null);
  const bicepAnalyzerRef = useRef<{ resetCounter: () => void } | null>(null); 
  const lungeAnalyzerRef = useRef<{ resetCounter: () => void } | null>(null);
  const plankAnalyzerRef = useRef<{ resetTimer: () => void } | null>(null);
  const situpAnalyzerRef = useRef<{ resetCounter: () => void } | null>(null);
  const shoulderPressAnalyzerRef = useRef<{ resetCounter: () => void } | null>(null);
  const benchPressAnalyzerRef = useRef<{ resetCounter: () => void } | null>(null);
  const pushupAnalyzerRef = useRef<{ resetCounter: () => void } | null>(null);
  const lateralRaiseAnalyzerRef = useRef<{ resetCounter: () => void } | null>(null);
  
  // Validate that the session has all required data
  useEffect(() => {
    // Reset validation state first
    setIsSessionValid(false);
    
    // Validate the session object and its critical properties
    if (!session) {
      setError('Session not available');
      return;
    }
    
    if (!session.id) {
      setError('Session missing ID');
      return;
    }
    
    if (!session.workoutPlan) {
      setError('Session missing workout plan data');
      return;
    }
    
    if (!session.workoutPlan.exercises || !session.workoutPlan.exercises.length) {
      setError('Workout plan has no exercises');
      return;
    }
    
    if (!session.exerciseSequence) {
      setError('Session missing exercise sequence data');
      return;
    }
    
    // If we reach here, the session is valid
    console.log('SessionTracker: Session validated successfully');
    setIsSessionValid(true);
    setError(null);
  }, [session]);
  
  // Update session when prop changes
  useEffect(() => {
    if (existingSession) {
      console.log('SessionTracker: Received session update:', 
        existingSession.id,
        'Status:', existingSession.status,
        'Has workout plan:', !!existingSession.workoutPlan);
      
      // Ensure we don't lose exercise results during updates
      if (session && session.exerciseResults) {
        // Preserve exercise results that might not be in the new session
        exerciseResultsCache.current = {
          ...exerciseResultsCache.current,
          ...(session.exerciseResults || {})
        };
      }
      
      setSession(existingSession);
    } else {
      console.warn('SessionTracker: Received null/undefined session');
    }
  }, [existingSession]);
  
  // Get current planned exercise
  const getCurrentPlannedExercise = useCallback((): PlannedExercise | undefined => {
    if (!session || !session.exerciseSequence || !session.exerciseSequence.originalPlan) return undefined;
    
    const plans = session.exerciseSequence.originalPlan;
    if (!plans || plans.length <= currentExerciseIndex) return undefined;
    
    return plans[currentExerciseIndex];
  }, [session, currentExerciseIndex]);
  
  // Get exercise details from workout plan
  const getExerciseFromWorkoutPlan = useCallback((exerciseId: string): WorkoutExercise | undefined => {
    if (!session?.workoutPlan?.exercises) return undefined;
    return session.workoutPlan.exercises.find(ex => ex.exercise.id === exerciseId);
  }, [session]);
  
  // Get current exercise details
  const getCurrentExerciseDetails = useCallback(() => {
    const plannedExercise = getCurrentPlannedExercise();
    if (!plannedExercise) return undefined;

    const workoutExercise = session?.workoutPlan?.exercises?.find(
      ex => ex.exercise.id === plannedExercise.exerciseId
    );

    if (!workoutExercise) return undefined;

    // Case-insensitive check for duration-based exercises
    const measurementType = workoutExercise.exercise?.measurementType;
    const isDurationBased = 
      measurementType === 'DURATION' || 
      measurementType === 'Duration' || 
      measurementType?.toLowerCase() === 'duration' ||
      // Check if the exercise name contains "plank" as a fallback
      (workoutExercise.exercise?.name || '').toLowerCase().includes('plank');
    
    // Only log on initial render or when exercise changes - not on every call
    if (!exerciseResultsCache.current[plannedExercise.exerciseId]) {
      console.log('Exercise Details:', {
        name: workoutExercise.exercise?.name,
        measurementType: measurementType,
        isDurationBased: isDurationBased
      });
      
      // Mark as logged to prevent repeated logging
      exerciseResultsCache.current[plannedExercise.exerciseId] = true;
    }

    return {
      ...plannedExercise,
      targetSets: workoutExercise.sets || 3, // Default to 3 sets if not specified
      targetRepetitions: workoutExercise.repetitions || 0,
      targetDuration: workoutExercise.duration || workoutExercise.repetitions || 0, 
      restTime: workoutExercise.restTime || 75,
      exercise: workoutExercise.exercise,
      isDurationBased: isDurationBased
    };
  }, [session, getCurrentPlannedExercise]);
  
  // Start workout timer if session is in progress or when transitioning between states
  useEffect(() => {
    if (session) {
      // Handle active session state
      if (session.status === SessionStatus.ACTIVE) {
        if (!isRunning) {
          console.log('Starting timer for active session');
          start();
        }
        
        // Notify parent component about active state change
        if (onSessionActiveChange) {
          onSessionActiveChange(true);
        }
      } 
      // Handle paused session state
      else if (session.status === SessionStatus.PAUSED) {
        if (isRunning) {
          console.log('Pausing timer for paused session');
          pause();
        }
        
        // Notify parent component about active state change
        if (onSessionActiveChange) {
          onSessionActiveChange(false);
        }
      }
      
      // When session status changes, update the session started ref
      if (session.status === SessionStatus.ACTIVE && !sessionStartedRef.current) {
        sessionStartedRef.current = true;
      }
    }
  }, [session, session?.status, isRunning, start, pause, onSessionActiveChange]);
  
  // Start session - play start workout cue
  useEffect(() => {
    if (session && session.status === SessionStatus.ACTIVE && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      // Audio: START_WORKOUT - "Let's begin your workout!"
      playCue(AudioCueType.START_WORKOUT);
    }
  }, [session, session?.status, sessionStartedRef, playCue]);
  
  // Start rest timer when needed
  useEffect(() => {
    if (showRestTimer && !isRestActive) {
      // Get the current exercise details to use its restTime
      const currentDetails = getCurrentExerciseDetails();
      const restDuration = currentDetails?.restTime || 90; // Use exercise rest time or default to 90s
      startCountdown(restDuration);
    }
  }, [showRestTimer, getCurrentExerciseDetails]);
  
  // End rest timer
  useEffect(() => {
    if (timeLeft === 0 && showRestTimer) {
      enqueueSnackbar('Rest time completed! Continue with your workout.', { variant: 'success' });
      setShowRestTimer(false);
      resetCountdown();
      
      // Play motivation cue when rest period ends
      // Audio: CONFIDENCE_BOOST - "You've got this!"
      playCue(AudioCueType.CONFIDENCE_BOOST);
    } else if (timeLeft === 5 && showRestTimer) {
      // Play a warning when 5 seconds left in rest period
      // Audio: PROGRESS_UPDATE - "Almost there!"
      playCue(AudioCueType.PROGRESS_UPDATE);
    }
  }, [timeLeft, showRestTimer, enqueueSnackbar, resetCountdown, playCue]);
  
  // Get current actual exercise
  const getCurrentActualExercise = useCallback((): ActualExercise | undefined => {
    if (!session || !session.exerciseSequence || !session.exerciseSequence.actualSequence) return undefined;
    
    const currentPlanned = getCurrentPlannedExercise();
    if (!currentPlanned || !currentPlanned.exerciseId) return undefined;
    
    return session.exerciseSequence.actualSequence.find(
      e => e && e.exerciseId === currentPlanned.exerciseId
    );
  }, [session, currentExerciseIndex, getCurrentPlannedExercise]);
  
  // Get exercise details by ID
  const getExerciseById = useCallback((exerciseId: string): Exercise | undefined => {
    if (!session || !session.workoutPlan || !session.workoutPlan.exercises) return undefined;
    
    // First, check if the workout plan has this exercise
    for (const ex of session.workoutPlan.exercises) {
      if (ex && ex.exercise && ex.exercise.id === exerciseId) {
        return ex.exercise;
      }
    }
    
    return undefined;
  }, [session]);
  
  // Get total number of exercises in the plan
  const getTotalExercisesCount = (): number => {
    if (!session || !session.exerciseSequence || !session.exerciseSequence.originalPlan) {
      return 0;
    }
    return session.exerciseSequence.originalPlan.length;
  };

  // Get a planned exercise by index
  const getPlannedExercise = (index: number) => {
    if (!session || !session.exerciseSequence || !session.exerciseSequence.originalPlan) {
      return null;
    }
    
    if (index < 0 || index >= session.exerciseSequence.originalPlan.length) {
      return null;
    }
    
    return session.exerciseSequence.originalPlan[index];
  };
  
  // Reset all exercise analyzers
  const resetExerciseAnalyzers = useCallback(() => {
    // Reset all exercise analyzers
    if (squatAnalyzerRef.current?.resetCounter) {
      squatAnalyzerRef.current.resetCounter();
    }
    if (bicepAnalyzerRef.current?.resetCounter) {
      bicepAnalyzerRef.current.resetCounter();
    }
    if (lungeAnalyzerRef.current?.resetCounter) {
      lungeAnalyzerRef.current.resetCounter();
    }
    if (plankAnalyzerRef.current?.resetTimer) {
      plankAnalyzerRef.current.resetTimer();
    }
    if (situpAnalyzerRef.current?.resetCounter) {
      situpAnalyzerRef.current.resetCounter();
    }
    if (shoulderPressAnalyzerRef.current?.resetCounter) {
      shoulderPressAnalyzerRef.current.resetCounter();
    }
    if (benchPressAnalyzerRef.current?.resetCounter) {
      benchPressAnalyzerRef.current.resetCounter();
    }
    if (pushupAnalyzerRef.current?.resetCounter) {
      pushupAnalyzerRef.current.resetCounter();
    }
    if (lateralRaiseAnalyzerRef.current?.resetCounter) {
      lateralRaiseAnalyzerRef.current.resetCounter();
    }
  }, []);
  
  // Move to next exercise
  const handleNextExercise = () => {
    if (!session || !session.exerciseSequence || !session.exerciseSequence.originalPlan) return;
    
    // Reset all exercise analyzers when changing exercises
    resetExerciseAnalyzers();
    
    // Save current set for this exercise before moving
    const currentExercise = getCurrentPlannedExercise();
    if (currentExercise && currentExercise.exerciseId) {
      setExerciseSetMap(prev => ({
        ...prev,
        [currentExercise.exerciseId]: currentSet
      }));
    }
    
    const totalExercises = session.exerciseSequence.originalPlan.length;
    // Update current index
    const newIndex = Math.min(currentExerciseIndex + 1, totalExercises - 1);
    setCurrentExerciseIndex(newIndex);
    
    // Load the correct set for the next exercise
    const nextExercise = session.exerciseSequence.originalPlan[newIndex];
    if (nextExercise && nextExercise.exerciseId) {
      // If we have a stored set for this exercise, use it, otherwise default to 1
      const savedSet = exerciseSetMap[nextExercise.exerciseId] || 1;
      setCurrentSet(savedSet);
      
      // Always start with 0 reps for a new exercise
      setReps(0);
      
      // Play transition audio cue for next exercise
      // Audio: NEXT_EXERCISE - "Moving to next exercise"
      playCue(AudioCueType.NEXT_EXERCISE);
      
      // After a delay, play exercise-specific cue
      const nextExerciseDetails = getExerciseById(nextExercise.exerciseId);
      if (nextExerciseDetails && nextExerciseDetails.name) {
        // Play exercise-specific cue after a short delay
        setTimeout(() => {
          const exerciseType = getExerciseType({
            name: nextExerciseDetails.name,
            muscleGroups: Array.isArray(nextExerciseDetails.muscleGroups) 
              ? nextExerciseDetails.muscleGroups 
              : nextExerciseDetails.muscleGroups ? [nextExerciseDetails.muscleGroups] : undefined
          });
          playExerciseTypeCue(exerciseType);
        }, 1500);
      }
    } else {
      setCurrentSet(1);
      setReps(0);
    }
    
    // Reset other form values
    setWeight(0);
    setFormScore(7);
    setNotes('');
  };
  
  // Move to previous exercise
  const handlePreviousExercise = () => {
    if (!session || !session.exerciseSequence || !session.exerciseSequence.originalPlan) return;
    
    // Reset all exercise analyzers when moving to previous exercise
    resetExerciseAnalyzers();
    
    // Save current set for this exercise before moving
    const currentExercise = getCurrentPlannedExercise();
    if (currentExercise && currentExercise.exerciseId) {
      setExerciseSetMap(prev => ({
        ...prev,
        [currentExercise.exerciseId]: currentSet
      }));
    }
    
    // Update current index
    const newIndex = Math.max(currentExerciseIndex - 1, 0);
    setCurrentExerciseIndex(newIndex);
    
    // Load the correct set for the previous exercise
    const prevExercise = session.exerciseSequence.originalPlan[newIndex];
    if (prevExercise && prevExercise.exerciseId) {
      // If we have a stored set for this exercise, use it, otherwise default to 1
      const savedSet = exerciseSetMap[prevExercise.exerciseId] || 1;
      setCurrentSet(savedSet);
      
      // Always start with 0 reps
      setReps(0);
    } else {
      setCurrentSet(1);
      setReps(0);
    }
    
    // Reset other form values
    setWeight(0);
    setFormScore(7);
    setNotes('');
  };
  
  // Reset form values
  const resetFormValues = () => {
    // Always start with 0 reps for a new set
    setReps(0);
    setWeight(0);
    setFormScore(7);
    setNotes('');
    resetDurationTimer();
  };
  
  // Open log dialog
  const openLogDialog = () => {
    setShowLogDialog(true);
  };
  
  // Close log dialog
  const closeLogDialog = () => {
    setShowLogDialog(false);
  };
  
  // Handle logging a set
  const handleLogSet = async () => {
    if (!session || !session.id) return;
    
    try {
      const currentExercise = getCurrentPlannedExercise();
      if (!currentExercise || !currentExercise.exerciseId) {
        enqueueSnackbar('Exercise not found', { variant: 'error' });
        return;
      }

      const exerciseId = currentExercise.exerciseId;
      const currentDetails = getCurrentExerciseDetails();
      const isDurationBased = currentDetails?.isDurationBased || false;
      
      // Stop the timer if it's running for duration-based exercises
      if (isDurationBased && timerRunning) {
        stopDurationTimer();
      }
      
      // Parse reps/duration value, treating empty string as 0
      const repsValue = reps === '' ? 0 : (typeof reps === 'number' ? reps : parseInt(reps as string) || 0);
      // For duration-based exercises, use the timer value
      const durationValue = isDurationBased ? 
        (durationTimer === '' ? 0 : (typeof durationTimer === 'number' ? durationTimer : parseInt(durationTimer as string) || 0)) 
        : 0;
      
      // Prepare data for API
      const logData = {
        repetitions: isDurationBased ? 0 : repsValue,
        weight: weight === '' ? 0 : (typeof weight === 'number' ? weight : parseInt(weight as string) || 0),
        formScore: Math.min(10, Math.max(0, formScore)), // Ensure form score is between 0-10
        notes: notes || undefined,
        setNumber: currentSet,
        duration: isDurationBased ? durationValue : 0
      };
      
      console.log('Logging set:', logData, 'for exercise:', exerciseId);
      
      // Store this exercise data in the cache before sending to API
      const existingExerciseData = typeof exerciseResultsCache.current[exerciseId] === 'object' && exerciseResultsCache.current[exerciseId] !== null
        ? exerciseResultsCache.current[exerciseId]
        : {
        status: "ACTIVE",
        attempts: []
      };
      
      // Ensure attempts is always an array to prevent "not iterable" errors
      if (!existingExerciseData.attempts || !Array.isArray(existingExerciseData.attempts)) {
        existingExerciseData.attempts = [];
      }
      
      // Add the current attempt to our cache
      const newAttempt = {
        notes: logData.notes,
        weight: logData.weight,
        duration: logData.duration,
        formScore: logData.formScore,
        timestamp: new Date().toISOString(),
        repetitions: logData.repetitions,
        setNumber: logData.setNumber
      };
      
      exerciseResultsCache.current[exerciseId] = {
        ...existingExerciseData,
        attempts: [...existingExerciseData.attempts, newAttempt],
        bestResult: {
          reps: isDurationBased ? 0 : Math.max(logData.repetitions, existingExerciseData.bestResult?.reps || 0),
          notes: logData.notes || existingExerciseData.bestResult?.notes,
          weight: Math.max(logData.weight, existingExerciseData.bestResult?.weight || 0),
          duration: isDurationBased ? Math.max(logData.duration, existingExerciseData.bestResult?.duration || 0) : 0,
          formScore: Math.max(logData.formScore, existingExerciseData.bestResult?.formScore || 0)
        }
      };
      
      console.log('Exercise data cached:', exerciseResultsCache.current);
      
      // Call API to log the set
      const updatedSession = await sessionService.recordExerciseCompletion(
        session.id,
        exerciseId,
        logData
      );
      
      // After logging a single exercise, also save the entire exercise result cache
      // to ensure we don't lose data if user doesn't complete the workout properly
      try {
        // Create a merged exercise results object
        const mergedExerciseResults = {
          ...(updatedSession?.exerciseResults || {}),
          ...exerciseResultsCache.current
        };
        
        console.log('Saving all cached exercise results after logging:', {
          exerciseResults: mergedExerciseResults
        });
        
        // Save all cached exercise results
        await sessionService.saveSessionExerciseResults(
          session.id,
          { exerciseResults: mergedExerciseResults }
        );
      } catch (saveError) {
        console.error('Error saving all exercise results after logging:', saveError);
        // Continue even if this fails
      }
      
      // Update session state with the new data
      if (updatedSession && updatedSession.id) {
        // Create a copy of the updated session
        const sessionCopy = {...updatedSession};
        
        // Ensure exerciseResults exists
        if (!sessionCopy.exerciseResults) {
          sessionCopy.exerciseResults = {};
        }
        
        // Merge our cached exercise results with the session data
        Object.keys(exerciseResultsCache.current).forEach(cachedExId => {
          sessionCopy.exerciseResults[cachedExId] = exerciseResultsCache.current[cachedExId];
        });
        
        console.log('Setting session with merged exercise data:', sessionCopy.exerciseResults);
        setSession(sessionCopy);
      }
      
      // Close dialog and show success message
      closeLogDialog();
      enqueueSnackbar('Set completed!', { variant: 'success' });
      
      // Play achievement audio cue when set is completed
      // Audio: SET_MILESTONE - "Great set, keep it up"
      playCue(AudioCueType.SET_MILESTONE);
      
      // Reset all exercise analyzers
      resetExerciseAnalyzers();
      
      const plannedExercise = getCurrentPlannedExercise();
      
      // If this was the last set, offer to move to next exercise
      if (plannedExercise && currentSet >= (plannedExercise.targetSets || 3)) {
        enqueueSnackbar('All sets completed for this exercise!', { variant: 'success' });
        
        // Automatically move to the next exercise after a delay
        setTimeout(() => {
          handleNextExercise();
        }, 1500);
      } else {
        // Increment set counter and show rest timer
        setCurrentSet(currentSet + 1);
        setShowRestTimer(true);
        
        // Play rest period audio cue
        // Audio: REST_PERIOD - "Take a rest now"
        playCue(AudioCueType.REST_PERIOD);
        
        // Get the current exercise details to use its restTime
        const exerciseDetails = getCurrentExerciseDetails();
        const restDuration = exerciseDetails?.restTime || 90; // Use exercise rest time or default to 90s
        startCountdown(restDuration);
        
        // Reset form values for next set
        resetFormValues();
        // Explicitly set reps to 0 for the next set
        setReps(0);
        // Reset duration timer for next set
        resetDurationTimer();
        
        // Store current set progress for this exercise
        if (currentExercise && currentExercise.exerciseId) {
          setExerciseSetMap(prev => ({
            ...prev,
            [currentExercise.exerciseId]: currentSet + 1
          }));
        }
      }
    } catch (err) {
      console.error('Failed to log set:', err);
      enqueueSnackbar('Failed to record exercise set', { variant: 'error' });
      // Keep dialog open on error
      setShowLogDialog(true);
    }
  };
  
  // Skip current exercise
  const handleSkipExercise = async () => {
    if (!session || !session.id) return;
    
    try {
      const currentExercise = getCurrentPlannedExercise();
      if (!currentExercise || !currentExercise.exerciseId) return;
      
      // Call API to skip exercise
      const updatedSession = await sessionService.skipExercise(
        session.id,
        currentExercise.exerciseId,
        'User skipped exercise'
      );
      
      // Update session state
      setSession(updatedSession);
      
      // Show success message and move to next exercise
      enqueueSnackbar('Exercise skipped', { variant: 'info' });
      handleNextExercise();
    } catch (err) {
      console.error('Failed to skip exercise:', err);
      enqueueSnackbar('Failed to skip exercise', { variant: 'error' });
    }
  };
  
  // Pause session
  const handlePauseSession = async () => {
    if (!session) return;
    
    // Simply pause the timer
    pause();
    
    // Update the session status locally to show the Resume button
    setSession(prev => prev ? { 
      ...prev, 
      status: SessionStatus.PAUSED 
    } : null);
    
    // Update session active status
    if (onSessionActiveChange) {
      onSessionActiveChange(false);
    }
  };
  
  // Resume session
  const handleResumeSession = async () => {
    if (!session) return;
    
    // Simply resume the timer
    start();
    
    // Update the session status locally to show the Pause button
    setSession(prev => prev ? { 
      ...prev, 
      status: SessionStatus.ACTIVE 
    } : null);
    
    // Update session active status
    if (onSessionActiveChange) {
      onSessionActiveChange(true);
    }
  };
  
  // Open confirm dialog
  const openConfirmDialog = (action: 'complete' | 'cancel') => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };
  
  // Close confirm dialog
  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };
  
  // Complete session
  const handleCompleteSession = async () => {
    if (!session || !session.id || isProcessingRef.current) return;
    
    try {
      // Set processing flag to prevent multiple calls
      isProcessingRef.current = true;
      
      closeConfirmDialog();
      setLoading(true);
      
      // Mark workout as completed in context to prevent pause notification
      setWorkoutCompleted(true);
      
      console.log('Cached exercise results before completion:', exerciseResultsCache.current);
      console.log('Session exercise results before completion:', session.exerciseResults);
      
      // First, save all cached exercise results to ensure we don't lose any data
      try {
        // Create a merged exercise results object from both our cache and existing session data
        const mergedExerciseResults = {
          ...(session.exerciseResults || {}),
          ...exerciseResultsCache.current
        };
        
        // Process exercise results to ensure all entries have proper fields
        Object.keys(mergedExerciseResults).forEach(exerciseId => {
          const exerciseData = mergedExerciseResults[exerciseId];
          
          // Ensure all attempts have setNumber field
          if (exerciseData.attempts && Array.isArray(exerciseData.attempts)) {
            exerciseData.attempts = exerciseData.attempts
              // Filter out entries without necessary fields
              .filter((attempt: any) => 
                attempt && typeof attempt === 'object' &&
                (attempt.repetitions || attempt.duration) &&
                attempt.timestamp
              )
              // Sort by timestamp to ensure correct order
              .sort((a: ExerciseAttempt, b: ExerciseAttempt) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              )
              // Remove duplicates (entries with same timestamp within 50ms)
              .reduce((unique: ExerciseAttempt[], attempt: ExerciseAttempt, index: number, array: ExerciseAttempt[]) => {
                // Check if this is a duplicate (very close timestamp to another entry)
                const isDuplicate = unique.some((existingAttempt: ExerciseAttempt) => {
                  const timeDiff = Math.abs(
                    new Date(existingAttempt.timestamp).getTime() - 
                    new Date(attempt.timestamp).getTime()
                  );
                  return timeDiff < 50 && // Less than 50ms apart
                    existingAttempt.repetitions === attempt.repetitions &&
                    existingAttempt.weight === attempt.weight;
                });
                
                // If not duplicate, ensure it has setNumber
                if (!isDuplicate) {
                  // If no setNumber, assign one based on position
                  if (!attempt.setNumber) {
                    attempt.setNumber = unique.length + 1;
                  }
                  unique.push(attempt);
                }
                
                return unique;
              }, []);
          }
        });
        
        console.log('Saving merged exercise results before completion:', {
          exerciseResults: mergedExerciseResults
        });
        
        // Log exercise IDs we're trying to save
        console.log('Exercise IDs being saved:', Object.keys(mergedExerciseResults));
        
        // First, save all cached exercise results
        const updatedSession = await sessionService.saveSessionExerciseResults(
          session.id,
          { exerciseResults: mergedExerciseResults }
        );
        
        console.log('Updated session after saving exercise results:', updatedSession);
        
        // Update our local session with the updated data
        if (updatedSession) {
          setSession(updatedSession);
          
          // Update the cache to match the cleaned data
          if (updatedSession.exerciseResults) {
            exerciseResultsCache.current = updatedSession.exerciseResults;
          }
        }
      } catch (saveError) {
        console.error('Error saving exercise results before completion:', saveError);
        // Continue with completion even if this fails
      }
      
      // Use exact duration in seconds (instead of rounding to minutes)
      const durationInSeconds = time;
      
      // Calculate estimated calories based on duration in minutes
      // Using exact duration in minutes for more accurate calorie calculation
      const durationInMinutes = time / 60;
      const caloriesBurned = Math.max(Math.round(durationInMinutes * 6.5), 1); // Ensure at least 1 calorie, but use exact duration
      
      // Create the complete session data with the merged exercise results
      // No need to include exercise results again as we've already saved them
      const completeSessionData = {
        duration: durationInSeconds, // Send duration in seconds without enforcing a minimum
        caloriesBurned: caloriesBurned
      };
      
      console.log('Sending complete session data with exact duration:', completeSessionData);
      
      // Update session status with duration and calories only
      // We've already saved the exercise results above
      const completedSession = await sessionService.completeSession(
        session.id, 
        completeSessionData
      );
      
      console.log('Final completed session data:', completedSession);
      
      // Make sure we're using the latest session data
      setSession(completedSession);
      
      // Reset timer
      reset();
      
      // Show success notification
      enqueueSnackbar('Workout completed successfully!', { variant: 'success' });
      
      // Play workout complete audio cue
      // Audio: WORKOUT_COMPLETE - "Workout complete, great job!"
      playCue(AudioCueType.WORKOUT_COMPLETE);
      
      // Call onComplete callback if provided - with a slight delay to ensure state updates
      if (onComplete) {
        setTimeout(() => {
          onComplete(completedSession);
        }, 300);
      }
    } catch (err) {
      console.error('Failed to complete session:', err);
      enqueueSnackbar('Failed to complete workout', { variant: 'error' });
      // Reset completed flag if there was an error
      setWorkoutCompleted(false);
    } finally {
      setLoading(false);
      // Reset processing flag after a delay to prevent rapid clicks
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  };
  
  // Cancel session
  const handleCancelSession = async () => {
    if (!session || !session.id || isProcessingRef.current) return;
    
    try {
      // Set processing flag to prevent multiple calls
      isProcessingRef.current = true;
      
      closeConfirmDialog();
      setLoading(true);
      
      const updatedSession = await sessionService.cancelSession(session.id);
      setSession(updatedSession);
      
      reset();
      enqueueSnackbar('Workout cancelled', { variant: 'info' });
      
      // Call onCancel callback if provided
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      console.error('Failed to cancel session:', err);
      enqueueSnackbar('Failed to cancel workout', { variant: 'error' });
    } finally {
      setLoading(false);
      // Reset processing flag after a delay to prevent rapid clicks
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  };
  
  // Format time display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate session progress percentage
  const calculateProgress = (): number => {
    if (!session || !session.exerciseSequence || !session.exerciseSequence.originalPlan) return 0;
    
    const totalExercises = session.exerciseSequence.originalPlan.length;
    if (totalExercises === 0) return 100;
    
    const completedExercises = session.exerciseSequence.actualSequence && 
      session.exerciseSequence.actualSequence.filter(
        e => e && e.status === ExerciseStatus.COMPLETED
      ).length || 0;
    
    return Math.round((completedExercises / totalExercises) * 100);
  };
  
  // Toggle exercise details expansion
  const toggleExerciseExpanded = () => {
    setExerciseExpanded(!exerciseExpanded);
  };
  
  // Set initial reps value from current exercise when component loads
  useEffect(() => {
    if (session && currentExerciseIndex === 0) {
      // Always start with 0 reps
      setReps(0);
    }
  }, [session, currentExerciseIndex]);
  
  // Is session active helper
  const isSessionActive = useCallback(() => {
    return session?.status === SessionStatus.ACTIVE || session?.status === SessionStatus.PAUSED;
  }, [session]);
  
  // Notify parent component when session active state changes
  useEffect(() => {
    if (onSessionActiveChange) {
      onSessionActiveChange(isSessionActive());
    }
  }, [session?.status, onSessionActiveChange, isSessionActive]);
  
  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSessionActive()) {
        // Show browser confirmation dialog
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSessionActive]);
  
  // Navigation guard - this will be called by parent components
  const handleNavigation = useCallback((callback: () => void) => {
    if (isSessionActive()) {
      // Store the callback to execute if user confirms navigation
      setNavigationCallback(() => callback);
      setShowNavigationDialog(true);
      return false; // Prevent immediate navigation
    }
    return true; // Allow navigation if no active session
  }, [isSessionActive]);
  
  // Make the navigation guard available via ref for parent components
  const navigationGuardRef = useRef<NavigationGuard>({
    handleNavigation,
    isSessionActive
  });
  
  // Keep the ref updated with latest functions
  useEffect(() => {
    navigationGuardRef.current = {
      handleNavigation,
      isSessionActive
    };
  }, [handleNavigation, isSessionActive]);
  
  // Use useImperativeHandle to expose methods to the parent component
  useImperativeHandle(ref, () => ({
    getNavigationGuard: () => navigationGuardRef.current
  }));
  
  // Handle navigation confirmation
  const confirmNavigation = () => {
    // Close dialog
    setShowNavigationDialog(false);
    
    // Pause the session if it's active
    if (session?.status === SessionStatus.ACTIVE) {
      // Use the global pauseActiveSession method
      pauseActiveSession().then(() => {
        // Update local session state
        if (session) {
          const updatedSession = { ...session, status: SessionStatus.PAUSED };
          setSession(updatedSession);
        }
        
        // Execute the navigation callback after pausing
        if (navigationCallback) {
          navigationCallback();
        }
      });
    } else {
      // Execute the navigation callback
      if (navigationCallback) {
        navigationCallback();
      }
    }
    
    setNavigationCallback(null);
  };
  
  // Cancel navigation
  const cancelNavigation = () => {
    setShowNavigationDialog(false);
    setNavigationCallback(null);
  };
  
  // Handle analysis results from AI
  const handleAnalysisComplete = (result: any) => {
    if (!result) return;
    
    try {
      logger.info('Exercise analysis complete:', result);
      
      // Get the current exercise details
      const currentExerciseDetails = getCurrentExerciseDetails();
      
      // Check if we have a valid exercise and it's the correct type
      if (!currentExerciseDetails) return;
      
      // Previous rep count
      const prevReps = typeof reps === 'string' ? parseInt(reps) || 0 : reps;
      let newReps = prevReps;
      
      // Handle different exercise types
      if (isSquatExercise(currentExerciseDetails.exercise.name)) {
        // Update rep count for squat
        newReps = result.repCount || 0;
        setReps(newReps);
      } else if (isBicepCurlExercise(currentExerciseDetails.exercise.name)) {
        // Update rep count for bicep curl
        newReps = result.repCount || 0;
        setReps(newReps);
      } else if (isLungeExercise(currentExerciseDetails.exercise.name)) {
        // Update rep count for lunge
        newReps = result.repCount || 0;
        setReps(newReps);
      } else if (isPlankExercise(currentExerciseDetails.exercise.name)) {
        // For plank, use durationInSeconds
        setDurationTimer(result.durationInSeconds || 0);
      } else if (isSitupExercise(currentExerciseDetails.exercise.name)) {
        // Update rep count for situp
        newReps = result.repCount || 0;
        setReps(newReps);
      } else if (isShoulderPressExercise(currentExerciseDetails.exercise.name)) {
        // Update rep count for shoulder press
        newReps = result.repCount || 0;
        setReps(newReps);
      } else if (isBenchPressExercise(currentExerciseDetails.exercise.name)) {
        // Update rep count for bench press
        newReps = result.repCount || 0;
        setReps(newReps);
      } else if (isPushupExercise(currentExerciseDetails.exercise.name)) {
        // Update rep count for pushup
        newReps = result.repCount || 0;
        setReps(newReps);
      } else if (isLateralRaiseExercise(currentExerciseDetails.exercise.name)) {
        // Update rep count for lateral raise
        newReps = result.repCount || 0;
        setReps(newReps);
      }
      
      // Play audio cues if rep count increased
      if (newReps > prevReps) {
        // Get the current exercise for audio cue type
        const exerciseType = getExerciseType({
          name: currentExerciseDetails.exercise.name,
          muscleGroups: Array.isArray(currentExerciseDetails.exercise.muscleGroups) 
            ? currentExerciseDetails.exercise.muscleGroups 
            : currentExerciseDetails.exercise.muscleGroups ? [currentExerciseDetails.exercise.muscleGroups] : undefined
        });
        
        const targetReps = currentExerciseDetails.targetRepetitions || 0;
        
        // First rep - play form guidance
        if (newReps === 1) {
          playExerciseTypeCue(exerciseType, 0, targetReps);
        } 
        // Halfway point milestone - only if we know the target and it's more than 4 reps
        else if (targetReps > 4 && newReps === Math.floor(targetReps / 2)) {
          // Audio: HALFWAY_POINT - "Halfway there, maintain form"
          playCue(AudioCueType.HALFWAY_POINT);
        }
        // Special 15 rep milestone
        else if (newReps === 15) {
          // Audio: ACHIEVEMENT - "Achievement unlocked!"
          playCue(AudioCueType.ACHIEVEMENT);
        }
        // Later reps - motivation
        else if (targetReps > 0 && newReps / targetReps >= 0.7 && newReps / targetReps < 0.9) {
          // Audio: PUSH_THROUGH - "Push through!"
          playCue(AudioCueType.PUSH_THROUGH);
        } 
        // Last rep
        else if (targetReps > 0 && newReps === targetReps) {
          // Audio: FINAL_REP - "Last rep!"
          playCue(AudioCueType.FINAL_REP);
        }
      }
      
      // Update form score (scale from 0-100 to 0-10)
      const formScoreValue = Math.round((result.formScore || 0) / 10);
      setFormScore(formScoreValue);
      
      // Play form guidance cues if form score is low (below 6 out of 10)
      if (formScoreValue < 6 && formScoreValue > 0) {
        // Determine which form cue to play based on the exercise type
        const exerciseType = getExerciseType({
          name: currentExerciseDetails.exercise.name,
          muscleGroups: Array.isArray(currentExerciseDetails.exercise.muscleGroups) 
            ? currentExerciseDetails.exercise.muscleGroups 
            : currentExerciseDetails.exercise.muscleGroups ? [currentExerciseDetails.exercise.muscleGroups] : undefined
        });
        
        // Get the recommended cues for this exercise type
        const recommendedCues = EXERCISE_TYPE_CUES[exerciseType];
        if (recommendedCues && recommendedCues.length > 0) {
          // Play the second cue if available (usually form related), or the first one
          const formCue = recommendedCues.length > 1 ? recommendedCues[1] : recommendedCues[0];
          playCue(formCue);
        }
      }
      
    } catch (error) {
      logger.error('Error handling analysis result:', error);
    }
  };
  
  // Handle AI analysis errors
  const handleAnalysisError = (error: any) => {
    if (error && error.severity === 'error') {
      setAnalysisError(error.message);
    } else {
      setAnalysisError(null);
    }
  };
  
  // Start duration timer
  const startDurationTimer = () => {
    if (timerRunning) return;
    
    // Convert any string value to number before starting timer
    if (typeof durationTimer === 'string') {
      setDurationTimer(durationTimer === '' ? 0 : Number(durationTimer));
    }
    
    setTimerRunning(true);
    durationTimerRef.current = setInterval(() => {
      setDurationTimer(prev => typeof prev === 'number' ? prev + 1 : 1);
    }, 1000);
  };

  // Stop duration timer
  const stopDurationTimer = () => {
    if (!timerRunning) return;
    
    setTimerRunning(false);
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    
    // Set the reps value to the duration timer value
    if (currentExerciseDetails?.isDurationBased) {
      setReps(durationTimer);
    }
  };

  // Reset duration timer
  const resetDurationTimer = () => {
    stopDurationTimer();
    setDurationTimer('');
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
      
      // Clean up any exercise analyzer state
      resetExerciseAnalyzers();
    };
  }, [resetExerciseAnalyzers]);
  
  // Render the appropriate analyzer based on exercise type
  const renderExerciseAnalyzer = () => {
    const currentExercise = getCurrentPlannedExercise();
    if (!currentExercise) return null;
    
    // Get the current exercise details from workout plan
    const exerciseDetails = session?.workoutPlan?.exercises?.find(
      ex => ex.exercise.id === currentExercise.exerciseId
    );
    
    if (!exerciseDetails || !exerciseDetails.exercise.name) return null;
    
    // Check if this is a squat exercise
    if (isSquatExercise(exerciseDetails.exercise.name)) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <PoseDetectionProvider>
            <AnalysisStateProvider>
              <SquatAnalyzer 
                ref={squatAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </AnalysisStateProvider>
          </PoseDetectionProvider>
        </Box>
      );
    }
    
    // Check if this is a bicep curl exercise
    if (isBicepCurlExercise(exerciseDetails.exercise.name)) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <PoseDetectionProvider>
            <AnalysisStateProvider>
              <BicepAnalyzer 
                ref={bicepAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
                targetReps={exerciseDetails.repetitions || 10}
              />
            </AnalysisStateProvider>
          </PoseDetectionProvider>
        </Box>
      );
    }
    
    // Check if this is a lunge exercise
    if (isLungeExercise(exerciseDetails.exercise.name)) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <PoseDetectionProvider>
            <AnalysisStateProvider>
              <LungeAnalyzer 
                ref={lungeAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </AnalysisStateProvider>
          </PoseDetectionProvider>
        </Box>
      );
    }
    
    // Check if this is a plank exercise
    if (isPlankExercise(exerciseDetails.exercise.name)) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <PoseDetectionProvider>
            <AnalysisStateProvider>
              <PlankAnalyzer 
                ref={plankAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </AnalysisStateProvider>
          </PoseDetectionProvider>
        </Box>
      );
    }
    
    // Check if this is a situp exercise
    if (isSitupExercise(exerciseDetails.exercise.name)) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <PoseDetectionProvider>
            <AnalysisStateProvider>
              <SitupAnalyzer 
                ref={situpAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </AnalysisStateProvider>
          </PoseDetectionProvider>
        </Box>
      );
    }

    // Check if this is a shoulder press exercise
    if (isShoulderPressExercise(exerciseDetails.exercise.name)) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <PoseDetectionProvider>
            <AnalysisStateProvider>
              <ShoulderPressAnalyzer 
                ref={shoulderPressAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </AnalysisStateProvider>
          </PoseDetectionProvider>
        </Box>
      );
    }
    
    // Check if this is a bench press exercise
    if (isBenchPressExercise(exerciseDetails.exercise.name)) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <PoseDetectionProvider>
            <AnalysisStateProvider>
              <BenchPressAnalyzer 
                ref={benchPressAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </AnalysisStateProvider>
          </PoseDetectionProvider>
        </Box>
      );
    }
    
    // Check if this is a pushup exercise
    if (isPushupExercise(exerciseDetails.exercise.name)) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <PoseDetectionProvider>
            <AnalysisStateProvider>
              <PushupAnalyzer 
                ref={pushupAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </AnalysisStateProvider>
          </PoseDetectionProvider>
        </Box>
      );
    }
    
    // Check if this is a lateral raise exercise
    if (isLateralRaiseExercise(exerciseDetails.exercise.name)) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <PoseDetectionProvider>
            <AnalysisStateProvider>
              <LateralRaiseAnalyzer 
                ref={lateralRaiseAnalyzerRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </AnalysisStateProvider>
          </PoseDetectionProvider>
        </Box>
      );
    }
    
    // Return null for other exercise types (for now)
    return null;
  };
  
  // Render loading state
  if (loading && !session) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Starting workout session...
        </Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
        <Button variant="outlined" color="error" sx={{ ml: 2 }} onClick={() => setSession(existingSession)}>
          Retry
        </Button>
      </Alert>
    );
  }
  
  // Render no session state
  if (!session) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        No workout session available.
        <Button variant="outlined" color="warning" sx={{ ml: 2 }} onClick={() => setSession(existingSession)}>
          Start Session
        </Button>
      </Alert>
    );
  }
  
  // Get current exercise
  const currentPlannedExercise = getCurrentPlannedExercise();
  const currentActualExercise = getCurrentActualExercise();
  const currentExercise = currentPlannedExercise ? 
    getExerciseById(currentPlannedExercise.exerciseId) : undefined;
  
  // Calculate progress
  const progress = calculateProgress();
  
  // Get current exercise details
  const currentExerciseDetails = getCurrentExerciseDetails();
  
  // Add a handleRepCountChange function to play appropriate audio cues based on rep progress
  const handleRepCountChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    setReps(value);
    
    // Only play audio cues if reps are increasing (not when manually setting or decreasing)
    if (numValue > (typeof reps === 'string' ? parseInt(reps) || 0 : reps)) {
      const currentDetails = getCurrentExerciseDetails();
      if (!currentDetails) return;
      
      const targetReps = currentDetails.targetRepetitions || 0;
      if (targetReps <= 0) return; // Skip if no target reps defined
      
      // Calculate progress through the set
      const progress = numValue / targetReps;
      
      // Get exercise type for exercise-specific cues
      const exercise = getExerciseById(currentDetails.exerciseId);
      if (!exercise || !exercise.name) return;
      
      const exerciseType = getExerciseType({
        name: exercise.name,
        muscleGroups: Array.isArray(exercise.muscleGroups) 
          ? exercise.muscleGroups 
          : exercise.muscleGroups ? [exercise.muscleGroups] : undefined
      });
      
      // Play appropriate audio cue based on rep count progress
      if (numValue === 1) {
        // First rep - play form guidance
        playExerciseTypeCue(exerciseType, 0, targetReps);
      } else if (progress >= 0.7 && progress < 0.9) {
        // Later reps - motivation
        playCue(AudioCueType.PUSH_THROUGH);
      } else if (numValue === targetReps) {
        // Last rep
        playCue(AudioCueType.FINAL_REP);
      }
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      {/* Session header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2, background: 'linear-gradient(to right, rgba(50,50,50,0.9), rgba(30,30,30,0.95))' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff' }}>
            {session?.workoutPlan?.name || 'Workout Session'}
          </Typography>
          <Chip 
            label={session?.status || 'UNKNOWN'} 
            color={
              session?.status === SessionStatus.ACTIVE ? 'success' : 'default'
            }
            sx={{ 
              fontSize: '0.9rem', 
              fontWeight: 'bold',
              py: 1,
              px: 1.5
            }}
          />
        </Box>
        
        <Box display="flex" alignItems="center" mb={3} sx={{ 
          p: 2, 
          borderRadius: 2, 
          background: 'rgba(255,255,255,0.08)',
          width: 'fit-content'
        }}>
          <Timer sx={{ mr: 1.5, fontSize: 30, color: '#fff' }} />
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff', letterSpacing: 1 }}>
            {formatTime(time)}
          </Typography>
        </Box>
        
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body1" fontWeight="medium" sx={{ color: '#fff' }}>
              Progress: {progress}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {currentExerciseIndex + 1} of {session?.exerciseSequence?.originalPlan?.length || 0} exercises
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundImage: 'linear-gradient(to right, #4CAF50, #8BC34A)'
              }
            }} 
          />
        </Box>
        
        <Stack direction="row" spacing={2} justifyContent="center">
          {session.status === SessionStatus.ACTIVE ? (
            <Button 
              variant="contained" 
              color="warning"
              startIcon={<Pause />}
              onClick={handlePauseSession}
              sx={{ 
                px: 3, 
                py: 1.2, 
                borderRadius: 2,
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px rgba(0,0,0,0.15)'
                }
              }}
            >
              Pause
            </Button>
          ) : session.status === SessionStatus.PAUSED ? (
            <Button 
              variant="contained" 
              color="success"
              startIcon={<PlayArrow />}
              onClick={handleResumeSession}
              sx={{ 
                px: 3, 
                py: 1.2, 
                borderRadius: 2,
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px rgba(0,0,0,0.15)'
                }
              }}
            >
              Resume
            </Button>
          ) : null}
          
          <Button 
            variant="contained" 
            color="success"
            startIcon={<Check />}
            onClick={() => openConfirmDialog('complete')}
            sx={{ 
              px: 3, 
              py: 1.2, 
              borderRadius: 2,
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 10px rgba(0,0,0,0.15)'
              }
            }}
          >
            Complete
          </Button>
          
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<Cancel />}
            onClick={() => openConfirmDialog('cancel')}
            sx={{ 
              px: 3, 
              py: 1.2, 
              borderRadius: 2,
              fontWeight: 'bold',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                backgroundColor: 'rgba(211, 47, 47, 0.08)'
              }
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Paper>
      
      {/* Rest timer dialog */}
      <Dialog 
        open={showRestTimer} 
        onClose={() => {}} // Prevent dialog from closing on backdrop click
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            background: 'linear-gradient(to bottom, #2c3e50, #1a2530)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1, color: '#fff' }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Rest Time
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            p={4}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.08)', 
              borderRadius: 3,
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'relative', width: 180, height: 180, mb: 4 }}>
              <CircularProgress 
                variant="determinate" 
                value={(timeLeft / 30) * 100} 
                size={180} 
                thickness={6}
                sx={{ position: 'absolute', opacity: 0.2 }}
              />
              <CircularProgress 
                variant="determinate" 
                value={(timeLeft / 30) * 100} 
                size={180} 
                thickness={6}
                color="primary"
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
              >
                <Typography variant="h2" color="primary" fontWeight="bold">
                  {timeLeft}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="h6" textAlign="center" sx={{ mb: 2, color: '#fff' }}>
                Take a break before the next set
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Your set has been recorded. Prepare for your next set of{' '}
                <Typography component="span" fontWeight="bold" color="primary" display="inline">{currentExercise?.name || 'exercise'}</Typography>.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setShowRestTimer(false)} 
            variant="contained" 
            color="primary"
            sx={{ 
              minWidth: 150, 
              py: 1.2, 
              fontSize: '1rem', 
              fontWeight: 'bold',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 14px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Skip Rest
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Current exercise card */}
      {currentExercise && currentPlannedExercise && (
        <Card 
          variant="outlined" 
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          <Box 
            sx={{ 
              backgroundColor: 'primary.main', 
              py: 0.75, 
              px: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
              {currentExerciseIndex + 1}. {currentExercise?.name || 'Exercise'}
            </Typography>
            <IconButton onClick={toggleExerciseExpanded} sx={{ color: '#fff' }}>
              {exerciseExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <CardContent sx={{ pt: 3, pb: 3 }}>
            <Collapse in={exerciseExpanded}>
              {currentExercise?.imageUrl && (
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <CardMedia
                    component="img"
                    height="250"
                    image={currentExercise.imageUrl}
                    alt={currentExercise.name || 'Exercise'}
                    sx={{ 
                      borderRadius: 2, 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                </Box>
              )}
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      backgroundColor: 'rgba(25, 118, 210, 0.07)'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Target Sets
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {currentExerciseDetails?.targetSets || 0}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      backgroundColor: 'rgba(76, 175, 80, 0.07)'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {currentExerciseDetails?.isDurationBased ? "Target Duration" : "Target Reps"}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {currentExerciseDetails?.isDurationBased 
                        ? `${currentExerciseDetails?.targetDuration}s` 
                        : currentExerciseDetails?.targetRepetitions || 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      backgroundColor: 'rgba(255, 152, 0, 0.07)'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rest Time
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {currentExerciseDetails?.restTime || 0}s
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Instructions:
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2, 
                  mb: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.03)'
                }}
              >
                <Typography variant="body1">
                  {currentExercise?.instructions ? (
                    Array.isArray(currentExercise.instructions) 
                      ? currentExercise.instructions.join("\n") 
                      : typeof currentExercise.instructions === 'string'
                        ? currentExercise.instructions
                        : 'No instructions available for this exercise.'
                  ) : currentExercise?.description ? (
                    currentExercise.description
                  ) : (
                    'No instructions available for this exercise.'
                  )}
                </Typography>
              </Paper>
              
              {currentPlannedExercise?.notes && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Notes:
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2, 
                      mb: 3,
                      backgroundColor: 'rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    <Typography variant="body1">
                      {currentPlannedExercise.notes}
                    </Typography>
                  </Paper>
                </>
              )}
            </Collapse>
            
            {/* Add AI Form Analysis for supported exercises */}
            {renderExerciseAnalyzer()}
            
            {/* Display any analysis errors */}
            {analysisError && (
              <Alert 
                severity="error" 
                sx={{ mt: 2, mb: 2 }}
                onClose={() => setAnalysisError(null)}
              >
                {analysisError}
              </Alert>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3, 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'primary.main',
                  color: 'white'
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Current Set: {currentSet} / {currentExerciseDetails?.targetSets || 3}
                </Typography>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={currentExerciseDetails?.isDurationBased ? "Duration (seconds)" : "Repetitions"}
                    type="number"
                    fullWidth
                    size="medium"
                    value={currentExerciseDetails?.isDurationBased ? durationTimer : reps}
                    onChange={(e) => {
                      if (currentExerciseDetails?.isDurationBased) {
                        setDurationTimer(e.target.value === '' ? '' : Number(e.target.value));
                        setReps(e.target.value === '' ? '' : Number(e.target.value));
                      } else {
                        handleRepCountChange(e.target.value === '' ? '' : Number(e.target.value));
                      }
                    }}
                    InputProps={{ 
                      inputProps: { min: 0 },
                      startAdornment: (
                        <Box component="span" sx={{ mr: 1, color: 'text.secondary' }}>
                          {currentExerciseDetails?.isDurationBased ? 
                            <Timer fontSize="small" /> : 
                            <FitnessCenter fontSize="small" />
                          }
                        </Box>
                      ),
                      endAdornment: currentExerciseDetails?.isDurationBased ? (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {!timerRunning ? (
                            <IconButton 
                              onClick={startDurationTimer} 
                              edge="end" 
                              size="small" 
                              color="primary"
                            >
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton 
                              onClick={stopDurationTimer} 
                              edge="end" 
                              size="small" 
                              color="error"
                            >
                              <Pause fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            onClick={resetDurationTimer} 
                            edge="end" 
                            size="small"
                          >
                            <RestartAlt fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : undefined
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Weight (kg)"
                    type="number"
                    fullWidth
                    size="medium"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    InputProps={{ 
                      inputProps: { min: 0, step: 0.5 },
                      startAdornment: (
                        <Box component="span" sx={{ mr: 1, color: 'text.secondary' }}>
                          <FitnessCenter fontSize="small" />
                        </Box>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel>Form Quality</InputLabel>
                    <Select
                      value={formScore}
                      label="Form Quality"
                      onChange={(e) => setFormScore(Number(e.target.value))}
                    >
                      <MenuItem value={10}>Perfect (10)</MenuItem>
                      <MenuItem value={9}>Excellent (9)</MenuItem>
                      <MenuItem value={8}>Very Good (8)</MenuItem>
                      <MenuItem value={7}>Good (7)</MenuItem>
                      <MenuItem value={6}>Above Average (6)</MenuItem>
                      <MenuItem value={5}>Average (5)</MenuItem>
                      <MenuItem value={4}>Below Average (4)</MenuItem>
                      <MenuItem value={3}>Poor (3)</MenuItem>
                      <MenuItem value={2}>Very Poor (2)</MenuItem>
                      <MenuItem value={1}>Extremely Poor (1)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    multiline
                    rows={2}
                    fullWidth
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did this set feel? Any difficulties?"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleLogSet}
                fullWidth
                sx={{ 
                  mt: 3,
                  py: 1.5, 
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                Log Set
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Exercise navigation */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button
          variant="outlined"
          startIcon={<SkipPrevious />}
          onClick={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
          sx={{ 
            px: 3, 
            py: 1.2, 
            borderRadius: 2,
            borderWidth: 2,
            '&:hover:not(:disabled)': {
              borderWidth: 2,
              transform: 'translateX(-2px)'
            },
            '&:disabled': {
              borderWidth: 2,
              opacity: 0.5
            }
          }}
        >
          Previous
        </Button>
        
        <Paper 
          elevation={0} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            px: 3, 
            py: 1, 
            borderRadius: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.06)'
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            Exercise {currentExerciseIndex + 1} of {session?.exerciseSequence?.originalPlan?.length || 0}
          </Typography>
        </Paper>
        
        <Button
          variant="outlined"
          endIcon={<SkipNext />}
          onClick={handleNextExercise}
          disabled={!session?.exerciseSequence?.originalPlan || currentExerciseIndex >= (session.exerciseSequence.originalPlan.length - 1)}
          sx={{ 
            px: 3, 
            py: 1.2, 
            borderRadius: 2,
            borderWidth: 2,
            '&:hover:not(:disabled)': {
              borderWidth: 2,
              transform: 'translateX(2px)'
            },
            '&:disabled': {
              borderWidth: 2,
              opacity: 0.5
            }
          }}
        >
          Next
        </Button>
      </Box>
      
      {/* Confirm dialog */}
      <Dialog 
        open={showConfirmDialog} 
        onClose={closeConfirmDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1
          }
        }}
      >
        <DialogTitle sx={{ pt: 3, px: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            {confirmAction === 'complete' ? 'Complete Workout?' : 'Cancel Workout?'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1">
            {confirmAction === 'complete'
              ? 'Are you sure you want to complete this workout session? This will finalize all tracked exercises and save your progress.'
              : 'Are you sure you want to cancel this workout session? Your progress will not be saved.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={closeConfirmDialog} 
            color="inherit"
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            No
          </Button>
          <Button 
            onClick={confirmAction === 'complete' ? handleCompleteSession : handleCancelSession}
            color={confirmAction === 'complete' ? 'success' : 'error'}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 'bold'
            }}
          >
            Yes, {confirmAction === 'complete' ? 'Complete' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Navigation confirmation dialog */}
      <Dialog 
        open={showNavigationDialog} 
        onClose={cancelNavigation}
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1
          }
        }}
      >
        <DialogTitle sx={{ pt: 3, px: 3 }}>
          <Box display="flex" alignItems="center">
            <Warning color="warning" sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Active Workout in Progress
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            You have an active workout session in progress. Navigating away will pause your workout.
          </Typography>
          <Typography variant="body1">
            Do you want to continue and pause your workout?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={cancelNavigation} 
            color="primary"
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 'bold'
            }}
          >
            Stay on Workout
          </Button>
          <Button 
            onClick={confirmNavigation}
            color="warning"
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Pause and Navigate Away
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

// Add the static property to the component
(SessionTracker as SessionTrackerComponent).navigationGuard = true;

export default SessionTracker as SessionTrackerComponent; 