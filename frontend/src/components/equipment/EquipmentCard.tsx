import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
} from '@mui/material';
import {
  FitnessCenterOutlined as FitnessIcon,
  AspectRatioOutlined as SizeIcon,
  MonetizationOnOutlined as CostIcon,
} from '@mui/icons-material';
import { getImageUrl, getEquipmentImageUrl, getVideoUrl } from '../../utils/imageUtils';

import { EquipmentTypes } from '../../types';
import { ExerciseDifficulty } from '../../types/exercise';
import { muscleColors } from '../exercise/ExerciseCard.styles';
import {
  StyledCard,
  StyledCardActionArea,
  StyledCardMedia,
  CompactCardMedia,
  MediaOverlay,
  DifficultyChip,
  CategoryChip,
  MetadataItem,
  CardTitle,
  CardDescription,
  ChipsContainer,
  MetadataContainer,
} from '../../components/equipment/EquipmentCard.styles';

interface EquipmentCardProps {
  equipment: any; // Accept any equipment format
  onClick?: (equipment: any) => void;
  compact?: boolean;
  className?: string;
}

// Utility function to normalize different equipment data formats
const normalizeEquipmentForCard = (equipment: any): any => {
  // Return a normalized equipment object
  const media = equipment.media || [];
  
  // Get image URL using our utility function
  let imageUrl = equipment.imageUrl;
  if (!imageUrl || imageUrl.includes('placeholder')) {
    // Use our enhanced utility function that properly handles media and entity IDs
    imageUrl = getEquipmentImageUrl(equipment.name, media, equipment.id);
  } else {
    // Make sure the URL is properly formatted
    imageUrl = getImageUrl(imageUrl);
  }
  
  return {
    id: equipment.id?.toString() || '',
    name: equipment.name || 'Unnamed Equipment',
    description: equipment.description || '',
    imageUrl: imageUrl || '/static/images/equipment/placeholder.jpg',
    category: equipment.category || 'ACCESSORIES',
    difficulty: equipment.difficulty || ExerciseDifficulty.BEGINNER,
    costTier: equipment.costTier || 'MID_RANGE',
    spaceRequired: equipment.spaceRequired || 'SMALL',
    muscleGroupsTargeted: equipment.muscleGroupsTargeted || [],
    media: media,
  };
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onClick,
  compact = false,
  className = ''
}) => {
  // Normalize the equipment data
  const normalizedEquipment = normalizeEquipmentForCard(equipment);
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleClick = () => {
    onClick && onClick(equipment);
  };

  // Primary muscle group targeted by this equipment
  const primaryMuscle = normalizedEquipment.muscleGroupsTargeted && 
    normalizedEquipment.muscleGroupsTargeted.length > 0 ? 
    normalizedEquipment.muscleGroupsTargeted[0] : undefined;

  // Use direct URL from the media or imageUrl
  const imageUrl = normalizedEquipment.imageUrl;
  
  // Get video URL if available
  const videoUrl = getVideoUrl(
    normalizedEquipment.media, 
    normalizedEquipment.id, 
    'equipment',
    normalizedEquipment.name
  );
  
  console.log(`Equipment ${normalizedEquipment.name} - Image URL:`, imageUrl);
  if (videoUrl) {
    console.log(`Equipment ${normalizedEquipment.name} - Video URL:`, videoUrl);
  }

  const CardMediaComponent = compact ? CompactCardMedia : StyledCardMedia;

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

  // Add a fallback style for when images fail to load
  const placeholderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '2rem',
    '&::before': {
      content: '"\\2639"', // Sad face symbol
    }
  };

  // Format space requirement for display
  const spaceDisplay = normalizedEquipment.spaceRequired ? 
    normalizedEquipment.spaceRequired.replace('_', ' ').toLowerCase() : 'small';

  // Format cost tier for display
  const costDisplay = normalizedEquipment.costTier ? 
    normalizedEquipment.costTier.replace('_', ' ').toLowerCase() : 'mid range';

  return (
    <StyledCard 
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StyledCardActionArea onClick={handleClick} disabled={!onClick}>
        {/* Image shown by default */}
        <CardMediaComponent
          image={imageUrl}
          title={normalizedEquipment.name}
          onError={(e: any) => {
            console.error(`Failed to load image: ${imageUrl}`);
            setImageError(true);
            // When image fails to load, apply the placeholder style
            const target = e.target as HTMLElement;
            Object.assign(target.style, {
              backgroundColor: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            });
            // Add a placeholder icon or text
            target.innerHTML = '<span style="color: rgba(255,255,255,0.3); font-size: 2rem;">⚙️</span>';
          }}
          style={{ display: (isHovering && videoUrl) ? 'none' : 'block' }}
        >
          <MediaOverlay>
            <CategoryChip 
              label={normalizedEquipment.category} 
              size="small"
              category={normalizedEquipment.category}
            />
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
              <CategoryChip 
                label={normalizedEquipment.category} 
                size="small"
                category={normalizedEquipment.category}
              />
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
              {normalizedEquipment.name}
            </Typography>
          </CardTitle>
          
          {!compact && (
            <CardDescription>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                {normalizedEquipment.description}
              </Typography>
            </CardDescription>
          )}
          
          <MetadataContainer>
            <MetadataItem>
              <SizeIcon fontSize="small" />
              {spaceDisplay}
            </MetadataItem>
            
            <MetadataItem>
              <CostIcon fontSize="small" />
              {costDisplay}
            </MetadataItem>
          </MetadataContainer>
        </Box>
      </StyledCardActionArea>
    </StyledCard>
  );
};

export default EquipmentCard; 