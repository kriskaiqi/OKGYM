import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress,
  Chip,
  LinearProgress,
  Grid,
  Divider 
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import { WorkoutSession } from '../../types/workout';
import sessionService from '../../services/sessionService';
import { useSnackbar } from 'notistack';
import { SessionStatus } from '../../types/workout';
import { useWorkoutSession } from '../../App';

interface ActiveSessionWidgetProps {
  onStartSession?: () => void;
  refreshDashboard?: () => void;
}

const ActiveSessionWidget: React.FC<ActiveSessionWidgetProps> = ({ 
  onStartSession, 
  refreshDashboard 
}) => {
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { setWorkoutCompleted } = useWorkoutSession();

  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First check for active sessions
        const activeResult = await sessionService.getUserSessions({ 
          status: 'ACTIVE', 
          limit: 1 
        });
        
        // If no active session found, check for paused sessions
        if (activeResult.sessions.length === 0) {
          const pausedResult = await sessionService.getUserSessions({ 
            status: 'PAUSED', 
            limit: 1 
          });
          
          if (pausedResult.sessions.length > 0) {
            const session = pausedResult.sessions[0];
            
            // Validate that the session has the required data
            if (!session.workoutPlan) {
              console.warn('Received session without workout plan data');
              setError('Session data is incomplete');
              setActiveSession(null);
            } else {
              setActiveSession(session);
            }
          } else {
            setActiveSession(null);
          }
        } else {
          const session = activeResult.sessions[0];
          
          // Validate that the session has the required data
          if (!session.workoutPlan) {
            console.warn('Received session without workout plan data');
            setError('Session data is incomplete');
            setActiveSession(null);
          } else {
            setActiveSession(session);
          }
        }
      } catch (err) {
        console.error('Error fetching active session:', err);
        setError('Failed to load active session');
        setActiveSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSession();
  }, []);

  const handleContinueSession = () => {
    if (activeSession) {
      // If session is paused, we need to resume it first
      if (activeSession.status === SessionStatus.PAUSED) {
        // Resume the session before navigating
        sessionService.resumeSession(activeSession.id)
          .then(() => {
            // After resuming, refresh the dashboard if needed
            if (refreshDashboard) {
              refreshDashboard();
            }
            // Then navigate to the session page
            navigate('/sessions');
          })
          .catch(error => {
            console.error('Error resuming session:', error);
            enqueueSnackbar('Error resuming session', { variant: 'error' });
            // Navigate anyway to let the session page handle it
            navigate('/sessions');
          });
      } else {
        // For active sessions, just navigate
        navigate('/sessions');
      }
    }
  };

  const handlePauseSession = async () => {
    if (!activeSession) return;
    
    try {
      setLoading(true);
      
      // Calculate session duration in seconds based on start time
      let sessionDurationSeconds = 0;
      if (activeSession.startTime) {
        // Calculate duration from session start to now in seconds
        const startTime = new Date(activeSession.startTime);
        const now = new Date();
        sessionDurationSeconds = Math.round((now.getTime() - startTime.getTime()) / 1000);
      }
      
      // Calculate estimated calories (simple calculation - can be enhanced)
      // Using exact duration in minutes for more accurate calorie calculation
      const durationInMinutes = sessionDurationSeconds / 60;
      const caloriesBurned = Math.max(Math.round(durationInMinutes * 6.5), 1); // Ensure at least 1 calorie
      
      console.log('Pausing session with exact duration:', sessionDurationSeconds, 'seconds, calories:', caloriesBurned);
      
      // Pass duration and calories to ensure they're properly recorded
      await sessionService.pauseSession(activeSession.id, {
        duration: sessionDurationSeconds,
        caloriesBurned: caloriesBurned
      });
      
      enqueueSnackbar('Workout session paused', { variant: 'success' });
      
      // Refresh session data
      const updatedSession = await sessionService.getSessionById(activeSession.id);
      setActiveSession(updatedSession);
      
      if (refreshDashboard) {
        refreshDashboard();
      }
    } catch (err) {
      console.error('Error pausing session:', err);
      enqueueSnackbar('Failed to pause session', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!activeSession) return;
    
    try {
      setLoading(true);
      
      // Set workout completed flag in context to prevent pause notification
      setWorkoutCompleted(true);
      
      // Calculate session duration in seconds based on start time
      let sessionDurationSeconds = 0;
      if (activeSession.startTime) {
        // Calculate duration from session start to now in seconds
        const startTime = new Date(activeSession.startTime);
        const now = new Date();
        sessionDurationSeconds = Math.round((now.getTime() - startTime.getTime()) / 1000);
      }
      
      // Calculate estimated calories (simple calculation - can be enhanced)
      // Using exact duration in minutes for more accurate calorie calculation
      const durationInMinutes = sessionDurationSeconds / 60;
      const caloriesBurned = Math.max(Math.round(durationInMinutes * 6.5), 1); // Ensure at least 1 calorie
      
      console.log('Completing session with exact duration:', sessionDurationSeconds, 'seconds, calories:', caloriesBurned);
      
      // Pass duration and calories to ensure they're properly recorded
      await sessionService.completeSession(activeSession.id, {
        duration: sessionDurationSeconds,
        caloriesBurned: caloriesBurned
      });
      
      enqueueSnackbar('Workout session completed!', { variant: 'success' });
      setActiveSession(null);
      
      if (refreshDashboard) {
        refreshDashboard();
      }
    } catch (err) {
      console.error('Error completing session:', err);
      enqueueSnackbar('Failed to complete session', { variant: 'error' });
      
      // Reset completed flag if there was an error
      setWorkoutCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewSession = () => {
    if (onStartSession) {
      onStartSession();
    } else {
      navigate('/sessions');
    }
  };

  // Calculate session progress safely
  const getSessionProgress = (): number => {
    if (!activeSession || !activeSession.summary) {
      return 0;
    }
    
    const totalExercises = activeSession?.summary?.totalExercises || 0;
    const completedExercises = activeSession?.summary?.exerciseSummaries?.length || 0;
    
    return totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
        <CircularProgress size={40} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3, minHeight: 150 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleStartNewSession}
          >
            Start New Workout
          </Button>
        </Box>
      </Paper>
    );
  }

  if (!activeSession) {
    return (
      <Paper elevation={2} sx={{ p: 3, minHeight: 150 }}>
        <Typography variant="h6" gutterBottom>
          Ready for a workout?
        </Typography>
        <Typography color="text.secondary" paragraph>
          You don't have any active workout sessions.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayIcon />}
          onClick={handleStartNewSession}
          fullWidth
          sx={{ mt: 1 }}
        >
          Start New Workout
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6">
            Active Workout
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {activeSession.workoutPlan?.name || 'Custom Workout'}
          </Typography>
        </Box>
        <Chip 
          label={activeSession.status === SessionStatus.ACTIVE ? 'Active' : 'Paused'} 
          color={activeSession.status === SessionStatus.ACTIVE ? 'primary' : 'default'}
          size="small"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            {activeSession.summary?.exerciseSummaries?.length || 0} of {activeSession.summary?.totalExercises || 0} exercises completed
          </Typography>
          <Typography variant="body2">
            {Math.round(getSessionProgress())}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={getSessionProgress()} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              Started {activeSession.startTime && formatDistance(new Date(activeSession.startTime), new Date(), { addSuffix: true })}
            </Typography>
          </Box>
        </Grid>
        {activeSession.caloriesBurned > 0 && (
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FireIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="body2">
                {activeSession.caloriesBurned || 0} calories burned
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleContinueSession}
          startIcon={activeSession.status === SessionStatus.ACTIVE ? <PlayIcon /> : null}
        >
          {activeSession.status === SessionStatus.ACTIVE ? 'Resume Workout' : 'Continue Workout'}
        </Button>

        <Box>
          {activeSession.status === SessionStatus.ACTIVE ? (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PauseIcon />}
              onClick={handlePauseSession}
              sx={{ mr: 1 }}
            >
              Pause
            </Button>
          ) : null}
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleCompleteSession}
          >
            Complete
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ActiveSessionWidget; 