import React from 'react';
import { styled } from '@mui/system';
import { useThemeContext } from '../../contexts/ThemeContext';

// Types
type ChartDataPoint = {
  label: string;
  value: number;
  color?: string;
};

type ChartType = 'bar' | 'line' | 'pie';

type ChartProps = {
  data: ChartDataPoint[];
  type: ChartType;
  title?: string;
  height?: number;
  width?: number | string;
  showLegend?: boolean;
  showValues?: boolean;
  showLabels?: boolean;
  className?: string;
  maxValue?: number;
  formatValue?: (value: number) => string;
  gradientFill?: boolean;
  animated?: boolean;
  barWidth?: number;
};

// Styled Components
const ChartContainer = styled('div')<{ chartWidth: number | string }>(({ theme, chartWidth }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: typeof chartWidth === 'number' ? `${chartWidth}px` : chartWidth,
  borderRadius: '12px',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(0,0,0,0.4)'
    : '0 4px 20px 0 rgba(0,0,0,0.05), 0 7px 10px -5px rgba(0,0,0,0.04)',
}));

const ChartTitle = styled('h3')(({ theme }) => ({
  margin: '0 0 20px',
  fontSize: '1.25rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  position: 'relative',
  paddingBottom: '12px',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '40px',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  }
}));

const ChartContent = styled('div', {
  shouldForwardProp: (prop) => prop !== 'chartHeight'
})<{ chartHeight: number }>(({ chartHeight }) => ({
  height: `${chartHeight}px`,
  display: 'flex',
  position: 'relative',
}));

const BarChartContent = styled(ChartContent)({
  position: 'relative',
  padding: '10px 5px 30px 5px',
});

const LineChartContent = styled(ChartContent)({
  position: 'relative',
});

const PieChartContent = styled(ChartContent)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const BarDebug = styled('div')<{ isDark: boolean }>(({ theme, isDark }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: '4px 8px',
  fontSize: '10px',
  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
  backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', 
  borderRadius: '0 0 0 4px',
  display: 'none',
  zIndex: 10,
}));

// Create a container for each bar that uses absolute positioning
const BarContainer = styled('div')<{ index: number, totalBars: number }>(({ index, totalBars }) => {
  const barWidth = 100 / (totalBars + 1); // Calculate width percentage with spacing
  const leftPosition = barWidth * (index + 0.5); // Center bars with spacing
  
  return {
    position: 'absolute',
    bottom: 30, // Space for labels
    left: `${leftPosition}%`,
    transform: 'translateX(-50%)', // Center the bar
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
    width: '100%',
    maxWidth: '60px',
  };
});

// Simplified bar that directly uses height in pixels instead of percentages
const Bar = styled('div')<{ 
  color: string; 
  heightPercentage: number;
  chartHeight: number;
  isDark: boolean;
  value: number;
}>(({ color, heightPercentage, chartHeight, isDark, value }) => {
  // Calculate height in pixels instead of percentage
  const maxBarHeight = chartHeight - 40; // Subtract space for labels and padding
  const heightInPixels = (heightPercentage / 100) * maxBarHeight;
  
  return {
    backgroundColor: color,
    width: '30px',
    height: `${Math.max(heightInPixels, value > 0 ? 4 : 0)}px`, // Ensure visible bars for non-zero values
    borderRadius: '8px 8px 0 0',
    background: value > 0 
      ? `linear-gradient(to top, ${color}, ${color}CC)`
      : `${color}99`,
    border: value === 0
      ? `2px dashed ${color}99`
      : 'none',
    boxShadow: isDark 
      ? `0 4px 12px rgba(0, 0, 0, 0.3), inset 0 -30px 30px -30px rgba(0, 0, 0, 0.3)`
      : `0 4px 12px rgba(0, 0, 0, 0.1), inset 0 -30px 30px -30px rgba(0, 0, 0, 0.1)`,
    '&:hover': {
      transform: 'translateY(-5px)',
      transition: 'transform 0.3s ease',
    },
  };
});

const BarLabel = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: '-28px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '80px',
  textAlign: 'center',
}));

const Legend = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '20px',
  justifyContent: 'center',
});

const LegendItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.8rem',
  fontWeight: 500,
});

const LegendColor = styled('div')<{ color: string }>(({ color }) => ({
  width: '14px',
  height: '14px',
  backgroundColor: color,
  borderRadius: '3px',
}));

const ChartValueLabel = styled('div')<{ 
  bgColor: string; 
  isDark: boolean;
  isEmpty: boolean;
}>(({ theme, bgColor, isDark, isEmpty }) => ({
  backgroundColor: isEmpty ? 'transparent' : bgColor,
  color: isEmpty ? theme.palette.text.secondary : '#fff',
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '0.8rem',
  position: 'absolute',
  transform: 'translateX(-50%)',
  top: isEmpty ? '-25px' : '-40px',
  left: '50%',
  zIndex: 2,
  whiteSpace: 'nowrap',
  boxShadow: isEmpty ? 'none' : '0 2px 4px rgba(0,0,0,0.15)',
  fontWeight: 600,
  border: isEmpty ? `1px dashed ${bgColor}99` : 'none',
}));

const ChartXAxis = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '2px',
  backgroundColor: theme.palette.divider,
}));

// Update the ChartYAxisGrid to add value indicators for better reference
const ChartYAxisGrid = styled('div')<{ count: number, isDark: boolean }>(({ theme, count, isDark }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  pointerEvents: 'none', // Don't interfere with user interactions
  '& > div': {
    position: 'relative',
    width: '100%',
    height: '1px',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)',
    '&::before': {
      content: 'attr(data-value)',
      position: 'absolute',
      left: -5,
      top: -10,
      fontSize: '0.7rem',
      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
    }
  },
}));

// Helper function to generate chart colors
const generateDefaultColors = (count: number, isDark: boolean): string[] => {
  const baseColors = isDark
    ? [
        '#3f51b5', '#f44336', '#4caf50', '#ff9800', '#9c27b0',
        '#2196f3', '#ff5722', '#009688', '#cddc39', '#673ab7'
      ]
    : [
        '#5c6bc0', '#ef5350', '#66bb6a', '#ffb74d', '#ab47bc',
        '#42a5f5', '#ff7043', '#26a69a', '#d4e157', '#7e57c2'
      ];
  
  // If we need more colors than we have in the base set, generate more
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Create additional colors by varying the existing ones
  const extendedColors = [...baseColors];
  
  while (extendedColors.length < count) {
    const index = extendedColors.length % baseColors.length;
    const baseColor = baseColors[index];
    
    // Slightly vary the base color
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Adjust brightness
    const factor = 0.8 + (extendedColors.length / baseColors.length) * 0.4;
    const newR = Math.min(255, Math.round(r * factor));
    const newG = Math.min(255, Math.round(g * factor));
    const newB = Math.min(255, Math.round(b * factor));
    
    const newColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    extendedColors.push(newColor);
  }
  
  return extendedColors.slice(0, count);
};

// Improve the findReasonableMaxValue function to better scale the axis
const findReasonableMaxValue = (values: number[]): number => {
  const maxValue = Math.max(...values, 0);
  
  // If all values are 0 or close to 0, return a small default
  if (maxValue <= 0) return 10;
  if (maxValue < 5) return 10;
  
  // For small values, provide appropriate scale
  if (maxValue < 50) return Math.ceil(maxValue * 1.2);
  
  // Round to a nice number based on magnitude
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const normalized = maxValue / magnitude;
  
  // Choose a nice round number slightly above max for better visual
  return Math.ceil(normalized) * magnitude;
};

// Fix the BarChart implementation to make bars touch the bottom
const BarChart: React.FC<{
  data: ChartDataPoint[];
  height: number;
  showValues: boolean;
  showLabels: boolean;
  maxValue?: number;
  formatValue?: (value: number) => string;
  animated: boolean;
  isDark: boolean;
  barWidth?: number;
}> = ({ data, height, showValues, showLabels, maxValue, formatValue, animated, isDark, barWidth = 36 }) => {
  // Create refs for each bar
  const barRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  
  // Find max value from data
  const dataMax = Math.max(...data.map(item => Math.abs(item.value)), 1);
  
  // Determine the effective max value
  const effectiveMaxValue = maxValue || Math.ceil(dataMax / 10) * 10;
  
  // Helper function to calculate percentages
  const calculatePercentage = (value: number): number => {
    if (value <= 0) return 0;
    return (value / effectiveMaxValue) * 100;
  };

  const formatValueDisplay = (value: number): string => {
    if (formatValue) {
      return formatValue(value);
    }
    return value.toString();
  };

  // Use effect to directly set the heights of the bars after render
  React.useEffect(() => {
    // Maximum available height for bars (subtract space for labels)
    const availableHeight = height - 40;
    
    // Set heights for each bar directly
    barRefs.current.forEach((barRef, index) => {
      if (barRef) {
        const value = data[index].value;
        const percentage = calculatePercentage(value);
        const barHeightInPixels = (percentage / 100) * availableHeight;
        
        // Set the height directly
        barRef.style.height = `${Math.max(barHeightInPixels, value > 0 ? 4 : 0)}px`;
        
        // Add data attributes for debugging
        barRef.dataset.value = value.toString();
        barRef.dataset.percentage = percentage.toFixed(1) + '%';
        barRef.title = `${data[index].label}: ${value} (${percentage.toFixed(1)}%)`;
      }
    });
  }, [data, height, effectiveMaxValue, calculatePercentage]);

  return (
    <div style={{ 
      position: 'relative',
      height: `${height}px`,
      width: '100%',
      padding: '10px 20px 30px 20px',
    }}>
      {/* Grid lines */}
      {Array(5).fill(0).map((_, i) => {
        const lineValue = Math.round((i / 4) * effectiveMaxValue);
        return (
          <div 
            key={`grid-${i}`}
            style={{
              position: 'absolute',
              bottom: `${(i / 4) * (height - 60) + 30}px`,
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            }}
          >
            {i > 0 && (
              <span style={{
                position: 'absolute',
                left: 5,
                top: -10,
                fontSize: '0.7rem',
                color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              }}>
                {lineValue}
              </span>
            )}
          </div>
        );
      })}
      
      {/* X axis */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: 0,
        right: 0,
        height: '1px',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      }} />
      
      {/* Bar container */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: '31px',  // Position just above the x-axis line
        left: '20px',
        right: '20px',
        height: `${height - 60}px`, // Subtract top and bottom padding
      }}>
        {data.map((item, index) => (
          <div 
            key={`bar-container-${index}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end', // Align to bottom
              height: '100%',
              width: `${100 / data.length}%`,
              position: 'relative',
            }}
          >
            {/* Value label */}
            {showValues && (
              <div style={{
                position: 'absolute',
                top: 0,
                fontSize: '0.8rem',
                fontWeight: 'bold',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: item.value > 0 ? (item.color || '#3f51b5') : 'transparent',
                color: item.value > 0 ? '#fff' : isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                border: item.value === 0 ? `1px dashed ${item.color || '#3f51b5'}99` : 'none',
                zIndex: 2,
                whiteSpace: 'nowrap',
              }}>
                {formatValueDisplay(item.value)}
              </div>
            )}
            
            {/* Bar */}
            <div
              ref={el => barRefs.current[index] = el}
              style={{
                width: `${barWidth}px`,
                backgroundColor: (item.color || '#3f51b5') + (item.value > 0 ? '' : '99'),
                borderRadius: '8px 8px 0 0',
                position: 'absolute',
                bottom: 0, // Ensure the bar touches the bottom
                left: '50%',
                transform: 'translateX(-50%)',
                transition: 'transform 0.3s ease, height 0.3s ease',
                boxShadow: isDark 
                  ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                  : '0 4px 8px rgba(0, 0, 0, 0.1)',
                border: item.value === 0 ? `2px dashed ${item.color || '#3f51b5'}99` : 'none',
                background: item.value > 0 
                  ? `linear-gradient(to top, ${item.color || '#3f51b5'}, ${item.color || '#3f51b5'}CC)`
                  : undefined,
              }}
              className="chart-bar"
              onMouseOver={(e) => {
                if (e.currentTarget) {
                  e.currentTarget.style.transform = 'translateX(-50%) translateY(-5px)';
                }
              }}
              onMouseOut={(e) => {
                if (e.currentTarget) {
                  e.currentTarget.style.transform = 'translateX(-50%)';
                }
              }}
            >
              {/* Highlight effect */}
              {item.value > 0 && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '10%',
                    left: '20%',
                    width: '60%',
                    height: '20%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
            
            {/* Label */}
            {showLabels && (
              <div style={{
                position: 'absolute',
                bottom: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.85rem',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PieChart: React.FC<{
  data: ChartDataPoint[];
  height: number;
  showValues: boolean;
  formatValue?: (value: number) => string;
  animated: boolean;
}> = ({ data, height, showValues, formatValue, animated }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate each slice's angle
  let startAngle = 0;
  const slices = data.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const slice = {
      label: item.label,
      value: item.value,
      color: item.color || '#3f51b5',
      startAngle,
      endAngle: startAngle + angle,
      percentage
    };
    startAngle += angle;
    return slice;
  });

  const formatValueDisplay = (value: number, percentage: number): string => {
    if (formatValue) {
      return formatValue(value);
    }
    return `${Math.round(percentage)}%`;
  };

  const radius = height / 2.5;
  const centerX = height / 2;
  const centerY = height / 2;

  return (
    <PieChartContent chartHeight={height}>
      <svg width="100%" height="100%" viewBox={`0 0 ${height} ${height}`}>
        <defs>
          {slices.map((slice, index) => (
            <filter key={`shadow-${index}`} id={`shadow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" floodOpacity="0.3" />
            </filter>
          ))}
        </defs>
        {slices.map((slice, index) => {
          // Calculate SVG arc path
          const startAngleRad = (slice.startAngle - 90) * (Math.PI / 180);
          const endAngleRad = (slice.endAngle - 90) * (Math.PI / 180);
          
          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);
          
          const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
          
          // Text position for labels
          const midAngleRad = ((slice.startAngle + slice.endAngle) / 2 - 90) * (Math.PI / 180);
          const labelRadius = showValues ? radius * 0.7 : radius * 0.85;
          const labelX = centerX + labelRadius * Math.cos(midAngleRad);
          const labelY = centerY + labelRadius * Math.sin(midAngleRad);
          
          return (
            <g key={index}>
              <path
                d={`M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`}
                fill={slice.color}
                stroke="#fff"
                strokeWidth="2"
                filter={`url(#shadow-${index})`}
                opacity={animated ? 0 : 1}
                transform={animated ? `scale(0.8) translate(${centerX * 0.2}, ${centerY * 0.2})` : 'none'}
                style={{
                  transition: animated ? `all 0.5s ease-out ${index * 0.1}s` : 'none',
                  opacity: animated ? 1 : 1,
                  transform: animated ? 'none' : 'none',
                }}
              />
              {showValues && slice.percentage > 5 && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="600"
                  opacity={animated ? 0 : 1}
                  style={{
                    transition: animated ? `opacity 0.5s ease-out ${0.5 + index * 0.1}s` : 'none',
                    opacity: animated ? 1 : 1,
                  }}
                >
                  {formatValueDisplay(slice.value, slice.percentage)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </PieChartContent>
  );
};

// Main Chart Component
export const Chart: React.FC<ChartProps> = ({
  data,
  type,
  title,
  height = 300,
  width = '100%',
  showLegend = true,
  showValues = true,
  showLabels = true,
  className,
  maxValue,
  formatValue,
  gradientFill = false,
  animated = true,
  barWidth = 36,
}) => {
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';

  // Assign colors to data points if not provided
  const processedData = data.map((item, index) => {
    if (!item.color) {
      const colors = generateDefaultColors(data.length, isDark);
      return { ...item, color: colors[index] };
    }
    return item;
  });

  return (
    <ChartContainer className={className} chartWidth={width}>
      {title && <ChartTitle>{title}</ChartTitle>}
      
      {type === 'bar' && (
        <BarChart 
          data={processedData} 
          height={height} 
          showValues={showValues} 
          showLabels={showLabels}
          maxValue={maxValue}
          formatValue={formatValue}
          animated={animated}
          isDark={isDark}
          barWidth={barWidth}
        />
      )}
      
      {type === 'pie' && (
        <PieChart 
          data={processedData} 
          height={height} 
          showValues={showValues}
          formatValue={formatValue}
          animated={animated}
        />
      )}
      
      {showLegend && (
        <Legend>
          {processedData.map((item, index) => (
            <LegendItem key={index}>
              <LegendColor color={item.color || '#3f51b5'} />
              <span>{item.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );
}; 