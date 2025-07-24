import api from './api';
import { WorkoutSession, WorkoutPlan } from '../types/workout';
import { ExerciseLog } from '../types/exercise';
import { ActiveSession } from '../types/dashboard';
import axios from 'axios';

interface SessionFilters {
  status?: string;
  startDateMin?: string;
  startDateMax?: string;
  limit?: number;
  offset?: number;
  _timestamp?: number;
}

interface RecordExerciseParams {
  repetitions?: number;
  duration?: number;
  formScore: number;
  weight?: number;
  resistance?: number;
  notes?: string;
  setNumber: number;
}

interface SessionResponse {
  data: WorkoutSession;
}

interface SessionsListResponse {
  data: WorkoutSession[];
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}

interface ExercisesResponse {
  data: {
    planned: any[];
    actual: any[];
    progress: number;
  };
}

interface SummaryResponse {
  data: any;
}

// Metrics tracking wrapper
const trackApiCall = (name: string, fn: Function) => {
  return async (...args: any[]) => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      console.debug(`API call to ${name} took ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`API call to ${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  };
};

const sessionService = {
  // Start a new workout session
  startSession: async (workoutPlanId: string | number): Promise<WorkoutSession> => {
    console.log(`Starting session with ID: ${workoutPlanId} (type: ${typeof workoutPlanId})`);
    try {
      // Send the raw workoutPlanId without converting it
      // Let the backend handle the type conversion as needed
      const { data } = await api.post<WorkoutSession>('/api/workout-sessions', { workoutPlanId });
      
      console.log(`Session started successfully with ID: ${data.id}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;
        
        console.error(`Failed to start session for workout plan ID ${workoutPlanId}: ${errorMessage} (${status})`);
        console.error('Error details:', error.response?.data);
        
        // Preserve the Axios error format for consistent error handling
        throw error;
      } else {
        // Handle non-Axios errors
        console.error(`Unexpected error starting session for workout plan ID ${workoutPlanId}:`, error);
        throw error;
      }
    }
  },

  // Get user's workout sessions with optional filtering
  getUserSessions: trackApiCall('getUserSessions', async (filters: SessionFilters = {}): Promise<{sessions: WorkoutSession[], total: number}> => {
    try {
      // Ensure we request workout plans and exercise data for proper exercise identification
      const requestFilters = {
        ...filters,
        includeWorkoutPlan: true,
        includeExerciseResults: true
      };
      
      const response = await api.get<SessionsListResponse>(`/api/workout-sessions`, { 
        params: requestFilters
      });
      
      // Return in the format expected by the progressService
      return {
        sessions: response.data.data || [],
        total: response.data.metadata?.total || 0
      };
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return { sessions: [], total: 0 };
    }
  }),

  // Get a specific workout session by ID
  getSessionById: trackApiCall('getSessionById', async (sessionId: string): Promise<WorkoutSession> => {
    const response = await api.get<SessionResponse>(`/api/workout-sessions/${sessionId}`);
    return response.data.data;
  }),

  // Get exercises for a session with completion status
  getSessionExercises: trackApiCall('getSessionExercises', async (sessionId: string) => {
    const response = await api.get<ExercisesResponse>(`/api/workout-sessions/${sessionId}/exercises`);
    return response.data.data;
  }),

  // Get session summary
  getSessionSummary: trackApiCall('getSessionSummary', async (sessionId: string) => {
    const response = await api.get<SummaryResponse>(`/api/workout-sessions/${sessionId}/summary`);
    return response.data.data;
  }),

  // Record completion of an exercise
  recordExerciseCompletion: trackApiCall('recordExerciseCompletion', async (
    sessionId: string, 
    exerciseId: string, 
    data: RecordExerciseParams
  ): Promise<WorkoutSession> => {
    const response = await api.post<SessionResponse>(
      `/api/workout-sessions/${sessionId}/exercises/${exerciseId}/complete`,
      data
    );
    return response.data.data;
  }),

  // Skip an exercise
  skipExercise: trackApiCall('skipExercise', async (
    sessionId: string, 
    exerciseId: string, 
    reason?: string
  ): Promise<WorkoutSession> => {
    const response = await api.post<SessionResponse>(
      `/api/workout-sessions/${sessionId}/exercises/${exerciseId}/skip`,
      { reason }
    );
    return response.data.data;
  }),

  // Pause a workout session
  pauseSession: trackApiCall('pauseSession', async (
    sessionId: string, 
    data?: { 
      duration?: number; 
      caloriesBurned?: number;
    }
  ): Promise<WorkoutSession> => {
    const response = await api.post<SessionResponse>(
      `/api/workout-sessions/${sessionId}/pause`, 
      data || {}
    );
    return response.data.data;
  }),

  // Resume a workout session
  resumeSession: trackApiCall('resumeSession', async (sessionId: string): Promise<WorkoutSession> => {
    try {
      console.log(`Attempting to resume session ${sessionId}`);
      
      if (!sessionId) {
        throw new Error('Cannot resume session: Session ID is empty or undefined');
      }
      
      // Make the API call to resume the session
      const response = await api.post<any>(`/api/workout-sessions/${sessionId}/resume`, {});
      console.log('Resume API response:', response.data);
      
      // Extract the session data from the response, handling different response formats
      let resumedSession: WorkoutSession | null = null;
      
      // Handle case 1: Direct session object (id, status, etc. directly in response data)
      if (response.data?.id && (typeof response.data.status === 'string')) {
        console.log('Resume API returned direct session object format');
        resumedSession = response.data;
      } 
      // Handle case 2: Nested session in data property
      else if (response.data?.data?.id && (typeof response.data.data.status === 'string')) {
        console.log('Resume API returned nested session object format');
        resumedSession = response.data.data;
      }
      // Handle case 3: Our updated backend format with both structures
      else if (response.data?.data?.id && response.data?.id) {
        console.log('Resume API returned combined format - using nested data property');
        resumedSession = response.data.data;
      }
      
      // If we couldn't extract session data using any known format, throw error
      if (!resumedSession) {
        console.error('Unknown response format:', response.data);
        throw new Error('Resume API returned unexpected response format');
      }
      
      // Log extracted session details for debugging
      console.log('Extracted session data:', {
        id: resumedSession.id,
        status: resumedSession.status,
        hasWorkoutPlan: !!resumedSession.workoutPlan
      });
      
      // If we got a session but it doesn't have the workout plan, try to fetch the complete session data
      if (!resumedSession.workoutPlan) {
        console.log(`Session missing workout plan data, fetching complete session data for ${sessionId}`);
        try {
          const detailedSession = await api.get<SessionResponse>(`/api/workout-sessions/${sessionId}`);
          console.log('Detailed session API response:', detailedSession.data);
          
          const sessionData = detailedSession.data.data || detailedSession.data;
          
          if (sessionData && sessionData.id) {
            console.log('Successfully fetched detailed session data with workout plan');
            return sessionData;
          }
        } catch (detailError) {
          console.warn('Could not fetch detailed session data, continuing with partial data', detailError);
        }
      }
      
      return resumedSession;
    } catch (error) {
      console.error('Resume session API call failed:', error);
      throw error;
    }
  }),

  // New function to save multiple exercise records at once (to be used when completing session)
  saveSessionExerciseResults: trackApiCall('saveSessionExerciseResults', async (
    sessionId: string,
    data: { exerciseResults: { [exerciseId: string]: any } }
  ): Promise<WorkoutSession> => {
    console.log('Sending exercise results to save:', JSON.stringify(data));
    const response = await api.post<SessionResponse>(
      `/api/workout-sessions/${sessionId}/exercise-results`,
      data
    );
    return response.data.data;
  }),

  // Complete a workout session
  completeSession: trackApiCall('completeSession', async (
    sessionId: string, 
    data?: { 
      duration?: number; 
      caloriesBurned?: number; 
      exerciseResults?: { [exerciseId: string]: any } 
    }
  ): Promise<WorkoutSession> => {
    const response = await api.post<SessionResponse>(
      `/api/workout-sessions/${sessionId}/complete`, 
      data || {}
    );
    return response.data.data;
  }),

  // Cancel a workout session
  cancelSession: trackApiCall('cancelSession', async (sessionId: string): Promise<WorkoutSession> => {
    const response = await api.post<SessionResponse>(`/api/workout-sessions/${sessionId}/cancel`, {});
    return response.data.data;
  }),

  /**
   * Get the user's active workout session (if any)
   * @returns Active session or null if none exists
   */
  getActiveSession: trackApiCall('getActiveSession', async (): Promise<ActiveSession | null> => {
    try {
      // First try to find a paused session since we want to prioritize resuming those
      const pausedResponse = await api.get<SessionsListResponse>('/api/workout-sessions?status=PAUSED&limit=1');
      
      if (pausedResponse.data.data && pausedResponse.data.data.length > 0) {
        const session = pausedResponse.data.data[0];
        
        // Ensure the workoutPlan is available before accessing properties
        if (!session.workoutPlan) {
          console.warn('Paused session missing workoutPlan data');
          // If missing workoutPlan data, try to fetch the session with more details
          try {
            const detailedSession = await sessionService.getSessionById(session.id);
            if (detailedSession.workoutPlan) {
              session.workoutPlan = detailedSession.workoutPlan;
            }
          } catch (err) {
            console.error('Failed to fetch detailed session data:', err);
          }
        }
        
        // Transform WorkoutSession into ActiveSession
        return {
          id: session.id,
          workoutId: session.workoutPlan?.id.toString() || '',
          workoutName: session.workoutPlan?.name || 'Workout Session',
          startTime: session.startTime?.toISOString() || new Date().toISOString(),
          lastActiveTime: session.updatedAt.toISOString(),
          status: session.status as "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED",
          currentExerciseIndex: session.exerciseSequence?.actualSequence?.length || 0,
          totalExercises: session.exerciseSequence?.originalPlan?.length || 0,
          completedExercises: session.exerciseSequence?.actualSequence?.length || 0,
          duration: session.totalDuration || 0,
          caloriesBurned: session.caloriesBurned || 0,
          workoutPlan: session.workoutPlan
        };
      }
      
      // If no paused session, then look for active sessions
      const activeResponse = await api.get<SessionsListResponse>('/api/workout-sessions?status=ACTIVE&limit=1');
      
      if (!activeResponse.data.data || activeResponse.data.data.length === 0) {
        return null;
      }
      
      const session = activeResponse.data.data[0];
      
      // Ensure the workoutPlan is available before accessing properties
      if (!session.workoutPlan) {
        console.warn('Active session missing workoutPlan data');
        // If missing workoutPlan data, try to fetch the session with more details
        try {
          const detailedSession = await sessionService.getSessionById(session.id);
          if (detailedSession.workoutPlan) {
            session.workoutPlan = detailedSession.workoutPlan;
          }
        } catch (err) {
          console.error('Failed to fetch detailed session data:', err);
        }
      }
      
      // Transform WorkoutSession into ActiveSession
      return {
        id: session.id,
        workoutId: session.workoutPlan?.id.toString() || '',
        workoutName: session.workoutPlan?.name || 'Workout Session',
        startTime: session.startTime?.toISOString() || new Date().toISOString(),
        lastActiveTime: session.updatedAt.toISOString(),
        status: session.status as "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED",
        currentExerciseIndex: session.exerciseSequence?.actualSequence?.length || 0,
        totalExercises: session.exerciseSequence?.originalPlan?.length || 0,
        completedExercises: session.exerciseSequence?.actualSequence?.length || 0,
        duration: session.totalDuration || 0,
        caloriesBurned: session.caloriesBurned || 0,
        workoutPlan: session.workoutPlan
      };
    } catch (error: any) {
      // Return null if no active session exists (404) or other errors
      console.error('Error fetching active session:', error);
      return null;
    }
  }),

  // Update session status
  updateSessionStatus: trackApiCall('updateSessionStatus', async (sessionId: string, status: string) => {
    const response = await api.patch(`/api/workout-sessions/${sessionId}/status`, { status });
    return response.data;
  }),

  // Complete exercise in session
  completeExercise: trackApiCall('completeExercise', async (sessionId: string, exerciseId: string, data: any) => {
    const response = await api.post(
      `/api/workout-sessions/${sessionId}/exercises/${exerciseId}/complete`, 
      data
    );
    return response.data;
  }),

  // Submit feedback for a completed session
  submitSessionFeedback: trackApiCall('submitSessionFeedback', async (sessionId: string, feedback: any) => {
    console.log('Submitting session feedback:', feedback, 'for session ID:', sessionId);
    const response = await api.post(`/api/workout-sessions/${sessionId}/feedback`, feedback);
    return response.data;
  }),

  // Simple update for userFeedback field
  updateSessionUserFeedback: trackApiCall('updateSessionUserFeedback', async (sessionId: string, userFeedback: string) => {
    console.log('Updating session user feedback:', userFeedback, 'for session ID:', sessionId);
    const response = await api.post(`/api/workout-sessions/${sessionId}/user-feedback`, { userFeedback });
    console.log('Session feedback update response:', response.data);
    return response.data;
  })
};

export default sessionService; 