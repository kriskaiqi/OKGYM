import React, { useState, useEffect } from 'react';
import { Exercise } from '../../types/exercise';
import ExerciseList from './ExerciseList';
import ExerciseDetail from './ExerciseDetail';
import { 
  Box, 
  Button, 
  Typography 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ExerciseSelectorProps {
  onSelect?: (exercise: Exercise) => void;
  onCancel?: () => void;
  initialSelectedExerciseId?: string;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  onSelect,
  onCancel,
  initialSelectedExerciseId
}) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  
  // If an initial exercise ID is provided, show details immediately
  useEffect(() => {
    if (initialSelectedExerciseId) {
      // We would need to fetch the exercise details here
      // This could be implemented once we have a proper API endpoint
      // For now, we'll assume this is handled by the parent component
      setDetailVisible(true);
    }
  }, [initialSelectedExerciseId]);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setDetailVisible(true);
  };
  
  const handleBackToList = () => {
    setDetailVisible(false);
  };
  
  const handleAddToWorkout = (exercise: Exercise) => {
    if (onSelect) {
      onSelect(exercise);
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {onCancel && (
        <Button 
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={onCancel} 
          sx={{ mb: 2 }}
        >
          Cancel
        </Button>
      )}
      
      <Box>
        {!detailVisible && (
          <ExerciseList 
            onSelectExercise={handleSelectExercise} 
            selectable={true}
          />
        )}
        
        {detailVisible && selectedExercise ? (
          <ExerciseDetail
            exerciseId={selectedExercise.id}
            onBackClick={handleBackToList}
            onAddToWorkout={handleAddToWorkout}
          />
        ) : detailVisible && initialSelectedExerciseId ? (
          <ExerciseDetail
            exerciseId={initialSelectedExerciseId}
            onBackClick={handleBackToList}
            onAddToWorkout={handleAddToWorkout}
          />
        ) : null}
      </Box>
    </Box>
  );
};

export default ExerciseSelector; 