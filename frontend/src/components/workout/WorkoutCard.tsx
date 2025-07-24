import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  Rating, 
  Stack,
  styled,
  alpha,
  Tooltip,
  IconButton,
  CardActionArea,
  useTheme
} from '@mui/material';
import { 
  AccessTime as ClockIcon, 
  LocalFireDepartment as FireIcon, 
  FitnessCenter as WorkoutIcon,
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { WorkoutPlan, WorkoutDifficulty } from '../../types/workout';
import {
  StyledWorkoutCard,
  WorkoutHeader,
  WorkoutTitle,
  WorkoutDescription,
  WorkoutStats,
  StatItem,
  WorkoutTags,
  StyledChip,
  WorkoutCardContent,
} from './WorkoutCard.styles';
import { 
  fadeIn, scaleIn, pulse, morph, glow, 
  slideUp, pop, ripple, gradientFlow, favoriteRemove, heartBeat
} from '../../styles/animations';
import { getImageUrl, getVideoUrl } from '../../utils/imageUtils';

// Helper function to get color based on difficulty
const getDifficultyColor = (difficulty?: WorkoutDifficulty): string => {
  if (!difficulty) {
    return 'default';
  }
  
  switch (difficulty) {
    case WorkoutDifficulty.BEGINNER:
      return 'success';
    case WorkoutDifficulty.INTERMEDIATE:
      return 'primary';
    case WorkoutDifficulty.ADVANCED:
      return 'error';
    default:
      return 'default';
  }
};

interface WorkoutCardProps {
  workout: WorkoutPlan;
  onStartWorkout?: (workoutId: string | number) => void;
  compact?: boolean;
  onFavoriteToggle?: (workoutId: string | number, isFavorite: boolean) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
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

const CompactCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
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

const CardOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
  opacity: 0.8,
  transition: 'opacity 0.3s ease'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  fontWeight: 600,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: theme.shape.borderRadius * 4,
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  margin: theme.spacing(0.5),
}));

const DifficultyChip = styled(Chip)(({ theme, color }) => ({
  borderRadius: '12px',
  fontWeight: 600,
  height: '24px',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

// Add styled FavoriteButton component
const FavoriteButton = styled(IconButton)<{ isremoving?: string; isadding?: string }>(({ theme, isremoving, isadding }) => ({
  zIndex: 2,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
  },
  animation: isremoving === 'true' 
    ? `${favoriteRemove} 0.5s ease` 
    : isadding === 'true' 
      ? `${heartBeat} 0.8s ease`
      : 'none',
  ...(isremoving !== 'true' && isadding !== 'true' && {
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  })
}));

const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  workout, 
  onStartWorkout, 
  compact = false,
  onFavoriteToggle
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if workout is null or undefined
  if (!workout) {
    return (
      <CompactCard>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">Workout data unavailable</Typography>
        </Box>
      </CompactCard>
    );
  }

  // Get video URL if available
  const videoUrl = getVideoUrl(
    workout.media,
    workout.id,
    'workout',
    workout.name
  );

  if (videoUrl) {
    console.log(`Workout ${workout.name} - Video URL:`, videoUrl);
  }

  // Handle mouse enter/leave for video playback
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch(err => {
        console.warn('Failed to autoplay video:', err);
      });
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Handle logic when user toggles favorite status
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If we're removing a favorite, trigger the removing animation
    if (workout.isFavorite) {
      setIsRemoving(true);
      // Wait for animation to complete before actually toggling favorite
      setTimeout(() => {
        if (onFavoriteToggle) {
          onFavoriteToggle(workout.id, !workout.isFavorite);
        }
        setIsRemoving(false);
      }, 500); // Match the animation duration
    } else {
      // For adding favorites, show heart beat animation
      setIsAdding(true);
      if (onFavoriteToggle) {
        onFavoriteToggle(workout.id, !workout.isFavorite);
      }
      // Reset after animation completes
      setTimeout(() => {
        setIsAdding(false);
      }, 800); // Match the heartBeat animation duration
    }
  };

  const handleStartWorkout = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartWorkout) {
      onStartWorkout(workout.id);
    } else {
      // If no callback is provided, navigate directly
      navigate(`/sessions?workoutId=${workout.id}`);
    }
  };

  const navigateToDetails = () => {
    navigate(`/workout-plans/${workout.id}`);
  };

  const getWorkoutImage = () => {
    try {
      // First check if the workout has an imageUrl property from normalization
      if (workout.imageUrl) {
        return workout.imageUrl;
      }
      
      // If no imageUrl, check for media
      if (workout.media && workout.media.length > 0) {
        const primaryImage = workout.media.find(m => m.type === 'IMAGE' && m.isPrimary === true);
        if (primaryImage && primaryImage.url) {
          return getImageUrl(primaryImage.url);
        }
        
        // Then any image
        const anyImage = workout.media.find(m => m.type === 'IMAGE');
        if (anyImage && anyImage.url) {
          return getImageUrl(anyImage.url);
        }
      }
      
      // Use name-based approach using the correct path structure
      if (workout.name) {
        const filename = workout.name.toLowerCase().replace(/\s+/g, '-');
        return `/static/workouts/images/${filename}.jpg`;
      }
      
      // Fall back to category image
      if (workout.workoutCategory) {
        const formattedCategory = workout.workoutCategory.toLowerCase().replace(/_/g, '-');
        return `/static/images/workouts/${formattedCategory}.jpg`;
      }
      
      // Last resort fallback
      return '/static/images/workouts/placeholder.jpg';
    } catch (error) {
      console.error('Error getting workout image:', error);
      // Return a fallback image if all else fails
      return '/static/images/workouts/placeholder.jpg';
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Failed to load workout image for "${workout.name}"`);
    setImgError(true);
    
    // Apply placeholder style immediately rather than trying another image that might fail
    const target = e.target as HTMLElement;
    Object.assign(target.style, {
      backgroundColor: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
    
    // Add a placeholder icon or text
    target.innerHTML = '<span style="color: rgba(255,255,255,0.3); font-size: 2rem;">🏋️</span>';
  };

  if (compact) {
    return (
      <StyledWorkoutCard onClick={navigateToDetails} sx={{ cursor: 'pointer' }}>
        <WorkoutCardContent>
          <WorkoutHeader>
            <WorkoutTitle variant="h6">{workout.name}</WorkoutTitle>
            <Typography variant="subtitle2" color="text.secondary">
              {workout.estimatedDuration} min
            </Typography>
          </WorkoutHeader>

          <WorkoutDescription variant="body2">
            {workout.description}
          </WorkoutDescription>

          <WorkoutStats>
            <StatItem>
              <Typography variant="body2">
                {workout.exerciseCount !== undefined ? workout.exerciseCount : (workout.exercises?.length || 0)} exercises
              </Typography>
            </StatItem>
            <StatItem>
              <Typography variant="body2">
                {workout.difficulty}
              </Typography>
            </StatItem>
          </WorkoutStats>

          <WorkoutTags>
            {workout.workoutCategory && (
              <StyledChip
                label={workout.workoutCategory}
                size="small"
                color="primary"
              />
            )}
            <StyledChip
              label={workout.difficulty}
              size="small"
              color="secondary"
            />
          </WorkoutTags>
        </WorkoutCardContent>
      </StyledWorkoutCard>
    );
  }
  
  return (
    <StyledCard 
      data-workout-id={workout.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ height: 450 }}
    >
      <CardActionArea onClick={navigateToDetails}>
        {/* Image shown by default */}
        <CardMedia
          component="img"
          height="200"
          image={getWorkoutImage()}
          alt={workout.name || 'Workout'}
          sx={{ 
            objectFit: 'cover',
            display: (isHovering && videoUrl) ? 'none' : 'block',
            height: 200
          }}
          onError={handleImageError}
        />
        
        {/* Video shown on hover if available */}
        {videoUrl && (
          <Box 
            sx={{ 
              position: 'relative', 
              width: '100%', 
              height: '200px',
              display: isHovering ? 'block' : 'none',
              overflow: 'hidden'
            }}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
              muted
              loop
              playsInline
            />
            <CardOverlay />
          </Box>
        )}
        
        <CardOverlay />
        
        <Box sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}>
          <Box>
            <DifficultyChip 
              size="small"
              label={workout.difficulty ? workout.difficulty.replace('_', ' ') : 'Unknown'}
              color={getDifficultyColor(workout.difficulty) as any}
              sx={{ mb: 1 }}
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                color: 'white', 
                fontWeight: 700, 
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                mb: 0,
                maxHeight: '56px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {workout.name || 'Unnamed Workout'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          position: 'absolute', 
          top: 12, 
          right: 12, 
          display: 'flex',
          gap: 1
        }}>
          <MetricBox>
            <ClockIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {workout.estimatedDuration || '0'} mins
            </Typography>
          </MetricBox>
          
          <MetricBox>
            <FireIcon fontSize="small" sx={{ mr: 0.5, color: 'secondary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {workout.estimatedCaloriesBurn || '0'} cal
            </Typography>
          </MetricBox>
        </Box>
        
        {/* Favorite button inside the CardActionArea but with stopPropagation */}
        <FavoriteButton 
          onClick={(e) => {
            e.stopPropagation();
            handleFavoriteToggle(e);
          }}
          isremoving={isRemoving.toString()}
          isadding={isAdding.toString()}
          sx={{ 
            position: 'absolute',
            bottom: 12,
            right: 12,
            color: 'white',
            bgcolor: workout.isFavorite ? 'error.main' : 'rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: workout.isFavorite ? 'error.dark' : 'rgba(0,0,0,0.7)',
            },
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            transform: workout.isFavorite ? 'scale(1.1)' : 'scale(1)',
            padding: '8px'
          }}
          size="medium"
          aria-label={workout.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {workout.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </FavoriteButton>
      </CardActionArea>
      
      <CardContent sx={{ flexGrow: 1, pt: 2, height: '120px' }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <Rating 
            value={workout.rating || 0} 
            precision={0.5} 
            readOnly 
            size="small" 
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            ({workout.ratingCount || 0})
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          mb: 1.5,
          height: '60px'
        }}>
          {workout.description || 'No description available'}
        </Typography>
        
        {(workout.exerciseCount !== undefined || (workout.exercises && workout.exercises.length > 0)) && (
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WorkoutIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
            <strong>{workout.exerciseCount !== undefined ? workout.exerciseCount : (workout.exercises?.length || 0)}</strong> exercises
          </Typography>
        )}
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between', height: '70px' }}>
        <Button 
          size="small" 
          component={Link} 
          to={`/workout-plans/${workout.id}`}
          variant="outlined"
          startIcon={<InfoIcon />}
        >
          Details
        </Button>
        
        {onStartWorkout && (
          <ActionButton
            variant="contained"
            onClick={handleStartWorkout}
            endIcon={<PlayIcon />}
            size="medium"
          >
            Start Workout
          </ActionButton>
        )}
      </CardActions>
    </StyledCard>
  );
};

export default WorkoutCard; 