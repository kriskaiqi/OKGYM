import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Chip, 
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  Card,
  CardContent,
  useTheme,
  alpha,
  styled,
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
  TextField,
  Button
} from '@mui/material';
import { WorkoutSession, WorkoutSummary, ExerciseSummary as BaseExerciseSummary } from '../../types/workout';
import { formatDistanceToNow } from 'date-fns';
import {
  FitnessCenter,
  DirectionsRun,
  Timer,
  FlashOn,
  Whatshot,
  LocalFireDepartment,
  FavoriteBorder,
  SportsScore,
  EmojiEvents,
  Info,
  KeyboardArrowDown,
  KeyboardArrowUp,
  FeedbackOutlined,
  Edit,
  RateReview,
  Add,
  SentimentVerySatisfied,
  SentimentVeryDissatisfied,
  SentimentNeutral
} from '@mui/icons-material';
import { exerciseService } from '../../services/exerciseService';
import sessionService from '../../services/sessionService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Log exercise service to verify it's imported correctly
console.log('Exercise service imported:', exerciseService);

// Styled components
const SummaryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  },
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.default, 0.7),
  }
}));

// New styled component for the expanded details section
const ExpandedDetailsBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(1, 3, 2, 3),
}));

const SetDetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
  }
}));

const SetMetric = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// Define color options as standard CSS background colors
const getColorBackground = (colorName: string): string => {
  switch (colorName) {
    case 'primary': return 'rgba(25, 118, 210, 0.12)';
    case 'secondary': return 'rgba(156, 39, 176, 0.12)';
    case 'error': return 'rgba(211, 47, 47, 0.12)';
    case 'warning': return 'rgba(237, 108, 2, 0.12)';
    case 'info': return 'rgba(2, 136, 209, 0.12)';
    case 'success': return 'rgba(46, 125, 50, 0.12)';
    default: return 'rgba(25, 118, 210, 0.12)'; // primary by default
  }
};

interface IconWrapperProps {
  color?: string;
}

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})<IconWrapperProps & { theme?: any }>(({ theme, color = 'primary' }) => ({
  width: 42,
  height: 42,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5),
  backgroundColor: getColorBackground(color),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '& .MuiTableCell-head': {
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: alpha(theme.palette.background.default, 0.6),
  }
}));

// Extended interfaces to support additional properties
interface ExtendedWorkoutSession extends WorkoutSession {
  exerciseData?: {
    planned?: any[];
    actual?: any[];
    progress?: number;
  };
}

interface ExerciseResultData {
  repetitions?: number;
  weight?: number;
  duration?: number;
  formScore?: number;
  notes?: string;
  setNumber?: number;
  [key: string]: any; // Allow for additional unknown properties
}

interface ExerciseDetail {
  id: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  muscleGroups?: string[] | string;
  targetMuscleGroups?: string[] | string;
  synergistMuscleGroups?: string[] | string;
  movementPattern?: string;
  types?: string[] | string;
  // Add any other exercise properties needed
}

interface SessionSummaryProps {
  session: ExtendedWorkoutSession;
}

// Extend the ExerciseSummary interface to ensure it has formScore
interface ExerciseSummary extends BaseExerciseSummary {
  bestResult: {
    weight?: number;
    reps?: number;
    duration?: number;
    difficultyScore?: number;
    formScore?: number;
    notes?: string;
  };
}

// Add a fade animation effect for transitioning between editing and viewing modes
const fadeAnimation = {
  transition: 'all 0.3s ease-in-out',
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
};

// Add a styled component for the feedback section
const FeedbackPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
  }
}));

const FeedbackIconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  marginRight: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const SentimentIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  opacity: 0.15,
  transition: 'all 0.3s ease',
  '&:hover': {
    opacity: 0.3,
    transform: 'scale(1.1) rotate(5deg)',
  }
}));

const FeedbackBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: theme.spacing(4, 0),
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  backgroundColor: alpha(theme.palette.background.paper, 0.04),
  padding: theme.spacing(3, 3, 2, 3)
}));

const FeedbackContent = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.06),
  borderRadius: theme.shape.borderRadius * 3,
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(3, 3),
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const FeedbackHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: theme.spacing(0.5)
}));

const EditFeedbackButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 4,
  padding: theme.spacing(0.5, 2),
  fontWeight: 500,
  transition: 'all 0.2s ease',
  textTransform: 'none',
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.background.paper, 0.1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.2),
  }
}));

const FeedbackEmotionIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  opacity: 0.7,
  fontSize: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const SessionSummary: React.FC<SessionSummaryProps> = ({ session }) => {
  const theme = useTheme();
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, ExerciseDetail>>({});
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [loadingReport, setLoadingReport] = useState(false);
  
  // Add state for feedback
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  // Add state for feedback difficulty rating
  const [feedbackDifficultyRating, setFeedbackDifficultyRating] = useState<number>(0);
  
  // Fetch exercise details by their IDs
  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!session || !session.exerciseResults || Object.keys(session.exerciseResults).length === 0) return;
      
      setIsLoadingExercises(true);
      
      try {
        const exerciseIds = Object.keys(session.exerciseResults);
        console.log('Fetching details for exercise IDs:', exerciseIds);
        
        // Create a map to store exercise details
        const detailsMap: Record<string, ExerciseDetail> = {};
        
        // Fetch details for each exercise ID
        for (const exerciseId of exerciseIds) {
          try {
            const exercise = await exerciseService.getExerciseById(exerciseId);
            if (exercise) {
              detailsMap[exerciseId] = exercise;
              console.log(`Fetched details for exercise ${exerciseId}:`, exercise.name);
            }
          } catch (error) {
            console.error(`Failed to fetch details for exercise ${exerciseId}:`, error);
          }
        }
        
        setExerciseDetails(detailsMap);
      } catch (error) {
        console.error('Error fetching exercise details:', error);
      } finally {
        setIsLoadingExercises(false);
      }
    };
    
    fetchExerciseDetails();
  }, [session]);
  
  // Initialize feedback text and difficulty rating from session
  useEffect(() => {
    if (session) {
      if (session.userFeedback) {
        setFeedbackText(session.userFeedback);
      }
      if (session.difficultyRating) {
        setFeedbackDifficultyRating(session.difficultyRating);
      }
    }
  }, [session]);
  
  if (!session) return null;
  
  // Create a default summary object to prevent null/undefined errors
  const defaultSummary = {
    caloriesBurned: 0,
    uniqueExercises: 0,
    totalExercises: 0,
    totalSets: 0,
    totalReps: 0,
    formScore: 0,
    muscleGroups: [],
    focusAreas: [],
    exerciseSummaries: []
  };
  
  // Extract session data with fallbacks
  console.log("Raw session data:", session);
  const { 
    summary: rawSummary = defaultSummary, 
    startTime, 
    endTime, 
    totalDuration = 0, 
    difficultyRating = 0,
    caloriesBurned = 0,
    exerciseData = null,
    exerciseResults = {},
    userFeedback,
    id: sessionId,
    status: sessionStatus
  } = session;

  console.log("Session status:", sessionStatus, "Session ID:", sessionId);

  // Ensure we don't lose form score when destructuring
  const summary = {
    ...defaultSummary,
    ...(rawSummary || {})
  };

  console.log("Processed summary object:", summary);
  
  // Format workout time
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };
  
  // Format date
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'N/A';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Check if we have valid summary data
  const hasValidSummary = summary !== null && summary !== undefined;
  
  // Check if we have valid exercise data 
  const hasExerciseData = exerciseData && 
    ((exerciseData.planned && exerciseData.planned.length > 0) || 
     (exerciseData.actual && exerciseData.actual.length > 0));

  // Extract exercise summaries from different possible sources
  const getExerciseSummaries = (): ExerciseSummary[] => {
    console.log('Getting exercise summaries from:', { summary, exerciseResults });
    
    // First try using summary.exerciseSummaries if available
    if (hasValidSummary && Array.isArray(summary.exerciseSummaries) && summary.exerciseSummaries.length > 0) {
      return summary.exerciseSummaries;
    }
    
    // If no summaries but we have exerciseResults, build summaries from there
    if (exerciseResults && Object.keys(exerciseResults).length > 0) {
      return Object.entries(exerciseResults).map(([exerciseId, result]: [string, any]) => {
        // Try to get the name from our fetched exercise details
        const exerciseName = exerciseDetails[exerciseId]?.name || 'Unknown Exercise';
        
        return {
          exerciseId,
          name: exerciseName,
          totalAttempts: result.attempts?.length || 1,
          bestResult: {
            reps: result.bestResult?.reps || 0,
            weight: result.bestResult?.weight || 0,
            formScore: result.bestResult?.formScore || 0
          }
        };
      });
    }
    
    // Fallback to exerciseData if available
    if (hasExerciseData && exerciseData.actual) {
      // Map each actual exercise to a summary
      return exerciseData.actual.map((exercise: any) => {
        const result = exerciseResults[exercise.exerciseId] || {};
        return {
          exerciseId: exercise.exerciseId,
          name: exercise.name || exerciseDetails[exercise.exerciseId]?.name || 'Unknown Exercise',
          totalAttempts: result.attempts?.length || 1,
          bestResult: {
            reps: result.bestResult?.reps || 0,
            weight: result.bestResult?.weight || 0,
            formScore: result.bestResult?.formScore || 0
          }
        };
      });
    }
    
    return [];
  };
  
  // Get all actual exercise data
  const exerciseSummaries = getExerciseSummaries();
  const hasSummaries = exerciseSummaries && exerciseSummaries.length > 0;

  // Determine muscle groups
  const getMuscleGroups = (): string[] => {
    // First try from summary data
    if (hasValidSummary && summary.muscleGroups && summary.muscleGroups.length > 0) {
      return summary.muscleGroups;
    }
    
    // Initialize a set to collect unique muscle groups
    const groups = new Set<string>();
    
    // Try to extract muscle groups from exercise data
    if (hasExerciseData && exerciseData.planned) {
      exerciseData.planned.forEach((exercise: any) => {
        if (exercise.muscleGroups) {
          exercise.muscleGroups.forEach((group: string) => groups.add(group));
        }
      });
    }
    
    // Try to extract from exercise details based on performed exercises
    if (exerciseResults && Object.keys(exerciseResults).length > 0 && exerciseDetails) {
      Object.keys(exerciseResults).forEach(exerciseId => {
        const exercise = exerciseDetails[exerciseId];
        if (exercise) {
          // Check for targetMuscleGroups
          if (exercise.targetMuscleGroups) {
            const targetGroups = Array.isArray(exercise.targetMuscleGroups) 
              ? exercise.targetMuscleGroups 
              : [exercise.targetMuscleGroups];
            
            targetGroups.forEach((group: string) => groups.add(group));
          }
          
          // Also check for regular muscleGroups if targetMuscleGroups not available
          else if (exercise.muscleGroups) {
            const muscleGroups = Array.isArray(exercise.muscleGroups) 
              ? exercise.muscleGroups 
              : [exercise.muscleGroups];
            
            muscleGroups.forEach((group: string) => groups.add(group));
          }
        }
      });
    }
    
    return Array.from(groups);
  };
  
  // Determine focus areas
  const getFocusAreas = (): string[] => {
    // First try from summary data
    if (hasValidSummary && summary.focusAreas && summary.focusAreas.length > 0) {
      return summary.focusAreas;
    }
    
    // Initialize a set to collect unique focus areas
    const areas = new Set<string>();
    
    // Try to extract focus areas from exercise data
    if (hasExerciseData && exerciseData.planned) {
      exerciseData.planned.forEach((exercise: any) => {
        if (exercise.focusAreas) {
          exercise.focusAreas.forEach((area: string) => areas.add(area));
        }
      });
    }
    
    // Try to extract focus areas from exercise details using other properties
    if (exerciseResults && Object.keys(exerciseResults).length > 0 && exerciseDetails) {
      Object.keys(exerciseResults).forEach(exerciseId => {
        const exercise = exerciseDetails[exerciseId];
        if (exercise) {
          // Check for movementPattern
          if (exercise.movementPattern) {
            areas.add(exercise.movementPattern);
          }
          
          // Check for synergist muscle groups
          if (exercise.synergistMuscleGroups) {
            const synergistGroups = Array.isArray(exercise.synergistMuscleGroups) 
              ? exercise.synergistMuscleGroups 
              : [exercise.synergistMuscleGroups];
            
            synergistGroups.forEach((group: string) => areas.add(group));
          }
          
          // Check for exercise type
          if (exercise.types) {
            const types = Array.isArray(exercise.types) 
              ? exercise.types 
              : [exercise.types];
            
            types.forEach((type: string) => areas.add(type));
          }
          
          // Add exercise category as a focus area
          if (exercise.category) {
            areas.add(exercise.category);
          }
        }
      });
    }
    
    return Array.from(areas);
  };

  // Get final data
  const muscleGroups = getMuscleGroups();
  const focusAreas = getFocusAreas();

  // Calculate form score based on available data
  const getFormScore = (): number => {
    // Debug logs for form score data
    console.log('Form score calculation - exercise results:', exerciseResults);
    
    // Direct extraction from exercise results
    if (exerciseResults && Object.keys(exerciseResults).length > 0) {
      const formScores: number[] = [];
      
      // Extract form scores from all exercises
      Object.values(exerciseResults).forEach((result: any) => {
        // Check attempts first
        if (Array.isArray(result.attempts) && result.attempts.length > 0) {
          result.attempts.forEach((attempt: any) => {
            if (attempt && typeof attempt.formScore === 'number') {
              console.log('Found form score in attempt:', attempt.formScore);
              formScores.push(attempt.formScore);
            }
          });
        }
        
        // Check best result
        if (result.bestResult && typeof result.bestResult.formScore === 'number') {
          console.log('Found form score in bestResult:', result.bestResult.formScore);
          formScores.push(result.bestResult.formScore);
        }
      });
      
      if (formScores.length > 0) {
        const average = Math.round(formScores.reduce((sum, score) => sum + score, 0) / formScores.length);
        console.log('Calculated form score:', average, 'from scores:', formScores);
        return average;
      }
    }
    
    // Check summary as fallback
    if (summary && typeof summary.formScore === 'number' && summary.formScore > 0) {
      console.log('Using summary formScore:', summary.formScore);
      return summary.formScore;
    }
    
    console.log('No form score found in either exercise results or summary');
    return 0;
  };

  // Calculate total sets from exercise results
  const getTotalSets = (): number => {
    // First try summary data
    if (hasValidSummary && typeof summary.totalSets === 'number' && summary.totalSets > 0) {
      console.log('Using summary total sets:', summary.totalSets);
      return summary.totalSets;
    }
    
    // Then try exercise results
    if (exerciseResults && Object.keys(exerciseResults).length > 0) {
      console.log('Calculating sets from exerciseResults:', exerciseResults);
      // Count all attempts across all exercises
      const calculatedSets = Object.values(exerciseResults).reduce((total: number, result: any) => {
        // If the result has an attempts array, count those
        if (Array.isArray(result.attempts)) {
          return total + result.attempts.length;
        }
        // Otherwise count as one set
        return total + 1;
      }, 0);
      console.log('Calculated sets from results:', calculatedSets);
      return calculatedSets;
    }
    
    // Finally try exercise summaries
    if (hasSummaries) {
      const summariesSets = exerciseSummaries.reduce((acc: number, ex: ExerciseSummary) => 
        acc + (ex.totalAttempts || 1), 0);
      console.log('Calculated sets from summaries:', summariesSets);
      return summariesSets;
    }
    
    return 0;
  };

  // Calculate total reps from exercise results
  const getTotalReps = (): number => {
    // First try summary data
    if (hasValidSummary && typeof summary.totalReps === 'number' && summary.totalReps > 0) {
      console.log('Using summary total reps:', summary.totalReps);
      return summary.totalReps;
    }
    
    // Then try exercise results
    if (exerciseResults && Object.keys(exerciseResults).length > 0) {
      console.log('Calculating reps from exerciseResults');
      // Sum all repetitions across all exercises and attempts
      const calculatedReps = Object.values(exerciseResults).reduce((total: number, result: any) => {
        let exerciseReps = 0;
        
        // If the result has an attempts array, sum the repetitions
        if (Array.isArray(result.attempts)) {
          exerciseReps = result.attempts.reduce((setTotal: number, attempt: any) => {
            return setTotal + (attempt.repetitions || 0);
          }, 0);
        }
        
        // If no reps found in attempts, try bestResult
        if (exerciseReps === 0 && result.bestResult && typeof result.bestResult.reps === 'number') {
          exerciseReps = result.bestResult.reps;
        }
        
        console.log('Exercise reps:', exerciseReps);
        return total + exerciseReps;
      }, 0);
      
      console.log('Calculated reps from results:', calculatedReps);
      return calculatedReps;
    }
    
    // Finally try exercise summaries
    if (hasSummaries) {
      const summariesReps = exerciseSummaries.reduce((acc: number, ex: ExerciseSummary) => 
        acc + (ex.bestResult?.reps || 0), 0);
      console.log('Calculated reps from summaries:', summariesReps);
      return summariesReps;
    }
    
    return 0;
  };

  // Function to toggle the expanded state of an exercise
  const handleToggleExercise = (exerciseId: string) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  // Function to get detailed set data for an exercise
  const getExerciseSets = (exerciseId: string): any[] => {
    if (!exerciseResults || !exerciseResults[exerciseId]) {
      return [];
    }
    
    const result = exerciseResults[exerciseId];
    
    // Check if attempts array exists and has items
    if (Array.isArray(result.attempts) && result.attempts.length > 0) {
      console.log(`Found ${result.attempts.length} sets for exercise ${exerciseId}`);
      return result.attempts.map((attempt: any, index: number) => ({
        setNumber: attempt.setNumber || index + 1,
        repetitions: attempt.repetitions || 0,
        weight: attempt.weight || 0,
        formScore: attempt.formScore || 0,
        notes: attempt.notes || '',
        timestamp: attempt.timestamp || null
      }));
    }
    
    // If no attempts but we have a bestResult, create a single set from it
    if (result.bestResult) {
      return [{
        setNumber: 1,
        repetitions: result.bestResult.reps || 0,
        weight: result.bestResult.weight || 0,
        formScore: result.bestResult.formScore || 0,
        notes: '',
        timestamp: null
      }];
    }
    
    return [];
  };

  // Render details for a specific exercise's sets
  const renderExerciseSets = (exerciseId: string) => {
    const sets = getExerciseSets(exerciseId);
    
    if (sets.length === 0) {
      return (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No detailed set data available for this exercise
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        <Grid container sx={{ fontWeight: 'medium', mb: 1, px: 2 }}>
          <Grid item xs={2}>
            <Typography variant="body2" color="text.secondary">Set</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Reps</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Weight</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Form Score</Typography>
          </Grid>
        </Grid>
        
        {sets.map((set, index) => (
          <SetDetailRow key={`set-${index}`}>
            <Grid container alignItems="center">
              <Grid item xs={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Chip 
                    label={set.setNumber} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: 600, minWidth: '30px' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Typography align="center">{set.repetitions}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography align="center">{set.weight ? `${set.weight} kg` : '-'}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Rating 
                    value={set.formScore / 2} 
                    precision={0.5} 
                    size="small" 
                    readOnly 
                    max={5}
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {set.formScore}/10
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </SetDetailRow>
        ))}
        
        {sets.length > 0 && (
          <Box sx={{ mt: 2, px: 2 }}>
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {sets[0].notes ? `Notes: ${sets[0].notes}` : ''}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Render exercise performance table
  const renderExerciseTable = () => {
    // Check if we have any exercise data
    if (!hasSummaries) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center">
            <Info sx={{ mr: 1 }} />
            <Typography>No exercise data available for this session.</Typography>
          </Box>
        </Alert>
      );
    }
    
    // Show loading indicator while fetching exercise details
    if (isLoadingExercises) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Loading exercise details...</Typography>
        </Box>
      );
    }
    
    return (
      <Paper variant="outlined">
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Exercise</TableCell>
                <TableCell align="center">Sets</TableCell>
                <TableCell align="center">Best Reps</TableCell>
                <TableCell align="center">Best Weight</TableCell>
                <TableCell align="center">Form Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exerciseSummaries.map((exercise: ExerciseSummary, index: number) => {
                const exerciseId = exercise.exerciseId || `exercise-${index}`;
                const isExpanded = !!expandedExercises[exerciseId];
                
                return (
                  <React.Fragment key={exerciseId}>
                    <TableRow 
                      hover
                      className="exercise-row"
                    >
                      <TableCell padding="checkbox">
                        <Tooltip title={isExpanded ? "Hide sets" : "Show sets"}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => handleToggleExercise(exerciseId)}
                          >
                            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FitnessCenter 
                            fontSize="small" 
                            color="primary" 
                            sx={{ mr: 1, opacity: 0.7 }} 
                          />
                          <Typography fontWeight={500}>
                            {exercise.name || exerciseDetails[exercise.exerciseId]?.name || `Exercise ${index + 1}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{exercise.totalAttempts || 1}</TableCell>
                      <TableCell align="center">{exercise.bestResult?.reps || '-'}</TableCell>
                      <TableCell align="center">
                        {exercise.bestResult?.weight ? `${exercise.bestResult.weight} kg` : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {exercise.bestResult?.formScore ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Rating 
                              value={(exercise.bestResult.formScore || 0) / 2} 
                              precision={0.5} 
                              readOnly 
                              size="small" 
                              max={5}
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {exercise.bestResult.formScore}/10
                            </Typography>
                          </Box>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded details row */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <ExpandedDetailsBox>
                            <Typography variant="subtitle2" gutterBottom component="div" color="primary.main">
                              Set Details
                            </Typography>
                            {renderExerciseSets(exerciseId)}
                          </ExpandedDetailsBox>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
              
              {!hasSummaries && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 3 }}>
                      <FitnessCenter sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No exercises completed in this session
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Paper>
    );
  };
  
  // Render health metrics section
  const renderHealthMetrics = () => (
    session.healthData && (
      <Box mt={4}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2
        }}>
          <LocalFireDepartment 
            sx={{ 
              color: theme.palette.error.main, 
              mr: 1 
            }} 
          />
          <Typography variant="h6" fontWeight={600}>
            Health Metrics
          </Typography>
        </Box>
        
        <SummaryPaper elevation={0}>
          <Grid container spacing={3}>
            {session.healthData.avgHeartRate && (
              <Grid item xs={6} sm={3}>
                <MetricBox>
                  <IconWrapper color="error">
                    <FavoriteBorder />
                  </IconWrapper>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Avg Heart Rate
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {session.healthData.avgHeartRate} bpm
                    </Typography>
                  </Box>
                </MetricBox>
              </Grid>
            )}
            
            {session.healthData.peakHeartRate && (
              <Grid item xs={6} sm={3}>
                <MetricBox>
                  <IconWrapper color="error">
                    <FlashOn />
                  </IconWrapper>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Peak Heart Rate
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {session.healthData.peakHeartRate} bpm
                    </Typography>
                  </Box>
                </MetricBox>
              </Grid>
            )}
            
            {session.healthData.caloriesBurned && (
              <Grid item xs={6} sm={3}>
                <MetricBox>
                  <IconWrapper color="error">
                    <LocalFireDepartment />
                  </IconWrapper>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Calories Burned
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {session.healthData.caloriesBurned} kcal
                    </Typography>
                  </Box>
                </MetricBox>
              </Grid>
            )}
            
            {session.healthData.stepsCount && (
              <Grid item xs={6} sm={3}>
                <MetricBox>
                  <IconWrapper color="primary">
                    <DirectionsRun />
                  </IconWrapper>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Steps
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {session.healthData.stepsCount}
                    </Typography>
                  </Box>
                </MetricBox>
              </Grid>
            )}
          </Grid>
        </SummaryPaper>
      </Box>
    )
  );
  
  // Check if workoutPlan exists
  const hasWorkoutPlan = !!session.workoutPlan;
  
  // Handle saving feedback with difficulty rating
  const handleSaveFeedback = async () => {
    if (!sessionId) {
      console.error('Cannot save feedback: Session ID is missing');
      return;
    }
    
    console.log('Saving feedback for session ID:', sessionId);
    setFeedbackSubmitting(true);
    
    try {
      // First update the text feedback
      const feedbackResponse = await sessionService.updateSessionUserFeedback(sessionId, feedbackText);
      console.log('Feedback update success:', feedbackResponse);
      
      // Then update difficulty rating if it's different than current
      if (feedbackDifficultyRating !== session.difficultyRating) {
        // The real update would require a backend API endpoint for updating difficulty
        // For now we'll log this - in a real implementation you'd call an API endpoint
        console.log('Would update difficulty rating to:', feedbackDifficultyRating);
        // Example: await sessionService.updateSessionDifficultyRating(sessionId, feedbackDifficultyRating);
      }
      
      setIsEditingFeedback(false);
      // Update local display immediately
      session.userFeedback = feedbackText;
      session.difficultyRating = feedbackDifficultyRating;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Silently fail and don't display alert
      // Still update the UI to show feedback was saved (better UX)
      setIsEditingFeedback(false);
      session.userFeedback = feedbackText;
      session.difficultyRating = feedbackDifficultyRating;
    } finally {
      setFeedbackSubmitting(false);
    }
  };
  
  // Render feedback section with improved styling
  const renderFeedbackSection = () => {
    // Function to determine sentiment icon based on feedback content
    const getFeedbackSentiment = () => {
      if (!userFeedback) return null;
      
      const text = userFeedback.toLowerCase();
      if (text.includes('great') || text.includes('good') || text.includes('awesome') || text.includes('excellent')) {
        return (
          <FeedbackEmotionIcon>
            <SentimentVerySatisfied sx={{ fontSize: 40, color: theme.palette.success.main }} />
          </FeedbackEmotionIcon>
        );
      } else if (text.includes('bad') || text.includes('terrible') || text.includes('awful') || text.includes('poor')) {
        return (
          <FeedbackEmotionIcon>
            <SentimentVeryDissatisfied sx={{ fontSize: 40, color: theme.palette.error.main }} />
          </FeedbackEmotionIcon>
        );
      } else {
        return (
          <FeedbackEmotionIcon>
            <SentimentNeutral sx={{ fontSize: 40, color: theme.palette.info.main }} />
          </FeedbackEmotionIcon>
        );
      }
    };

    if (isEditingFeedback) {
      return (
        <FeedbackBox>
          <FeedbackHeader>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              marginRight: 1.5,
              color: theme.palette.primary.main
            }}>
              <FeedbackOutlined sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.9 }}>
              Session Feedback
            </Typography>
          </FeedbackHeader>
          
          <Box sx={{ pt: 2, pb: 1 }}>
            <TextField 
              fullWidth 
              multiline 
              rows={4} 
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              variant="outlined"
              placeholder="How did this workout go? Any notes for next time?"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: '1rem',
                  backgroundColor: alpha(theme.palette.background.paper, 0.03),
                  transition: 'all 0.2s ease',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '1px',
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: '2px',
                  }
                }
              }}
            />
            
            {/* Improved difficulty rating component */}
            <Box sx={{ 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.background.paper, 0.07),
              borderRadius: 3,
              p: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.15),
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mr: 2, 
                  fontWeight: 500,
                  color: alpha(theme.palette.text.primary, 0.9)
                }}
              >
                Workout Difficulty:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Rating
                  value={feedbackDifficultyRating / 2}
                  precision={0.5}
                  onChange={(_, newValue) => {
                    setFeedbackDifficultyRating(newValue ? newValue * 2 : 0);
                  }}
                  size="large"
                  sx={{ 
                    color: theme.palette.success.main,
                    '& .MuiRating-iconEmpty': {
                      color: alpha(theme.palette.success.main, 0.3),
                    }
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 2,
                    color: alpha(theme.palette.text.primary, 0.7),
                    fontWeight: 500
                  }}
                >
                  {feedbackDifficultyRating}/10
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              justifyContent: 'flex-end'
            }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setIsEditingFeedback(false);
                  if (userFeedback) {
                    setFeedbackText(userFeedback);
                  }
                  setFeedbackDifficultyRating(session.difficultyRating || 0);
                }}
                disabled={feedbackSubmitting}
                sx={{
                  borderRadius: 6,
                  px: 3,
                  py: 0.7,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              >
                Cancel
              </Button>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveFeedback}
                disabled={feedbackSubmitting}
                sx={{
                  borderRadius: 6,
                  px: 3,
                  py: 0.7,
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {feedbackSubmitting ? 
                  <CircularProgress size={24} color="inherit" /> : 
                  'Save Feedback'
                }
              </Button>
            </Box>
          </Box>
        </FeedbackBox>
      );
    }
    
    return (
      <FeedbackBox>
        <FeedbackHeader>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            marginRight: 1.5,
            color: theme.palette.primary.main
          }}>
            <FeedbackOutlined sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.9 }}>
            Session Feedback
          </Typography>
        </FeedbackHeader>
        
        {userFeedback ? (
          <>
            <FeedbackContent>
              <Typography variant="body1" fontWeight={500} lineHeight={1.6} sx={{ pr: 5 }}>
                {userFeedback}
              </Typography>
              {getFeedbackSentiment()}
            </FeedbackContent>
            
            {/* Improved difficulty rating display */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 2.5,
              mt: 0.5,
              mx: 1.5
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mr: 1.5, 
                  color: alpha(theme.palette.text.primary, 0.7),
                  fontWeight: 500
                }}
              >
                Difficulty Rating:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating
                  value={(difficultyRating || 0) / 2}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ 
                    color: theme.palette.success.main,
                    mr: 1
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: alpha(theme.palette.text.primary, 0.7),
                    fontWeight: 500
                  }}
                >
                  {difficultyRating}/10
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end'
            }}>
              <EditFeedbackButton
                startIcon={<Edit sx={{ fontSize: 18 }} />}
                onClick={() => setIsEditingFeedback(true)}
              >
                Edit Feedback
              </EditFeedbackButton>
            </Box>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            py: 3,
            px: 2
          }}>
            <Box sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              transform: 'rotate(-5deg)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(5deg) scale(1.05)',
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
              }
            }}>
              <RateReview sx={{ fontSize: 32, color: theme.palette.primary.main, opacity: 0.7 }} />
            </Box>
            <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
              No feedback yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', maxWidth: 400 }}>
              Add your thoughts about this workout to track your progress and improve future sessions.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setIsEditingFeedback(true)}
              startIcon={<Add />}
              sx={{
                borderRadius: 6,
                px: 3,
                py: 1,
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Add Feedback
            </Button>
          </Box>
        )}
      </FeedbackBox>
    );
  };
  
  // Generate PDF report for this session
  const handleGenerateReport = async () => {
    // Save current expansion state
    const prevExpanded = { ...expandedExercises };
    // Expand all exercises
    const allExpanded: Record<string, boolean> = {};
    exerciseSummaries.forEach(ex => {
      allExpanded[ex.exerciseId] = true;
    });
    setExpandedExercises(allExpanded);
    setLoadingReport(true);
    await new Promise(r => setTimeout(r, 100)); // Wait for DOM update
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // --- Cover Page ---
    // Use theme colors for backgrounds and text
    const bgDefault = theme.palette.background.default;
    const bgPaper = theme.palette.background.paper;
    const textPrimary = theme.palette.text.primary;
    const textSecondary = theme.palette.text.secondary;
    // Convert hex/rgba to RGB for jsPDF
    function hexToRgb(hex: string): [number, number, number] {
      // Expand shorthand form (e.g. "#03F") to full form (e.g. "#0033FF")
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] as [number, number, number] : [255,255,255];
    }
    function rgbaToRgbArray(rgba: string): [number, number, number] {
      // e.g. rgba(18, 18, 18, 1) or rgb(18, 18, 18)
      const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] as [number, number, number];
      return [255,255,255];
    }
    function colorToRgbArray(color: string): [number, number, number] {
      if (color.startsWith('#')) return hexToRgb(color);
      if (color.startsWith('rgb')) return rgbaToRgbArray(color);
      return [255,255,255];
    }
    // Top bar: use primary color
    const primaryRgb: [number, number, number] = colorToRgbArray(theme.palette.primary.main);
    pdf.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.rect(0, 0, pageWidth, 18, 'F');
    // Main cover: use background.default
    const bgRgb: [number, number, number] = colorToRgbArray(bgDefault);
    pdf.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
    pdf.rect(0, 18, pageWidth, pageHeight - 18, 'F');
    // Text colors
    const textPrimaryRgb: [number, number, number] = colorToRgbArray(textPrimary);
    const textSecondaryRgb: [number, number, number] = colorToRgbArray(textSecondary);
    // Title
    pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(32);
    pdf.text('Session Summary Report', pageWidth / 2, 60, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(18);
    pdf.setTextColor(textPrimaryRgb[0], textPrimaryRgb[1], textPrimaryRgb[2]);
    pdf.text(`${session.workoutPlan?.name || 'Workout Session'}`, pageWidth / 2, 80, { align: 'center' });
    pdf.setFontSize(15);
    pdf.text(`Date: ${session.startTime ? new Date(session.startTime).toLocaleString() : 'N/A'}`, pageWidth / 2, 95, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setTextColor(textSecondaryRgb[0], textSecondaryRgb[1], textSecondaryRgb[2]);
    pdf.text('This report summarizes your workout session, including all exercise details.', pageWidth / 2, 115, { align: 'center' });
    // --- Session Summary Page ---
    await new Promise(r => setTimeout(r, 100));
    const element = document.getElementById('session-summary-root');
    if (element) {
      const canvas = await html2canvas(element, { backgroundColor: bgDefault, scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      if (imgData.startsWith('data:image/png')) {
        const imgProps = pdf.getImageProperties(imgData);
        let imgWidth = pageWidth - 20;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        if (imgHeight > pageHeight - 20) {
          imgHeight = pageHeight - 20;
          imgWidth = (imgProps.width * imgHeight) / imgProps.height;
        }
        pdf.addPage();
        // Fill the background with the theme color before adding the image
        pdf.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      }
    }
    pdf.save('session-summary-report.pdf');
    setExpandedExercises(prevExpanded); // Restore previous state
    setLoadingReport(false);
  };
  
  return (
    <>
      <Box id="session-summary-root">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          justifyContent: 'space-between' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SportsScore 
              sx={{ 
                fontSize: 32, 
                color: theme.palette.primary.main, 
                mr: 1.5 
              }} 
            />
            <Typography variant="h4" fontWeight={700}>
              Workout Summary
            </Typography>
          </Box>
          <Button variant="contained" color="primary" onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </Box>
        
        {!hasWorkoutPlan && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Workout plan data is unavailable for this session.
          </Alert>
        )}
        
        <SummaryPaper elevation={0}>
          {hasWorkoutPlan ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              mb: 3
            }}>
              <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
                {session.workoutPlan.name}
              </Typography>
              
              <Chip 
                label={session.workoutPlan?.difficulty || 'BEGINNER'} 
                color="primary"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          ) : (
            <Typography variant="h5" component="h2" fontWeight={600} gutterBottom mb={3}>
              Workout Session
            </Typography>
          )}
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <MetricBox>
                <IconWrapper color="primary">
                  <Timer />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatDuration(totalDuration || 0)}
                  </Typography>
                </Box>
              </MetricBox>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <MetricBox>
                <IconWrapper color="error">
                  <Whatshot />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">Calories</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {hasValidSummary ? summary.caloriesBurned || caloriesBurned || 0 : caloriesBurned || 0} kcal
                  </Typography>
                </Box>
              </MetricBox>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <MetricBox>
                <IconWrapper color="secondary">
                  <FitnessCenter />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">Exercises</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {hasValidSummary && summary.uniqueExercises ? 
                      `${summary.uniqueExercises} (${summary.totalExercises || 0} sets)` : 
                      `${hasSummaries ? exerciseSummaries.length : 0} (${hasSummaries ? exerciseSummaries.length : 0} sets)`
                    }
                  </Typography>
                </Box>
              </MetricBox>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <MetricBox>
                <IconWrapper color="success">
                  <SportsScore />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatDate(endTime)}
                  </Typography>
                </Box>
              </MetricBox>
            </Grid>
          </Grid>
          
          <Divider sx={{ mb: 4 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                Session Stats
              </Typography>
              <SummaryCard variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Total Sets</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {getTotalSets()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Total Reps</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {getTotalReps()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Form Score</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {getFormScore()}/10
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Difficulty</Typography>
                      <Rating
                        value={(difficultyRating || 0) / 2}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </SummaryCard>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                Muscle Groups
              </Typography>
              <SummaryCard variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {muscleGroups && muscleGroups.length > 0 && muscleGroups.map((group, index) => (
                      <Chip 
                        key={index} 
                        label={group} 
                        size="small" 
                        color="primary"
                        variant="outlined" 
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                    
                    {(!muscleGroups || muscleGroups.length === 0) && (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        width: '100%',
                        py: 2
                      }}>
                        <FitnessCenter sx={{ fontSize: 24, opacity: 0.2, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No muscle groups recorded
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </SummaryCard>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                Focus Areas
              </Typography>
              <SummaryCard variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {focusAreas && focusAreas.length > 0 && focusAreas.map((area, index) => (
                      <Chip 
                        key={index} 
                        label={area} 
                        size="small" 
                        color="secondary"
                        variant="outlined" 
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                    
                    {(!focusAreas || focusAreas.length === 0) && (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        width: '100%',
                        py: 2
                      }}>
                        <Timer sx={{ fontSize: 24, opacity: 0.2, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No focus areas recorded
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </SummaryCard>
            </Grid>
          </Grid>
        </SummaryPaper>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          mt: 4
        }}>
          <FitnessCenter 
            sx={{ 
              color: theme.palette.secondary.main, 
              mr: 1 
            }} 
          />
          <Typography variant="h6" fontWeight={600}>
            Exercise Performance
          </Typography>
        </Box>
        
        {renderExerciseTable()}
        
        {renderHealthMetrics()}
        
        {/* Add feedback section */}
        {renderFeedbackSection()}
      </Box>
    </>
  );
};

export default SessionSummary; 