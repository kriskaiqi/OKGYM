import { styled } from '@mui/material/styles';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { 
  fadeIn, scaleIn, pulse, morph, glow, 
  slideUp, pop, ripple, gradientFlow 
} from '../../styles/animations';

export const StyledWorkoutCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeIn} 0.5s ease-out, ${scaleIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
    animation: `${gradientFlow} 3s ease infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '5px',
    height: '5px',
    background: 'rgba(255, 255, 255, 0.5)',
    opacity: '0',
    borderRadius: '100%',
    transform: 'scale(1, 1) translate(-50%)',
    transformOrigin: '50% 50%',
  },
  '&:active::after': {
    animation: `${ripple} 1s ease-out`,
  },
}));

export const WorkoutHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  animation: `${slideUp} 0.5s ease-out`,
}));

export const WorkoutTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateX(4px)',
    color: theme.palette.primary.main,
  },
}));

export const WorkoutDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    WebkitLineClamp: 'unset',
  },
}));

export const WorkoutStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  animation: `${slideUp} 0.5s ease-out 0.1s both`,
}));

export const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    color: theme.palette.primary.main,
  },
}));

export const WorkoutTags = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  animation: `${slideUp} 0.5s ease-out 0.2s both`,
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius / 2,
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    animation: `${pop} 0.3s ease-in-out`,
  },
  '&.MuiChip-colorPrimary': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  '&.MuiChip-colorSecondary': {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
}));

export const WorkoutCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, 
      ${theme.palette.primary.main}10, 
      ${theme.palette.secondary.main}10
    )`,
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

export const WorkoutImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  transition: 'transform 0.5s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

export const WorkoutOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
  opacity: 0.8,
  transition: 'opacity 0.3s ease-in-out',
  '&:hover': {
    opacity: 0.9,
  },
})); 