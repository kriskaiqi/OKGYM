import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Grid,
  Box,
  Tab,
  Tabs,
  Skeleton,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button,
  Paper,
  Fade
} from '@mui/material';
import AchievementCard from './AchievementCard';
import { Achievement } from '../../services/achievementService';
import achievementService from '../../services/achievementService';
import { useNavigate } from 'react-router-dom';
import { fadeIn, fadeScale, slideUp } from '../../styles/animations';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Styled components for animations
const AnimatedGridItem = styled(Grid)(({ theme }) => ({
  animation: `${fadeScale} 0.5s ease-out`,
  animationFillMode: 'both',
}));

const AnimatedChip = styled(Chip)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  }
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  animation: `${slideUp} 0.5s ease-out`,
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const EnhancedSkeleton = styled(Skeleton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  transform: 'scale(1)',
  '&::after': {
    animation: 'wave 1.6s linear 0.5s infinite',
  }
}));

// Unique achievement categories
const CATEGORIES = [
  'ALL',
  'MILESTONE',
  'CONSISTENCY',
  'PERFORMANCE',
  'IMPROVEMENT',
  'EXPLORER',
  'CHALLENGE',
  'SOCIAL',
  'SPECIAL'
];

// Achievement tiers
const TIERS = [
  'ALL',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'MASTER'
];

interface AchievementListProps {
  compact?: boolean;
  showHeader?: boolean;
  maxItems?: number;
  showViewAllButton?: boolean;
}

// Add this custom hook at the start of the file, before the AchievementList component
const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await achievementService.getAchievements();
      setAchievements(data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    loading,
    error,
    retryFetch: fetchAchievements
  };
};

// Add this ErrorDisplay component before the AchievementList component
const ErrorDisplay: React.FC<{ 
  message: string; 
  onRetry: () => void;
}> = ({ message, onRetry }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        my: 4, 
        borderRadius: 2, 
        border: '1px solid',
        borderColor: 'error.light',
        backgroundColor: alpha(theme.palette.error.light, 0.1)
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {message}
        </Typography>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    </Paper>
  );
};

/**
 * Reusable component to display achievements
 */
const AchievementList: React.FC<AchievementListProps> = ({
  compact = false,
  showHeader = true,
  maxItems,
  showViewAllButton = false
}) => {
  const { achievements, loading, error, retryFetch } = useAchievements();
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('progress');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // Handle tab change
  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };
  
  // Handle tier filter change
  const handleTierChange = (event: SelectChangeEvent) => {
    setSelectedTier(event.target.value);
  };
  
  // Handle sort by change
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };
  
  // Filter and sort achievements
  const filteredAndSortedAchievements = React.useMemo(() => {
    // First filter by category
    let filtered = achievements;
    
    if (selectedTab !== 'ALL') {
      filtered = filtered.filter(a => a.category === selectedTab);
    }
    
    // Then filter by tier
    if (selectedTier !== 'ALL') {
      filtered = filtered.filter(a => a.tier === selectedTier);
    }
    
    // Then sort
    let sorted = [...filtered];
    switch (sortBy) {
      case 'unlocked':
        sorted.sort((a, b) => {
          // Unlocked first, then by name
          if (a.isUnlocked && !b.isUnlocked) return -1;
          if (!a.isUnlocked && b.isUnlocked) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'progress':
        sorted.sort((a, b) => {
          // Highest progress percentage first
          const aProgress = achievementService.calculateProgressPercentage(a);
          const bProgress = achievementService.calculateProgressPercentage(b);
          return bProgress - aProgress;
        });
        break;
      case 'tier':
        sorted.sort((a, b) => {
          // By tier precedence
          const tierOrder = {
            'BRONZE': 1,
            'SILVER': 2,
            'GOLD': 3,
            'PLATINUM': 4,
            'DIAMOND': 5,
            'MASTER': 6
          };
          return (tierOrder[a.tier as keyof typeof tierOrder] || 0) - 
                 (tierOrder[b.tier as keyof typeof tierOrder] || 0);
        });
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Limit if maxItems is specified
    if (maxItems && sorted.length > maxItems) {
      sorted = sorted.slice(0, maxItems);
    }
    
    return sorted;
  }, [achievements, selectedTab, selectedTier, sortBy, maxItems]);
  
  // Stats for achievements
  const achievementStats = React.useMemo(() => {
    if (achievements.length === 0) return { total: 0, unlocked: 0, percentage: 0 };
    
    const unlocked = achievements.filter(a => a.isUnlocked).length;
    const total = achievements.length;
    const percentage = Math.round((unlocked / total) * 100);
    
    return { total, unlocked, percentage };
  }, [achievements]);
  
  // Render loading skeletons
  const renderSkeletons = () => {
    const count = compact ? 3 : 6;
    return Array(count).fill(0).map((_, index) => (
      <Grid item xs={12} sm={compact ? 6 : 6} md={compact ? 4 : 4} key={`skeleton-${index}`}
        sx={{ 
          opacity: 1 - (index * 0.1), // Fade out slightly for a cascade effect
          animation: `${fadeIn} ${0.3 + (index * 0.1)}s ease-out`
        }}
      >
        <Paper sx={{ position: 'relative', overflow: 'visible', pb: 2, height: '100%' }}>
          {/* Tier badge skeleton */}
          <Box sx={{ position: 'absolute', top: -10, right: 20 }}>
            <EnhancedSkeleton variant="circular" width={36} height={36} />
          </Box>
          
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <EnhancedSkeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <EnhancedSkeleton variant="text" width="70%" height={30} />
                <EnhancedSkeleton variant="text" width="40%" height={20} />
              </Box>
            </Box>
            <EnhancedSkeleton variant="text" width="100%" height={20} />
            <EnhancedSkeleton variant="text" width="90%" height={20} />
            <Box sx={{ mt: 2 }}>
              <EnhancedSkeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 4 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <EnhancedSkeleton variant="text" width="30%" height={15} />
                <EnhancedSkeleton variant="text" width="20%" height={15} />
              </Box>
            </Box>
          </Box>
          
          {/* Status indicator skeleton */}
          <Box sx={{ position: 'absolute', bottom: -10, right: -10 }}>
            <EnhancedSkeleton variant="circular" width={30} height={30} />
          </Box>
        </Paper>
      </Grid>
    ));
  };
  
  // View all achievements handler
  const handleViewAll = () => {
    navigate('/achievements');
  };
  
  return (
    <>
      {showHeader && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Your Achievements
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Track your fitness journey milestones and accomplishments.
            </Typography>
            
            {!loading && !error && !compact && (
              <StatsContainer>
                <AnimatedChip 
                  label={`Total: ${achievementStats.total}`} 
                  color="primary" 
                  variant="outlined" 
                  size={compact ? "small" : "medium"}
                />
                <AnimatedChip 
                  label={`Unlocked: ${achievementStats.unlocked}`} 
                  color="success" 
                  variant="outlined"
                  size={compact ? "small" : "medium"}
                />
                <AnimatedChip 
                  label={`Completion: ${achievementStats.percentage}%`} 
                  color={achievementStats.percentage > 50 ? "success" : "primary"} 
                  variant="outlined"
                  size={compact ? "small" : "medium"}
                />
              </StatsContainer>
            )}
          </Box>
          
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      
      {/* Only show filters if not in compact mode */}
      {!compact && (
        <>
          {/* Category Tabs */}
          <Box sx={{ width: '100%', mb: 3 }}>
            {isMobile ? (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={selectedTab}
                  label="Category"
                  onChange={(e) => setSelectedTab(e.target.value)}
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {CATEGORIES.map((category) => (
                  <AnimatedChip
                    key={category}
                    label={category}
                    onClick={() => setSelectedTab(category)}
                    color={selectedTab === category ? "primary" : "default"}
                    variant={selectedTab === category ? "filled" : "outlined"}
                    sx={{ fontWeight: selectedTab === category ? 'bold' : 'normal' }}
                  />
                ))}
              </Box>
            )}
          </Box>
          
          {/* Filters and Sorting */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              mb: 3
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="tier-select-label">Tier</InputLabel>
              <Select
                labelId="tier-select-label"
                value={selectedTier}
                label="Tier"
                onChange={handleTierChange}
              >
                {TIERS.map((tier) => (
                  <MenuItem key={tier} value={tier}>
                    {tier}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="progress">Progress</MenuItem>
                <MenuItem value="unlocked">Unlocked</MenuItem>
                <MenuItem value="tier">Tier</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </>
      )}
      
      {/* Error Display */}
      {error && (
        <ErrorDisplay message={error} onRetry={() => {
          retryFetch();
        }} />
      )}
      
      {/* Achievements Grid */}
      <Grid container spacing={compact ? 2 : 3}>
        {loading ? (
          renderSkeletons()
        ) : filteredAndSortedAchievements.length > 0 ? (
          filteredAndSortedAchievements.map((achievement, index) => (
            <AnimatedGridItem 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={achievement.id}
              sx={{ 
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <AchievementCard 
                achievement={achievement} 
              />
            </AnimatedGridItem>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography textAlign="center" color="textSecondary" sx={{ py: 4 }}>
              {selectedTab !== 'ALL' || selectedTier !== 'ALL'
                ? 'No achievements match your selected filters.'
                : 'No achievements found. Start completing workouts to earn achievements!'}
            </Typography>
          </Grid>
        )}
      </Grid>
      
      {/* View All Button */}
      {showViewAllButton && filteredAndSortedAchievements.length > 0 && (
        <Fade in={true} style={{ transitionDelay: '300ms' }}>
          <Box mt={3} display="flex" justifyContent="center">
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleViewAll}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              View All Achievements
            </Button>
          </Box>
        </Fade>
      )}
    </>
  );
};

export default AchievementList; 