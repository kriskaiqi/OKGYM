import React from 'react';
import { Box } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`squat-tabpanel-${index}`}
      aria-labelledby={`squat-tab-${index}`}
      sx={{ width: '100%' }}
    >
      {value === index && children}
    </Box>
  );
}; 