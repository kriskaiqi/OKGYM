import React, { useState, useEffect, useCallback } from 'react';
import { WorkoutPlan } from '../../types/workout';
import { Exercise } from '../../types/exercise';
import { workoutService, exerciseService } from '../../services';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardHeader,
  Chip,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  PlayArrow as PlayIcon,
  AccessTime as ClockIcon,
  LocalFireDepartment as FireIcon,
  FitnessCenterOutlined as FitnessIcon,
  Photo as ImageIcon
} from '@mui/icons-material';
import { getExerciseImageUrl } from '../../utils/imageUtils';

// Styled components
const DetailPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  height: '100%',
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`
}));

const ExerciseCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  },
  display: 'flex',
  flexDirection: 'column',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(1, 2),
  fontWeight: 600,
}));

const ExerciseImage = styled(Box)(({ theme }) => ({
  width: '250px',
  aspectRatio: '1/1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.grey[200], 0.5),
  borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
  position: 'relative',
  overflow: 'hidden',
}));

const NoImagePlaceholder = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '250px',
  backgroundColor: alpha(theme.palette.grey[200], 0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  padding: theme.spacing(2),
}));

const ExerciseOrderBadge = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5),
  fontWeight: 600,
  fontSize: '0.875rem',
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workout-tabpanel-${index}`}
      aria-labelledby={`workout-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface WorkoutPlanDetailProps {
  workoutId: number | string;
  onEdit?: (workout: WorkoutPlan) => void;
  onDelete?: (workoutId: number | string) => void;
  onStartWorkout?: (workout: WorkoutPlan) => void;
}

export const WorkoutPlanDetail: React.FC<WorkoutPlanDetailProps> = ({
  workoutId,
  onEdit,
  onDelete,
  onStartWorkout
}) => {
  const theme = useTheme();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [exerciseMap, setExerciseMap] = useState<Record<string, Exercise>>({});
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'error' | 'success' | 'info' | 'warning' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchWorkoutDetails = useCallback(async () => {
    try {
      setLoading(true);
      const workoutData = await workoutService.getWorkoutPlanById(Number(workoutId));
      
      // Log the data structure to debug response format
      console.log('Workout data received:', workoutData);
      
      setWorkoutPlan(workoutData);
      
      if (workoutData.exercises && Array.isArray(workoutData.exercises) && workoutData.exercises.length > 0) {
        // Log exercises structure for debugging
        console.log('Exercises from workout data:', workoutData.exercises);
        
        // Extract all exercise IDs using the same approach that works in the edit form
        const exerciseIds = workoutData.exercises
          .map(ex => {
            // Try all possible locations of the exercise ID
            const exerciseId = (ex.exercise && ex.exercise.id) || 
                               (ex as any).exerciseId || 
                               (ex as any).exercise_id;
            
            if (!exerciseId) {
              console.warn('No exercise ID found in exercise object:', ex);
              console.log('Exercise object keys:', Object.keys(ex));
              
              // If we have an exercise object, check its keys
              if (ex.exercise) {
                console.log('Exercise sub-object keys:', Object.keys(ex.exercise));
              }
            }
            
            return exerciseId;
          })
          .filter(id => id); // Remove null/undefined
        
        console.log(`Extracted ${exerciseIds.length} exercise IDs:`, exerciseIds);
        
        if (exerciseIds.length > 0) {
          // Fetch exercise details
          try {
            const exercisePromises = exerciseIds.map(id => {
              console.log(`Creating promise to fetch exercise with ID: ${id}`);
              return exerciseService.getExerciseById(id);
            });
            
            console.log(`Created ${exercisePromises.length} promises for exercise details`);
            const exerciseDetails = await Promise.all(exercisePromises);
            console.log('Exercise details fetched:', exerciseDetails);
            
            // Create a map of exercise id to details, filtering out null results
            const exerciseMap = exerciseDetails
              .filter(Boolean) // Remove null results
              .reduce((map, ex) => {
                if (ex && ex.id) {
                  map[ex.id] = ex;
                }
                return map;
              }, {} as Record<string, Exercise>);
            
            console.log('Exercise map created with keys:', Object.keys(exerciseMap));
            setExerciseMap(exerciseMap);
          } catch (error) {
            console.error('Error fetching exercise details:', error);
          }
        } else {
          console.warn('No valid exercise IDs extracted from workout exercises');
        }
      } else {
        console.warn('No exercises found in workout plan or invalid structure:', 
          workoutData.exercises);
      }
    } catch (error) {
      console.error('Failed to fetch workout details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load workout details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails();
    }
  }, [workoutId, fetchWorkoutDetails]);

  const handleDelete = async () => {
    if (!workoutPlan) return;
    
    try {
      await workoutService.deleteWorkoutPlan(Number(workoutPlan.id));
      setSnackbar({
        open: true,
        message: 'Workout plan deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      if (onDelete) {
        onDelete(workoutPlan.id);
      }
    } catch (error) {
      console.error('Failed to delete workout plan:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete workout plan',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'success';
      case 'INTERMEDIATE':
        return 'primary';
      case 'ADVANCED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!workoutPlan) {
    return (
      <Alert severity="warning">
        Workout plan not found. It may have been deleted or you don't have access to it.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DetailPaper elevation={0}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: 3
        }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              {workoutPlan.name}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={workoutPlan.difficulty || 'BEGINNER'} 
                color={getDifficultyColor(workoutPlan.difficulty) as any}
                size="small"
              />
              
              <Chip 
                label={workoutPlan.workoutCategory?.replace('_', ' ') || 'General'} 
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
            {onStartWorkout && (
              <ActionButton
                startIcon={<PlayIcon />}
                variant="contained"
                color="primary"
                onClick={() => onStartWorkout(workoutPlan)}
              >
                Start Workout
              </ActionButton>
            )}
          </Box>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: theme.shape.borderRadius,
            }}>
              <ClockIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {workoutPlan.estimatedDuration || 0} min
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 2,
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              borderRadius: theme.shape.borderRadius,
            }}>
              <FireIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.error.main }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Calories
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {workoutPlan.estimatedCaloriesBurn || 0} kcal
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 2,
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              borderRadius: theme.shape.borderRadius,
            }}>
              <FitnessIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.success.main }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Exercises
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {workoutPlan.exercises?.length || 0}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {workoutPlan.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {workoutPlan.description}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab 
              label="Exercises" 
              icon={<FitnessIcon />} 
              iconPosition="start"
              sx={{ borderRadius: '8px 8px 0 0' }}
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {!workoutPlan.exercises || !Array.isArray(workoutPlan.exercises) || workoutPlan.exercises.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              This workout plan doesn't have any exercises yet.
            </Alert>
          ) : (
            <Box>
              {workoutPlan.exercises
                  ?.filter(ex => {
                    // Use the same check that works in the edit form
                    const hasValidReference = ex && (
                      (ex.exercise && ex.exercise.id) || 
                      (ex as any).exerciseId || 
                      (ex as any).exercise_id
                    );
                    return hasValidReference;
                  })
                  .sort((a, b) => {
                    const orderA = typeof a.order === 'number' ? a.order : 0;
                    const orderB = typeof b.order === 'number' ? b.order : 0;
                    return orderA - orderB;
                })
                .map((exercise, index) => {
                // Extract exerciseId using same approach as edit form
                const exerciseId = 
                  (exercise.exercise && exercise.exercise.id) || 
                  (exercise as any).exerciseId || 
                  (exercise as any).exercise_id;
                
                if (!exerciseId) {
                  console.warn('No exercise ID found in:', exercise);
                  return null;
                }
                
                // Try to get exercise details from different sources
                let exerciseName = `Exercise ${index + 1}`;
                let exerciseDetails = exerciseMap[exerciseId];
                
                // If not in exerciseMap, check if it's available directly in the exercise object
                if (!exerciseDetails && exercise.exercise && exercise.exercise.name) {
                  exerciseName = exercise.exercise.name;
                }
                
                return (
                  <ExerciseCard key={`exercise-${exerciseId || index}`}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      height: '100%'
                    }}>
                      {/* Left side - Exercise image */}
                      {exerciseDetails ? (
                        <ExerciseImage>
                          <Box
                            component="img"
                            src={getExerciseImageUrl(
                              exerciseDetails.name, 
                              exerciseDetails.media, 
                              exerciseDetails.id
                            )}
                            alt={exerciseDetails.name || "Exercise image"}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                            }}
                            onError={(e) => {
                              console.error(`Failed to load image for exercise: ${exerciseDetails.name}`);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallbackEl = e.currentTarget.parentElement?.querySelector('.image-error-fallback');
                              if (fallbackEl) {
                                (fallbackEl as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                          <Box
                            className="image-error-fallback"
                            sx={{
                              display: 'none',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: (theme) => alpha(theme.palette.grey[800], 0.05),
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              No image available
                            </Typography>
                          </Box>
                        </ExerciseImage>
                      ) : (
                        <NoImagePlaceholder>
                          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No image available
                          </Typography>
                        </NoImagePlaceholder>
                      )}
                      
                      {/* Right side - Exercise details */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <CardHeader
                          avatar={
                            <ExerciseOrderBadge>
                              {index + 1}
                            </ExerciseOrderBadge>
                          }
                          title={exerciseDetails?.name || exerciseName}
                          subheader={
                            exerciseDetails?.muscleGroups && Array.isArray(exerciseDetails.muscleGroups) && exerciseDetails.muscleGroups.length > 0 ? 
                              exerciseDetails.muscleGroups[0] : 
                              exerciseDetails?.category?.replace('_', ' ') || null
                          }
                          action={
                            exerciseDetails?.muscleGroups?.length ? (
                              <Chip 
                                label={exerciseDetails.muscleGroups[0]} 
                                color="primary" 
                                variant="outlined"
                                size="small"
                              />
                            ) : null
                          }
                        />
                        
                        <CardContent sx={{ pt: 0 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip 
                              label={`Sets: ${(exercise as any).sets ?? 3}`} 
                              size="small"
                              variant="outlined"
                            />
                            
                            {(exercise.repetitions ?? 0) > 0 && (
                              <Chip 
                                label={`Reps: ${exercise.repetitions}`} 
                                size="small"
                                variant="outlined"
                              />
                            )}
                            
                            {(exercise.duration ?? 0) > 0 && (
                              <Chip 
                                label={`Duration: ${exercise.duration}s`} 
                                size="small"
                                variant="outlined"
                              />
                            )}
                            
                            <Chip 
                              label={`Rest: ${exercise.restTime ?? 60}s`} 
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          
                          {exerciseDetails?.description && (
                            <Typography variant="body2" color="text.secondary">
                              {exerciseDetails.description}
                            </Typography>
                          )}
                        </CardContent>
                      </Box>
                    </Box>
                  </ExerciseCard>
                );
                })}
            </Box>
          )}
        </TabPanel>
      </DetailPaper>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Workout Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{workoutPlan.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
            </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkoutPlanDetail; 