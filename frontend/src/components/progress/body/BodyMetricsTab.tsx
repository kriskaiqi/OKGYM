import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  LinearProgress,
  useTheme,
  styled,
  alpha
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TimeRange, progressService } from '../../../services/progressService';

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

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.success.main,
    borderRadius: 5,
  }
}));

interface BodyMetricsTabProps {
  timeRange: TimeRange;
}

const BodyMetricsTab: React.FC<BodyMetricsTabProps> = ({ timeRange }) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    weightData: [],
    startingWeight: 0,
    currentWeight: 0,
    weightUnit: 'kg',
    weightLossPercentage: 0
  });
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await progressService.getBodyMetricsData(timeRange);
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching body metrics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Convert measurement system to display unit
  const getDisplayUnit = (unit: string) => {
    if (!unit) return 'kg';
    return unit.toUpperCase() === 'METRIC' ? 'kg' : 'lbs';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  // Format data for weight chart
  const weightChartData = metrics.weightData.map((item: any) => ({
    date: new Date(item.date).toISOString().split('T')[0],
    weight: item.weight
  }));

  // Empty state message component for when no data is available
  const EmptyStateMessage = () => (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      py={6}
    >
      <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
        No body metrics data available for this time period
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        Record weight and body measurements to see your progress here
      </Typography>
    </Box>
  );

  // Check if we have any meaningful data to display
  const hasNoData = 
    metrics.currentWeight === 0 && 
    metrics.startingWeight === 0 && 
    weightChartData.length === 0;

  if (hasNoData) {
    return <EmptyStateMessage />;
  }

  // Get the display unit (kg or lbs)
  const displayUnit = getDisplayUnit(metrics.weightUnit);

  const chartConfig = {
    grid: <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />,
    axisColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    tooltipStyle: {
      backgroundColor: isDarkMode ? '#333' : '#fff',
      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Weight Stats */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Current Weight</StatsLabel>
              <StatsValue>
                {metrics.currentWeight} {displayUnit}
              </StatsValue>
              {metrics.startingWeight > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Starting weight: {metrics.startingWeight} {displayUnit}
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
        
        {/* Weight Loss Progress */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Weight Loss Progress</StatsLabel>
              {metrics.startingWeight > 0 && metrics.currentWeight > 0 ? (
                <>
                  <StatsValue>
                    {metrics.weightLossPercentage.toFixed(1)}%
                  </StatsValue>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Box width="100%" mr={1}>
                      <StyledLinearProgress 
                        variant="determinate" 
                        value={Math.min(metrics.weightLossPercentage, 100)}
                      />
                    </Box>
                    <Box minWidth={45}>
                      <Typography variant="body2" color="text.secondary">
                        5% Goal
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No weight loss data available
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Weight History Chart */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <StatsLabel>Weight History</StatsLabel>
              {weightChartData.length > 0 ? (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightChartData}>
                      {chartConfig.grid}
                      <XAxis 
                        dataKey="date" 
                        stroke={chartConfig.axisColor} 
                        tick={{ fill: chartConfig.axisColor }}
                      />
                      <YAxis 
                        domain={['dataMin - 5', 'dataMax + 5']} 
                        stroke={chartConfig.axisColor} 
                        tick={{ fill: chartConfig.axisColor }}
                      />
                      <Tooltip 
                        contentStyle={chartConfig.tooltipStyle}
                        cursor={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={{ r: 3, fill: theme.palette.primary.main }}
                        activeDot={{ r: 5, fill: theme.palette.primary.main }}
                        name={`Weight (${displayUnit})`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No weight history data available for this time period
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BodyMetricsTab; 