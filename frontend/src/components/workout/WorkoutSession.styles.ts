import { styled, alpha } from '@mui/material/styles';
import { 
  Paper, Box, Button, Fab, CardMedia, Typography,
  LinearProgress, Stepper, Step, StepLabel, StepContent,
  Card, CardContent, CardHeader, IconButton, Chip,
  Alert, Divider, Tooltip, Zoom, Slide
} from '@mui/material';
import {
  fadeIn, scaleIn, pulse, morph, glow,
  slideUp, pop, ripple, gradientFlow,
  bounce, shake
} from '../../styles/animations';

export const SessionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
  animation: `${fadeIn} 0.5s ease-out, ${scaleIn} 0.5s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    animation: `${gradientFlow} 3s ease infinite`,
  },
}));

export const TimerDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  borderRadius: theme.shape.borderRadius * 2,
  fontFamily: 'monospace',
  fontSize: '2rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  animation: `${pulse} 2s ease-in-out infinite`,
  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

export const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  animation: `${slideUp} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    animation: `${pulse} 0.3s ease-in-out`,
  },
  '&:active': {
    transform: 'translateY(0)',
    animation: `${ripple} 0.5s ease-out`,
  },
}));

export const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 100,
  animation: `${bounce} 2s ease-in-out infinite`,
  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 6px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

export const ExerciseImage = styled(CardMedia)(({ theme }) => ({
  height: 300,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  transition: 'all 0.5s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[8],
  },
}));

export const ExerciseVideo = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingBottom: '56.25%',
  height: 0,
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.01)',
    boxShadow: theme.shadows[8],
  },
  '& iframe': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
}));

export const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1,
  color: theme.palette.text.primary,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    color: theme.palette.primary.main,
  },
}));

export const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

export const StyledStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-label': {
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiStepLabel-active': {
    animation: `${pulse} 1s ease-in-out infinite`,
  },
  '& .MuiStepLabel-completed': {
    color: theme.palette.success.main,
  },
}));

export const ExerciseCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease-in-out',
  animation: `${slideUp} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

export const ExerciseHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '& .MuiCardHeader-title': {
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
}));

export const ExerciseContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

export const ExerciseChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    animation: `${pop} 0.3s ease-in-out`,
  },
}));

export const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    animation: `${gradientFlow} 3s ease infinite`,
  },
}));

export const AlertMessage = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  animation: `${shake} 0.5s ease-in-out`,
  '& .MuiAlert-icon': {
    animation: `${pulse} 1s ease-in-out infinite`,
  },
})); 