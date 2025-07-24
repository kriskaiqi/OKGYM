import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { WorkoutPlanDetail, WorkoutPlanForm } from '../../components/workout';
import { WorkoutPlan, CreateWorkoutPlanRequest } from '../../types/workout';
import { workoutService } from '../../services';
import { PageContainer } from '../../components/layout';

const WorkoutPlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch the workout details when ID changes
  useEffect(() => {
    if (id) {
      const fetchWorkout = async () => {
        try {
          const workout = await workoutService.getWorkoutPlanById(Number(id));
          setSelectedWorkout(workout);
        } catch (error) {
          console.error('Failed to fetch workout details:', error);
          setError('Failed to fetch workout details. Please try again.');
        }
      };
      fetchWorkout();
    }
  }, [id]);

  const handleEdit = (workout: WorkoutPlan) => {
    setSelectedWorkout(workout);
    setShowForm(true);
  };

  const handleSaveWorkout = async (updatedWorkout: WorkoutPlan) => {
    try {
      // Convert WorkoutPlan to CreateWorkoutPlanRequest
      const workoutRequest: CreateWorkoutPlanRequest = {
        name: updatedWorkout.name,
        description: updatedWorkout.description,
        difficulty: updatedWorkout.difficulty,
        estimatedDuration: updatedWorkout.estimatedDuration,
        workoutCategory: updatedWorkout.workoutCategory,
        imageUrl: updatedWorkout.imageUrl,
        exercises: updatedWorkout.exercises.map(ex => ({
          exerciseId: ex.exercise.id.toString(),
          order: ex.order,
          repetitions: ex.repetitions || undefined,
          duration: ex.duration || undefined,
          sets: ex.sets,
          restTime: ex.restTime,
          intensity: ex.intensity
        }))
      };
      
      await workoutService.updateWorkoutPlan(Number(id), workoutRequest);
      setShowForm(false);
      setError(null);
      // Refresh the page or refetch workout details
      window.location.reload();
    } catch (error) {
      console.error('Failed to update workout plan:', error);
      setError('Failed to update workout plan. Please try again.');
    }
  };

  const handleDelete = async (workoutId: number | string) => {
    setConfirmDelete(true);
  };

  const confirmDeleteWorkout = async () => {
    try {
      await workoutService.deleteWorkoutPlan(Number(id));
      setConfirmDelete(false);
      // Navigate back to workout plans page
      navigate('/workout-plans');
    } catch (error) {
      console.error('Failed to delete workout plan:', error);
      setError('Failed to delete workout plan. Please try again.');
      setConfirmDelete(false);
    }
  };

  const handleStartWorkout = (workout: WorkoutPlan) => {
    navigate(`/sessions?workoutId=${workout.id}`);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <PageContainer>
      <Box sx={{ width: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/workout-plans')}
              sx={{ mr: 1 }}
            >
              Back to Workouts
            </Button>
          </Box>

          {id && (
            <WorkoutPlanDetail 
              workoutId={id}
              onEdit={selectedWorkout ? () => handleEdit(selectedWorkout) : undefined}
              onDelete={id ? () => handleDelete(Number(id)) : undefined}
              onStartWorkout={selectedWorkout ? () => handleStartWorkout(selectedWorkout) : undefined}
            />
          )}
        </Paper>
      </Box>

      {/* Edit Workout Dialog */}
      <Dialog 
        open={showForm} 
        onClose={handleCloseForm}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Workout Plan</DialogTitle>
        <DialogContent>
          <WorkoutPlanForm
            initialWorkout={selectedWorkout}
            onSave={handleSaveWorkout}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this workout plan? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteWorkout} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default WorkoutPlanDetailPage; 