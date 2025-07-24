import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutExercise } from '../../types/workout';
import { Exercise, ExerciseCategory } from '../../types/exercise';
import { exerciseService } from '../../services';
import { 
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Card, 
  CardContent,
  CardMedia,
  CardHeader,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  Chip,
  Alert,
  Divider,
  Fab,
  Tooltip,
  Zoom,
  Slide,
  styled,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
  AccessTime as ClockIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Close as CloseIcon,
  Timer as TimerIcon,
  LocalFireDepartment as FireIcon,
  FitnessCenter as ExerciseIcon,
  EmojiEvents as TrophyIcon,
  KeyboardDoubleArrowDown as ScrollDownIcon,
} from '@mui/icons-material';

import {
  SessionPaper,
  TimerDisplay,
  StatCard,
  ActionButton,
  FloatingActionButton,
  ExerciseImage,
  ExerciseVideo,
  StatValue,
  StatLabel,
  StyledStepper,
  ExerciseCard,
  ExerciseHeader,
  ExerciseContent,
  ExerciseChip,
  ProgressBar,
  AlertMessage,
} from './WorkoutSession.styles';

interface WorkoutSessionProps {
  workout: WorkoutPlan;
  onComplete: (workout: WorkoutPlan, duration: number) => void;
  onCancel: () => void;
}

interface ExerciseWithDetails extends WorkoutExercise {
  details?: Exercise;
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
  actualDuration?: number;
  notes?: string;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({
  workout,
  onComplete,
  onCancel
}) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [exercises, setExercises] = useState<ExerciseWithDetails[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    reps: 0,
    weight: 0,
    duration: 0,
    notes: '',
  });
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Monitor scroll position to show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    prepareExercises();
  }, [workout]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const prepareExercises = async () => {
    try {
      setIsLoading(true);
      
      if (!workout.exercises || workout.exercises.length === 0) {
        setExercises([]);
        setIsLoading(false);
        return;
      }
      
      // Sort exercises by order
      const sortedExercises = [...workout.exercises].sort((a, b) => a.order - b.order);
      
      // Create session exercises with completed flag
      const sessionExercises: ExerciseWithDetails[] = sortedExercises.map(ex => ({
        ...ex,
        completed: false
      }));
      
      // Fetch detailed exercise information
      const exercisePromises = sortedExercises.map(ex => 
        exerciseService.getExerciseById(ex.exercise.id)
      );
      
      const fetchedExercises = await Promise.all(exercisePromises);
      
      // Create a map of id -> exercise for quick lookup
      const exerciseMap: { [key: string]: Exercise } = fetchedExercises.reduce((map, ex) => {
        if (ex && ex.id) {
          map[ex.id] = ex;
        }
        return map;
      }, {} as { [key: string]: Exercise });
      
      // Merge details into session exercises
      const updatedExercises = sessionExercises.map((ex) => ({
        ...ex,
        details: ex.exercise && ex.exercise.id ? exerciseMap[ex.exercise.id] : undefined
      }));
      
      setExercises(updatedExercises);
    } catch (error) {
      console.error('Failed to prepare workout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startWorkout = () => {
    setIsActive(true);
    setStartTime(new Date());
  };

  const pauseWorkout = () => {
    setIsActive(false);
  };

  const resumeWorkout = () => {
    setIsActive(true);
  };

  const nextExercise = () => {
    if (currentStep < exercises.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    }
  };

  const prevExercise = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLogModal = () => {
    const currentExercise = exercises[currentStep];
    setFormValues({
      reps: currentExercise.actualReps || currentExercise.repetitions || 0,
      weight: currentExercise.actualWeight || 0,
      duration: currentExercise.actualDuration || currentExercise.duration || 0,
      notes: currentExercise.notes || '',
    });
    setLogModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: name === 'notes' ? value : Number(value),
    });
  };

  const handleLogComplete = () => {
      const updatedExercises = [...exercises];
      updatedExercises[currentStep] = {
        ...updatedExercises[currentStep],
        completed: true,
      actualReps: formValues.reps,
      actualWeight: formValues.weight,
      actualDuration: formValues.duration,
      notes: formValues.notes,
      };
      
      setExercises(updatedExercises);
    setLogModalOpen(false);
      
      // Move to next exercise if available
      if (currentStep < exercises.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        scrollToTop();
      }, 500);
      }
  };

  const handleConfirmComplete = () => {
    setConfirmModalOpen(true);
  };

  const completeWorkout = () => {
    const duration = Math.floor(time);
    onComplete(workout, duration);
    setConfirmModalOpen(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = exercises[currentStep];
  const completedExercises = exercises.filter(ex => ex.completed).length;
  const progress = exercises.length > 0 ? (completedExercises / exercises.length) * 100 : 0;
  const estimatedCalories = Math.round((time / 60) * (workout.estimatedCaloriesBurn || 10));

  const renderExerciseMedia = (exercise: Exercise) => {
    if (exercise.videoUrl) {
      return (
        <ExerciseVideo>
          <iframe
            src={exercise.videoUrl}
            title={`${exercise.name} demonstration`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </ExerciseVideo>
      );
    }
    
    if (exercise.imageUrl) {
      return (
        <ExerciseImage
          image={exercise.imageUrl}
          title={`${exercise.name} demonstration`}
          />
      );
    }
    
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 300,
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        borderRadius: theme.shape.borderRadius,
        mb: 2,
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <ExerciseIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.4, mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            No demonstration media available
          </Typography>
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '70vh'
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Preparing workout session...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      <SessionPaper elevation={0}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            {workout.name}
          </Typography>
          
          <Tooltip title="Cancel Workout">
            <IconButton 
              color="default" 
              onClick={onCancel}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <TimerDisplay>
          <ClockIcon sx={{ mr: 1 }} />
          {formatTime(time)}
        </TimerDisplay>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <StatCard>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                <CircularProgress 
                  variant="determinate" 
                  value={progress} 
                  size={80} 
                  thickness={5}
                  sx={{ color: theme.palette.success.main }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ExerciseIcon color="action" />
                </Box>
              </Box>
              <StatValue>{completedExercises}/{exercises.length}</StatValue>
              <StatLabel>Exercises</StatLabel>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <StatCard>
              <TimerIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <StatValue>{formatTime(time).split(':').slice(0, 2).join(':')}</StatValue>
              <StatLabel>Elapsed Time</StatLabel>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <StatCard>
              <FireIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.error.main }} />
              <StatValue>{estimatedCalories}</StatValue>
              <StatLabel>Est. Calories</StatLabel>
            </StatCard>
          </Grid>
        </Grid>
      
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          mb: 4
        }}>
        {!isActive && !startTime && (
            <ActionButton
              variant="contained"
              color="primary"
            size="large" 
              startIcon={<PlayIcon />}
            onClick={startWorkout}
          >
            Start Workout
            </ActionButton>
        )}
        
        {isActive && (
            <ActionButton
              variant="outlined"
              color="primary"
            size="large" 
              startIcon={<PauseIcon />}
            onClick={pauseWorkout}
          >
            Pause
            </ActionButton>
        )}
        
        {!isActive && startTime && (
            <ActionButton
              variant="contained"
              color="primary"
            size="large" 
              startIcon={<PlayIcon />}
            onClick={resumeWorkout}
          >
            Resume
            </ActionButton>
        )}
        
        {startTime && (
            <ActionButton
              variant="contained"
              color="success"
            size="large" 
              startIcon={<CheckIcon />}
            onClick={handleConfirmComplete}
          >
            Complete Workout
            </ActionButton>
        )}
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Exercise Progress
          </Typography>
          
          <Stepper 
            activeStep={currentStep} 
            alternativeLabel
            sx={{ mb: 3 }}
          >
            {exercises.map((exercise, index) => (
              <Step key={index} completed={exercise.completed}>
                <StepButton onClick={() => setCurrentStep(index)}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                    {exercise.details?.name || `Exercise ${index + 1}`}
                  </Typography>
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>
      </SessionPaper>
      
      {currentExercise && (
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <SessionPaper elevation={0}>
            <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
              Current Exercise
            </Typography>
            
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: theme.shape.borderRadius, 
                mb: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              }}
            >
              <CardHeader
                title={currentExercise.details?.name || `Exercise ${currentStep + 1}`}
                subheader={currentExercise.details?.category?.replace('_', ' ') || ''}
                action={
                  currentExercise.completed ? (
                    <Chip 
                      icon={<CheckIcon />} 
                      label="Completed" 
                      color="success" 
                      variant="filled"
                    />
                  ) : (
        <Button 
                      variant="contained"
                      color="primary"
                      onClick={openLogModal}
                      startIcon={<CheckIcon />}
                    >
                      Complete & Log
        </Button>
                  )
                }
              />
              
              <CardContent>
                {renderExerciseMedia(currentExercise.details!)}
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {currentExercise.repetitions && (
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip 
                          label={`${currentExercise.repetitions} reps`} 
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '1rem', height: 32, px: 1 }}
                        />
                      </Box>
                    </Grid>
                  )}
                  
                  {currentExercise.sets && (
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip 
                          label={`${currentExercise.sets} sets`} 
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '1rem', height: 32, px: 1 }}
                        />
                      </Box>
                    </Grid>
                  )}
                  
                  {currentExercise.restTime && (
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip 
                          label={`${currentExercise.restTime}s rest`} 
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '1rem', height: 32, px: 1 }}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {currentExercise.details?.description || 'No description provided for this exercise.'}
                </Typography>
                
                {currentExercise.details?.instructions && (
                  <>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Instructions
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {currentExercise.details.instructions}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
                startIcon={<PrevIcon />}
          onClick={prevExercise} 
          disabled={currentStep === 0}
                sx={{ borderRadius: theme.shape.borderRadius * 3 }}
        >
          Previous
        </Button>
        
        <Button 
                endIcon={<NextIcon />}
          onClick={nextExercise} 
          disabled={currentStep === exercises.length - 1}
                sx={{ borderRadius: theme.shape.borderRadius * 3 }}
        >
          Next
        </Button>
            </Box>
          </SessionPaper>
        </Slide>
      )}
      
      {/* Log Exercise Modal */}
      <Dialog 
        open={logModalOpen} 
        onClose={() => setLogModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Log Your Exercise
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Repetitions"
                name="reps"
                type="number"
                fullWidth
                value={formValues.reps}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
                margin="normal"
              />
            </Grid>
          
            <Grid item xs={12} sm={6}>
              <TextField
                label="Weight (kg)"
            name="weight" 
                type="number"
                fullWidth
                value={formValues.weight}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.5 }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Duration (seconds)"
                name="duration"
                type="number"
                fullWidth
                value={formValues.duration}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
            name="notes" 
                fullWidth
                multiline
                rows={3}
                value={formValues.notes}
                onChange={handleInputChange}
                margin="normal"
                placeholder="How did it feel? Any challenges?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setLogModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleLogComplete}
          >
            Save & Continue
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Complete Workout Modal */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrophyIcon sx={{ color: theme.palette.warning.main }} />
          Complete Workout
        </DialogTitle>
        
        <DialogContent dividers>
          <DialogContentText paragraph>
            Are you sure you want to complete this workout?
          </DialogContentText>
        
        <Alert
            severity="info" 
            icon={<CheckIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Workout Summary
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <Typography variant="body2">
                  <strong>Total Time:</strong>
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {formatTime(time)}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2">
                  <strong>Exercises Done:</strong>
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {completedExercises}/{exercises.length}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2">
                  <strong>Calories Burned:</strong>
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {estimatedCalories} kcal
                </Typography>
              </Grid>
            </Grid>
          </Alert>
          
          {completedExercises < exercises.length && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You have {exercises.length - completedExercises} uncompleted exercises. You can still complete the workout, but your progress won't be fully tracked.
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary">
            This will save your workout progress and return you to the dashboard.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={completeWorkout}
            startIcon={<CheckIcon />}
          >
            Complete Workout
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Scroll to top button */}
      <Zoom in={showScrollButton}>
        <FloatingActionButton 
          color="primary" 
          size="medium"
          onClick={scrollToTop}
          aria-label="scroll to top"
        >
          <ScrollDownIcon sx={{ transform: 'rotate(180deg)' }} />
        </FloatingActionButton>
      </Zoom>
    </Box>
  );
};

export default WorkoutSession; 