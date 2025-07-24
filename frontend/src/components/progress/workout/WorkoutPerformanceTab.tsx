import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  useTheme,
  styled,
  alpha,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  LineChart, 
  Line, 
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
  Legend
} from 'recharts';
import { TimeRange, progressService } from '../../../services/progressService';
import MonthlyActivityCalendar from './MonthlyActivityCalendar';
import SearchIcon from '@mui/icons-material/Search';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#ffffff',
  boxShadow: 'none',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  height: '100%',
}));

const StatsValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: '-0.5px',
  color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
}));

const StatsLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

// Type definitions
interface WorkoutPerformanceTabProps {
  timeRange: TimeRange;
}

interface VolumeDataPoint {
  date: string;
  volume: number;
}

interface FormScoreDataPoint {
  date: string;
  score: number;
}

interface WeekdayData {
  name: string;
  count: number;
}

interface MuscleGroupData {
  name: string;
  value: number;
}

interface WorkoutTypeData {
  name: string;
  count: number;
}

interface ExerciseFrequency {
  name: string;
  count: number;
  level?: string;
  id?: string;
}

interface StrengthProgressData {
  exerciseName: string;
  data: Array<{
    date: string;
    value: number;
  }>;
}

interface PerformanceData {
  volumeData: Array<{ x: string; y: number }>;
  formScoreData: Array<{ x: string; y: number }>;
  totalWorkouts: number;
  averageDuration: number;
  muscleGroupDistribution: Record<string, number>;
  workoutsByWeekday: number[];
  strengthProgress: StrengthProgressData[];
  workoutTypes: WorkoutTypeData[];
  mostFrequentExercises: ExerciseFrequency[];
  exerciseCount: number;
  exerciseCategories: WorkoutTypeData[];
  difficultyLevels: WorkoutTypeData[];
  actualExercises: ExerciseFrequency[];
  exerciseLevels: WorkoutTypeData[];
  completionRate: number;
}

// Weekday names for the workout distribution chart
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Colors for charts
const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', 
  '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
];

const WorkoutPerformanceTab: React.FC<WorkoutPerformanceTabProps> = ({ timeRange }) => {
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState<PerformanceData>({
    volumeData: [],
    formScoreData: [],
    totalWorkouts: 0,
    averageDuration: 0,
    muscleGroupDistribution: {},
    workoutsByWeekday: [0, 0, 0, 0, 0, 0, 0],
    strengthProgress: [],
    workoutTypes: [],
    mostFrequentExercises: [],
    exerciseCount: 0,
    exerciseCategories: [],
    difficultyLevels: [],
    actualExercises: [],
    exerciseLevels: [],
    completionRate: 0
  });
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [workoutDetails, setWorkoutDetails] = useState<Record<string, string[]>>({});
  const [searchResults, setSearchResults] = useState<ExerciseFrequency[]>([]);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await progressService.getWorkoutPerformanceData(timeRange);
        setPerformance(data as PerformanceData);
        
        // Debug exercise levels data
        console.log('Exercise Levels Data from API:', {
          raw: data.exerciseLevels,
          dataType: typeof data.exerciseLevels,
          isArray: Array.isArray(data.exerciseLevels),
          count: Array.isArray(data.exerciseLevels) ? data.exerciseLevels.length : 0,
          sample: Array.isArray(data.exerciseLevels) && data.exerciseLevels.length > 0 
            ? data.exerciseLevels[0] 
            : 'No data'
        });
        
        // Extract workout dates from volume data
        const dates = data.volumeData.map(item => item.x);
        setWorkoutDates(dates);
        
        // Create a mapping of dates to workout names using actual data
        const detailsMap: Record<string, string[]> = {};
        
        // Use the actual exercise names from most frequent exercises when available
        dates.forEach(date => {
          // Find any corresponding exercise data for this date
          const matchingExercises = data.mostFrequentExercises
            .filter(e => e && typeof e.name === 'string' && e.name.trim() !== '')
            .map(e => e.name);
            
          // Assign the actual exercises if available, otherwise leave empty
          if (matchingExercises.length > 0) {
            detailsMap[date] = matchingExercises.slice(0, 2); // Limit to 2 exercise names per day
          } else {
            detailsMap[date] = ['Workout']; // Default minimal label if no specific exercises
          }
        });
        
        setWorkoutDetails(detailsMap);
      } catch (error) {
        console.error('Error fetching workout performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  // Format data for volume chart
  const volumeChartData: VolumeDataPoint[] = performance.volumeData.map((item) => ({
    date: item.x,
    volume: item.y
  }));

  // Format data for form score chart
  const formScoreChartData: FormScoreDataPoint[] = performance.formScoreData.map((item) => ({
    date: item.x,
    score: item.y
  }));

  // Format data for workout frequency by weekday
  const workoutFrequencyData: WeekdayData[] = performance.workoutsByWeekday.map((count, index) => ({
    name: WEEKDAYS[index],
    count: count
  }));

  // Format data for muscle group distribution
  const muscleGroupData: MuscleGroupData[] = Object.entries(performance.muscleGroupDistribution)
    .map(([name, count]) => ({
      name: typeof name === 'string' 
        ? name.replace(/_/g, ' ').replace(/^[a-z]/, (c) => c.toUpperCase()) 
        : 'Unknown',
      value: count as number
    }))
    .sort((a, b) => b.value - a.value);

  // Format data for workout types
  const workoutTypesData: WorkoutTypeData[] = performance.workoutTypes
    .filter(type => type && typeof type.name === 'string' && typeof type.count === 'number')
    .map(type => ({
      name: type.name.replace(/_/g, ' ').charAt(0).toUpperCase() + type.name.replace(/_/g, ' ').slice(1).toLowerCase(),
      count: type.count
    }))
    .slice(0, 5);

  // Format new data for charts
  const exerciseCategoriesData = performance.exerciseCategories
    .filter(category => category && typeof category.name === 'string' && category.count > 0)
    .map(category => {
      // Format the category name properly
      let displayName = category.name.replace(/_/g, ' ');
      // Capitalize first letter of each word
      displayName = displayName
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        name: displayName,
        count: category.count
      };
    });

  const difficultyLevelsData = performance.difficultyLevels.map(level => ({
    name: level.name.charAt(0).toUpperCase() + level.name.slice(1).toLowerCase(),
    count: level.count
  }));

  const actualExercisesData = performance.actualExercises
    .filter(exercise => exercise && typeof exercise.name === 'string')
    .map(exercise => ({
      name: exercise.name,
      count: exercise.count,
      level: exercise.level
    }));

  // Format data for Exercise Levels chart
  const exerciseLevelsData = performance.exerciseLevels
    .filter(level => level && typeof level.name === 'string' && level.count > 0)
    .map(level => {
      // Normalize the name for display purposes
      let displayName = level.name;
      
      // Handle different name formats and standardize them
      if (typeof displayName === 'string') {
        // Convert to title case format for display
        displayName = displayName.toLowerCase()
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      // Store the original uppercase name for color mapping
      const originalName = typeof level.name === 'string' ? level.name.toUpperCase() : '';
      
      return {
        name: displayName,
        originalName,
        count: level.count
      };
    })
    .sort((a, b) => b.count - a.count); // Sort by count descending

  // Get color for exercise level
  const getExerciseLevelColor = (level: string): string => {
    const colorMap: Record<string, string> = {
      'Beginner': '#82ca9d',      // Green
      'beginner': '#82ca9d',      // Green
      'BEGINNER': '#82ca9d',      // Green
      'Intermediate': '#ffc658',  // Yellow
      'intermediate': '#ffc658',  // Yellow
      'INTERMEDIATE': '#ffc658',  // Yellow
      'Advanced': '#ff8042',      // Orange
      'advanced': '#ff8042',      // Orange
      'ADVANCED': '#ff8042',      // Orange
      'Expert': '#d53e4f',        // Red
      'expert': '#d53e4f',        // Red
      'EXPERT': '#d53e4f'         // Red
    };
    
    // Handle common capitalization variations
    const normalizedLevel = typeof level === 'string' ? level.trim() : String(level);
    
    return colorMap[normalizedLevel] || 
           (normalizedLevel.toLowerCase().includes('begin') ? '#82ca9d' : 
           normalizedLevel.toLowerCase().includes('inter') ? '#ffc658' :
           normalizedLevel.toLowerCase().includes('adva') ? '#ff8042' :
           normalizedLevel.toLowerCase().includes('expert') ? '#d53e4f' : '#8884d8');
  };

  // Function to get exercise level with fallback
  const getExerciseLevel = (exercise: any): string => {
    // If level is already available
    if (exercise.level) {
      // Convert to title case for display
      const normalizedLevel = exercise.level.toString().trim();
      const titleCaseLevel = normalizedLevel.charAt(0).toUpperCase() + 
                             normalizedLevel.slice(1).toLowerCase();
      
      // Handle different variations of level names
      if (titleCaseLevel.includes('Begin') || titleCaseLevel === 'Easy' || titleCaseLevel === 'Novice') {
        return 'Beginner';
      } else if (titleCaseLevel.includes('Inter') || titleCaseLevel === 'Moderate') {
        return 'Intermediate';
      } else if (titleCaseLevel.includes('Advanc') || titleCaseLevel === 'Hard') {
        return 'Advanced';
      } else if (titleCaseLevel.includes('Expert') || titleCaseLevel === 'Elite' || titleCaseLevel === 'Master') {
        return 'Expert';
      }
      
      return titleCaseLevel;
    }
    
    // Default fallback
    return 'Beginner';
  };

  // Empty state message component for when no data is available
  const EmptyStateMessage: React.FC = () => (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      py={6}
    >
      <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
        No workout data available for this time period
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        Complete workouts to see your performance metrics here
      </Typography>
    </Box>
  );

  // Check if we have any meaningful data to display
  const hasNoData: boolean = 
    performance.totalWorkouts === 0 && 
    volumeChartData.length === 0 && 
    formScoreChartData.length === 0;

  if (hasNoData) {
    return <EmptyStateMessage />;
  }

  const chartConfig = {
    grid: <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />,
    axisColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    tooltipStyle: {
      backgroundColor: isDarkMode ? '#333' : '#fff',
      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
    }
  };

  // Add a function to assign specific colors to exercise categories
  const getCategoryColor = (categoryName: string) => {
    const colorMap: Record<string, string> = {
      'Strength': '#8884d8',    // Purple
      'Cardio': '#82ca9d',      // Green
      'Flexibility': '#ffc658', // Yellow
      'Hiit': '#ff8042',        // Orange
      'Core': '#0088fe',        // Blue
      'Mobility': '#00C49F',    // Teal
      'Balance': '#FFBB28',     // Gold
    };
    
    return colorMap[categoryName] || CHART_COLORS[0]; // Fallback to first color if not found
  };

  const ExerciseLevelPieChart = ({ data }: { data: { name: string, originalName?: string, count: number }[] }) => {
    // Define colors for different levels with both uppercase and proper case versions
    const levelColors: Record<string, string> = {
      'BEGINNER': '#4CAF50',       // Green
      'Beginner': '#4CAF50',       // Green
      'INTERMEDIATE': '#2196F3',   // Blue
      'Intermediate': '#2196F3',   // Blue
      'ADVANCED': '#FFC107',       // Amber
      'Advanced': '#FFC107',       // Amber
      'EXPERT': '#F44336',         // Red
      'Expert': '#F44336'          // Red
    };

    // Format the data for the pie chart with improved color mapping
    const pieData = data.map(item => {
      // Try to match color by original name first, then display name, then fallback
      const colorKey = (item.originalName && levelColors[item.originalName]) ? 
        item.originalName : 
        (levelColors[item.name] ? item.name : '');
      
      return {
        name: item.name,
        value: item.count,
        fill: levelColors[colorKey] || '#9E9E9E' // Grey fallback if no matching color
      };
    });

    return (
      <Box sx={{ height: 300, marginTop: 2 }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              />
              <Tooltip formatter={(value) => [`${value} exercises`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', paddingTop: 10 }}>
            No exercise level data available
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Main Stats Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Total Workouts</StatsLabel>
              <StatsValue>{performance.totalWorkouts}</StatsValue>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Average Duration</StatsLabel>
              <StatsValue>{performance.averageDuration} min</StatsValue>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={6} lg={2}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Total Exercises</StatsLabel>
              <StatsValue>{performance.exerciseCount}</StatsValue>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={6} lg={2}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Avg. Exercises Per Workout</StatsLabel>
              <StatsValue>
                {performance.totalWorkouts ? 
                  Math.round(performance.exerciseCount / performance.totalWorkouts) : 0}
              </StatsValue>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={6} lg={2}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Completion Rate</StatsLabel>
              <StatsValue>{`${performance.completionRate}%`}</StatsValue>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Volume Progress Chart */}
        <Grid item xs={12} lg={8}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Volume Progress</StatsLabel>
              {volumeChartData.length > 0 ? (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeChartData}>
                      {chartConfig.grid}
                      <XAxis 
                        dataKey="date" 
                        stroke={chartConfig.axisColor} 
                        tick={{ fill: chartConfig.axisColor }}
                      />
                      <YAxis 
                        stroke={chartConfig.axisColor} 
                        tick={{ fill: chartConfig.axisColor }}
                      />
                      <Tooltip 
                        contentStyle={chartConfig.tooltipStyle}
                        cursor={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={{ r: 3, fill: theme.palette.primary.main }}
                        activeDot={{ r: 5, fill: theme.palette.primary.main }}
                        name="Total Volume (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No volume data available for this time period
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Workout Frequency by Weekday */}
        <Grid item xs={12} md={6} lg={4}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Workout Frequency by Day</StatsLabel>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workoutFrequencyData} layout="vertical">
                    {chartConfig.grid}
                    <XAxis 
                      type="number" 
                      stroke={chartConfig.axisColor} 
                      tick={{ fill: chartConfig.axisColor }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke={chartConfig.axisColor} 
                      tick={{ fill: chartConfig.axisColor }}
                    />
                    <Tooltip 
                      contentStyle={chartConfig.tooltipStyle}
                      cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill={alpha(theme.palette.primary.main, 0.7)}
                      radius={[0, 4, 4, 0]}
                      name="Workouts"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Form Score Chart */}
        <Grid item xs={12} md={6} lg={6}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Form Quality</StatsLabel>
              {formScoreChartData.length > 0 ? (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formScoreChartData}>
                      {chartConfig.grid}
                      <XAxis 
                        dataKey="date" 
                        stroke={chartConfig.axisColor} 
                        tick={{ fill: chartConfig.axisColor }}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        stroke={chartConfig.axisColor} 
                        tick={{ fill: chartConfig.axisColor }}
                      />
                      <Tooltip 
                        contentStyle={chartConfig.tooltipStyle}
                        cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar 
                        dataKey="score" 
                        fill={alpha(theme.palette.success.main, 0.7)}
                        radius={[4, 4, 0, 0]}
                        name="Form Score (0-10)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No form score data available for this time period
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Workout Types */}
        <Grid item xs={12} md={6} lg={6}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Workout Types</StatsLabel>
              {workoutTypesData.length > 0 ? (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={workoutTypesData} 
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      {chartConfig.grid}
                      <XAxis 
                        type="number" 
                        stroke={chartConfig.axisColor} 
                        tick={{ fill: chartConfig.axisColor }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke={chartConfig.axisColor} 
                        tick={{ fill: chartConfig.axisColor }}
                        width={120}
                        tickFormatter={(value: string) => {
                          if (typeof value !== 'string') {
                            return 'Unknown';
                          }
                          const cleaned = value.replace(/_/g, ' ');
                          return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} workouts`, 'Count']}
                        contentStyle={chartConfig.tooltipStyle} 
                      />
                      <Bar 
                        dataKey="count" 
                        name="Workouts" 
                        radius={[0, 4, 4, 0]}
                      >
                        {workoutTypesData.map((entry: WorkoutTypeData, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No workout type data available
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Exercise Categories */}
        <Grid item xs={12} md={6} lg={6}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Exercise Categories</StatsLabel>
              {exerciseCategoriesData.length > 0 ? (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={exerciseCategoriesData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => 
                          percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                        }
                      >
                        {exerciseCategoriesData.map((entry) => (
                          <Cell 
                            key={`cell-${entry.name}`} 
                            fill={getCategoryColor(entry.name)} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} exercises`, name]}
                        contentStyle={chartConfig.tooltipStyle} 
                      />
                      <Legend 
                        formatter={(value) => {
                          return <span style={{ color: isDarkMode ? '#ddd' : '#333' }}>{value}</span>;
                        }}
                        layout="horizontal"
                        verticalAlign="bottom" 
                        height={36} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No exercise category data available
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Workout Difficulty Levels */}
        <Grid item xs={12} md={6} lg={6}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Workout Difficulty Levels</StatsLabel>
              {difficultyLevelsData.length > 0 ? (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={difficultyLevelsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
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
                        formatter={(value) => [`${value} workouts`, 'Count']}
                        contentStyle={chartConfig.tooltipStyle} 
                      />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        name="Workouts" 
                        radius={[4, 4, 0, 0]}
                      >
                        {difficultyLevelsData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? '#82ca9d' : index === 1 ? '#ffc658' : '#ff8042'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No difficulty level data available
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Monthly Activity Calendar */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Monthly Workout Calendar</StatsLabel>
              {workoutDates.length > 0 ? (
                <MonthlyActivityCalendar 
                  workoutDates={workoutDates} 
                  workoutDetails={workoutDetails}
                />
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No workout data available for calendar display
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkoutPerformanceTab; 