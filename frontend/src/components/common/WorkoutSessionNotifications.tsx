import React, { useEffect, useState } from 'react';
import { useSnackbar, SnackbarKey } from 'notistack';
import { useWorkoutSession } from '../../App';
import { Box } from '@mui/material';

/**
 * A component that listens for workout session state changes
 * and displays appropriate notifications using Snackbar.
 */
const WorkoutSessionNotifications: React.FC = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { 
    isWorkoutActive, 
    activeSessionId, 
    workoutCompleted,
    setWorkoutActive, 
    setActiveSessionId 
  } = useWorkoutSession();
  
  const [prevState, setPrevState] = useState<{
    isActive: boolean;
    sessionId: number | null;
    completed: boolean;
  }>({ isActive: false, sessionId: null, completed: false });
  
  // Track current notification key to close it when needed
  const [pauseNotificationKey, setPauseNotificationKey] = useState<SnackbarKey | null>(null);

  useEffect(() => {
    // Only show notifications for session changes after initial render
    if (prevState.sessionId !== null) {
      // Session was active but now is not
      if (prevState.isActive && !isWorkoutActive && !workoutCompleted && !prevState.completed) {
        // Instead of showing persistent notification, just log a message
        console.log('Workout paused - avoiding showing persistent notification');
        
        // Non-persistent notification with no action button
        enqueueSnackbar('Your workout has been paused. You can resume it from the sessions page.', { 
          variant: 'info',
          autoHideDuration: 5000, // Auto hide after 5 seconds
          anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
        });
      }
      
      // Session was not active but now is (started or resumed)
      if (!prevState.isActive && isWorkoutActive) {
        // Close pause notification if it exists
        if (pauseNotificationKey) {
          closeSnackbar(pauseNotificationKey);
          setPauseNotificationKey(null);
        }
        
        enqueueSnackbar('Your workout session is active', { variant: 'success' });
      }
      
      // Session ID changed (switched to a different session)
      if (prevState.sessionId !== activeSessionId && activeSessionId !== null) {
        enqueueSnackbar('Switched to a different workout session', { variant: 'info' });
      }
    }
    
    // Update previous state
    setPrevState({
      isActive: isWorkoutActive,
      sessionId: activeSessionId,
      completed: workoutCompleted
    });
  }, [isWorkoutActive, activeSessionId, workoutCompleted, enqueueSnackbar, closeSnackbar, pauseNotificationKey]);

  // Clean up notification on unmount
  useEffect(() => {
    return () => {
      if (pauseNotificationKey) {
        closeSnackbar(pauseNotificationKey);
      }
    };
  }, [closeSnackbar, pauseNotificationKey]);

  // This component doesn't render anything
  return null;
};

export default WorkoutSessionNotifications; 