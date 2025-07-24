import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Snackbar,
  Alert,
  styled,
  SelectChangeEvent
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { 
  WorkoutPlan,
  WorkoutDifficulty,
  WorkoutCategory
} from '../../types/workout';
import { Exercise } from '../../types/exercise';
import { exerciseService } from '../../services';
import { ExerciseSelector } from '../exercise';

interface WorkoutPlanFormProps {
  initialWorkout?: WorkoutPlan;
  onSave: (workout: WorkoutPlan) => void;
  onCancel: () => void;
}

interface CreateWorkoutExerciseRequest {
  id?: number;
  exerciseId: string;
  order: number;
  repetitions?: number;
  duration?: number;
  sets: number;
  restTime: number;
  intensity?: string;
}

// Styled components
const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  marginBottom: theme.spacing(3),
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const TableActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

export const WorkoutPlanForm: React.FC<WorkoutPlanFormProps> = ({
  initialWorkout,
  onSave,
  onCancel
}) => {
  const [formValues, setFormValues] = useState({
    name: initialWorkout?.name || '',
    description: initialWorkout?.description || '',
    difficulty: initialWorkout?.difficulty || WorkoutDifficulty.BEGINNER,
    estimatedDuration: initialWorkout?.estimatedDuration || 30,
    estimatedCaloriesBurn: initialWorkout?.estimatedCaloriesBurn || 100,
    workoutCategory: initialWorkout?.workoutCategory || WorkoutCategory.FULL_BODY,
    isCustom: initialWorkout?.isCustom ?? true
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<CreateWorkoutExerciseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseOptions, setExerciseOptions] = useState<{ label: string; value: string }[]>([]);
  const [exerciseMap, setExerciseMap] = useState<Record<string, Exercise>>({});
  const [exerciseSelectorVisible, setExerciseSelectorVisible] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'error' | 'success' | 'info' | 'warning' });

  // Form validation
  const [errors, setErrors] = useState({
    name: false,
    estimatedDuration: false
  });

  useEffect(() => {
    if (initialWorkout) {
      setFormValues({
        name: initialWorkout.name || '',
        description: initialWorkout.description || '',
        difficulty: initialWorkout.difficulty || WorkoutDifficulty.BEGINNER,
        estimatedDuration: initialWorkout.estimatedDuration || 30,
        estimatedCaloriesBurn: initialWorkout.estimatedCaloriesBurn || 100,
        workoutCategory: initialWorkout.workoutCategory || WorkoutCategory.FULL_BODY,
        isCustom: initialWorkout.isCustom ?? true
      });
      
      if (initialWorkout.exercises) {
        console.log('Initial workout exercises:', initialWorkout.exercises);
        
        // Ensure we're handling different possible formats of workout exercises
        const workoutExercises = initialWorkout.exercises
          .filter(ex => {
            // More comprehensive check to match backend data structure
            const hasValidExerciseReference = ex && (
              (ex.exercise && ex.exercise.id) || 
              (ex as any).exerciseId || 
              (ex as any).exercise_id
            );
            
            if (!hasValidExerciseReference) {
              console.log('Invalid exercise format, properties:', Object.keys(ex));
            }
            
            return hasValidExerciseReference;
          })
          .map(ex => {
            // Handle case where exercise data might be structured differently
            // Extract exercise ID from various possible locations
            const exerciseId = 
              (ex.exercise && ex.exercise.id) || 
              (ex as any).exerciseId || 
              (ex as any).exercise_id;
            
            console.log(`Processing exercise with ID: ${exerciseId}`, ex);
            
            return {
              exerciseId: exerciseId,
              order: ex.order || 0,
              repetitions: ex.repetitions ?? undefined,
              duration: ex.duration ?? undefined,
              sets: ex.sets || 3,
              restTime: ex.restTime || 30,
              intensity: ex.intensity || 'medium'
            };
          });
        
        console.log('Processed workout exercises:', workoutExercises);
        setSelectedExercises(workoutExercises);
        
        // Extract exercise IDs for fetching details
        const exerciseIds = workoutExercises
          .map(ex => ex.exerciseId)
          .filter(id => id && typeof id === 'string' && id.trim().length > 0);
        
        console.log('Exercise IDs to fetch:', exerciseIds);
        
        if (exerciseIds.length > 0) {
          fetchExerciseDetails(exerciseIds);
        } else {
          console.warn('No valid exercise IDs found in workout plan');
        }
      }
    }
    
    fetchExercises();
  }, [initialWorkout]);

  const fetchExercises = async () => {
    try {
      const response = await exerciseService.getExercises();
      
      // Ensure we got a valid response with an array of exercises
      if (response && Array.isArray(response.data)) {
        setExercises(response.data);
        
        // Create map for quick lookups
        const exerciseMap = response.data.reduce((map: Record<string, Exercise>, exercise: Exercise) => {
          if (exercise && exercise.id) {
            map[exercise.id] = exercise;
          }
          return map;
        }, {});
        
        // Update exercise options for select input
        const options = response.data.map((exercise: Exercise) => ({
          value: exercise.id,
          label: exercise.name
        }));
        setExerciseOptions(options);
      } else {
        console.error('Invalid exercise data returned from API:', response);
        setExercises([]);
        setExerciseOptions([]);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setExercises([]);
      setExerciseOptions([]);
    }
  };

  const fetchExerciseDetails = async (exerciseIds: string[]) => {
    setLoading(true);
    
    console.log('===== fetchExerciseDetails DEBUG =====');
    console.log('Raw exercise IDs:', exerciseIds);
    console.log('Current exercise map:', exerciseMap);
    console.log('Total loaded exercises:', exercises.length);
    
    // Filter out null, undefined, or empty IDs
    const validExerciseIds = exerciseIds.filter(id => id && typeof id === 'string' && id.trim().length > 0);
    
    if (validExerciseIds.length === 0) {
      setExerciseMap({});
      setLoading(false);
      console.warn('No valid exercises to fetch details for');
      return;
    }
    
    console.log(`Attempting to fetch details for ${validExerciseIds.length} exercises:`, validExerciseIds);
    
    try {
      // Create an object to store exercise details by ID
      const newExerciseMap: Record<string, Exercise> = { ...exerciseMap };
      
      // Fetch each exercise individually so that errors with one exercise don't fail the entire request
      await Promise.all(
        validExerciseIds.map(async (id) => {
          try {
            // Check if we already have this exercise in our map
            if (newExerciseMap[id]) {
              console.log(`Exercise ${id} already loaded, skipping fetch`);
              return;
            }
            
            console.log(`Fetching exercise with ID: ${id}`);
            const exercise = await exerciseService.getExerciseById(id);
            console.log(`Result for exercise ${id}:`, exercise);
            
            if (exercise) {
              newExerciseMap[id] = exercise;
            } else {
              console.warn(`Exercise with ID ${id} not found or returned null`);
            }
          } catch (error) {
            console.error(`Error fetching exercise ${id}:`, error);
            // Continue with other exercises
          }
        })
      );
      
      console.log('Exercise map created with details:', Object.keys(newExerciseMap));
      setExerciseMap(newExerciseMap);
    } catch (error) {
      console.error('Error fetching exercise details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchExercises = async (query: string) => {
    if (!query) {
      await fetchExercises();
      return;
    }
    
    try {
      const response = await exerciseService.searchExercises(query);
      
      // Validate response and handle errors
      if (response && Array.isArray(response.data)) {
        // Update exercise options for search results
        const options = response.data.map((exercise: Exercise) => ({
          value: exercise.id,
          label: exercise.name
        }));
        setExerciseOptions(options);
      } else {
        console.warn('Search returned invalid data:', response);
        setExerciseOptions([]);
      }
    } catch (error) {
      console.error('Error searching exercises:', error);
      setExerciseOptions([]);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const existingExerciseIndex = selectedExercises.findIndex(
      ex => ex.exerciseId === exercise.id
    );

    if (existingExerciseIndex >= 0) {
      setSnackbar({
        open: true,
        message: `${exercise.name} is already in the workout`,
        severity: 'warning'
      });
      return;
    }

    const newExercise: CreateWorkoutExerciseRequest = {
      exerciseId: exercise.id,
      order: selectedExercises.length + 1,
      repetitions: 10,
      duration: 60,
      restTime: 60,
      intensity: 'medium',
      sets: 3
    };

    setSelectedExercises([...selectedExercises, newExercise]);
    setExerciseSelectorVisible(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(index, 1);
    
    // Reorder exercises
    const reorderedExercises = updatedExercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1
    }));
    
    setSelectedExercises(reorderedExercises);
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === selectedExercises.length - 1)
    ) {
      return;
    }
    
    const updatedExercises = [...selectedExercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap elements
    [updatedExercises[index], updatedExercises[targetIndex]] = 
      [updatedExercises[targetIndex], updatedExercises[index]];
    
    // Reorder exercises
    const reorderedExercises = updatedExercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1
    }));
    
    setSelectedExercises(reorderedExercises);
  };

  const handleExerciseParamChange = (index: number, field: string, value: any) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    
    setSelectedExercises(updatedExercises);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Clear errors when user types
    if (name === 'name') {
      setErrors({ ...errors, name: false });
    }
  };

  const handleNumberChange = (name: string, value: number | null) => {
    setFormValues({
      ...formValues,
      [name]: value || 0
    });
    
    // Clear errors when user types
    if (name === 'estimatedDuration') {
      setErrors({ ...errors, estimatedDuration: false });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      isCustom: e.target.checked
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {
      name: !formValues.name,
      estimatedDuration: !formValues.estimatedDuration
    };
    
    setErrors(newErrors);
    
    // Check if we have validation errors
    if (newErrors.name || newErrors.estimatedDuration) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    // Validate that we have at least one valid exercise
    const validExercises = selectedExercises.filter(ex => 
      ex.exerciseId && 
      ex.exerciseId.trim().length > 0 && 
      (exerciseMap[ex.exerciseId] || exercises.some(e => e.id === ex.exerciseId))
    );
    
    if (validExercises.length === 0 && selectedExercises.length > 0) {
      // We have exercises but none are valid
      setSnackbar({
        open: true,
        message: 'Please add at least one valid exercise to your workout plan',
        severity: 'warning'
      });
      return;
    }
    
    // Create a proper workout plan object to return
    const workoutPlanWithValidExercises: WorkoutPlan = {
      ...(initialWorkout || {
        id: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: 0,
        ratingCount: 0,
        popularity: 0
      } as Partial<WorkoutPlan>),
      name: formValues.name,
      description: formValues.description,
      difficulty: formValues.difficulty as WorkoutDifficulty,
      estimatedDuration: formValues.estimatedDuration,
      estimatedCaloriesBurn: formValues.estimatedCaloriesBurn,
      workoutCategory: formValues.workoutCategory as WorkoutCategory,
      isCustom: formValues.isCustom,
      exercises: validExercises.map(ex => {
        // Find the full exercise object if it exists in our map
        const exerciseDetails = exerciseMap[ex.exerciseId];
        
        // Return a structure matching the WorkoutExercise interface with necessary properties
        return {
          // For existing exercises, keep the ID
          ...(typeof ex.id === 'number' ? { id: ex.id } : { id: 0 }),
          order: ex.order,
          repetitions: ex.repetitions || null,
          duration: ex.duration || null,
          sets: ex.sets || 3,
          restTime: ex.restTime,
          intensity: ex.intensity,
          exercise: exerciseDetails || { id: ex.exerciseId, name: 'Unknown Exercise' } as Exercise
        };
      })
    } as WorkoutPlan;
    
    // Pass to the parent component
    onSave(workoutPlanWithValidExercises);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
        {initialWorkout ? 'Edit Workout Plan' : 'Create Workout Plan'}
      </Typography>
      
      <FormPaper elevation={0}>
        <FormSection>
          <TextField
            fullWidth
            label="Workout Name"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            required
            error={errors.name}
            helperText={errors.name ? "Workout name is required" : ""}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            margin="normal"
          />
        </FormSection>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="difficulty-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-label"
                name="difficulty"
                value={formValues.difficulty}
                onChange={handleSelectChange}
                label="Difficulty"
              >
                <MenuItem value={WorkoutDifficulty.BEGINNER}>Beginner</MenuItem>
                <MenuItem value={WorkoutDifficulty.INTERMEDIATE}>Intermediate</MenuItem>
                <MenuItem value={WorkoutDifficulty.ADVANCED}>Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Estimated Duration (minutes)"
              name="estimatedDuration"
              type="number"
              value={formValues.estimatedDuration}
              onChange={(e) => handleNumberChange('estimatedDuration', parseInt(e.target.value))}
              required
              error={errors.estimatedDuration}
              helperText={errors.estimatedDuration ? "Duration is required" : ""}
              InputProps={{ inputProps: { min: 1 } }}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Estimated Calories Burn"
              name="estimatedCaloriesBurn"
              type="number"
              value={formValues.estimatedCaloriesBurn}
              onChange={(e) => handleNumberChange('estimatedCaloriesBurn', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 0 } }}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="workoutCategory"
                value={formValues.workoutCategory}
                onChange={handleSelectChange}
                label="Category"
              >
                {Object.values(WorkoutCategory).map((category) => (
                  <MenuItem key={category} value={category}>{category.replace('_', ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formValues.isCustom}
                  onChange={handleSwitchChange}
                  name="isCustom"
                  color="primary"
                />
              }
              label="Custom Workout"
              sx={{ mt: 2 }}
            />
          </Grid>
        </Grid>
      </FormPaper>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Exercises</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setExerciseSelectorVisible(true)}
          >
            Add Exercise
          </Button>
        </Box>
        
        {exerciseSelectorVisible ? (
          <Box sx={{ mb: 3 }}>
            <ExerciseSelector
              onSelect={handleAddExercise}
              onCancel={() => setExerciseSelectorVisible(false)}
            />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="80">Order</TableCell>
                  <TableCell>Exercise</TableCell>
                  <TableCell width="120">Repetitions</TableCell>
                  <TableCell width="120">Duration (sec)</TableCell>
                  <TableCell width="120">Rest (sec)</TableCell>
                  <TableCell width="150">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedExercises.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No exercises added yet</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedExercises.map((exercise, index) => {
                    // Try multiple ways to get the exercise name
                    const exerciseFromMap = exerciseMap[exercise.exerciseId];
                    const exerciseFromList = exercises.find(e => e.id === exercise.exerciseId);
                    const exerciseName = exerciseFromMap?.name || exerciseFromList?.name || `Exercise ${index + 1}`;
                    
                    return (
                      <TableRow key={`exercise-${exercise.exerciseId || exercise.order}`}>
                        <TableCell>{exercise.order}</TableCell>
                        <TableCell>{exerciseName}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={exercise.repetitions || ''}
                            onChange={(e) => handleExerciseParamChange(index, 'repetitions', parseInt(e.target.value))}
                            InputProps={{ inputProps: { min: 1 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={exercise.duration || ''}
                            onChange={(e) => handleExerciseParamChange(index, 'duration', parseInt(e.target.value))}
                            InputProps={{ inputProps: { min: 1 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={exercise.restTime}
                            onChange={(e) => handleExerciseParamChange(index, 'restTime', parseInt(e.target.value))}
                            InputProps={{ inputProps: { min: 0 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TableActions>
                            <IconButton
                              size="small"
                              disabled={index === 0}
                              onClick={() => handleMoveExercise(index, 'up')}
                            >
                              <ArrowUpIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              disabled={index === selectedExercises.length - 1}
                              onClick={() => handleMoveExercise(index, 'down')}
                            >
                              <ArrowDownIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveExercise(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableActions>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          type="submit" 
          disabled={loading || selectedExercises.length === 0}
        >
          {initialWorkout ? 'Update Workout Plan' : 'Create Workout Plan'}
        </Button>
      </Box>
      
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

export default WorkoutPlanForm; 