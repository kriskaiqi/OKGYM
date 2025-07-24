import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExerciseDetail } from '../../components/exercise';
import { 
  Box, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { exerciseService } from '../../services';
import { PageContainer } from '../../components/layout';

export const ExercisePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when ID changes
    setLoading(true);
    setError(null);
  }, [id]);

  const handleBackToList = () => {
    navigate('/exercises');
  };

  return (
    <PageContainer>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {id && !error && (
            <ExerciseDetail 
              exerciseId={id} 
              onBackClick={handleBackToList}
              onLoadingChange={setLoading}
              onError={(msg) => setError(msg)}
            />
          )}
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default ExercisePage; 