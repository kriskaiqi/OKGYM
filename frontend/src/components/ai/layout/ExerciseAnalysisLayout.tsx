import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Grid, 
  IconButton, 
  Tooltip, 
  useMediaQuery, 
  Theme, 
  ToggleButtonGroup, 
  ToggleButton
} from '@mui/material';
import { 
  ViewAgenda as SequentialViewIcon,
  ViewColumn as SideBySideViewIcon
} from '@mui/icons-material';

interface ExerciseAnalysisLayoutProps {
  videoComponent: React.ReactNode;
  metricsComponent: React.ReactNode;
  defaultLayout?: 'sequential' | 'side-by-side';
}

/**
 * A layout component for exercise analysis that can display video and metrics
 * either sequentially (stacked) or side-by-side based on user preference
 */
const ExerciseAnalysisLayout: React.FC<ExerciseAnalysisLayoutProps> = ({
  videoComponent,
  metricsComponent,
  defaultLayout = 'side-by-side'
}) => {
  const [layout, setLayout] = useState<'sequential' | 'side-by-side'>(defaultLayout);
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  
  // Always use sequential layout on mobile
  const effectiveLayout = isDesktop ? layout : 'sequential';
  
  const handleLayoutChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLayout: 'sequential' | 'side-by-side' | null
  ) => {
    if (newLayout !== null) {
      setLayout(newLayout);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Layout toggle control */}
      {isDesktop && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ToggleButtonGroup
            value={layout}
            exclusive
            onChange={handleLayoutChange}
            size="small"
            aria-label="display layout"
          >
            <ToggleButton value="sequential" aria-label="sequential layout">
              <Tooltip title="Stack View">
                <SequentialViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="side-by-side" aria-label="side-by-side layout">
              <Tooltip title="Side-by-side View">
                <SideBySideViewIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {effectiveLayout === 'sequential' ? (
        // Sequential Layout (stacked)
        <Box>
          {videoComponent}
          {metricsComponent}
        </Box>
      ) : (
        // Side-by-side Layout
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            {videoComponent}
          </Grid>
          <Grid item xs={12} md={5}>
            {metricsComponent}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ExerciseAnalysisLayout; 