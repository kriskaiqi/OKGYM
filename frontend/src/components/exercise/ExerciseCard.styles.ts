import { styled, alpha } from '@mui/material';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  Chip, 
  CardActionArea 
} from '@mui/material';
import { ExerciseDifficulty, MuscleGroup } from '../../types/exercise';
import { 
  fadeIn, 
  scaleIn, 
  slideUp, 
  pulse, 
  pop, 
  gradientFlow,
  glow
} from '../../styles/animations';

// Define muscle group colors for visual distinction
export const muscleColors: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: '#e57373', // Red
  [MuscleGroup.BACK]: '#64b5f6', // Blue
  [MuscleGroup.SHOULDERS]: '#81c784', // Green
  [MuscleGroup.ARMS]: '#ffb74d', // Orange
  [MuscleGroup.LEGS]: '#9575cd', // Purple
  [MuscleGroup.CORE]: '#4fc3f7', // Light Blue
  [MuscleGroup.FULL_BODY]: '#4db6ac' // Teal
};

// Enhanced styled components for the card
export const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  animation: `${fadeIn} 0.5s ease-out, ${scaleIn} 0.5s ease-out`,
  position: 'relative',
  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.9) : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
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
}));

export const StyledCardActionArea = styled(CardActionArea)(({ theme }) => ({
  height: '100%', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'stretch',
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
    animation: `${pop} 1s ease-out`,
  },
}));

export const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 160,
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'all 0.5s ease-in-out',
  '&:hover': {
    backgroundPosition: 'center 45%',
    transform: 'scale(1.03)',
  },
}));

export const CompactCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 100,
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'all 0.5s ease-in-out',
  '&:hover': {
    backgroundPosition: 'center 45%',
    transform: 'scale(1.03)',
  },
}));

export const MediaOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  display: 'flex',
  justifyContent: 'space-between',
  transition: 'all 0.3s ease-in-out',
  opacity: 0.9,
  '&:hover': {
    opacity: 1,
    padding: theme.spacing(1.2),
  },
}));

export const DifficultyChip = styled(Chip)<{ difficulty: ExerciseDifficulty }>(({ theme, difficulty }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  fontSize: '0.75rem',
  height: 24,
  fontWeight: 600,
  backgroundColor: 
    difficulty === ExerciseDifficulty.BEGINNER 
      ? theme.palette.success.main 
      : difficulty === ExerciseDifficulty.INTERMEDIATE 
        ? theme.palette.warning.main 
        : theme.palette.error.main,
  color: '#fff',
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-2px)',
    animation: `${pulse} 0.3s ease-in-out`,
    boxShadow: `0 3px 6px ${alpha(
      difficulty === ExerciseDifficulty.BEGINNER 
        ? theme.palette.success.main 
        : difficulty === ExerciseDifficulty.INTERMEDIATE 
          ? theme.palette.warning.main 
          : theme.palette.error.main,
      0.4
    )}`,
  },
}));

export const MuscleChip = styled(Chip)<{ musclegroup: MuscleGroup }>(({ theme, musclegroup }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  fontSize: '0.75rem',
  height: 24,
  backgroundColor: alpha(muscleColors[musclegroup] || theme.palette.grey[500], 0.8),
  color: '#fff',
  margin: theme.spacing(0, 0.5, 0.5, 0),
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-2px) rotate(-2deg)',
    backgroundColor: muscleColors[musclegroup] || theme.palette.grey[500],
    boxShadow: `0 3px 6px ${alpha(muscleColors[musclegroup] || theme.palette.grey[500], 0.4)}`,
  },
}));

export const MetadataItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginRight: theme.spacing(2),
  transition: 'all 0.2s ease-in-out',
  '& svg': {
    fontSize: '1rem',
    marginRight: theme.spacing(0.5),
    color: theme.palette.primary.main,
    transition: 'all 0.3s ease-in-out',
  },
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'scale(1.05)',
    '& svg': {
      transform: 'scale(1.2) rotate(5deg)',
      animation: `${glow} 1.5s ease-in-out infinite`,
    },
  },
}));

export const CardTitle = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  fontWeight: 600,
  margin: theme.spacing(1.5, 1, 0.5, 1),
  transition: 'all 0.2s ease-in-out',
  animation: `${slideUp} 0.5s ease-out`,
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateX(2px)',
  },
}));

export const CardDescription = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  minHeight: '3.6em',
  color: theme.palette.text.secondary,
  transition: 'all 0.3s ease-in-out',
  animation: `${slideUp} 0.5s ease-out 0.1s`,
  lineHeight: 1.5,
  padding: theme.spacing(0, 1),
  '&:hover': {
    WebkitLineClamp: 4,
    maxHeight: '6em',
  },
}));

export const ChipsContainer = styled(Box)(({ theme }) => ({
  display: 'flex', 
  flexWrap: 'wrap', 
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(0, 1),
  animation: `${slideUp} 0.5s ease-out 0.2s`,
}));

export const MetadataContainer = styled(Box)(({ theme }) => ({
  display: 'flex', 
  alignItems: 'center',
  padding: theme.spacing(0, 1, 1, 1),
  marginTop: 'auto',
  animation: `${slideUp} 0.5s ease-out 0.3s`,
})); 