import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Avatar, styled } from '@mui/material';
import { Achievement } from '../../services/achievementService';
import achievementService from '../../services/achievementService';
import { fadeScale, pulse, shimmer, glow, pop } from '../../styles/animations';
import { TierIndicator } from '../ui';

// Import Material UI icons dynamically
import * as MuiIcons from '@mui/icons-material';

// Interface for component props
interface AchievementCardProps {
  achievement: Achievement;
}

// Styled components
const StyledCard = styled(Card)<{ tier: string, unlocked: boolean }>(({ theme, tier, unlocked }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  position: 'relative',
  animation: `${fadeScale} 0.4s ease-out`,
  transform: 'translateZ(0)',
  overflow: 'visible',
  borderLeft: unlocked ? `4px solid ${achievementService.getTierColor(tier)}` : 'none',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 24px 0 ${theme.palette.mode === 'light' 
      ? 'rgba(0,0,0,0.15)' 
      : 'rgba(255,255,255,0.15)'}`
  }
}));

const AchievementContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: theme.spacing(2),
}));

const AchievementHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const AchievementAvatar = styled(Avatar)<{ tier: string, unlocked: boolean }>(({ theme, tier, unlocked }) => {
  const tierStyles = achievementService.getTierStyles(tier, unlocked);
  
  return {
    background: unlocked ? achievementService.getTierGradient(tier) : theme.palette.grey[500],
    marginRight: theme.spacing(2),
    width: 56,
    height: 56,
    opacity: tierStyles.opacity,
    boxShadow: tierStyles.boxShadow,
    animation: unlocked ? `${pulse} 3s infinite ease-in-out` : 'none',
    '& svg': {
      fontSize: 28,
    }
  };
});

// Fix the interface to make theme optional
const ProgressBar = styled(LinearProgress)<{ value: number }>(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: value >= 100 
      ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})` 
      : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    backgroundSize: '200% 100%',
    animation: value < 100 ? `${shimmer} 2s infinite linear` : 'none'
  }
}));

const UnlockedOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.7)',
  color: '#fff',
  borderRadius: theme.shape.borderRadius,
  zIndex: 10,
  animation: `${fadeScale} 0.5s forwards`,
}));

const UnlockedText = styled(Typography)(({ theme }) => ({
  animation: `${pop} 0.5s forwards`,
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #FFC107, #FF5722)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 2px 10px rgba(255,255,255,0.3)',
  fontSize: '1.5rem'
}));

/**
 * Component that displays an individual achievement card
 */
const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  // Animation state for achievements
  const [showUnlockedAnimation, setShowUnlockedAnimation] = useState(achievement.isUnlocked);
  
  // Hide animation after a few seconds
  useEffect(() => {
    if (achievement.isUnlocked) {
      const timer = setTimeout(() => {
        setShowUnlockedAnimation(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement.isUnlocked]);
  
  // Calculate progress percentage
  const progressPercentage = achievementService.calculateProgressPercentage(achievement);
  
  // Get the icon component
  const iconName = achievement.icon || achievementService.getCategoryIcon(achievement.category);
  const IconComponent = (MuiIcons as any)[iconName] || MuiIcons.EmojiEvents;
  
  return (
    <StyledCard tier={achievement.tier} unlocked={achievement.isUnlocked}>
      {showUnlockedAnimation && achievement.isUnlocked && (
        <UnlockedOverlay>
          <UnlockedText variant="h5">Achievement Completed!</UnlockedText>
        </UnlockedOverlay>
      )}
      
      <AchievementContent>
        <AchievementHeader>
          <AchievementAvatar 
            tier={achievement.tier} 
            unlocked={achievement.isUnlocked}
          >
            <IconComponent />
          </AchievementAvatar>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
              <Typography variant="h6" component="h3" sx={{ mr: 1 }}>
                {achievement.name}
              </Typography>
              <TierIndicator tier={achievement.tier} />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {achievement.category}
            </Typography>
          </Box>
        </AchievementHeader>
        
        <Typography variant="body2" color="textSecondary" sx={{ flex: 1, mb: 2, mt: 1, lineHeight: 1.4 }}>
          {achievement.description}
        </Typography>
        
        <Box>
          <ProgressBar 
            variant="determinate" 
            value={progressPercentage} 
            color={achievement.isUnlocked ? "success" : "primary"} 
          />
          
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption" color="textSecondary">
              {achievement.progress.current} / {achievement.progress.required} {achievement.progress.unit}
            </Typography>
            <Typography variant="caption" fontWeight="bold" color={achievement.isUnlocked ? "success.main" : "textSecondary"}>
              {progressPercentage}%
            </Typography>
          </Box>
          
          {achievement.isUnlocked && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 1, 
                color: 'success.main', 
                fontWeight: 'bold' 
              }}
            >
              ACHIEVED!
            </Typography>
          )}
        </Box>
      </AchievementContent>
    </StyledCard>
  );
};

export default AchievementCard; 