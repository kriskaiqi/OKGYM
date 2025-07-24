import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, styled, Tooltip } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

interface MonthlyActivityCalendarProps {
  workoutDates: string[];
  workoutDetails?: Record<string, string[]>;
}

interface CalendarDay {
  date: Date | null;
  isCurrentMonth: boolean;
  isWorkoutDay?: boolean;
  workoutNames?: string[];
}

const CalendarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(2),
}));

const CalendarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const DayCell = styled(Paper, {
  shouldForwardProp: (prop) => 
    prop !== 'isWorkoutDay' && 
    prop !== 'isCurrentMonth',
})<{ isWorkoutDay?: boolean; isCurrentMonth?: boolean }>(({ theme, isWorkoutDay, isCurrentMonth }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: isWorkoutDay ? 'pointer' : 'default',
  backgroundColor: isWorkoutDay ? theme.palette.primary.main : 'transparent',
  color: isWorkoutDay 
    ? theme.palette.primary.contrastText 
    : isCurrentMonth 
      ? theme.palette.text.primary 
      : theme.palette.text.disabled,
  opacity: isCurrentMonth ? 1 : 0.5,
  transition: 'transform 0.1s ease-in-out',
  '&:hover': {
    transform: isWorkoutDay ? 'scale(1.05)' : 'none',
    zIndex: 1,
  }
}));

const TooltipContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  maxWidth: 250,
}));

const MonthNavigator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
}));

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MonthlyActivityCalendar: React.FC<MonthlyActivityCalendarProps> = ({ 
  workoutDates,
  workoutDetails = {}
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const workoutDatesSet = new Set(workoutDates.map(date => date.split('T')[0]));
  
  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Calculate days of the month grid (accounting for starting day of week)
  const firstDayOfMonth = getDay(monthStart);
  
  // Build calendar grid
  const calendarDays: CalendarDay[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ date: null, isCurrentMonth: false });
  }
  
  // Add days of the current month
  days.forEach(day => {
    const dateString = format(day, 'yyyy-MM-dd');
    const isWorkoutDay = workoutDatesSet.has(dateString);
    const workoutNames = workoutDetails[dateString] || [];
    
    calendarDays.push({ 
      date: day, 
      isCurrentMonth: true,
      isWorkoutDay,
      workoutNames
    });
  });
  
  // Organize days into weeks
  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];
  
  calendarDays.forEach((day, index) => {
    week.push(day);
    if (week.length === 7 || index === calendarDays.length - 1) {
      // If week is not fully filled, add empty cells
      while (week.length < 7) {
        week.push({ date: null, isCurrentMonth: false });
      }
      weeks.push([...week]);
      week = [];
    }
  });
  
  // Generate a summary for the tooltip
  const getTooltipContent = (day: CalendarDay) => {
    if (!day.date || !day.isWorkoutDay) return null;
    
    const dateString = format(day.date, 'EEE, MMM d');
    const workoutCount = day.workoutNames?.length || 0;
    
    return (
      <TooltipContent>
        <Typography variant="subtitle2" fontWeight="bold">{dateString}</Typography>
        <Typography variant="body2">{workoutCount} workout{workoutCount !== 1 ? 's' : ''}</Typography>
        {day.workoutNames && day.workoutNames.length > 0 && (
          <>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>Workouts:</Typography>
            {day.workoutNames.map((workout, idx) => (
              <Typography key={idx} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                • {workout}
              </Typography>
            ))}
          </>
        )}
      </TooltipContent>
    );
  };
  
  return (
    <CalendarContainer>
      <CalendarHeader>
        <MonthNavigator onClick={handlePreviousMonth}>
          <ArrowBackIosNewIcon fontSize="small" />
        </MonthNavigator>
        <Typography variant="h6">{format(currentDate, 'MMMM yyyy')}</Typography>
        <MonthNavigator onClick={handleNextMonth}>
          <ArrowForwardIosIcon fontSize="small" />
        </MonthNavigator>
      </CalendarHeader>
      
      <Grid container spacing={1}>
        {/* Weekday headers */}
        {weekDays.map(day => (
          <Grid item xs={12/7} key={day}>
            <Typography align="center" variant="body2" fontWeight="bold">
              {day}
            </Typography>
          </Grid>
        ))}
        
        {/* Calendar days */}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={`week-${weekIndex}`}>
            {week.map((day, dayIndex) => (
              <Grid item xs={12/7} key={`${weekIndex}-${dayIndex}`}>
                <Tooltip 
                  title={getTooltipContent(day) || ''} 
                  placement="top"
                  arrow
                  disableHoverListener={!day.isWorkoutDay}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 4,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 0
                      }
                    }
                  }}
                >
                  <DayCell 
                    isWorkoutDay={day.isWorkoutDay} 
                    isCurrentMonth={day.isCurrentMonth}
                  >
                    {day.date ? format(day.date, 'd') : ''}
                  </DayCell>
                </Tooltip>
              </Grid>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </CalendarContainer>
  );
};

export default MonthlyActivityCalendar; 