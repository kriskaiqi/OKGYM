import React from 'react';
import { Container, Paper } from '@mui/material';
import AchievementList from '../components/achievements/AchievementList';

/**
 * Achievements page component
 * Now just a wrapper around the reusable AchievementList component
 */
const Achievements: React.FC = () => {
  return (
    <Container sx={{ py: 4, width: '100%', maxWidth: '100% !important' }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <AchievementList showHeader={true} compact={false} />
      </Paper>
    </Container>
  );
};

export default Achievements; 