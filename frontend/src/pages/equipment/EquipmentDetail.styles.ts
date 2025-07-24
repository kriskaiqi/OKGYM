import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Tabs, Tab, Chip, alpha } from '@mui/material';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Main container for the page
export const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

// Header container with back button and title
export const HeaderContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
}));

// Image container for equipment
export const ImageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'imageUrl',
})<{ imageUrl: string }>(({ theme, imageUrl }) => ({
  width: '100%',
  height: 300,
  backgroundColor: '#222',
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

// Placeholder container when no image is available
export const PlaceholderContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 300,
  backgroundColor: '#222',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    display: 'block',
    width: '40%',
    height: '40%',
    backgroundImage: `url('/images/equipment-placeholder.svg')`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0.2,
  },
}));

// Container for equipment metadata
export const MetadataContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

// Container for category and property chips
export const ChipsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

// Styled tabs for the detail sections
export const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    minHeight: 48,
    padding: theme.spacing(1.5, 2),
  },
  backgroundColor: theme.palette.background.default,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    backgroundColor: theme.palette.primary.main
  },
}));

// Styled tab component
export const StyledTab = styled(Tab)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

// Title for section headers
export const DetailTitle = styled(Typography)({
  marginBottom: 16,
  fontWeight: 600,
  fontSize: '1.25rem'
});

// Container for detail sections
export const DetailSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

// Styled chip for muscle groups
export const MuscleChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.primary.main, 0.2) 
    : alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  borderRadius: '16px',
})); 