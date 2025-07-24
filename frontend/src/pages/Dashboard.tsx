import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography as MuiTypography, 
  Grid, 
  Paper, 
  Button, 
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Tooltip,
  Rating,
  useTheme,
  useMediaQuery,
  styled,
  Chip,
  Fade,
  alpha,
  CircularProgress,
  LinearProgress,
  tooltipClasses,
  TooltipProps,
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  Favorite as FavoriteIcon, 
  FitnessCenter as FitnessCenterIcon,
  Timer as TimerIcon,
  LocalFireDepartment as FireIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  EmojiEvents as TrophyIcon,
  Dashboard as DashboardIcon,
  DirectionsRun as ActivityIcon,
  Assignment as WorkoutsIcon,
  EmojiEvents as AchievementsIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { WorkoutCard, ActiveSessionWidget } from '../components/workout';
import { formatDistanceToNow } from 'date-fns';
import { dashboardService } from '../services/dashboardService';
import achievementService from '../services/achievementService';
import { ActivityItem } from '../services/userService';
import { useSnackbar } from 'notistack';
import LoadingState from '../components/common/LoadingState';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { PageContainer } from '../components/layout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  Tabs, 
  TabList, 
  Tab, 
  TabPanel, 
  Chart, 
  Progress 
} from '../components/ui';
import { 
  Typography,
  PageTitle, 
  BodyText, 
  SmallText,
  SectionTitle,
  SubsectionTitle
} from '../components/ui/Typography';
import AchievementList from '../components/achievements/AchievementList';
import { userService } from '../services/userService';
import sessionService from '../services/sessionService';
import { fadeIn } from '../styles/animations';
import { keyframes } from '@mui/system';

// Fallback animation if import fails
const fadeInAnimation = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Define a subtle fade-in-scale animation 
const fadeInScale = keyframes`
  from {
    opacity: 0.7;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const WelcomeSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  }
}));

const PageHeader = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  '& h5': {
    fontSize: '1.25rem',
    fontWeight: 700,
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: -8,
      width: 40,
      height: 3,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 2,
    }
  }
}));

type StatIconProps = {
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
};

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  position: 'relative',
  animation: `${fadeInScale} 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.7)}, ${alpha(theme.palette.secondary.main, 0.7)})`,
    opacity: 0,
    transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 20px -10px ${alpha(theme.palette.common.black, 0.3)}`,
    '&::before': {
      opacity: 1,
    },
  },
}));

const StatIcon = styled(Box)<StatIconProps>(({ theme, color = 'primary' }) => ({
  width: 60,
  height: 60,
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.2)} 0%, ${alpha(theme.palette[color].main, 0.4)} 100%)`,
  color: theme.palette[color].main,
  boxShadow: `0 4px 10px ${alpha(theme.palette[color].main, 0.25)}`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    boxShadow: `0 0 12px ${alpha(theme.palette[color].main, 0.6)}`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::after': {
    opacity: 1,
  },
  '& svg': {
    fontSize: 30,
    filter: `drop-shadow(0 2px 4px ${alpha(theme.palette[color].main, 0.5)})`,
  }
}));

const StatContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 800,
  color: theme.palette.text.primary,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  marginBottom: theme.spacing(0.5),
  textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}`,
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: alpha(theme.palette.text.secondary, 0.9),
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
}));

const AchievementCard = styled(Card)(({ theme }) => ({
  padding: 0,
  overflow: 'visible',
}));

const AchievementContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2.5, 3),
}));

const AchievementAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  backgroundColor: theme.palette.primary.main,
  marginRight: theme.spacing(2.5),
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
}));

const AchievementTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
  fontSize: '1rem',
}));

const AchievementDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(1),
}));

const AchievementTimestamp = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  fontSize: '0.75rem',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  }
}));

// Enhanced tooltip with better styling
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    color: theme.palette.text.primary,
    borderRadius: 12,
    padding: theme.spacing(1.5, 2),
    boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.2)}`,
    backdropFilter: 'blur(8px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    maxWidth: 220,
    fontSize: '0.85rem',
    fontWeight: 500,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '2px',
      bottom: -1,
      left: 0,
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      borderRadius: '0 0 12px 12px',
    },
    animation: `${fadeInAnimation} 0.25s cubic-bezier(0.4, 0, 0.2, 1)`,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: alpha(theme.palette.background.paper, 0.95),
  },
}));

// Add a custom hook to fetch achievements
const useAchievementCount = () => {
  const [achievementCount, setAchievementCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAchievementCount = useCallback(async () => {
    try {
      setLoading(true);
      const achievements = await achievementService.getAchievements();
      const unlockedAchievements = achievements.filter(a => a.isUnlocked);
      setAchievementCount(unlockedAchievements.length);
    } catch (error) {
      console.error('Error fetching achievement count:', error);
      // Keep the count at 0 in case of error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievementCount();
  }, [fetchAchievementCount]);

  return {
    achievementCount,
    loading,
    refetch: fetchAchievementCount
  };
};

const DashboardHeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100%',
  width: '100%',
  zIndex: 0,
  marginLeft: '-24px',
  marginRight: '-24px',
  paddingLeft: '24px',
  paddingRight: '24px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '450px',
    background: theme.palette.mode === 'dark' 
      ? `
        linear-gradient(120deg, 
          ${alpha(theme.palette.primary.dark, 0.9)} 0%,
          ${alpha(theme.palette.secondary.dark, 0.8)} 50%,
          ${alpha(theme.palette.primary.dark, 0.7)} 100%),
        radial-gradient(
          circle at top right,
          ${alpha(theme.palette.secondary.main, 0.8)} 0%,
          transparent 60%
        ),
        radial-gradient(
          circle at bottom left,
          ${alpha(theme.palette.primary.main, 0.8)} 0%,
          transparent 60%
        )
      `
      : `
        linear-gradient(120deg, 
          ${alpha(theme.palette.primary.light, 0.8)} 0%,
          ${alpha(theme.palette.secondary.light, 0.7)} 50%,
          ${alpha(theme.palette.primary.light, 0.6)} 100%),
        radial-gradient(
          circle at top right,
          ${alpha(theme.palette.secondary.light, 0.6)} 0%,
          transparent 60%
        ),
        radial-gradient(
          circle at bottom left,
          ${alpha(theme.palette.primary.light, 0.6)} 0%,
          transparent 60%
        )
      `,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    borderRadius: '24px 24px 0 0',
    opacity: 0.9,
    zIndex: -1,
    boxShadow: theme.palette.mode === 'dark'
      ? `0 10px 30px -10px ${alpha(theme.palette.common.black, 0.3)}`
      : `0 10px 30px -10px ${alpha(theme.palette.common.black, 0.15)}`,
    [theme.breakpoints.down('sm')]: {
      height: '350px',
      borderRadius: '16px 16px 0 0',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '450px',
    background: `linear-gradient(180deg, 
      transparent 50%, 
      ${theme.palette.background.default} 100%)`,
    zIndex: -1,
    borderRadius: '24px 24px 0 0',
    [theme.breakpoints.down('sm')]: {
      height: '350px',
      borderRadius: '16px 16px 0 0',
    },
  },
}));

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<any[]>([]);
  const [favoriteWorkouts, setFavoriteWorkouts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<number[]>(Array(7).fill(0));
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalWorkouts: 0,
    totalDuration: 0,
    averageDuration: 0,
    totalCaloriesBurned: 0,
    averageCaloriesBurned: 0,
    longestStreak: 0,
    totalExercises: 0
  });
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [activeSection, setActiveSection] = useState('overview');
  
  // Use the achievement count hook
  const { achievementCount, loading: achievementsLoading } = useAchievementCount();

  // Function to fetch favorite workouts
  const fetchFavoriteWorkouts = async () => {
    try {
      const favorites = await userService.getFavoriteWorkouts();
      setFavoriteWorkouts(favorites);
    } catch (error) {
      console.error('Error fetching favorite workouts:', error);
    }
  };

  // Function to fetch all session data for comprehensive stats
  const fetchAllSessions = async () => {
    try {
      // Get completed sessions with a high limit to ensure we get all data
      const { sessions } = await sessionService.getUserSessions({ 
        status: 'COMPLETED',
        limit: 500 // High limit to get all historical data
      });
      
      setAllSessions(sessions);
      
      // Calculate comprehensive statistics
      if (sessions.length > 0) {
        // Calculate total exercises
        const totalExercises = sessions.reduce((sum: number, session: any) => {
          const exerciseResults = typeof session.exerciseResults === 'string' 
            ? JSON.parse(session.exerciseResults) 
            : session.exerciseResults;
          
          return sum + (exerciseResults ? Object.keys(exerciseResults).length : 0);
        }, 0);
        
        // Calculate total workout duration in minutes
        const totalDuration = sessions.reduce((sum: number, session: any) => {
          return sum + (session.totalDuration || 0) / 60; // Convert seconds to minutes
        }, 0);
        
        // Calculate total calories burned
        const totalCaloriesBurned = sessions.reduce((sum: number, session: any) => {
          return sum + (session.caloriesBurned || 0);
        }, 0);
        
        // Calculate longest streak
        const streakData = calculateStreakData(sessions);
        
        setStats({
          totalWorkouts: sessions.length,
          totalDuration: totalDuration,
          averageDuration: sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
          totalCaloriesBurned: totalCaloriesBurned,
          averageCaloriesBurned: sessions.length > 0 ? Math.round(totalCaloriesBurned / sessions.length) : 0,
          longestStreak: streakData.longestStreak,
          totalExercises: totalExercises
        });
      }
    } catch (error) {
      console.error('Error fetching all sessions:', error);
    }
  };

  // Function to calculate streak data
  const calculateStreakData = (sessions: any[]) => {
    if (!sessions.length) {
      return {
        currentStreak: 0,
        longestStreak: 0
      };
    }
    
    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.startTime || a.createdAt).getTime() - new Date(b.startTime || b.createdAt).getTime()
    );
    
    // Get unique dates
    const uniqueDates = new Set<string>();
    sortedSessions.forEach(session => {
      const date = new Date(session.startTime || session.createdAt).toISOString().split('T')[0];
      uniqueDates.add(date);
    });
    
    // Convert to array and sort
    const dates = Array.from(uniqueDates).sort();
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i-1]);
      prevDate.setDate(prevDate.getDate() + 1);
      const expectedDate = prevDate.toISOString().split('T')[0];
      
      if (dates[i] === expectedDate) {
        tempStreak++;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    
    // Check one more time after the loop ends
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    
    return {
      currentStreak: 0, // Not using current streak
      longestStreak
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');
      const dashboardData = await dashboardService.getDashboardData();
      console.log('Dashboard data received:', dashboardData);
      
      // Transform recent workouts to flatten workoutPlan properties onto the workout object
      setRecentWorkouts(dashboardData.recentWorkouts?.map(workout => {
        if (workout.workoutPlan) {
          return {
            ...workout,
            // Flatten workoutPlan properties
            name: workout.workoutPlan.name,
            description: workout.workoutPlan.description,
            difficulty: workout.workoutPlan.difficulty,
            estimatedDuration: workout.workoutPlan.estimatedDuration,
            imageUrl: workout.workoutPlan.imageUrl,
            estimatedCaloriesBurn: workout.workoutPlan.estimatedCaloriesBurn,
            exerciseCount: workout.workoutPlan.exercises?.length || 0,
            exercises: workout.workoutPlan.exercises || [],
            rating: workout.workoutPlan.rating || 0,
            ratingCount: workout.workoutPlan.ratingCount || 0,
            isFavorite: workout.workoutPlan.isFavorite || false,
            workoutCategory: workout.workoutPlan.workoutCategory,
            id: workout.workoutPlan.id // Ensure ID is properly passed
          };
        }
        return workout;
      }) || []);
      setRecommendedWorkouts(dashboardData.recommendedWorkouts || []);
      setAchievements(dashboardData.achievements || []);
      setGoals(dashboardData.goals || []);
      setMetrics(dashboardData.metrics || []);
      setNotifications(dashboardData.notifications || []);
      setWeeklyActivity(dashboardData.weeklyActivity || Array(7).fill(0));
      
      // Fetch favorite workouts
      await fetchFavoriteWorkouts();
      
      // Fetch all sessions for comprehensive stats
      await fetchAllSessions();
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
      enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to prepare chart data for weekly activity - can be removed since we're removing the chart
  const prepareWeeklyActivityData = () => {
    const today = new Date().getDay();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Reorder days to start with today
    const orderedDays = [...days.slice(today), ...days.slice(0, today)];
    
    // Make a copy of weeklyActivity to avoid modifying the original
    const activityData = [...weeklyActivity];
    
    // Reorder data to match the days, starting with today
    const orderedData = [...activityData.slice(today), ...activityData.slice(0, today)];
    
    // Define colors with better contrast
    const colors = [
      '#4361ee', // Today (primary)
      '#3a86ff',
      '#4895ef', 
      '#4cc9f0',
      '#38b6ff',
      '#5e60ce',
      '#7400b8',
    ];
    
    // Map the data to ChartDataPoint format
    return orderedDays.map((day, index) => ({
      label: day,
      value: orderedData[index],
      color: orderedData[index] > 0 ? colors[index] : `${colors[index]}90` // Lighter color for zero values
    }));
  };

  // Function to prepare workout type data for pie chart - can be removed since we're removing the chart
  const prepareWorkoutTypeData = () => {
    // Example workout type distribution - in a real app, this would come from the backend
    return [
      { label: 'Strength', value: 45 },
      { label: 'Cardio', value: 30 },
      { label: 'Flexibility', value: 15 },
      { label: 'Balance', value: 10 }
    ];
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (workoutId: string | number, isFavorite: boolean) => {
    try {
      // Call API
      const success = await userService.toggleFavoriteWorkout(workoutId, isFavorite);
      
      if (success) {
        // If successfully toggled, refresh the favorite workouts
        await fetchFavoriteWorkouts();
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    }
  };

  return (
    <ErrorBoundary>
      <PageContainer maxWidth="1600px" noPadding>
        <DashboardHeroContainer>
          <HeaderRow sx={{ 
            mb: 4, 
            pt: { xs: 4, sm: 5, md: 6 }, 
            px: { xs: 1, sm: 2, md: 3 },
            position: 'relative',
            zIndex: 1 
          }}>
          <Box>
              <PageTitle 
                sx={{ 
              fontSize: { xs: '1.75rem', md: '2.25rem' },
                  mb: 1,
                  color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.dark,
                  fontWeight: 800,
                  textShadow: theme.palette.mode === 'dark' 
                    ? '0 2px 10px rgba(0,0,0,0.5)'
                    : '0 2px 10px rgba(0,0,0,0.2)',
                  position: 'relative',
                  display: 'inline-block',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: '60%',
                    height: '3px',
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.7)'
                      : alpha(theme.palette.primary.main, 0.7),
                    borderRadius: '3px',
                  }
                }}
              >
              Welcome back, {user?.firstName || 'User'}!
            </PageTitle>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, mt: { xs: 1, md: 0 } }}>
              <IconButton
              onClick={() => fetchDashboardData()}
                size="small"
                sx={{ 
                  color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : alpha(theme.palette.primary.main, 0.1),
                  backdropFilter: 'blur(8px)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.3)'
                      : alpha(theme.palette.primary.main, 0.2),
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                }}
            >
                <RefreshIcon fontSize="small" />
              </IconButton>
          </Box>
        </HeaderRow>

        <Tabs
          defaultTab="overview"
          onChange={setActiveSection}
          variant="pills"
            sx={{ mb: 4, position: 'relative', zIndex: 1 }}
        >
          <TabList>
            <Tab id="overview" icon={<DashboardIcon />}>Overview</Tab>
            <Tab id="workouts" icon={<WorkoutsIcon />}>Workouts</Tab>
            <Tab id="achievements" icon={<AchievementsIcon />}>Achievements</Tab>
          </TabList>

          {loading ? (
            <LoadingState height={300} />
          ) : error ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: (theme) => alpha(theme.palette.error.light, 0.1),
                border: (theme) => `1px solid ${theme.palette.error.light}`,
                borderRadius: 2,
              }}
            >
              <BodyText color="error">
                {error}
              </BodyText>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 2 }}
                onClick={fetchDashboardData}
              >
                Try Again
              </Button>
            </Paper>
          ) : (
            <>
              <TabPanel id="overview">
                <Box sx={{ mb: 2 }}>
                  <SectionTitle>Overall Statistics</SectionTitle>
                </Box>
                
                {/* Stats Cards */}
                  <Grid container spacing={3.5} sx={{ mb: 5 }}>
                  <Grid item xs={6} md={3}>
                    <StatCard>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                        <StatIcon color="primary">
                          <FitnessCenterIcon />
                        </StatIcon>
                        <StatContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatValue>
                            {stats.totalWorkouts}
                          </StatValue>
                            </Box>
                          <StatLabel>
                            Total Workouts
                          </StatLabel>
                        </StatContent>
                      </CardContent>
                    </StatCard>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <StatCard>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                        <StatIcon color="secondary">
                          <TimerIcon />
                        </StatIcon>
                        <StatContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatValue>
                            {Math.floor(stats.totalDuration / 60)} hrs
                          </StatValue>
                            </Box>
                          <StatLabel>
                            Total Time
                          </StatLabel>
                        </StatContent>
                      </CardContent>
                    </StatCard>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <StatCard>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                        <StatIcon color="error">
                          <FireIcon />
                        </StatIcon>
                        <StatContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatValue>
                            {stats.totalCaloriesBurned}
                          </StatValue>
                            </Box>
                          <StatLabel>
                            Calories Burned
                          </StatLabel>
                        </StatContent>
                      </CardContent>
                    </StatCard>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <StatCard>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                        <StatIcon color="success">
                          <TrophyIcon />
                        </StatIcon>
                        <StatContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatValue>
                            {achievementsLoading ? (
                              <Box component="span" sx={{ 
                                display: 'inline-block', 
                                width: '1em',
                                height: '1em',
                                    animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                              }}>...</Box>
                            ) : (
                              achievementCount
                            )}
                          </StatValue>
                            </Box>
                          <StatLabel>
                            Achievements
                          </StatLabel>
                        </StatContent>
                      </CardContent>
                    </StatCard>
                  </Grid>
                </Grid>

                {/* Second row of stats */}
                  <Grid container spacing={3.5} sx={{ mb: 5 }}>
                  <Grid item xs={6} md={3}>
                    <StatCard>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                        <StatIcon color="info">
                          <FitnessCenterIcon />
                        </StatIcon>
                        <StatContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatValue>
                            {stats.totalExercises || 0}
                          </StatValue>
                            </Box>
                          <StatLabel>
                            Total Exercises
                          </StatLabel>
                        </StatContent>
                      </CardContent>
                    </StatCard>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <StatCard>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                        <StatIcon color="warning">
                          <TimerIcon />
                        </StatIcon>
                        <StatContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatValue>
                            {stats.averageDuration || 0} min
                          </StatValue>
                            </Box>
                          <StatLabel>
                            Avg. Duration
                          </StatLabel>
                        </StatContent>
                      </CardContent>
                    </StatCard>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <StatCard>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                        <StatIcon color="secondary">
                          <FireIcon />
                        </StatIcon>
                        <StatContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatValue>
                            {stats.averageCaloriesBurned || 0}
                          </StatValue>
                            </Box>
                          <StatLabel>
                            Avg. Calories
                          </StatLabel>
                        </StatContent>
                      </CardContent>
                    </StatCard>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <StatCard>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                        <StatIcon color="warning">
                          <TrophyIcon />
                        </StatIcon>
                        <StatContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatValue>
                            {stats.longestStreak || 0}
                          </StatValue>
                            </Box>
                          <StatLabel>
                            Longest Streak
                          </StatLabel>
                        </StatContent>
                      </CardContent>
                    </StatCard>
                  </Grid>
                </Grid>

                {/* Recent workouts */}
                <Box sx={{ mb: 2 }}>
                  <SectionHeader>
                    <SectionTitle>Recent Workouts</SectionTitle>
                    <Button
                      variant="outlined"
                      startIcon={<HistoryIcon />} 
                      onClick={() => navigate('/workouts/history')}
                    >
                      View All
                    </Button>
                  </SectionHeader>
                  <Grid container spacing={3}>
                    {recentWorkouts.length > 0 ? (
                      recentWorkouts.slice(0, 3).map((workout) => (
                        <Grid item xs={12} sm={6} md={4} key={workout.id}>
                          <WorkoutCard 
                            workout={workout} 
                            onFavoriteToggle={handleFavoriteToggle}
                            onStartWorkout={(id) => navigate(`/sessions?workoutId=${id}`)}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Card variant="outlined" radius="medium">
                          <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <BodyText color="text.secondary" gutterBottom>
                              No recent workouts found. Start your fitness journey today!
                            </BodyText>
                            <Button 
                              variant="contained" 
                              sx={{ mt: 2 }}
                              onClick={() => navigate('/workouts')}
                            >
                              Browse Workouts
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </TabPanel>
              
              <TabPanel id="workouts">
                {/* Favorite Workouts tab content */}
                <Box>
                  <SectionTitle>Favorite Workouts</SectionTitle>
                  <Grid container spacing={3}>
                    {favoriteWorkouts.length > 0 ? (
                      favoriteWorkouts.slice(0, 6).map((workout) => (
                        <Grid item xs={12} sm={6} md={4} key={workout.id}>
                          <WorkoutCard workout={{...workout, isFavorite: true}} onFavoriteToggle={handleFavoriteToggle} />
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <BodyText color="text.secondary" gutterBottom>
                              No favorite workouts found. Browse workouts and add some to your favorites.
                            </BodyText>
                            <Button 
                              variant="contained" 
                              sx={{ mt: 2 }}
                              onClick={() => navigate('/workout-plans')}
                            >
                              Browse Workouts
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </TabPanel>
              
              <TabPanel id="achievements">
                <AchievementList 
                  compact={false} 
                  showHeader={true}
                  maxItems={6}
                  showViewAllButton={true}
                />
              </TabPanel>
            </>
          )}
        </Tabs>
        </DashboardHeroContainer>
      </PageContainer>
    </ErrorBoundary>
  );
};

export default Dashboard; 