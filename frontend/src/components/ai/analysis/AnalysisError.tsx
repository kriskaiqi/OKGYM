import React from 'react';
import { Alert, AlertTitle, AlertColor } from '@mui/material';
import { ExerciseError } from '../../../types/ai/exercise';

interface AnalysisErrorProps {
  error: ExerciseError;
  onClose?: () => void;
}

const mapSeverityToAlertColor = (severity: ExerciseError['severity']): AlertColor => {
  switch (severity) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'low':
    case 'medium':
    case 'high':
      return 'info';
    default:
      return 'error';
  }
};

export const AnalysisError: React.FC<AnalysisErrorProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <Alert 
      severity={mapSeverityToAlertColor(error.severity)}
      onClose={onClose}
      sx={{ 
        mt: 2,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      <AlertTitle>{error.type}</AlertTitle>
      {error.message}
    </Alert>
  );
}; 