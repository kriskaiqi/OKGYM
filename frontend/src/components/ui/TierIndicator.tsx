import React from 'react';
import { Box, styled } from '@mui/material';
import achievementService from '../../services/achievementService';
import { shimmer } from '../../styles/animations';

interface TierIndicatorProps {
  tier: string;
  className?: string;
}

const StyledTierIndicator = styled(Box)<{ tier: string }>(({ theme, tier }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3px 8px',
  borderRadius: '12px',
  background: achievementService.getTierGradient(tier),
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  width: '85px',
  height: '24px',
  lineHeight: '18px',
  textAlign: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  position: 'relative',
  overflow: 'hidden',
  letterSpacing: '0.5px',
  textShadow: '0 1px 2px rgba(0,0,0,0.25)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0))',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    right: '-50%',
    bottom: '-50%',
    background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)',
    transform: 'rotate(30deg)',
    animation: `${shimmer} 3s infinite linear`,
    zIndex: 1,
  }
}));

/**
 * A consistent tier indicator component for use across the application
 */
const TierIndicator: React.FC<TierIndicatorProps> = ({ tier, className }) => {
  return (
    <StyledTierIndicator tier={tier} className={className}>
      {tier}
    </StyledTierIndicator>
  );
};

export default TierIndicator; 