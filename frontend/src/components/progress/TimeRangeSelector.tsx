import React from 'react';
import { ToggleButtonGroup, ToggleButton, styled } from '@mui/material';
import { TimeRange } from '../../services/progressService';

// Styled components for the time range selector
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  borderRadius: theme.shape.borderRadius * 3,
  marginBottom: theme.spacing(2),
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius * 3,
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: '6px 16px',
  textTransform: 'none',
  minWidth: 80,
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  },
}));

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (timeRange: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: TimeRange | null
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <StyledToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      aria-label="time range"
      size="small"
    >
      <StyledToggleButton value="weekly" aria-label="weekly">
        Weekly
      </StyledToggleButton>
      <StyledToggleButton value="monthly" aria-label="monthly">
        Monthly
      </StyledToggleButton>
      <StyledToggleButton value="yearly" aria-label="yearly">
        Yearly
      </StyledToggleButton>
      <StyledToggleButton value="all" aria-label="all time">
        All Time
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  );
};

export default TimeRangeSelector; 