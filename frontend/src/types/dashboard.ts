import { WorkoutPlan } from './workout';
import { Exercise } from './exercise';

/**
 * Dashboard data structure returned from the backend
 */
export interface DashboardData {
  recentWorkouts: WorkoutPlan[];
  recommendedWorkouts: WorkoutPlan[];
  userProgress: UserProgressData;
  recentActivity: UserActivityItem[];
}

/**
 * User progress metrics
 */
export interface UserProgressData {
  metrics: UserProgressMetric[];
  // Additional aggregated data as needed
}

/**
 * Individual progress metric
 */
export interface UserProgressMetric {
  id: string;
  metricName: string;
  date: string;
  value: number;
  unit: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  type: string;
  previousValue?: number;
  percentChange?: number;
}

/**
 * User activity item
 */
export interface UserActivityItem {
  id: string;
  type: string;
  timestamp: string;
  details?: {
    entityId?: string;
    entityType?: string;
    action?: string;
    result?: string;
    duration?: number;
    searchQuery?: string;
  };
}

/**
 * User session data
 */
export interface ActiveSession {
  id: string;
  workoutId: string;
  workoutName: string;
  startTime: string;
  lastActiveTime: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  currentExerciseIndex: number;
  totalExercises: number;
  completedExercises: number;
  duration: number;
  caloriesBurned: number;
  workoutPlan?: any;
}