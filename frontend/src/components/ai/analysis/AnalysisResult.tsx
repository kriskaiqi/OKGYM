import React from 'react';
import { Paper, Typography, Stack, Box } from '@mui/material';
import { AnalysisResult as IAnalysisResult } from '../../../types/ai/analysis';

interface AnalysisResultProps {
  result: IAnalysisResult;
  renderMetrics?: (result: any) => React.ReactNode;
  renderErrors?: (errors: any[]) => React.ReactNode;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  renderMetrics,
  renderErrors
}) => {
  if (!result.success || !result.result) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        Analysis Results
      </Typography>
      <Stack spacing={2}>
        {renderMetrics && renderMetrics(result.result)}
        
        {result.result.errors?.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="error">
              Form Issues:
            </Typography>
            {renderErrors ? (
              renderErrors(result.result.errors)
            ) : (
              <ul>
                {result.result.errors.map((error: any, index: number) => (
                  <li key={index}>
                    <Typography color="error.main">
                      {error.message}
                    </Typography>
                  </li>
                ))}
              </ul>
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}; 