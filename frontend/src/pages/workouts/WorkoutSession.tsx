import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Grid,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Divider,
  LinearProgress,
  Snackbar,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { workoutService } from '../../services';
import { WorkoutPlan, WorkoutExercise as ApiWorkoutExercise, WorkoutDifficulty } from '../../types/workout';
import { Exercise as ApiExercise } from '../../types/exercise';
import { getExerciseImageUrl } from '../../utils/imageUtils';

// Define Exercise type for component use
interface Exercise {
  id: string;
  name: string;
  description?: string;
  category?: string;
  muscleGroups: string[];
  equipment?: string[];
  difficulty?: string;
  imageUrl?: string;
  videoUrl?: string;
  instructions?: string[];
  estimatedDuration?: number;
  calories?: number;
}

// Define WorkoutExercise type
interface WorkoutExercise {
  id: string | number;
  exerciseId: string;
  order: number;
  sets: number;
  reps?: number;
  duration?: number; // in seconds
  restTime: number; // in seconds
  exercise?: Exercise;
}

// Define Workout type to accept both string and number for id
interface Workout {
  id: string | number;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  estimatedCaloriesBurn: number;
  imageUrl?: string;
  exercises: WorkoutExercise[];
}

// Convert API WorkoutPlan to component Workout
const mapApiWorkoutToComponentWorkout = (apiWorkout: WorkoutPlan): Workout => {
  // Determine workout level
  let level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
  
  switch (apiWorkout.difficulty) {
    case WorkoutDifficulty.BEGINNER:
      level = 'beginner';
      break;
    case WorkoutDifficulty.INTERMEDIATE:
      level = 'intermediate';
      break;
    case WorkoutDifficulty.ADVANCED:
      level = 'advanced';
      break;
  }

  // Map exercises
  const exercises = apiWorkout.exercises.map(apiExercise => {
    const apiExerciseData = apiExercise.exercise;
    
    // Create Exercise object with proper typing
    const exercise: Exercise = {
      id: apiExerciseData.id.toString(),
      name: apiExerciseData.name,
      description: apiExerciseData.description,
      category: apiExerciseData.category,
      muscleGroups: Array.isArray(apiExerciseData.muscleGroups) 
        ? apiExerciseData.muscleGroups 
        : [],
      equipment: Array.isArray(apiExerciseData.equipment) 
        ? apiExerciseData.equipment 
        : [],
      difficulty: apiExerciseData.difficulty,
      imageUrl: apiExerciseData.imageUrl,
      videoUrl: apiExerciseData.videoUrl,
      instructions: Array.isArray(apiExerciseData.instructions)
        ? apiExerciseData.instructions
        : [],
      estimatedDuration: apiExerciseData.estimatedDuration,
      calories: apiExerciseData.calories
    };

    return {
      id: apiExercise.id,
      exerciseId: exercise.id,
      order: apiExercise.order,
      sets: 3, // Default to 3 sets if not specified
      reps: apiExercise.repetitions || undefined,
      duration: apiExercise.duration || undefined,
      restTime: apiExercise.restTime,
      exercise
    } as WorkoutExercise;
  });

  return {
    id: apiWorkout.id,
    name: apiWorkout.name,
    description: apiWorkout.description,
    level,
    estimatedDuration: apiWorkout.estimatedDuration,
    estimatedCaloriesBurn: apiWorkout.estimatedCaloriesBurn,
    imageUrl: apiWorkout.imageUrl,
    exercises
  };
};

// Define ExerciseForm type for tracking user's progress
interface ExerciseFormData {
  sets: Array<{
    reps?: number;
    weight?: number;
    duration?: number; // in seconds
    completed: boolean;
  }>;
}

// Update WorkoutSessionData to work with both string and number IDs
interface WorkoutSessionData {
  workoutId: string | number;
  startTime: string;
  endTime?: string;
  exercises: Array<{
    exerciseId: string | number;
    sets: Array<{
      reps?: number;
      weight?: number;
      duration?: number;
      completed: boolean;
    }>;
  }>;
  totalDuration?: number; // in seconds
  caloriesBurned?: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const WorkoutSession: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [exerciseTimers, setExerciseTimers] = useState<{ [key: string | number]: number }>({});
  const [restTimers, setRestTimers] = useState<{ [key: string | number]: number }>({});
  const [timerActive, setTimerActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [exerciseFormData, setExerciseFormData] = useState<{ [key: string | number]: ExerciseFormData }>({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [submitting, setSubmitting] = useState(false);

  const intervalRef = useRef<number | null>(null);

  // Start session timer
  const startTimer = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }
    
    // Set timer to update every second
    intervalRef.current = window.setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
    
    setTimerActive(true);
  };

  // Initialize workout session
  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      if (!workoutId) return;
      
      setLoading(true);
      try {
        // Fetch workout plan details
        const workoutData = await workoutService.getWorkoutPlanById(workoutId);
        
        // Start the workout session
        await workoutService.startWorkout(workoutId);
        
        // Convert API model to component model
        const mappedWorkout = mapApiWorkoutToComponentWorkout(workoutData);
        
        // Initialize form data for each exercise in the workout
        const formData: Record<string | number, ExerciseFormData> = {};
        
        mappedWorkout.exercises.forEach(ex => {
          formData[ex.id] = {
            sets: Array(ex.sets).fill(null).map(() => ({
              reps: ex.reps || undefined,
              weight: undefined,
              duration: ex.duration || undefined,
              completed: false
            }))
          };
        });
        
        setWorkout(mappedWorkout);
        setExerciseFormData(formData);
        setSessionStartTime(new Date());
      } catch (error) {
        console.error('Error fetching workout details:', error);
        setSnackbarMessage('Failed to load workout details. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
    
    // Start the timer
    startTimer();
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [workoutId]);

  // Start/stop session timer
  useEffect(() => {
    if (timerActive) {
      if (!sessionStartTime) {
        setSessionStartTime(new Date());
      }
      
      intervalRef.current = window.setInterval(() => {
        setSessionTimer(prev => prev + 1);

        // Update current exercise timer if applicable
        if (workout && activeStep < workout.exercises.length) {
          const currentExerciseId = workout.exercises[activeStep].id;
          
          // If no exercise timer exists for this ID, initialize it
          if (!exerciseTimers[currentExerciseId]) {
            setExerciseTimers(prev => ({
              ...prev,
              [currentExerciseId]: 0
            }));
          } else {
            // Increment the timer for the current exercise
            setExerciseTimers(prev => ({
              ...prev,
              [currentExerciseId]: prev[currentExerciseId] + 1
            }));
          }
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerActive, sessionStartTime, workout, activeStep, exerciseTimers]);

  // Handle set completion
  const handleSetCompletion = (exerciseId: string | number, setIndex: number, completed: boolean) => {
    setExerciseFormData(prev => {
      const updatedExercise = { ...prev[exerciseId] };
      updatedExercise.sets[setIndex].completed = completed;
      return {
        ...prev,
        [exerciseId]: updatedExercise
      };
    });

    // Show snackbar notification
    setSnackbarMessage(completed ? 'Set completed!' : 'Set marked as incomplete');
    setSnackbarSeverity(completed ? 'success' : 'info');
    setSnackbarOpen(true);
  };

  // Handle input change for reps, weight, or duration
  const handleInputChange = (
    exerciseId: string | number,
    setIndex: number,
    field: 'reps' | 'weight' | 'duration',
    value: string
  ) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    
    setExerciseFormData(prev => {
      const updatedExercise = { ...prev[exerciseId] };
      updatedExercise.sets[setIndex][field] = numValue;
      return {
        ...prev,
        [exerciseId]: updatedExercise
      };
    });
  };

  // Navigate to the next exercise
  const handleNext = () => {
    if (workout && activeStep < workout.exercises.length - 1) {
      setActiveStep(prevStep => prevStep + 1);
    } else {
      // At the end of the workout
      handleCompleteWorkout();
    }
  };

  // Navigate to the previous exercise
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  // Toggle the timer (play/pause)
  const handleToggleTimer = () => {
    setTimerActive(!timerActive);
  };

  // Open dialog to confirm quitting the workout
  const handleQuitWorkout = () => {
    setOpenConfirmDialog(true);
  };

  // Confirm quitting the workout
  const handleConfirmQuit = () => {
    setOpenConfirmDialog(false);
    navigate('/workouts');
  };

  // Close the quit confirmation dialog
  const handleCancelQuit = () => {
    setOpenConfirmDialog(false);
  };

  // Handle completing the workout
  const handleCompleteWorkout = () => {
    setOpenCompleteDialog(true);
  };

  // Submit the completed workout
  const handleSubmitWorkout = async () => {
    if (!workout || !sessionStartTime) return;

    setSubmitting(true);

    // Prepare data for submission
    const sessionData: WorkoutSessionData = {
      workoutId: workout.id,
      startTime: sessionStartTime.toISOString(),
      endTime: new Date().toISOString(),
      totalDuration: sessionTimer,
      caloriesBurned: Math.floor(workout.estimatedCaloriesBurn * (sessionTimer / (workout.estimatedDuration * 60))),
      exercises: workout.exercises.map(ex => ({
        exerciseId: ex.id,
        sets: exerciseFormData[ex.id].sets
      }))
    };

    try {
      // Submit workout data to API
      const result = await workoutService.completeWorkout(workout.id, {
        caloriesBurned: sessionData.caloriesBurned,
        duration: sessionTimer,
        notes: '', // Optional notes could be added in a future enhancement
      });
      
      setOpenCompleteDialog(false);
      setSubmitting(false);
      
      // Navigate to results page
      navigate('/progress', { 
        state: { 
          completedWorkout: true,
          workoutName: workout.name,
          duration: sessionTimer,
          calories: sessionData.caloriesBurned
        } 
      });
    } catch (error) {
      console.error('Error submitting workout session:', error);
      setSnackbarMessage('Failed to save workout session. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setSubmitting(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!workout) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>Workout Not Found</Typography>
          <Typography paragraph>
            Sorry, we couldn't find the workout you're looking for.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/workouts')}>
            Back to Workouts
          </Button>
        </Paper>
      </Container>
    );
  }

  // Get current exercise
  const currentExercise = workout.exercises[activeStep];
  const currentExerciseData = currentExercise?.exercise;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Session Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h5">{workout.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {formatTime(sessionTimer)} / ~{workout.estimatedDuration} min
              </Typography>
              <LocalFireDepartmentIcon fontSize="small" color="action" sx={{ ml: 2, mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                ~{Math.floor(workout.estimatedCaloriesBurn * (sessionTimer / (workout.estimatedDuration * 60)))} cal
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={handleQuitWorkout}
              >
                Quit
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleToggleTimer}
                startIcon={timerActive ? <PauseIcon /> : <PlayArrowIcon />}
              >
                {timerActive ? 'Pause' : 'Resume'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        <LinearProgress 
          variant="determinate" 
          value={(activeStep / workout.exercises.length) * 100} 
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Workout Stepper */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Exercises</Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
              {workout.exercises.map((exercise, index) => (
                <Step key={exercise.id}>
                  <StepLabel
                    optional={
                      <Typography variant="caption">
                        {exercise.sets} sets {exercise.reps ? `× ${exercise.reps} reps` : ''} 
                        {exercise.duration ? `× ${exercise.duration}s` : ''}
                      </Typography>
                    }
                  >
                    {exercise.exercise?.name || `Exercise ${index + 1}`}
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Rest: {exercise.restTime}s between sets
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {currentExerciseData ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {currentExerciseData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Primary Muscle: {currentExerciseData.muscleGroups.map(group => group.charAt(0).toUpperCase() + group.slice(1)).join(', ')}
                  </Typography>
                </Box>

                {currentExerciseData.imageUrl && (
                  <Box sx={{ mb: 3 }}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="250"
                        image={getExerciseImageUrl(currentExerciseData.imageUrl)}
                        alt={currentExerciseData.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {currentExerciseData.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Instructions</Typography>
                  {currentExerciseData.instructions ? (
                    <ol>
                      {currentExerciseData.instructions.map((instruction, i) => (
                        <li key={i}>
                          <Typography variant="body2" paragraph>
                            {instruction}
                          </Typography>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <Typography variant="body2">No specific instructions available for this exercise.</Typography>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>Track Your Sets</Typography>
                
                <Grid container spacing={2}>
                  {exerciseFormData[currentExercise.id].sets.map((set, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: 'space-between',
                          gap: 2,
                          bgcolor: set.completed ? 'action.hover' : 'background.paper'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ minWidth: 80 }}>
                            Set {idx + 1}
                          </Typography>
                          {currentExercise.reps && (
                            <TextField
                              label="Reps"
                              type="number"
                              size="small"
                              value={set.reps?.toString() || ''}
                              onChange={(e) => handleInputChange(currentExercise.id, idx, 'reps', e.target.value)}
                              InputProps={{ inputProps: { min: 0 } }}
                              sx={{ width: 80, mx: 1 }}
                              disabled={set.completed}
                            />
                          )}
                          {currentExercise.duration && (
                            <TextField
                              label="Secs"
                              type="number"
                              size="small"
                              value={set.duration?.toString() || ''}
                              onChange={(e) => handleInputChange(currentExercise.id, idx, 'duration', e.target.value)}
                              InputProps={{ inputProps: { min: 0 } }}
                              sx={{ width: 80, mx: 1 }}
                              disabled={set.completed}
                            />
                          )}
                          <TextField
                            label="Weight (kg)"
                            type="number"
                            size="small"
                            value={set.weight?.toString() || ''}
                            onChange={(e) => handleInputChange(currentExercise.id, idx, 'weight', e.target.value)}
                            InputProps={{ inputProps: { min: 0, step: 0.5 } }}
                            sx={{ width: 100, mx: 1 }}
                            disabled={set.completed}
                          />
                        </Box>
                        <Box>
                          {set.completed ? (
                            <Button
                              variant="outlined"
                              color="warning"
                              onClick={() => handleSetCompletion(currentExercise.id, idx, false)}
                              startIcon={<CloseIcon />}
                            >
                              Undo
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleSetCompletion(currentExercise.id, idx, true)}
                              startIcon={<CheckIcon />}
                            >
                              Complete
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Typography>Exercise details not available</Typography>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
              >
                Previous
              </Button>
              <Tooltip title={activeStep === workout.exercises.length - 1 ? 'Complete Workout' : 'Next Exercise'}>
                <Fab
                  color="primary"
                  onClick={handleNext}
                  sx={{ ml: 2 }}
                >
                  {activeStep === workout.exercises.length - 1 ? <CheckIcon /> : <SkipNextIcon />}
                </Fab>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quit Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelQuit}
        aria-labelledby="quit-dialog-title"
        aria-describedby="quit-dialog-description"
      >
        <DialogTitle id="quit-dialog-title">
          Quit Workout?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="quit-dialog-description">
            Are you sure you want to quit this workout? Your progress will not be saved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelQuit} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmQuit} color="error" autoFocus>
            Quit Workout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Workout Dialog */}
      <Dialog
        open={openCompleteDialog}
        onClose={() => setOpenCompleteDialog(false)}
        aria-labelledby="complete-dialog-title"
        aria-describedby="complete-dialog-description"
      >
        <DialogTitle id="complete-dialog-title">
          Workout Complete!
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="complete-dialog-description">
            Great job! You've completed your workout.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Workout:</strong> {workout.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Duration:</strong> {formatTime(sessionTimer)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Estimated Calories Burned:</strong> {Math.floor(workout.estimatedCaloriesBurn * (sessionTimer / (workout.estimatedDuration * 60)))}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitWorkout} 
            color="primary" 
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : undefined}
          >
            {submitting ? 'Saving...' : 'Save & View Results'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WorkoutSession; 