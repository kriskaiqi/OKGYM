import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutDifficulty, WorkoutCategory } from '../../types/workout';
import { workoutService } from '../../services';
import { 
  Typography,
  Box,
  Paper,
  Grid,
  Card, 
  CardContent,
  CardHeader,
  Chip,
  Button,
  CircularProgress,
  Table, 
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  styled,
  useTheme,
  alpha,
  Skeleton,
  Stack
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  AccessTime as ClockIcon,
  DirectionsRun as RunningIcon,
  LocalFireDepartment as FireIcon,
  FitnessCenter as DumbbellIcon,
  FitnessCenter as WorkoutIcon,
  Flag as FlagIcon,
  BarChart as ChartIcon,
  FilterList as FilterIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { format } from 'date-fns';

dayjs.extend(relativeTime);

// Define DateRange type
type DateRange<T> = [T | null, T | null];

// Styled components
const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
}));

const StatsCardContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const StatsIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
}));

interface PerformanceChipProps {
  performance: string;
  theme?: any;
}

const PerformanceChip = styled(Chip)<PerformanceChipProps>(({ theme, performance }) => {
  const getColor = () => {
    switch (performance) {
      case 'Low':
        return theme.palette.warning.main;
      case 'Medium':
        return theme.palette.success.main;
      case 'High':
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return {
    backgroundColor: alpha(getColor(), 0.1),
    color: getColor(),
    fontWeight: 600,
    '& .MuiChip-label': {
      padding: theme.spacing(0.5, 1.5),
    },
  };
});

const HistoryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.default, 0.6),
}));

// Define the workout history item interface
interface WorkoutHistoryItem {
  id: number;
  workoutPlanId: number;
  workoutPlan: WorkoutPlan;
  dateCompleted: Date;
  duration: number;
  caloriesBurned: number;
  performance: 'Low' | 'Medium' | 'High';
  notes?: string;
}

interface WorkoutHistoryProps {
  userId?: string; // If not provided, will use the current user
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ userId }) => {
  const theme = useTheme();
  const [historyItems, setHistoryItems] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange<dayjs.Dayjs>>([null, null]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    totalCaloriesBurned: 0,
    averagePerformance: 'Medium'
  });
  
  useEffect(() => {
    fetchWorkoutHistory();
  }, [userId, dateRange]);
  
  const fetchWorkoutHistory = async () => {
    try {
      setLoading(true);
      
      // Call the service to get workout history
      // In a real implementation, this would be:
      // const response = await workoutService.getWorkoutHistory(userId, dateRange);
      
      // For now, we'll use mock data
      const mockHistoryItems: WorkoutHistoryItem[] = [
        {
          id: 1,
          workoutPlanId: 1,
          workoutPlan: {
            id: 1,
            name: 'Full Body Workout',
            description: 'A complete full body workout for intermediate users',
            difficulty: WorkoutDifficulty.INTERMEDIATE,
            estimatedDuration: 45,
            isCustom: false,
            rating: 4.5,
            ratingCount: 120,
            popularity: 98,
            workoutCategory: WorkoutCategory.STRENGTH,
            estimatedCaloriesBurn: 350,
            exercises: [],
            createdAt: new Date('2023-06-10'),
            updatedAt: new Date('2023-06-10')
          },
          dateCompleted: new Date('2023-07-15T10:30:00'),
          duration: 47,
          caloriesBurned: 380,
          performance: 'High',
          notes: 'Felt great, increased weights on bench press.'
        },
        {
          id: 2,
          workoutPlanId: 2,
          workoutPlan: {
            id: 2,
            name: 'HIIT Cardio',
            description: 'High intensity interval training for maximum calorie burn',
            difficulty: WorkoutDifficulty.ADVANCED,
            estimatedDuration: 30,
            isCustom: false,
            rating: 4.8,
            ratingCount: 85,
            popularity: 90,
            workoutCategory: WorkoutCategory.CARDIO,
            estimatedCaloriesBurn: 400,
            exercises: [],
            createdAt: new Date('2023-06-15'),
            updatedAt: new Date('2023-06-15')
          },
          dateCompleted: new Date('2023-07-17T18:15:00'),
          duration: 28,
          caloriesBurned: 385,
          performance: 'Medium',
          notes: 'Was a bit tired today, struggled with the last circuit.'
        }
      ];
      
      setHistoryItems(mockHistoryItems);
      
      // Calculate stats
      calculateStats(mockHistoryItems);
      
    } catch (error) {
      console.error('Error fetching workout history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStats = (items: WorkoutHistoryItem[]) => {
    if (items.length === 0) {
      setStats({
        totalWorkouts: 0,
        totalDuration: 0,
        totalCaloriesBurned: 0,
        averagePerformance: 'Medium'
      });
      return;
    }
    
    const totalWorkouts = items.length;
    const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);
    const totalCaloriesBurned = items.reduce((sum, item) => sum + item.caloriesBurned, 0);
    
    // Calculate average performance
    const performanceValues = {
      'Low': 1,
      'Medium': 2,
      'High': 3
    };
    
    const averagePerformanceValue = items.reduce((sum, item) => 
      sum + performanceValues[item.performance], 0) / totalWorkouts;
    
    let averagePerformance = 'Medium';
    if (averagePerformanceValue <= 1.5) averagePerformance = 'Low';
    else if (averagePerformanceValue >= 2.5) averagePerformance = 'High';
    
    setStats({
      totalWorkouts,
      totalDuration,
      totalCaloriesBurned,
      averagePerformance
    });
  };
  
  const handleDateRangeChange = (newDateRange: DateRange<dayjs.Dayjs>) => {
    setDateRange(newDateRange);
  };

  const handleClearFilters = () => {
    setDateRange([null, null]);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const getPerformanceChip = (performance: 'Low' | 'Medium' | 'High') => {
    return (
      <PerformanceChip 
        label={performance} 
        size="small" 
        performance={performance}
      />
    );
  };

  const renderStatsCards = () => {
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <StatsCardContent>
              <StatsIcon sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TrophyIcon color="primary" fontSize="large" />
              </StatsIcon>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalWorkouts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Workouts
              </Typography>
            </StatsCardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <StatsCardContent>
              <StatsIcon sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                <ClockIcon sx={{ color: theme.palette.warning.main }} fontSize="large" />
              </StatsIcon>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalDuration}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Minutes
              </Typography>
            </StatsCardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <StatsCardContent>
              <StatsIcon sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                <FireIcon sx={{ color: theme.palette.error.main }} fontSize="large" />
              </StatsIcon>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalCaloriesBurned}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calories Burned
              </Typography>
            </StatsCardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <StatsCardContent>
              <StatsIcon sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                <ChartIcon sx={{ color: theme.palette.success.main }} fontSize="large" />
              </StatsIcon>
              <Typography variant="h4" fontWeight={700}>
                {stats.averagePerformance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Performance
              </Typography>
            </StatsCardContent>
          </StatsCard>
        </Grid>
      </Grid>
    );
  };

  const renderFilterSection = () => {
  return (
      <FilterContainer>
        <Typography variant="subtitle1" fontWeight={600}>
          Filter by date:
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            value={dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : ''}
            onChange={(e) => {
              const newDate = dayjs(e.target.value);
              setDateRange([newDate, dateRange[1]]);
            }}
          />
          <TextField
            type="date"
            value={dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : ''}
            onChange={(e) => {
              const newDate = dayjs(e.target.value);
              setDateRange([dateRange[0], newDate]);
            }}
          />
        </Stack>
            <Button 
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleClearFilters}
          disabled={!dateRange[0] && !dateRange[1]}
            >
              Clear Filters
            </Button>
      </FilterContainer>
    );
  };
  
  return (
    <HistoryPaper elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CalendarIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
        <Typography variant="h5" component="h2" fontWeight={700}>
          Workout History
        </Typography>
      </Box>
      
      {renderStatsCards()}
      
      {renderFilterSection()}
        
        {loading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
        ) : historyItems.length > 0 ? (
        <TableContainer>
          <Table aria-label="workout history table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Workout Plan</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Calories</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyItems
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{dayjs(item.dateCompleted).format('MMM D, YYYY h:mm A')}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkoutIcon sx={{ mr: 1, color: 'primary.main', opacity: 0.7 }} />
                        {item.workoutPlan.name}
                      </Box>
                    </TableCell>
                    <TableCell>{item.duration} min</TableCell>
                    <TableCell>{item.caloriesBurned} kcal</TableCell>
                    <TableCell>{getPerformanceChip(item.performance)}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={historyItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <Box sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: alpha(theme.palette.background.default, 0.5),
          borderRadius: theme.shape.borderRadius * 1.5,
          border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
        }}>
          <WorkoutIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No workout history found
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Start a workout session to track your fitness journey
          </Typography>
        </Box>
      )}
    </HistoryPaper>
  );
};

export default WorkoutHistory; 