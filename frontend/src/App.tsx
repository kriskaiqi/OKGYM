import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Router from './router';
import { sessionService } from './services';
import { AudioCueProvider } from './contexts/AudioCueContext';

// Styles
import './styles/global.css';

// Create a context for workout session state
export interface WorkoutSessionContext {
  isWorkoutActive: boolean;
  setWorkoutActive: (active: boolean) => void;
  confirmNavigation: (callback: () => void) => boolean;
  activeSessionId: number | null;
  setActiveSessionId: (id: number | null) => void;
  pauseActiveSession: () => Promise<boolean>;
  workoutCompleted: boolean;
  setWorkoutCompleted: (completed: boolean) => void;
}

const defaultContext: WorkoutSessionContext = {
  isWorkoutActive: false,
  setWorkoutActive: () => {},
  confirmNavigation: () => true,
  activeSessionId: null,
  setActiveSessionId: () => {},
  pauseActiveSession: async () => false,
  workoutCompleted: false,
  setWorkoutCompleted: () => {}
};

export const WorkoutSessionContext = createContext<WorkoutSessionContext>(defaultContext);

// Custom hook to use the workout session context
export const useWorkoutSession = () => useContext(WorkoutSessionContext);

const App: React.FC = () => {
  // Track active workout session state globally
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  
  // Reset workout completed flag when starting a new session
  useEffect(() => {
    if (isWorkoutActive) {
      setWorkoutCompleted(false);
    }
  }, [isWorkoutActive]);
  
  // Pause the active session
  const pauseActiveSession = useCallback(async () => {
    if (isWorkoutActive && activeSessionId) {
      try {
        await sessionService.pauseSession(activeSessionId);
        console.log('Your workout has been paused');
        return true;
      } catch (err) {
        console.error('Failed to pause workout session:', err);
        return false;
      }
    }
    return false;
  }, [isWorkoutActive, activeSessionId]);
  
  // Navigation confirmation handler
  const confirmNavigation = useCallback((callback: () => void) => {
    if (isWorkoutActive) {
      const confirmed = window.confirm(
        "You have an active workout session. Navigating away will pause your workout. Continue?"
      );
      
      if (confirmed) {
        // Pause the active session before navigating
        pauseActiveSession().then(() => {
          callback();
        });
        return true;
      }
      return false;
    }
    
    // If no active workout, allow navigation
    callback();
    return true;
  }, [isWorkoutActive, pauseActiveSession]);
  
  // Create value for context
  const workoutSessionContextValue = {
    isWorkoutActive,
    setWorkoutActive: setIsWorkoutActive,
    confirmNavigation,
    activeSessionId,
    setActiveSessionId,
    pauseActiveSession,
    workoutCompleted,
    setWorkoutCompleted
  };

  return (
    <ThemeProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        autoHideDuration={3000}
      >
        <AuthProvider>
          <WorkoutSessionContext.Provider value={workoutSessionContextValue}>
            <AudioCueProvider>
            <CssBaseline />
            <Router />
            </AudioCueProvider>
          </WorkoutSessionContext.Provider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App; 