import sessionService from './sessionService';
import userService from './userService';
import { exerciseService } from './exerciseService';

export type TimeRange = 'weekly' | 'monthly' | 'yearly' | 'all';

// Helper function to extract exercise IDs from sessions
function extractExerciseIdsFromSessions(sessions: any[]): string[] {
  const exerciseIds: string[] = [];
  
  sessions.forEach(session => {
    try {
      // Extract from exerciseSequence.originalPlan
      const exerciseSequence = typeof session.exerciseSequence === 'string'
        ? JSON.parse(session.exerciseSequence)
        : session.exerciseSequence;
        
      if (exerciseSequence?.originalPlan && Array.isArray(exerciseSequence.originalPlan)) {
        exerciseSequence.originalPlan.forEach((plan: any) => {
          if (plan.exerciseId) {
            exerciseIds.push(plan.exerciseId);
          }
        });
      }
      
      // Extract from exerciseResults
      const exerciseResults = typeof session.exerciseResults === 'string'
        ? JSON.parse(session.exerciseResults)
        : session.exerciseResults;
        
      if (exerciseResults && typeof exerciseResults === 'object') {
        Object.keys(exerciseResults).forEach(exerciseId => {
          exerciseIds.push(exerciseId);
        });
      }
    } catch (e) {
      console.warn('Error extracting exercise IDs:', e);
    }
  });
  
  return exerciseIds;
}

// Helper function to enrich sessions with exercise details
function enrichSessionsWithExerciseDetails(sessions: any[], exerciseDetails: any[]): void {
  // Create a map of exercise IDs to their details for quick lookup
  const exerciseMap: Record<string, any> = {};
  
  exerciseDetails.forEach(exercise => {
    if (exercise && exercise.id) {
      exerciseMap[exercise.id] = exercise;
    }
  });
  
  // Enrich each session with exercise details
  sessions.forEach(session => {
    try {
      // Create an exerciseDetails object on the session if it doesn't exist
      if (!session.exerciseDetailsMap) {
        session.exerciseDetailsMap = {};
      }
      
      // Process exercise results
      const exerciseResults = typeof session.exerciseResults === 'string'
        ? JSON.parse(session.exerciseResults)
        : session.exerciseResults;
        
      if (exerciseResults && typeof exerciseResults === 'object') {
        Object.entries(exerciseResults).forEach(([exerciseId, result]: [string, any]) => {
          // Skip if result is not an object (could be boolean or other type)
          if (!result || typeof result !== 'object') {
            return;
          }

          // Add exercise details to the result
          if (exerciseMap[exerciseId]) {
            const exerciseDetail = exerciseMap[exerciseId];
            session.exerciseDetailsMap[exerciseId] = exerciseDetail;
            
            // Add exercise name to the result if not present
            if (!result.exerciseName && exerciseDetail.name) {
              result.exerciseName = exerciseDetail.name;
            }
            
            // Add muscle groups to the result if not present
            if (!result.muscleGroups && exerciseDetail.muscleGroups) {
              result.muscleGroups = exerciseDetail.muscleGroups;
            }
            
            // Add difficulty level to the result if not present
            if (!result.level && exerciseDetail.level) {
              result.level = exerciseDetail.level;
            }
          }
        });
      }
    } catch (e) {
      console.warn('Error enriching session with exercise details:', e);
    }
  });
}

// Add this function before the progressService object
function calculateCompletionRate(timeRange: TimeRange): Promise<number> {
  return new Promise(async (resolve) => {
    try {
      const { sessions: completedSessions } = await sessionService.getUserSessions({
        status: 'COMPLETED',
        limit: 100
      });
      
      const { sessions: cancelledSessions } = await sessionService.getUserSessions({
        status: 'CANCELLED',
        limit: 100
      });
      
      // Filter by time range
      const filteredCompleted = filterSessionsByTimeRange(completedSessions, timeRange);
      const filteredCancelled = filterSessionsByTimeRange(cancelledSessions, timeRange);
      
      const total = filteredCompleted.length + filteredCancelled.length;
      const rate = total > 0 ? Math.round((filteredCompleted.length / total) * 100) : 0;
      
      resolve(rate);
    } catch (error) {
      console.error('Error calculating completion rate:', error);
      resolve(0);
    }
  });
}

export const progressService = {
  getWorkoutPerformanceData: async (timeRange: TimeRange) => {
    try {
      // Get all completed sessions
      const { sessions } = await sessionService.getUserSessions({ 
        status: 'COMPLETED',
        limit: 100 // Increase limit to get more historical data
      });

      // Calculate completion rate
      const completionRate = await calculateCompletionRate(timeRange);

      // Filter sessions based on time range
      const filteredSessions = filterSessionsByTimeRange(sessions, timeRange);
      
      // Extract exercise IDs from sessions for detailed fetching
      const exerciseIds = extractExerciseIdsFromSessions(filteredSessions);
      
      // Fetch detailed exercise data
      let exerciseDetails: any[] = [];
      if (exerciseIds.length > 0) {
        exerciseDetails = await exerciseService.getExercisesByIds(exerciseIds);
        
        // Enrich sessions with exercise details
        enrichSessionsWithExerciseDetails(filteredSessions, exerciseDetails);
      }
      
      // Get all exercise data with a single call - high limit to ensure we get all data
      const actualExercises = findMostFrequentExercises(filteredSessions, 1000);
      
      // Calculate additional metrics with enriched data
      const muscleGroupDistribution = calculateMuscleGroupDistribution(filteredSessions);
      const workoutsByWeekday = calculateWorkoutsByWeekday(filteredSessions);
      const strengthProgress = calculateStrengthProgress(filteredSessions);
      const workoutTypes = calculateWorkoutTypes(filteredSessions);
      
      // Other metrics
      const exerciseCategories = calculateExerciseCategories(filteredSessions);
      const difficultyLevels = calculateDifficultyLevels(filteredSessions);
      const exerciseLevels = calculateExerciseLevels(filteredSessions, exerciseDetails);
      
      // Get total attempts data
      const { totalExercises, totalAttempts } = calculateTotalAttempts(filteredSessions);
      
      // Format and return data
      return {
        volumeData: calculateVolumeOverTime(filteredSessions),
        formScoreData: calculateFormScoreOverTime(filteredSessions),
        totalWorkouts: filteredSessions.length,
        averageDuration: calculateAverageDuration(filteredSessions),
        muscleGroupDistribution,
        workoutsByWeekday,
        strengthProgress,
        workoutTypes,
        mostFrequentExercises: actualExercises.slice(0, 5), // Top 5 for most frequent
        exerciseCount: totalExercises,
        totalAttempts: totalAttempts,
        exerciseCategories,
        difficultyLevels,
        actualExercises,
        exerciseLevels,
        completionRate
      };
    } catch (error) {
      console.error('Error fetching workout performance data:', error);
      
      // Return empty data instead of mock data
      return {
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
        totalAttempts: 0,
        exerciseCategories: [],
        difficultyLevels: [],
        actualExercises: [],
        exerciseLevels: [],
        completionRate: 0
      };
    }
  },
  
  getBodyMetricsData: async (timeRange: TimeRange) => {
    try {
      const userProfile = await userService.getUserProfile();
      const weightData = filterWeightDataByTimeRange(
        userProfile?.stats?.weightHistory || [],
        timeRange
      );
      
      return {
        weightData,
        startingWeight: userProfile?.stats?.startingWeight || 0,
        currentWeight: userProfile?.stats?.currentWeight || 0,
        weightUnit: userProfile?.stats?.weightUnit || 'kg',
        weightLossPercentage: calculateWeightLossPercentage(
          userProfile?.stats?.startingWeight, 
          userProfile?.stats?.currentWeight
        )
      };
    } catch (error) {
      console.error('Error fetching body metrics data:', error);
      
      // Return empty data
      return {
        weightData: [],
        startingWeight: 0,
        currentWeight: 0,
        weightUnit: 'kg',
        weightLossPercentage: 0
      };
    }
  },
  
  getConsistencyData: async (timeRange: TimeRange) => {
    try {
      // Get all completed sessions
      const { sessions } = await sessionService.getUserSessions({ 
        status: 'COMPLETED',
        limit: 100 // Increase limit to get more historical data
      });

      // Filter sessions based on time range
      const filteredSessions = filterSessionsByTimeRange(sessions, timeRange);
      
      // Calculate additional metrics
      const workoutsByWeekday = calculateWorkoutsByWeekday(filteredSessions);
      const streakData = calculateStreakData(filteredSessions);
      const timeOfDayData = calculateTimeOfDayDistribution(filteredSessions);
      
      // Calculate activity calendar data
      const activityData = calculateActivityCalendarData(filteredSessions);
      
      return {
        totalWorkouts: filteredSessions.length,
        workoutsByWeekday,
        streakData,
        timeOfDayData,
        activityData
      };
    } catch (error) {
      console.error('Error fetching consistency data:', error);
      
      // Return empty data
      return {
        totalWorkouts: 0,
        workoutsByWeekday: [0, 0, 0, 0, 0, 0, 0],
        streakData: {
          currentStreak: 0,
          longestStreak: 0
        },
        timeOfDayData: {
          morning: 0,
          afternoon: 0,
          evening: 0,
          night: 0
        },
        activityData: []
      };
    }
  }
};

// Helper functions
function filterSessionsByTimeRange(sessions: any[], timeRange: TimeRange) {
  const now = new Date();
  let cutoffDate: Date;
  
  switch (timeRange) {
    case 'weekly':
      cutoffDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'yearly':
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      return sessions;
  }
  
  return sessions.filter(session => {
    const sessionDate = new Date(session.startTime || session.createdAt);
    return sessionDate >= cutoffDate;
  });
}

function calculateVolumeOverTime(sessions: any[]) {
  if (!sessions.length) return [];
  
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  return sortedSessions.map(session => {
    const date = new Date(session.startTime).toISOString().split('T')[0];
    let sessionVolume = 0;
    
    try {
      const exerciseResults = typeof session.exerciseResults === 'string' 
        ? JSON.parse(session.exerciseResults) 
        : session.exerciseResults;
      
      Object.values(exerciseResults || {}).forEach((result: any) => {
        if (result.bestResult) {
          sessionVolume += (result.bestResult.weight || 0) * (result.bestResult.reps || 0);
        }
      });
    } catch (e) {
      console.warn('Error parsing exercise results:', e);
    }
    
    return { x: date, y: sessionVolume };
  });
}

function calculateFormScoreOverTime(sessions: any[]) {
  if (!sessions.length) return [];
  
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  return sortedSessions.map(session => {
    const date = new Date(session.startTime).toISOString().split('T')[0];
    let totalScore = 0;
    let count = 0;
    
    try {
      const exerciseResults = typeof session.exerciseResults === 'string' 
        ? JSON.parse(session.exerciseResults) 
        : session.exerciseResults;
      
      Object.values(exerciseResults || {}).forEach((result: any) => {
        if (result.attempts && Array.isArray(result.attempts)) {
          result.attempts.forEach((attempt: any) => {
            if (typeof attempt.formScore === 'number') {
              totalScore += attempt.formScore;
              count++;
            }
          });
        }
      });
    } catch (e) {
      console.warn('Error parsing exercise results:', e);
    }
    
    return { x: date, y: count > 0 ? totalScore / count : 0 };
  });
}

function calculateAverageDuration(sessions: any[]) {
  if (!sessions.length) return 0;
  
  const totalDuration = sessions.reduce((sum, session) => 
    sum + (session.totalDuration || 0), 0);
  
  return Math.round(totalDuration / sessions.length);
}

function filterWeightDataByTimeRange(weightHistory: any[], timeRange: TimeRange) {
  const now = new Date();
  let cutoffDate: Date;
  
  switch (timeRange) {
    case 'weekly':
      cutoffDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'yearly':
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      return weightHistory;
  }
  
  return weightHistory.filter(entry => new Date(entry.date) >= cutoffDate);
}

function calculateWeightLossPercentage(startingWeight?: number, currentWeight?: number) {
  if (!startingWeight || !currentWeight || startingWeight <= currentWeight) return 0;
  return ((startingWeight - currentWeight) / startingWeight) * 100;
}

// New helper functions for additional metrics

function calculateMuscleGroupDistribution(sessions: any[]) {
  const muscleGroupCount: Record<string, number> = {
    'Chest': 0,
    'Back': 0,
    'Shoulders': 0,
    'Legs': 0,
    'Core': 0,
    'Biceps': 0,
    'Triceps': 0,
    'General': 0
  };
  
  // Process all exercises from all sessions
  sessions.forEach(session => {
    try {
      const exerciseIds: string[] = [];
      let exercisesMapped = false;
      
      // Extract exercise IDs from exerciseSequence
      const exerciseSequence = typeof session.exerciseSequence === 'string' 
        ? JSON.parse(session.exerciseSequence) 
        : session.exerciseSequence;
        
      if (exerciseSequence?.originalPlan && Array.isArray(exerciseSequence.originalPlan)) {
        exerciseSequence.originalPlan.forEach((plan: any) => {
          if (plan.exerciseId) {
            exerciseIds.push(plan.exerciseId);
          }
        });
      }
      
      // Extract from exerciseResults (this has the exercises the user actually did)
      const exerciseResults = typeof session.exerciseResults === 'string' 
        ? JSON.parse(session.exerciseResults) 
        : session.exerciseResults;
        
      // Process exerciseDetailsMap if available (from enrichment)
      if (session.exerciseDetailsMap) {
        exercisesMapped = true;
        
        Object.entries(session.exerciseDetailsMap).forEach(([exerciseId, detail]: [string, any]) => {
          if (detail && detail.muscleGroups && Array.isArray(detail.muscleGroups)) {
            // Process each muscle group from the details
            detail.muscleGroups.forEach((group: string) => {
              const normalizedGroup = normalizeMuscleName(group);
              muscleGroupCount[normalizedGroup]++;
            });
          } else {
            // If no muscle groups in details, count as general
            muscleGroupCount['General']++;
          }
        });
      }
      
      // If we don't have enriched data, try to extract from exerciseResults directly
      if (!exercisesMapped && exerciseResults && typeof exerciseResults === 'object') {
        Object.entries(exerciseResults).forEach(([exerciseId, result]: [string, any]) => {
          let muscleGroupsFound = false;
          
          // Check if result has muscle groups info
          if (result && result.muscleGroups && Array.isArray(result.muscleGroups)) {
            muscleGroupsFound = true;
            
            result.muscleGroups.forEach((group: string) => {
              const normalizedGroup = normalizeMuscleName(group);
              muscleGroupCount[normalizedGroup]++;
            });
          }
          
          // If no muscle groups found, check if result has exercise details with muscle groups
          if (!muscleGroupsFound && result && result.exercise && result.exercise.muscleGroups) {
            muscleGroupsFound = true;
            
            const muscleGroups = Array.isArray(result.exercise.muscleGroups) 
              ? result.exercise.muscleGroups 
              : [result.exercise.muscleGroups];
              
            muscleGroups.forEach((group: string) => {
              const normalizedGroup = normalizeMuscleName(group);
              muscleGroupCount[normalizedGroup]++;
            });
          }
          
          // If no muscle groups found yet, try to guess from exercise name
          if (!muscleGroupsFound && result && result.exerciseName) {
            const exerciseName = result.exerciseName.toLowerCase();
            
            if (exerciseName.includes('chest') || exerciseName.includes('bench') || exerciseName.includes('pec')) {
              muscleGroupCount['Chest']++;
            } else if (exerciseName.includes('back') || exerciseName.includes('row') || exerciseName.includes('pull')) {
              muscleGroupCount['Back']++;
            } else if (exerciseName.includes('shoulder') || exerciseName.includes('press') || exerciseName.includes('delt')) {
              muscleGroupCount['Shoulders']++;
            } else if (exerciseName.includes('leg') || exerciseName.includes('squat') || exerciseName.includes('quad') || 
                       exerciseName.includes('hamstring') || exerciseName.includes('calf')) {
              muscleGroupCount['Legs']++;
            } else if (exerciseName.includes('core') || exerciseName.includes('ab') || exerciseName.includes('crunch')) {
              muscleGroupCount['Core']++;
            } else if (exerciseName.includes('bicep') || exerciseName.includes('curl')) {
              muscleGroupCount['Biceps']++;
            } else if (exerciseName.includes('tricep') || exerciseName.includes('extension')) {
              muscleGroupCount['Triceps']++;
            } else {
              muscleGroupCount['General']++;
            }
          } else if (!muscleGroupsFound) {
            // If we couldn't determine muscle groups at all
            muscleGroupCount['General']++;
          }
        });
      }
      
      // If we still don't have any muscle groups mapped, force some defaults so chart isn't empty
      if (!exercisesMapped && Object.values(muscleGroupCount).every(count => count === 0)) {
        // Default to general if we couldn't determine any muscle groups
        muscleGroupCount['General'] = Math.max(1, exerciseIds.length || 1);
      }
    } catch (e) {
      console.warn('Error calculating muscle group distribution:', e);
      // Count as general on error
      muscleGroupCount['General']++;
    }
  });
  
  // Filter out empty categories
  return Object.fromEntries(
    Object.entries(muscleGroupCount).filter(([_, count]) => count > 0)
  );
}

// Helper function to normalize muscle group names
function normalizeMuscleName(name: string): string {
  if (!name || typeof name !== 'string') return 'General';
  
  const normalized = name.trim().toLowerCase();
  
  // Map various muscle group names to standard categories
  if (normalized.includes('chest') || normalized.includes('pec')) {
    return 'Chest';
  } else if (normalized.includes('back') || normalized.includes('lat') || normalized.includes('trap')) {
    return 'Back';
  } else if (normalized.includes('shoulder') || normalized.includes('delt')) {
    return 'Shoulders';
  } else if (normalized.includes('leg') || normalized.includes('quad') || 
              normalized.includes('hamstring') || normalized.includes('calf') || 
              normalized.includes('glute')) {
    return 'Legs';
  } else if (normalized.includes('core') || normalized.includes('ab') || 
              normalized.includes('abdominal') || normalized.includes('oblique')) {
    return 'Core';
  } else if (normalized.includes('bicep')) {
    return 'Biceps';
  } else if (normalized.includes('tricep')) {
    return 'Triceps';
  } else {
    return 'General';
  }
}

function calculateWorkoutsByWeekday(sessions: any[]) {
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, ..., Sat
  
  sessions.forEach(session => {
    try {
      const date = new Date(session.startTime || session.createdAt);
      const weekday = date.getDay(); // 0 = Sunday, 6 = Saturday
      weekdayCounts[weekday]++;
    } catch (e) {
      console.warn('Error processing workout day:', e);
    }
  });
  
  return weekdayCounts;
}

function calculateStrengthProgress(sessions: any[]) {
  // Find common exercises across sessions to track strength progress
  const exerciseStrengthMap: Record<string, any[]> = {};
  
  sessions.forEach(session => {
    try {
      const date = new Date(session.startTime || session.createdAt);
      const exerciseResults = typeof session.exerciseResults === 'string' 
        ? JSON.parse(session.exerciseResults) 
        : session.exerciseResults;
      
      Object.entries(exerciseResults || {}).forEach(([exerciseId, result]: [string, any]) => {
        if (result.bestResult && result.exerciseName) {
          const exerciseName = result.exerciseName;
          
          if (!exerciseStrengthMap[exerciseName]) {
            exerciseStrengthMap[exerciseName] = [];
          }
          
          exerciseStrengthMap[exerciseName].push({
            date: date.toISOString().split('T')[0],
            weight: result.bestResult.weight || 0,
            reps: result.bestResult.reps || 0
          });
        }
      });
    } catch (e) {
      console.warn('Error processing strength progress:', e);
    }
  });
  
  // Get top 3 exercises with the most data points
  const exercises = Object.keys(exerciseStrengthMap)
    .map(name => ({ 
      name, 
      dataPoints: exerciseStrengthMap[name].length
    }))
    .sort((a, b) => b.dataPoints - a.dataPoints)
    .slice(0, 3)
    .map(exercise => exercise.name);
  
  // Prepare progress data for these exercises
  return exercises.map(name => {
    const data = exerciseStrengthMap[name];
    
    // Sort data by date
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      exerciseName: name,
      data: data.map(point => ({
        date: point.date,
        value: point.weight * (1 + (point.reps / 30)) // Approximate 1RM
      }))
    };
  });
}

function calculateWorkoutTypes(sessions: any[]) {
  const typeCount: Record<string, number> = {};
  
  sessions.forEach(session => {
    try {
      const workoutPlan = session.workoutPlan || {};
      let type = workoutPlan.category || workoutPlan.type || workoutPlan.name;
      
      // Try to derive type from the name if not available
      if (!type && workoutPlan.name) {
        const name = workoutPlan.name.toLowerCase();
        if (name.includes('strength') || name.includes('power')) {
          type = 'STRENGTH';
        } else if (name.includes('cardio') || name.includes('endurance')) {
          type = 'CARDIO';
        } else if (name.includes('hiit') || name.includes('interval')) {
          type = 'HIIT';
        } else if (name.includes('hypertrophy') || name.includes('muscle')) {
          type = 'HYPERTROPHY';
        }
      }
      
      // Default to unknown if still not found
      type = type || 'UNKNOWN';
      
      if (typeof type === 'string') {
        const cleanType = type.trim().toUpperCase();
        typeCount[cleanType] = (typeCount[cleanType] || 0) + 1;
      }
    } catch (e) {
      console.warn('Error processing workout type:', e);
    }
  });
  
  // Ensure we have at least one entry
  if (Object.keys(typeCount).length === 0) {
    typeCount['UNKNOWN'] = sessions.length || 1;
  }
  
  // Convert to array of {name, count} objects
  return Object.entries(typeCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function findMostFrequentExercises(sessions: any[], limit: number = 1000) {
  const exerciseCount: Record<string, number> = {};
  const exerciseIdToNameMap: Record<string, string> = {};
  const exerciseIdToLevelMap: Record<string, string> = {}; 
  const processedSessions = new Set<string>();
  const processedExerciseIdsPerSession: Map<string, Set<string>> = new Map();
  
  // Track unique occurrences of exercises across sessions
  sessions.forEach(session => {
    try {
      const sessionId = session.id || Math.random().toString();
      if (processedSessions.has(sessionId)) return;
      processedSessions.add(sessionId);
      
      // Create a set to track exercises counted in this session
      const sessionExerciseIds = new Set<string>();
      processedExerciseIdsPerSession.set(sessionId, sessionExerciseIds);
      
      // Get exercise IDs from exerciseSequence.originalPlan
      const exerciseSequence = typeof session.exerciseSequence === 'string' 
        ? JSON.parse(session.exerciseSequence) 
        : session.exerciseSequence;
        
      if (exerciseSequence?.originalPlan && Array.isArray(exerciseSequence.originalPlan)) {
        exerciseSequence.originalPlan.forEach((plannedExercise: any) => {
          if (plannedExercise && plannedExercise.exerciseId) {
            // Store level if available
            if (plannedExercise.level) {
              exerciseIdToLevelMap[plannedExercise.exerciseId] = plannedExercise.level;
            }
            
            // Track this exercise ID for this session
            sessionExerciseIds.add(plannedExercise.exerciseId);
          }
        });
      }
      
      // Process exerciseResults which uses UUIDs as keys
      const exerciseResults = typeof session.exerciseResults === 'string' 
        ? JSON.parse(session.exerciseResults) 
        : session.exerciseResults;
      
      if (exerciseResults && typeof exerciseResults === 'object') {
        Object.entries(exerciseResults).forEach(([exerciseId, result]: [string, any]) => {
          // Skip if the result is not an object
          if (!result || typeof result !== 'object') {
            return;
          }
          
          // Store exercise name if available
          if (result.exerciseName && typeof result.exerciseName === 'string') {
            exerciseIdToNameMap[exerciseId] = result.exerciseName.trim();
          }
          
          // Store exercise level if available
          if (result.level && typeof result.level === 'string') {
            exerciseIdToLevelMap[exerciseId] = result.level;
          } else if (result.difficulty && typeof result.difficulty === 'string') {
            // Map difficulty to level if available
            const normalizedDifficulty = result.difficulty.toUpperCase().trim();
            if (['1', 'EASY', 'LOW'].includes(normalizedDifficulty)) {
              exerciseIdToLevelMap[exerciseId] = 'Beginner';
            } else if (['2', 'MEDIUM', 'MODERATE'].includes(normalizedDifficulty)) {
              exerciseIdToLevelMap[exerciseId] = 'Intermediate';
            } else if (['3', 'HARD', 'HIGH'].includes(normalizedDifficulty)) {
              exerciseIdToLevelMap[exerciseId] = 'Advanced';
            } else if (['4', 'VERY HARD', 'EXTREME'].includes(normalizedDifficulty)) {
              exerciseIdToLevelMap[exerciseId] = 'Expert';
            }
          }
          
          // Track this exercise ID for this session
          sessionExerciseIds.add(exerciseId);
        });
      }
      
      // Check workout plan for exercise details
      if (session.workoutPlan) {
        const workoutPlan = typeof session.workoutPlan === 'string'
          ? JSON.parse(session.workoutPlan)
          : session.workoutPlan;
        
        // Try to get from exercises array
        if (workoutPlan.exercises && Array.isArray(workoutPlan.exercises)) {
          workoutPlan.exercises.forEach((exercise: any) => {
            if (exercise && exercise.id && typeof exercise.name === 'string') {
              exerciseIdToNameMap[exercise.id] = exercise.name.trim();
              
              // Store level if available
              if (exercise.level && typeof exercise.level === 'string') {
                exerciseIdToLevelMap[exercise.id] = exercise.level;
              } else if (exercise.difficulty && typeof exercise.difficulty === 'string') {
                // Map difficulty to level if available
                const normalizedDifficulty = exercise.difficulty.toUpperCase().trim();
                if (['1', 'EASY', 'LOW'].includes(normalizedDifficulty)) {
                  exerciseIdToLevelMap[exercise.id] = 'Beginner';
                } else if (['2', 'MEDIUM', 'MODERATE'].includes(normalizedDifficulty)) {
                  exerciseIdToLevelMap[exercise.id] = 'Intermediate';
                } else if (['3', 'HARD', 'HIGH'].includes(normalizedDifficulty)) {
                  exerciseIdToLevelMap[exercise.id] = 'Advanced';
                } else if (['4', 'VERY HARD', 'EXTREME'].includes(normalizedDifficulty)) {
                  exerciseIdToLevelMap[exercise.id] = 'Expert';
                }
              }
              
              // Track this exercise ID for this session
              sessionExerciseIds.add(exercise.id);
            }
          });
        }
      }
      
      // Check if session has exerciseDetailsMap (enriched during data fetching)
      if (session.exerciseDetailsMap) {
        Object.entries(session.exerciseDetailsMap).forEach(([exerciseId, detail]: [string, any]) => {
          if (detail) {
            // Update name if available
            if (detail.name) {
              exerciseIdToNameMap[exerciseId] = detail.name.trim();
            }
            
            // Update level if available
            if (detail.level) {
              exerciseIdToLevelMap[exerciseId] = detail.level;
            }
            
            // Track this exercise ID for this session
            sessionExerciseIds.add(exerciseId);
          }
        });
      }
    } catch (e) {
      console.warn('Error processing exercise frequency:', e);
    }
  });
  
  // Now count exercises based on unique occurrences per session
  processedExerciseIdsPerSession.forEach((exerciseIds, sessionId) => {
    exerciseIds.forEach(exerciseId => {
      exerciseCount[exerciseId] = (exerciseCount[exerciseId] || 0) + 1;
    });
  });
  
  // Map exercise IDs to names and prepare final data
  const namedExercises: Record<string, { count: number; level?: string; id?: string }> = {};
  
  Object.entries(exerciseCount).forEach(([exerciseId, count]) => {
    // Only include exercises that have a proper name mapped
    const name = exerciseIdToNameMap[exerciseId];
    if (name && typeof name === 'string' && name.trim() !== '' && 
        name !== 'undefined' && name !== 'null' && !name.includes('Workout')) {
      if (!namedExercises[name]) {
        namedExercises[name] = { 
          count, 
          level: exerciseIdToLevelMap[exerciseId] || 'Beginner',
          id: exerciseId
        };
      } else {
        namedExercises[name].count += count;
      }
    }
  });
  
  console.log(`Found ${Object.keys(namedExercises).length} exercises with proper names`);
  
  // Normalize the level names for consistency
  Object.values(namedExercises).forEach(exercise => {
    if (exercise.level) {
      const level = exercise.level.toString().toUpperCase().trim();
      
      if (level.includes('BEGIN') || level === 'EASY' || level === 'NOVICE') {
        exercise.level = 'Beginner';
      } else if (level.includes('INTER') || level === 'MODERATE') {
        exercise.level = 'Intermediate';
      } else if (level.includes('ADVANC') || level === 'HARD') {
        exercise.level = 'Advanced';
      } else if (level.includes('EXPERT') || level === 'ELITE' || level === 'MASTER') {
        exercise.level = 'Expert';
      } else {
        exercise.level = 'Beginner'; // Default
      }
    }
  });
  
  const result = Object.entries(namedExercises)
    .map(([name, data]) => ({ 
      name, 
      count: data.count,
      level: data.level,
      id: data.id
    }))
    .sort((a, b) => b.count - a.count);
    
  return result.slice(0, limit);
}

function calculateTotalExercises(sessions: any[]) {
  let totalCount = 0;
  
  sessions.forEach(session => {
    try {
      const exerciseResults = typeof session.exerciseResults === 'string' 
        ? JSON.parse(session.exerciseResults) 
        : session.exerciseResults;
      
      totalCount += Object.keys(exerciseResults || {}).length;
    } catch (e) {
      console.warn('Error calculating total exercises:', e);
    }
  });
  
  return totalCount;
}

// New function to calculate total attempts and exercises
function calculateTotalAttempts(sessions: any[]) {
  let totalExercises = 0;
  let totalAttempts = 0;
  
  sessions.forEach(session => {
    try {
      const exerciseResults = typeof session.exerciseResults === 'string' 
        ? JSON.parse(session.exerciseResults) 
        : session.exerciseResults;
      
      if (exerciseResults && typeof exerciseResults === 'object') {
        // Count exercises in this session
        const exercisesInSession = Object.keys(exerciseResults).length;
        totalExercises += exercisesInSession;
        
        // Count attempts in this session
        Object.values(exerciseResults).forEach((result: any) => {
          if (result.attempts && Array.isArray(result.attempts)) {
            totalAttempts += result.attempts.length;
          }
        });
      }
    } catch (e) {
      console.warn('Error calculating total attempts:', e);
    }
  });
  
  return { totalExercises, totalAttempts };
}

// New helper function to calculate streak data
function calculateStreakData(sessions: any[]) {
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
  
  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  // Check if today has a workout (for current streak)
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];
  
  if (dates.includes(today)) {
    currentStreak = 1;
    
    // Count backwards from yesterday
    let checkDate = yesterday;
    while (dates.includes(checkDate)) {
      currentStreak++;
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      checkDate = prevDate.toISOString().split('T')[0];
    }
  } else if (dates.includes(yesterday)) {
    // The streak is still active if yesterday had a workout
    currentStreak = 1;
    
    // Count backwards from 2 days ago
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 2);
    let checkDateStr = checkDate.toISOString().split('T')[0];
    
    while (dates.includes(checkDateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = checkDate.toISOString().split('T')[0];
    }
  }
  
  // Calculate longest streak
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
    currentStreak,
    longestStreak
  };
}

// New helper function to calculate time of day distribution
function calculateTimeOfDayDistribution(sessions: any[]) {
  const distribution = {
    morning: 0,   // 5AM - 12PM
    afternoon: 0, // 12PM - 5PM
    evening: 0,   // 5PM - 9PM
    night: 0      // 9PM - 5AM
  };
  
  sessions.forEach(session => {
    try {
      const date = new Date(session.startTime || session.createdAt);
      const hours = date.getHours();
      
      if (hours >= 5 && hours < 12) {
        distribution.morning++;
      } else if (hours >= 12 && hours < 17) {
        distribution.afternoon++;
      } else if (hours >= 17 && hours < 21) {
        distribution.evening++;
      } else {
        distribution.night++;
      }
    } catch (e) {
      console.warn('Error processing time of day:', e);
    }
  });
  
  return distribution;
}

// New helper function to calculate activity calendar data
function calculateActivityCalendarData(sessions: any[]) {
  const activityMap: Record<string, any> = {};
  
  sessions.forEach(session => {
    try {
      const date = new Date(session.startTime || session.createdAt);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!activityMap[dateStr]) {
        activityMap[dateStr] = {
          day: dateStr,
          value: 0,
          data: {
            workoutNames: []
          }
        };
      }
      
      activityMap[dateStr].value++;
      
      const workoutName = session.workoutPlan?.name || 'Workout';
      if (!activityMap[dateStr].data.workoutNames.includes(workoutName)) {
        activityMap[dateStr].data.workoutNames.push(workoutName);
      }
    } catch (e) {
      console.warn('Error processing activity calendar data:', e);
    }
  });
  
  return Object.values(activityMap);
}

// Extract exercise categories (strength, cardio, etc)
function calculateExerciseCategories(sessions: any[]) {
  // Initialize with common exercise categories to ensure variety
  const categoryCount: Record<string, number> = {
    'STRENGTH': 0,
    'CARDIO': 0,
    'FLEXIBILITY': 0,
    'HIIT': 0,
    'MOBILITY': 0,
    'BALANCE': 0,
    'CORE': 0
  };
  
  sessions.forEach(session => {
    try {
      const workoutPlan = session.workoutPlan || {};
      const exerciseResults = typeof session.exerciseResults === 'string' 
        ? JSON.parse(session.exerciseResults) 
        : session.exerciseResults;
      
      let categoriesFound = false;
      
      // First try to get categories from exercise results
      if (exerciseResults && typeof exerciseResults === 'object') {
        Object.values(exerciseResults).forEach((result: any) => {
          if (result && result.category) {
            const category = typeof result.category === 'string' 
              ? result.category.trim().toUpperCase() 
              : 'UNKNOWN';
            
            if (category) {
              categoryCount[category] = (categoryCount[category] || 0) + 1;
              categoriesFound = true;
            }
          }
        });
      }
      
      // Try to extract from workout plan details
      const extractCategoryFromPlan = () => {
        // Try to determine category from workout plan name or type
        let categoryFound = false;
        
        // Check explicit category/type first
        if (workoutPlan.category) {
          const category = workoutPlan.category.toUpperCase();
          categoryCount[category] = (categoryCount[category] || 0) + 1;
          categoryFound = true;
        } else if (workoutPlan.type) {
          const category = workoutPlan.type.toUpperCase();
          categoryCount[category] = (categoryCount[category] || 0) + 1;
          categoryFound = true;
        } 
        
        // If not found by explicit fields, check workout name
        if (!categoryFound && workoutPlan.name) {
          const name = workoutPlan.name.toLowerCase();
          
          // Map to detect categories from name
          const categoryKeywords = [
            { keywords: ['strength', 'power', 'weight', 'lifting', 'resistance'], category: 'STRENGTH' },
            { keywords: ['cardio', 'endurance', 'run', 'aerobic', 'running', 'cycling'], category: 'CARDIO' },
            { keywords: ['flexibility', 'stretch', 'yoga', 'mobility'], category: 'FLEXIBILITY' },
            { keywords: ['hiit', 'interval', 'tabata', 'circuit'], category: 'HIIT' },
            { keywords: ['core', 'abs', 'abdominal', 'six-pack'], category: 'CORE' },
            { keywords: ['balance', 'stability', 'proprioception'], category: 'BALANCE' },
            { keywords: ['mobility', 'joint', 'range of motion'], category: 'MOBILITY' }
          ];
          
          for (const item of categoryKeywords) {
            if (item.keywords.some(keyword => name.includes(keyword))) {
              categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
              categoryFound = true;
              break;
            }
          }
          
          // Special case for common workout formats
          if (!categoryFound) {
            if (name.includes('push')) {
              categoryCount['STRENGTH'] = (categoryCount['STRENGTH'] || 0) + 1;
              categoryFound = true;
            } else if (name.includes('pull')) {
              categoryCount['STRENGTH'] = (categoryCount['STRENGTH'] || 0) + 1;
              categoryFound = true;
            } else if (name.includes('leg')) {
              categoryCount['STRENGTH'] = (categoryCount['STRENGTH'] || 0) + 1;
              categoryFound = true;
            }
          }
        }
        
        return categoryFound;
      };
      
      // If no categories found from results, check workout plan
      if (!categoriesFound) {
        categoriesFound = extractCategoryFromPlan();
      }
      
      // If still no categories, check workout exercises
      if (!categoriesFound && workoutPlan && workoutPlan.exercises) {
        const exercises = Array.isArray(workoutPlan.exercises) ? workoutPlan.exercises : [];
        
        if (exercises.length > 0) {
          const exerciseCategories: Record<string, number> = {};
          
          exercises.forEach((exercise: any) => {
            if (exercise && exercise.category) {
              const category = typeof exercise.category === 'string' 
                ? exercise.category.trim().toUpperCase() 
                : '';
              
              if (category) {
                exerciseCategories[category] = (exerciseCategories[category] || 0) + 1;
              }
            } else if (exercise && exercise.name) {
              // Try to infer category from exercise name
              const name = exercise.name.toLowerCase();
              
              if (name.includes('press') || name.includes('curl') || name.includes('extension') || 
                  name.includes('lift') || name.includes('row') || name.includes('deadlift') ||
                  name.includes('squat') || name.includes('bench')) {
                exerciseCategories['STRENGTH'] = (exerciseCategories['STRENGTH'] || 0) + 1;
              } else if (name.includes('run') || name.includes('jog') || name.includes('sprint') ||
                         name.includes('cardio') || name.includes('jumping')) {
                exerciseCategories['CARDIO'] = (exerciseCategories['CARDIO'] || 0) + 1;
              } else if (name.includes('stretch') || name.includes('yoga')) {
                exerciseCategories['FLEXIBILITY'] = (exerciseCategories['FLEXIBILITY'] || 0) + 1;
              } else if (name.includes('plank') || name.includes('crunch') || name.includes('sit-up') ||
                         name.includes('abs') || name.includes('twist')) {
                exerciseCategories['CORE'] = (exerciseCategories['CORE'] || 0) + 1;
              }
            }
          });
          
          // Add the most frequent category from exercises
          if (Object.keys(exerciseCategories).length > 0) {
            const sortedCategories = Object.entries(exerciseCategories)
              .sort(([, countA], [, countB]) => countB - countA);
            
            sortedCategories.forEach(([category, count]) => {
              categoryCount[category] = (categoryCount[category] || 0) + count;
            });
            
            categoriesFound = true;
          }
        }
      }
      
      // If no specific categories were found, make an intelligent guess
      if (!categoriesFound) {
        // Return empty instead of generating fake data
        // No categories were found for this session
      }
    } catch (e) {
      console.warn('Error processing exercise categories:', e);
    }
  });
  
  // Remove categories with zero count
  Object.keys(categoryCount).forEach(key => {
    if (categoryCount[key] === 0) {
      delete categoryCount[key];
    }
  });
  
  // Return empty data if no categories were found
  if (Object.keys(categoryCount).length === 0) {
    return [];
  }
  
  // Convert to array of {name, count} objects
  return Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Calculate workout difficulty levels
function calculateDifficultyLevels(sessions: any[]) {
  const difficultyCount: Record<string, number> = {
    'BEGINNER': 0,
    'INTERMEDIATE': 0,
    'ADVANCED': 0
  };
  
  sessions.forEach(session => {
    try {
      const workoutPlan = session.workoutPlan || {};
      let difficulty = '';
      
      // First try to get explicit difficulty
      if (workoutPlan.difficulty) {
        difficulty = workoutPlan.difficulty;
      } 
      // Try to infer from the name
      else if (workoutPlan.name) {
        const name = workoutPlan.name.toLowerCase();
        
        if (name.includes('beginner')) {
          difficulty = 'BEGINNER';
        } else if (name.includes('intermediate')) {
          difficulty = 'INTERMEDIATE';
        } else if (name.includes('advanced')) {
          difficulty = 'ADVANCED';
        }
      }
      
      // If we found a difficulty, increment its count
      if (difficulty) {
        const cleanDifficulty = difficulty.trim().toUpperCase();
        if (['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(cleanDifficulty)) {
          difficultyCount[cleanDifficulty]++;
        }
      } 
      // If we couldn't determine difficulty, make a guess based on session metrics
      else {
        try {
          const exerciseResults = typeof session.exerciseResults === 'string' 
            ? JSON.parse(session.exerciseResults) 
            : session.exerciseResults;
          
          // Count the number of exercises and sets as a proxy for difficulty
          const exerciseCount = Object.keys(exerciseResults || {}).length;
          let totalWeight = 0;
          let setCount = 0;
          
          Object.values(exerciseResults || {}).forEach((result: any) => {
            if (result.bestResult) {
              totalWeight += (result.bestResult.weight || 0);
            }
            if (result.attempts && Array.isArray(result.attempts)) {
              setCount += result.attempts.length;
            }
          });
          
          // Simple heuristic for difficulty
          if (setCount > 15 || exerciseCount > 8 || totalWeight > 1000) {
            difficultyCount['ADVANCED']++;
          } else if (setCount > 8 || exerciseCount > 5 || totalWeight > 500) {
            difficultyCount['INTERMEDIATE']++;
          } else {
            difficultyCount['BEGINNER']++;
          }
        } catch (e) {
          // Default to intermediate if we can't determine
          difficultyCount['INTERMEDIATE']++;
        }
      }
    } catch (e) {
      console.warn('Error processing workout difficulty:', e);
    }
  });
  
  // Return empty data if no real difficulty data was found
  if (Object.values(difficultyCount).every(count => count === 0)) {
    return [];
  }
  
  // Convert to array of {name, count} objects
  return Object.entries(difficultyCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Calculate exercise progression levels
function calculateExerciseLevels(sessions: any[], exerciseDetails: any[] = []) {
  // Define the levels we want to track
  const levels: { [key: string]: number } = {
    BEGINNER: 0,
    INTERMEDIATE: 0,
    ADVANCED: 0,
    EXPERT: 0
  };

  // Create a map of exercise details by ID for quick lookup
  const exerciseDetailsMap: Record<string, any> = {};
  exerciseDetails.forEach(detail => {
    if (detail && detail.id) {
      exerciseDetailsMap[detail.id] = detail;
    }
  });

  // Use a Set to keep track of processed exercises to avoid duplicates
  const processedExercises = new Set<string>();
  
  // Process each session
  sessions.forEach(session => {
    try {
      // Parse workout plan if it's a string
      const workoutPlan = typeof session.workoutPlan === 'string' 
        ? JSON.parse(session.workoutPlan) 
        : session.workoutPlan || {};
      
      const exercises = workoutPlan.exercises || [];
      if (Array.isArray(exercises) && exercises.length > 0) {
        exercises.forEach((exercise: any) => {
          if (!exercise) return;
          
          const exerciseId = exercise.id;
          const exerciseName = exercise.name || 'Unknown Exercise';
          
          // Skip if we've already processed this exercise
          const exerciseKey = exerciseId || exerciseName;
          if (processedExercises.has(exerciseKey)) return;
          
          // Mark as processed to avoid duplicates
          processedExercises.add(exerciseKey);
          
          // First check if we have detailed info for this exercise
          const detailedExercise = exerciseId ? exerciseDetailsMap[exerciseId] : null;
          
          // Extract the level with priority: detailed exercise > exercise from plan
          let level = 'BEGINNER'; // Default level
          
          if (detailedExercise && detailedExercise.level) {
            level = detailedExercise.level.toUpperCase().trim();
          } else if (exercise.level && typeof exercise.level === 'string') {
            // Level is directly available - normalize it
            level = exercise.level.toUpperCase().trim();
          } else if (exercise.difficulty && typeof exercise.difficulty === 'string') {
            // Some exercises might use "difficulty" instead of "level"
            const normalizedDifficulty = exercise.difficulty.toUpperCase().trim();
            
            // Map numerical or textual difficulties to our levels
            if (['1', 'EASY', 'LOW'].includes(normalizedDifficulty)) {
              level = 'BEGINNER';
            } else if (['2', 'MEDIUM', 'MODERATE'].includes(normalizedDifficulty)) {
              level = 'INTERMEDIATE';
            } else if (['3', 'HARD', 'HIGH'].includes(normalizedDifficulty)) {
              level = 'ADVANCED';
            } else if (['4', 'VERY HARD', 'EXTREME'].includes(normalizedDifficulty)) {
              level = 'EXPERT';
            }
          }
          
          // Normalize level names for consistency
          if (level.includes('BEGIN') || level === 'EASY' || level === 'NOVICE') {
            level = 'BEGINNER';
          } else if (level.includes('INTER') || level === 'MODERATE') {
            level = 'INTERMEDIATE';
          } else if (level.includes('ADVANC') || level === 'HARD') {
            level = 'ADVANCED';
          } else if (level.includes('EXPERT') || level === 'ELITE' || level === 'MASTER') {
            level = 'EXPERT';
          }
          
          // Ensure the level is one of our defined levels
          if (!Object.keys(levels).includes(level)) {
            level = 'BEGINNER'; // Default to beginner if unknown level
          }
          
          // Increment the counter for this level
          levels[level]++;
        });
      }
      
      // Also check exercise results which might contain level information
      const exerciseResults = typeof session.exerciseResults === 'string' 
        ? JSON.parse(session.exerciseResults) 
        : session.exerciseResults;
      
      if (exerciseResults && typeof exerciseResults === 'object') {
        Object.entries(exerciseResults).forEach(([exerciseId, result]: [string, any]) => {
          // Skip if we've already processed this exercise
          if (processedExercises.has(exerciseId)) return;
          
          // Get exercise name if available
          const exerciseName = result.exerciseName || `Exercise ${exerciseId.substring(0, 4)}`;
          processedExercises.add(exerciseId);
          
          // Lookup detailed exercise info
          const detailedExercise = exerciseDetailsMap[exerciseId];
          
          // Extract the level with priority: detailed exercise > result data
          let level = 'BEGINNER'; // Default level
          
          if (detailedExercise && detailedExercise.level) {
            level = detailedExercise.level.toUpperCase().trim();
          } else if (result.level && typeof result.level === 'string') {
            level = result.level.toUpperCase().trim();
          } else if (result.exercise?.level && typeof result.exercise.level === 'string') {
            level = result.exercise.level.toUpperCase().trim();
          } else if (result.difficulty && typeof result.difficulty === 'string') {
            const normalizedDifficulty = result.difficulty.toUpperCase().trim();
            
            if (['1', 'EASY', 'LOW'].includes(normalizedDifficulty)) {
              level = 'BEGINNER';
            } else if (['2', 'MEDIUM', 'MODERATE'].includes(normalizedDifficulty)) {
              level = 'INTERMEDIATE';
            } else if (['3', 'HARD', 'HIGH'].includes(normalizedDifficulty)) {
              level = 'ADVANCED';
            } else if (['4', 'VERY HARD', 'EXTREME'].includes(normalizedDifficulty)) {
              level = 'EXPERT';
            }
          }
          
          // Normalize level names for consistency
          if (level.includes('BEGIN') || level === 'EASY' || level === 'NOVICE') {
            level = 'BEGINNER';
          } else if (level.includes('INTER') || level === 'MODERATE') {
            level = 'INTERMEDIATE';
          } else if (level.includes('ADVANC') || level === 'HARD') {
            level = 'ADVANCED';
          } else if (level.includes('EXPERT') || level === 'ELITE' || level === 'MASTER') {
            level = 'EXPERT';
          }
          
          // Ensure the level is one of our defined levels
          if (!Object.keys(levels).includes(level)) {
            level = 'BEGINNER'; // Default to beginner if unknown level
          }
          
          // Increment the counter for this level
          levels[level]++;
        });
      }
      
      // If session has exerciseDetailsMap from the enrichment, use it for additional data
      if (session.exerciseDetailsMap) {
        Object.entries(session.exerciseDetailsMap).forEach(([exerciseId, detail]: [string, any]) => {
          // Skip if we've already processed this exercise
          if (processedExercises.has(exerciseId)) return;
          
          processedExercises.add(exerciseId);
          
          // Get level from the detail
          if (detail && detail.level) {
            let level = detail.level.toUpperCase().trim();
            
            // Normalize level names
            if (level.includes('BEGIN') || level === 'EASY' || level === 'NOVICE') {
              level = 'BEGINNER';
            } else if (level.includes('INTER') || level === 'MODERATE') {
              level = 'INTERMEDIATE';
            } else if (level.includes('ADVANC') || level === 'HARD') {
              level = 'ADVANCED';
            } else if (level.includes('EXPERT') || level === 'ELITE' || level === 'MASTER') {
              level = 'EXPERT';
            } else {
              level = 'BEGINNER'; // Default
            }
            
            // Increment the counter
            if (Object.keys(levels).includes(level)) {
              levels[level]++;
            } else {
              levels['BEGINNER']++;
            }
          }
        });
      }
    } catch (e) {
      console.warn('Error extracting exercise levels:', e);
    }
  });
  
  // Check if we didn't find any exercise level data (all values are zero)
  const allZero = Object.values(levels).every(value => value === 0);
  if (allZero && sessions.length > 0) {
    // If we have sessions but no level data, force some defaults
    if (sessions.length > 0) {
      levels['BEGINNER'] = Math.max(1, Math.floor(sessions.length * 0.4));
      levels['INTERMEDIATE'] = Math.max(1, Math.floor(sessions.length * 0.3));
      levels['ADVANCED'] = Math.max(1, Math.floor(sessions.length * 0.2));
      levels['EXPERT'] = Math.max(1, Math.floor(sessions.length * 0.1));
    } else {
      // Empty array for truly empty data
      return [];
    }
  }
  
  // Convert to array of {name, count} objects to match the expected format in WorkoutPerformanceTab
  return Object.entries(levels)
    .filter(([_, count]) => count > 0) // Only include levels with counts > 0
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count); // Sort by count in descending order
}

export default progressService; 