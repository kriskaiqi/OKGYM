import { 
  styled, 
  Card, 
  CardActionArea, 
  CardMedia, 
  CardContent, 
  Chip, 
  Paper, 
  Box, 
  alpha,
  Theme
} from '@mui/material';
import { EquipmentTypes } from '../../types';
import { ExerciseDifficulty } from '../../types/exercise';
import { gradientFlow } from '../../styles/animations';

// Map of category to color
export const categoryColors: Record<string, string> = {
  BARBELLS: '#2196f3',      // Blue
  DUMBBELLS: '#3f51b5',     // Indigo
  KETTLEBELLS: '#673ab7',   // Deep Purple
  MACHINES: '#9c27b0',      // Purple
  CABLES: '#e91e63',        // Pink
  BODYWEIGHT: '#f44336',    // Red
  ACCESSORIES: '#ff9800',   // Orange
  CARDIO: '#4caf50',        // Green
  RACKS: '#607d8b',         // Blue Grey
  BENCHES: '#795548',       // Brown
  RESISTANCE_BANDS: '#ffeb3b', // Yellow
  SPECIALTY: '#009688',     // Teal
};

// Styled components
export const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
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
  }
}));

export const StyledCardActionArea = styled(CardActionArea)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  height: '100%',
  padding: 0,
});

export const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  paddingTop: '56.25%', // 16:9 aspect ratio
  position: 'relative',
  backgroundSize: 'cover',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
}));

export const CompactCardMedia = styled(CardMedia)(({ theme }) => ({
  paddingTop: '70%',
  position: 'relative',
  backgroundSize: 'cover',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
}));

export const MediaOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px',
});

interface DifficultyChipProps {
  difficulty: ExerciseDifficulty;
  theme?: Theme;
}

export const DifficultyChip = styled(Chip)<DifficultyChipProps>(({ theme, difficulty }) => {
  const difficultyColors = {
    [ExerciseDifficulty.BEGINNER]: theme?.palette.success.main || '#4caf50',
    [ExerciseDifficulty.INTERMEDIATE]: theme?.palette.warning.main || '#ff9800',
    [ExerciseDifficulty.ADVANCED]: theme?.palette.error.main || '#f44336',
  };

  return {
    backgroundColor: alpha(difficultyColors[difficulty], 0.95),
    color: '#fff',
    fontWeight: 500,
    fontSize: '0.75rem',
  };
});

interface CategoryChipProps {
  category: string;
  theme?: Theme;
}

export const CategoryChip = styled(Chip)<CategoryChipProps>(({ theme, category }) => {
  const color = categoryColors[category] || (theme?.palette.primary.main || '#1976d2');
  
  return {
    backgroundColor: alpha(color, 0.95),
    color: '#fff',
    fontWeight: 500,
    fontSize: '0.75rem',
  };
});

export const CardTitle = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
}));

export const CardDescription = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  marginBottom: theme.spacing(1),
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const ChipsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
}));

export const MetadataContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2, 2),
  marginTop: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
}));

export const MetadataItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 500,
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
    opacity: 0.7,
  },
})); 