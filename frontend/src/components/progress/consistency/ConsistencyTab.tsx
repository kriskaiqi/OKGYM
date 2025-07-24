import React, { useEffect, useState } from 'react';
import { Grid, Box, CardContent, Typography, CircularProgress, Tooltip as MuiTooltip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { progressService, TimeRange } from '../../../services/progressService';

// Styled components
const StyledCard = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StatsLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

const StatsValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: '-0.5px',
  color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
}));

// Define the activity data type
interface ActivityData {
  day: string;
  value: number;
  data: {
    workoutNames: string[];
  };
}

interface ConsistencyTabProps {
  timeRange?: TimeRange;
}

// Colors for charts
const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', 
  '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
];

// Calendar Cell component
interface CalendarCellProps {
  date: string;
  count: number;
  workoutNames: string[];
}

const CalendarCell: React.FC<CalendarCellProps> = ({ date, count, workoutNames }) => {
  const theme = useTheme();
  
  // Calculate color intensity based on count
  let intensity = count === 0 ? 0 : 0.3 + Math.min(count * 0.15, 0.7);
  
  return (
    <MuiTooltip 
      title={
        <div>
          <div><strong>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong></div>
          <div>{count} workout{count !== 1 ? 's' : ''}</div>
          {workoutNames.length > 0 && <div style={{ marginTop: '4px' }}>Workouts:</div>}
          {workoutNames.map((name, i) => <div key={i}>• {name}</div>)}
        </div>
      }
    >
      <Box
        sx={{
          width: 18,
          height: 18,
          m: '2px',
          bgcolor: count ? alpha(theme.palette.primary.main, intensity) : alpha(theme.palette.divider, 0.2),
          borderRadius: '2px',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.3)',
            zIndex: 1
          }
        }}
      />
    </MuiTooltip>
  );
};

const ConsistencyTab: React.FC<ConsistencyTabProps> = ({ timeRange = 'monthly' }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageWorkoutsPerWeek: 0,
    currentStreak: 0,
    longestStreak: 0,
    mostActiveDay: 'Monday',
    mostActiveTime: 'Evening (5-9 PM)',
  });
  const [weekdayData, setWeekdayData] = useState<any[]>([]);
  const [timeOfDayData, setTimeOfDayData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch consistency data
        const data = await progressService.getConsistencyData(timeRange);
        
        // Calculate average workouts per week
        const totalWorkouts = data.totalWorkouts || 0;
        const averageWorkoutsPerWeek = totalWorkouts > 0 
          ? (totalWorkouts / (timeRange === 'weekly' ? 1 : timeRange === 'monthly' ? 4 : 52)).toFixed(1) 
          : '0';
        
        // Get most active day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const maxIndex = data.workoutsByWeekday.indexOf(Math.max(...data.workoutsByWeekday));
        const mostActiveDay = days[maxIndex];
        
        // Format weekday data for chart
        const weekdayChartData = days.map((day, index) => ({
          name: day.substring(0, 3),
          count: data.workoutsByWeekday[index]
        }));
        setWeekdayData(weekdayChartData);
        
        // Format time of day data for chart
        const timeData = [
          { name: 'Morning', value: data.timeOfDayData.morning },
          { name: 'Afternoon', value: data.timeOfDayData.afternoon },
          { name: 'Evening', value: data.timeOfDayData.evening },
          { name: 'Night', value: data.timeOfDayData.night }
        ];
        setTimeOfDayData(timeData);
        
        // Get most active time
        const timeDistribution = data.timeOfDayData;
        const mostActiveTime = 
          timeDistribution.morning > timeDistribution.afternoon && 
          timeDistribution.morning > timeDistribution.evening && 
          timeDistribution.morning > timeDistribution.night
            ? 'Morning (5-12 AM)'
            : timeDistribution.afternoon > timeDistribution.evening && 
              timeDistribution.afternoon > timeDistribution.night
              ? 'Afternoon (12-5 PM)'
              : timeDistribution.evening > timeDistribution.night
                ? 'Evening (5-9 PM)'
                : 'Night (9 PM-5 AM)';
        
        // Update stats
        setStats({
          averageWorkoutsPerWeek: parseFloat(averageWorkoutsPerWeek),
          currentStreak: data.streakData.currentStreak,
          longestStreak: data.streakData.longestStreak,
          mostActiveDay,
          mostActiveTime
        });
        
        // Update activity data
        setActivityData(data.activityData);
      } catch (error) {
        console.error('Error fetching consistency data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Function to render calendar grid
  const renderCalendar = () => {
    if (activityData.length === 0) {
      return (
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No workout data available for this time period
          </Typography>
        </Box>
      );
    }

    // Create a map of activity data for easy lookup
    const activityMap = activityData.reduce<Record<string, { count: number, workouts: string[] }>>(
      (acc, item) => {
        acc[item.day] = { 
          count: item.value,
          workouts: item.data.workoutNames 
        };
        return acc;
      },
      {}
    );
    
    // Determine date range based on time range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
    }
    
    // Group the days by month
    const monthsData: Record<string, JSX.Element[]> = {};
    
    // Current date for iteration
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const dateString = currentDate.toISOString().split('T')[0];
      const monthKey = currentDate.toISOString().substring(0, 7); // YYYY-MM format
      const activity = activityMap[dateString] || { count: 0, workouts: [] };
      
      if (!monthsData[monthKey]) {
        monthsData[monthKey] = [];
      }
      
      monthsData[monthKey].push(
        <CalendarCell 
          key={dateString}
          date={dateString}
          count={activity.count}
          workoutNames={activity.workouts}
        />
      );
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return (
      <Box
        sx={{
          overflowY: 'auto',
          maxHeight: 160,
          px: 1
        }}
      >
        {Object.entries(monthsData).map(([month, cells]) => {
          const date = new Date(month + '-01');
          const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          
          return (
            <Box key={month} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {monthName}
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  maxWidth: '100%',
                }}
              >
                {cells}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Chart configuration
  const chartConfig = {
    grid: <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />,
    axisColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    tooltipStyle: {
      backgroundColor: isDarkMode ? '#333' : '#fff',
      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  // Generate frequency data for trend chart
  const frequencyData = activityData.map(item => ({
    date: item.day,
    count: item.value
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by week for weekly average chart
  const weeklyAverages: any[] = [];
  if (frequencyData.length > 0) {
    let currentWeekStart = new Date(frequencyData[0].date);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Start of week (Sunday)
    
    let currentSum = 0;
    let currentCount = 0;
    let weekNumber = 1;
    
    frequencyData.forEach(item => {
      const itemDate = new Date(item.date);
      const itemWeekStart = new Date(itemDate);
      itemWeekStart.setDate(itemDate.getDate() - itemDate.getDay());
      
      if (itemWeekStart.getTime() > currentWeekStart.getTime()) {
        if (currentCount > 0) {
          weeklyAverages.push({
            name: `Week ${weekNumber}`,
            average: currentSum / currentCount
          });
          weekNumber++;
        }
        currentWeekStart = itemWeekStart;
        currentSum = item.count;
        currentCount = 1;
      } else {
        currentSum += item.count;
        currentCount++;
      }
    });
    
    // Add the last week
    if (currentCount > 0) {
      weeklyAverages.push({
        name: `Week ${weekNumber}`,
        average: currentSum / currentCount
      });
    }
  }

  return (
    <Grid container spacing={3}>
      {/* Workout Consistency Section */}
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <StatsLabel variant="h6">Workout Frequency</StatsLabel>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Average workouts per week: <strong>{stats.averageWorkoutsPerWeek}</strong>
            </Typography>
            <Box height={180}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAverages.slice(-6)}>
                  {chartConfig.grid}
                  <XAxis 
                    dataKey="name" 
                    stroke={chartConfig.axisColor} 
                    tick={{ fill: chartConfig.axisColor }}
                  />
                  <YAxis 
                    stroke={chartConfig.axisColor} 
                    tick={{ fill: chartConfig.axisColor }}
                  />
                  <Tooltip 
                    contentStyle={chartConfig.tooltipStyle}
                    formatter={(value) => [Number(value).toFixed(1), 'Avg Workouts']}
                  />
                  <Bar 
                    dataKey="average" 
                    fill={alpha(theme.palette.primary.main, 0.7)}
                    radius={[4, 4, 0, 0]}
                    name="Average Workouts"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Streak Stats Section */}
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <StatsLabel variant="h6">Streak Statistics</StatsLabel>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Current Streak</Typography>
                  <Typography variant="h4" color="primary">{stats.currentStreak} days</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Longest Streak</Typography>
                  <Typography variant="h4" color="primary">{stats.longestStreak} days</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Workout Streak Calendar - UPDATED */}
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatsLabel variant="h6">Workout Activity Calendar</StatsLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Less
                </Typography>
                {[0.3, 0.45, 0.6, 0.75, 1].map((intensity, i) => (
                  <Box 
                    key={i}
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      bgcolor: alpha(theme.palette.primary.main, intensity),
                      ml: 0.5,
                      borderRadius: '2px'
                    }}
                  />
                ))}
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  More
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              {renderCalendar()}
            </Box>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                Hover over a cell to see workout details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activityData.reduce((total, item) => total + item.value, 0)} total workouts
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Weekly Distribution Section */}
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <StatsLabel variant="h6">Weekly Distribution</StatsLabel>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Most active day: <strong>{stats.mostActiveDay}</strong>
            </Typography>
            <Box height={180}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData}>
                  {chartConfig.grid}
                  <XAxis 
                    dataKey="name" 
                    stroke={chartConfig.axisColor} 
                    tick={{ fill: chartConfig.axisColor }}
                  />
                  <YAxis 
                    stroke={chartConfig.axisColor} 
                    tick={{ fill: chartConfig.axisColor }}
                  />
                  <Tooltip 
                    contentStyle={chartConfig.tooltipStyle}
                    formatter={(value) => [`${value} workouts`, 'Count']}
                  />
                  <Bar 
                    dataKey="count" 
                    fill={alpha(theme.palette.primary.main, 0.7)}
                    radius={[4, 4, 0, 0]}
                    name="Workouts"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Time of Day Section */}
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <StatsLabel variant="h6">Time of Day</StatsLabel>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Most active time: <strong>{stats.mostActiveTime}</strong>
            </Typography>
            <Box height={180}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeOfDayData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                  >
                    {timeOfDayData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} workouts`, name]}
                    contentStyle={chartConfig.tooltipStyle} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default ConsistencyTab;
 