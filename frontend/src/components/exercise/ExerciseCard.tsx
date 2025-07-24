import React, { useState, useRef } from 'react';
import { Exercise, ExerciseDifficulty, MuscleGroup } from '../../types/exercise';
import {
  Typography,
  Box,
} from '@mui/material';
import {
  FitnessCenterOutlined as FitnessIcon,
  AccessTimeOutlined as TimeIcon,
  LocalFireDepartmentOutlined as FireIcon,
} from '@mui/icons-material';
import { getExerciseImageUrl, getVideoUrl } from '../../utils/imageUtils';

import {
  StyledCard,
  StyledCardActionArea,
  StyledCardMedia,
  CompactCardMedia,
  MediaOverlay,
  DifficultyChip,
  MuscleChip,
  MetadataItem,
  CardTitle,
  CardDescription,
  ChipsContainer,
  MetadataContainer,
  muscleColors
} from './ExerciseCard.styles';

import { formatArrayOrString } from '../../utils/formatters';

interface ExerciseCardProps {
  exercise: any; // Accept any exercise format
  onClick?: (exercise: any) => void;
  compact?: boolean;
  className?: string;
  hideCategory?: boolean;
  hideDifficulty?: boolean;
}

// Utility function to normalize different exercise data formats
const normalizeExerciseForCard = (exercise: any): Partial<Exercise> => {
  // Create stats object if it doesn't exist
  const stats = exercise.stats || {};
  
  // Handle different exercise property formats
  const muscleGroups = exercise.muscleGroups || 
    (exercise.primaryMuscleGroup ? 
      [exercise.primaryMuscleGroup, ...(exercise.secondaryMuscleGroups || [])] : 
      []);
  
  // Process image URL using our utility function
  const media = exercise.media || [];
  let imageUrl = exercise.imageUrl;
  
  // Use the utility function to properly handle the URL
  if (!imageUrl || imageUrl.includes('placeholder')) {
    imageUrl = getExerciseImageUrl(exercise.name, media, exercise.id);
  }
  
  // Return a normalized exercise object that works with the card
  return {
    id: exercise.id?.toString() || '',
    name: exercise.name || 'Unnamed Exercise',
    description: exercise.description || '',
    imageUrl: imageUrl || '/static/images/exercises/placeholder.jpg',
    difficulty: (exercise.difficulty || 'BEGINNER') as ExerciseDifficulty,
    muscleGroups: muscleGroups,
    estimatedDuration: exercise.estimatedDuration || 0,
    calories: exercise.calories || 0,
    stats: {
      duration: {
        avg: stats.duration?.avg || 0
      },
      calories: {
        avg: stats.calories?.avg || 0
      }
    },
    media: media // Keep the media array for later use
  };
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onClick,
  compact = false,
  className = '',
  hideCategory = true,
  hideDifficulty = false
}) => {
  // Normalize the exercise data
  const normalizedExercise = normalizeExerciseForCard(exercise);
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Get video URL if available
  const videoUrl = getVideoUrl(
    normalizedExercise.media, 
    normalizedExercise.id, 
    'exercise',
    normalizedExercise.name
  );
  
  if (videoUrl) {
    console.log(`Exercise ${normalizedExercise.name} - Video URL:`, videoUrl);
  }

  const handleClick = () => {
    onClick && onClick(normalizedExercise);
  };

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

  // Update the primaryMuscle logic
  const primaryMuscle = exercise.muscleGroups 
    ? (Array.isArray(exercise.muscleGroups) 
      ? exercise.muscleGroups[0] 
      : exercise.muscleGroups.split(',')[0].trim())
    : undefined;

  // Use the imageUrl from normalized exercise (it's already processed)
  const imageUrl = normalizedExercise.imageUrl;
  
  const handleImageError = () => {
    console.warn(`Failed to load image for exercise: ${normalizedExercise.name}`);
    setImageError(true);
  };

  const CardMediaComponent = compact ? CompactCardMedia : StyledCardMedia;

  // Ensure difficulty is never undefined
  const difficulty = normalizedExercise.difficulty || ExerciseDifficulty.BEGINNER;

  return (
    <StyledCard 
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StyledCardActionArea onClick={handleClick} disabled={!onClick}>
        {/* Image shown by default */}
        <CardMediaComponent
          image={normalizedExercise.imageUrl}
          title={normalizedExercise.name}
          onError={(e: any) => {
            console.error(`Failed to load image: ${normalizedExercise.imageUrl}`);
            setImageError(true);
            // Apply fallback styling
            const target = e.target as HTMLElement;
            Object.assign(target.style, {
              backgroundColor: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            });
            target.innerHTML = '<span style="color: rgba(255,255,255,0.3); font-size: 2rem;">❓</span>';
          }}
          style={{ display: (isHovering && videoUrl) ? 'none' : 'block' }}
        >
          <MediaOverlay>
            {!hideCategory && (
              <MuscleChip
                label={primaryMuscle}
                size="small"
                musclegroup={primaryMuscle as MuscleGroup}
              />
            )}
            {!hideDifficulty && (
              <DifficultyChip 
                label={difficulty} 
                size="small"
                difficulty={difficulty}
              />
            )}
          </MediaOverlay>
        </CardMediaComponent>
        
        {/* Video shown on hover if available */}
        {videoUrl && (
          <Box 
            sx={{ 
              position: 'relative', 
              width: '100%', 
              height: compact ? '180px' : '240px',
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
            <MediaOverlay>
              {!hideCategory && (
                <MuscleChip
                  label={primaryMuscle}
                  size="small"
                  musclegroup={primaryMuscle as MuscleGroup}
                />
              )}
              {!hideDifficulty && (
                <DifficultyChip 
                  label={difficulty} 
                  size="small"
                  difficulty={difficulty}
                />
              )}
            </MediaOverlay>
          </Box>
        )}

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <CardTitle>
            <Typography 
              variant="subtitle1" 
              component="h3" 
              fontWeight={600}
            >
              {normalizedExercise.name}
            </Typography>
          </CardTitle>
          
          {!compact && (
            <CardDescription>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                {normalizedExercise.description}
              </Typography>
            </CardDescription>
          )}
          
          {!compact && exercise.muscleGroups && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {formatArrayOrString(exercise.muscleGroups).map((muscle: string, idx: number) => (
                <MuscleChip 
                  key={idx} 
                  label={muscle}
                  size="small"
                  musclegroup={muscle as unknown as MuscleGroup}
                />
              ))}
            </Box>
          )}
          
          <MetadataContainer>
            <MetadataItem>
              <TimeIcon fontSize="small" />
              {normalizedExercise.stats?.duration?.avg 
                ? Math.round(normalizedExercise.stats.duration.avg / 60)
                : normalizedExercise.estimatedDuration || '–'} min
            </MetadataItem>
            
            <MetadataItem>
              <FireIcon fontSize="small" />
              {normalizedExercise.stats?.calories?.avg 
                ? normalizedExercise.stats.calories.avg
                : normalizedExercise.calories || '–'} cal
            </MetadataItem>
          </MetadataContainer>
        </Box>
      </StyledCardActionArea>
    </StyledCard>
  );
};

export default ExerciseCard; 