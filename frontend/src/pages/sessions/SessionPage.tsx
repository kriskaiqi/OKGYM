import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Button, 
  Paper, 
  Tabs, 
  Tab, 
  Grid,
  Card, 
  CardContent,
  CardActionArea,
  CardMedia,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Typography,
  LinearProgress,
  Pagination,
  IconButton,
  ButtonGroup,
  Stack
} from '@mui/material';
import { useParams, useNavigate, useLocation, useBeforeUnload } from 'react-router-dom';
import { workoutService, sessionService } from '../../services';
import { WorkoutPlan, WorkoutSession, SessionStatus } from '../../types/workout';
import SessionTracker, { NavigationGuard } from '../../components/workout/SessionTracker';
import SessionSummary from '../../components/workout/SessionSummary';
import { useSnackbar } from 'notistack';
import { 
  Add, 
  History, 
  Pause, 
  PlayArrow, 
  InfoOutlined, 
  Assignment,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useWorkoutSession } from '../../App';
import { PageContainer } from '../../components/layout';
import { 
  PageTitle, 
  BodyText, 
  SectionTitle, 
  SubsectionTitle 
} from '../../components/ui/Typography';
import axios, { AxiosError } from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`session-tabpanel-${index}`}
      aria-labelledby={`session-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Define an extended session interface that includes the exerciseData field
interface ExtendedWorkoutSession extends WorkoutSession {
  exerciseData?: {
    planned?: any[];
    actual?: any[];
    progress?: number;
  };
}

const SessionPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [completedSession, setCompletedSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalWorkoutPlans, setTotalWorkoutPlans] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const PLANS_PER_PAGE = 12;
  
  const isStartingSession = useRef(false);
  
  const sessionTrackerRef = useRef<{ getNavigationGuard: () => NavigationGuard }>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { setWorkoutActive, setActiveSessionId } = useWorkoutSession();
  
  // Add state for history view
  const [showAllHistory, setShowAllHistory] = useState(false);
  const SESSIONS_PER_PAGE = 120;
  
  // New state for summary tab
  const [summarySession, setSummarySession] = useState<ExtendedWorkoutSession | null>(null);
  const [summarySessionIndex, setSummarySessionIndex] = useState(0);
  const [completedSessions, setCompletedSessions] = useState<WorkoutSession[]>([]);
  
  // Add loading state for session summary
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  // Track previous tab value to detect navigation changes
  const prevTabValueRef = useRef<number>(-1);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const workoutId = params.get('workoutId');
    
    if (workoutId) {
      navigate(location.pathname, { replace: true });
      
      const fetchWorkoutDetails = async () => {
        try {
          setLoading(true);
          const workout = await workoutService.getWorkoutPlanById(Number(workoutId));
          if (workout) {
            setSelectedPlan(workout);
            setTabValue(1);
          }
        } catch (error) {
          console.error('Failed to fetch workout details:', error);
          enqueueSnackbar('Failed to load workout details', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      };
      
      fetchWorkoutDetails();
    }
  }, [location, navigate, enqueueSnackbar]);
  
  useEffect(() => {
    if (activeSession) {
      console.log('Active session state changed:', {
        id: activeSession.id,
        status: activeSession.status,
        workoutPlanId: activeSession.workoutPlan?.id
      });
    } else {
      console.log('Active session cleared');
    }
  }, [activeSession]);
  
  useEffect(() => {
    fetchWorkoutPlans();
    loadUserSessions();
  }, [currentPage]);
  
  useEffect(() => {
    if (!activeSession) {
      const checkForActiveSession = async () => {
        try {
          const existingSession = await sessionService.getActiveSession();
          if (existingSession && existingSession.id) {
            console.log('Found active session during check:', existingSession.id);
            setActiveSession(existingSession);
            
            if (tabValue === 0) {
              setTabValue(1);
            }
          }
        } catch (error) {
          console.log('No active sessions found during check');
        }
      };
      
      checkForActiveSession();
    }
  }, [activeSession, tabValue]);
  
  useEffect(() => {
    if (activeSession) {
      const isActive = activeSession.status === SessionStatus.ACTIVE || 
                      activeSession.status === SessionStatus.PAUSED;
      setIsSessionActive(isActive);
      setWorkoutActive(isActive);
      
      if (isActive) {
        setActiveSessionId(Number(activeSession.id));
      }
    } else {
      setIsSessionActive(false);
      setWorkoutActive(false);
      setActiveSessionId(null);
    }
  }, [activeSession, setWorkoutActive, setActiveSessionId]);
  
  useEffect(() => {
    if (recentSessions.length > 0) {
      // Filter only completed sessions with some form of valid data
      const completed = recentSessions
        .filter(s => s != null && s.status === SessionStatus.COMPLETED)
        // Sort by most recent first
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setCompletedSessions(completed);
      
      // Set the most recent completed session as default if we don't have one already set
      if (completed.length > 0 && !summarySession) {
        setSummarySession(completed[0]);
        setSummarySessionIndex(0);
      }
    }
  }, [recentSessions, summarySession]);
  
  useEffect(() => {
    if (completedSession && completedSession.id && hasValidSummaryData(completedSession)) {
      // Don't fetch data, just use the completed session as is
      setSummarySession(completedSession as ExtendedWorkoutSession);
      
      // Find the index of this session in the completedSessions array
      const index = completedSessions.filter(s => s != null).findIndex(s => s.id === completedSession.id);
      if (index >= 0) {
        setSummarySessionIndex(index);
      } else {
        // If not found, it's probably new, so it would be at index 0
        setSummarySessionIndex(0);
      }
    }
  }, [completedSession, completedSessions]);
  
  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true);
      const response = await workoutService.getWorkoutPlans({ 
        limit: PLANS_PER_PAGE, 
        page: currentPage 
      });
      
      if (response.data) {
        setWorkoutPlans(response.data);
        setTotalWorkoutPlans(response.total || 0);
        setTotalPages(Math.ceil((response.total || response.data.length) / PLANS_PER_PAGE));
      } else if (Array.isArray(response)) {
        setWorkoutPlans(response);
        setTotalWorkoutPlans(response.length);
        setTotalPages(Math.ceil(response.length / PLANS_PER_PAGE));
      }
      
      if (currentPage === 1) {
        setTotalPages(Math.max(2, totalPages));
      }
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      setError('Failed to load workout plans');
      enqueueSnackbar('Failed to load workout plans', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const loadUserSessions = async () => {
    try {
      setSessionsLoading(true);
      
      const activeSessions = await sessionService.getUserSessions({ 
        status: 'ACTIVE', 
        limit: showAllHistory ? 120 : SESSIONS_PER_PAGE // Changed from 100 to 120
      });
      
      const pausedSessions = await sessionService.getUserSessions({ 
        status: 'PAUSED', 
        limit: showAllHistory ? 120 : SESSIONS_PER_PAGE // Changed from 100 to 120
      });
      
      const completedSessions = await sessionService.getUserSessions({ 
        status: 'COMPLETED', 
        limit: showAllHistory ? 120 : SESSIONS_PER_PAGE // Changed from 100 to 120
      });
      
      const allSessions = [
        ...activeSessions.sessions,
        ...pausedSessions.sessions,
        ...completedSessions.sessions,
      ];
      
      allSessions.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setRecentSessions(allSessions);
      
      const hasActiveOrPaused = activeSessions.sessions.length > 0 || pausedSessions.sessions.length > 0;
      
      if (hasActiveOrPaused && tabValue === 0) {
        setTabValue(1);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (tabValue === 1 && newValue === 0 && isSessionActive) {
      if (sessionTrackerRef.current && SessionTracker.navigationGuard) {
        const guardInstance = sessionTrackerRef.current.getNavigationGuard();
        const navigationAllowed = guardInstance.handleNavigation(() => {
          setTabValue(newValue);
        });
        
        if (!navigationAllowed) {
          return;
        }
      }
    }
    
    setTabValue(newValue);
  };
  
  const handlePlanSelect = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setTabValue(1);
  };
  
  const handleStartSession = async () => {
    if (!selectedPlan && !isStartingSession.current) {
      try {
        const existingSession = await sessionService.getActiveSession();
        if (existingSession) {
          setActiveSession(existingSession);
          enqueueSnackbar('Resuming existing workout session', { variant: 'info' });
          return;
        }
      } catch (checkError) {
        console.error('Error checking for active session:', checkError);
      }
    }
    
    if (!selectedPlan || isStartingSession.current) {
      console.log('Session start prevented - already processing or no plan selected');
      return;
    }
    
    try {
      isStartingSession.current = true;
      setLoading(true);
      setError(null);
      
      setCompletedSession(null);
      
      let existingSession;
      try {
        existingSession = await sessionService.getActiveSession();
      } catch (checkError) {
        console.error('Error checking for active session:', checkError);
      }
      
      if (existingSession) {
        console.log('Found existing session:', existingSession.id);
        setActiveSession(existingSession);
        enqueueSnackbar('Resuming existing workout session', { variant: 'info' });
        return;
      }
      
      console.log('Starting new session for plan:', selectedPlan.id);
      
      let retryCount = 0;
      let session = null;
      
      while (retryCount < 3 && !session) {
        try {
          session = await sessionService.startSession(selectedPlan.id);
          
          if (!session || !session.id) {
            throw new Error('Failed to create session - invalid response');
          }
          
          break;
        } catch (startError) {
          console.error(`Error starting session (attempt ${retryCount + 1}):`, startError);
          retryCount++;
          
          if (retryCount >= 3) {
            throw startError;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setActiveSession(session);
      await loadUserSessions();
      
      enqueueSnackbar('Workout session started successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error starting session:', error);
      setError('Failed to start workout session. Please try again.');
      enqueueSnackbar('Failed to start workout session', { variant: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        isStartingSession.current = false;
      }, 1000);
    }
  };
  
  const handleSessionComplete = useCallback((session: WorkoutSession) => {
    console.log('Session completed. Clearing active session state.');
    
    // Clear all session state
    setActiveSession(null);
    setCompletedSession(session);
    setIsSessionActive(false);
    setWorkoutActive(false);
    setActiveSessionId(null);
    
    // Just switch to the summary tab when a session is completed
    setTabValue(3); // The summary tab
  }, [setActiveSessionId, setWorkoutActive]);
  
  const handleSessionCancel = useCallback(async (pausedSession?: WorkoutSession) => {
    setActiveSession(null);
    setIsSessionActive(false);
    
    if (!pausedSession) {
      setWorkoutActive(false);
      setActiveSessionId(null);
    }
    
    // If a paused session was provided, update the UI immediately
    if (pausedSession && pausedSession.status === SessionStatus.PAUSED) {
      enqueueSnackbar('Session paused. You can resume it later.', { variant: 'info' });
      
      // Update recentSessions array with the paused session
      setRecentSessions(prev => {
        // Find if this session already exists in the array
        const sessionIndex = prev.findIndex(s => s.id === pausedSession.id);
        if (sessionIndex >= 0) {
          // Replace the existing session with the updated one
          const newSessions = [...prev];
          newSessions[sessionIndex] = pausedSession;
          return newSessions;
        }
        // Add the paused session to the beginning of the array
        return [pausedSession, ...prev];
      });
      
      // Reload the sessions to ensure we have the latest data
      await loadUserSessions();
      
      // DO NOT switch to the overview tab - stay on the current tab
      // and let the UI update to show the resume view
      
      return;
    }
    
    // Regular cancellation (not a pause)
    try {
      await loadUserSessions();
      enqueueSnackbar('Session cancelled', { variant: 'info' });
    } catch (error) {
      console.error('Error handling session cancellation:', error);
      enqueueSnackbar('Failed to update session status', { variant: 'error' });
    } finally {
      setTabValue(0); // Go back to workout selection tab
    }
  }, [enqueueSnackbar, loadUserSessions, setActiveSessionId, setWorkoutActive]);
  
  const handleWorkoutPlanDetails = (planId: string | number) => {
    navigate(`/workout-plans/${planId}`);
  };
  
  const formatSessionDate = (date: Date): string => {
    return format(new Date(date), 'MMM d, yyyy · h:mm a');
  };
  
  // Add a function to handle resuming sessions
  const handleResumeSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Find the paused session
      const pausedSessions = recentSessions.filter(s => s != null && s.status === SessionStatus.PAUSED);
      
      if (!pausedSessions || pausedSessions.length === 0) {
        throw new Error('No paused session found');
      }
      
      const pausedSession = pausedSessions[0]; // Take the first one
      
      console.log('Found paused session in recent sessions:', pausedSession.id);
      
      // Clear any existing state to prevent conflicts
      setActiveSession(null);
      setIsSessionActive(false);
      setWorkoutActive(false);
      setActiveSessionId(null);
      
      // Resume the paused session
      try {
        console.log('Resuming session:', pausedSession.id);
        const resumedSession = await sessionService.resumeSession(pausedSession.id);
        
        if (!resumedSession) {
          throw new Error('Resume API returned empty session data');
        }
        
        console.log('Session resumed successfully:', resumedSession.id);
        
        // Now that backend has updated the session status, we need to get a fresh list of sessions
        await loadUserSessions();
          
        // Update recent sessions list to reflect the new status
        setRecentSessions(prevSessions => 
          prevSessions.map(s => 
            s.id === pausedSession.id ? {...s, status: SessionStatus.ACTIVE} : s
          )
        );
        
        // Update the global workout state
        setWorkoutActive(true);
        setActiveSessionId(parseInt(pausedSession.id));
        
        // First update the UI to show the session tab
        setTabValue(1);
        
        // Now set the active session (this will trigger the SessionTracker component)
        setActiveSession(resumedSession);
        setIsSessionActive(true);
        
        // Show success message
        enqueueSnackbar('Session resumed successfully', { variant: 'success' });
      } catch (error) {
        console.error('Error resuming session:', error);
        
        // Show a specific error message
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const errorMessage = error.response?.data?.message || error.message;
          
          if (status === 400) {
            enqueueSnackbar(`Cannot resume session: ${errorMessage}`, { variant: 'warning' });
          } else if (status === 404) {
            enqueueSnackbar('Session not found', { variant: 'error' });
          } else {
            enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
          }
        } else {
          enqueueSnackbar(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { variant: 'error' });
        }
        
        // Since resume failed, refresh the session list to show current state
        loadUserSessions();
        
        // Rethrow to be caught by outer catch
        throw error;
      }
    } catch (error) {
      // This outer catch block handles any errors in the overall process
      console.error('Resume session failed:', error);
      
      // Clean up any partial state
      setActiveSession(null);
      setIsSessionActive(false);
      setWorkoutActive(false);
      setActiveSessionId(null);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDuration = (totalSeconds: number): string => {
    if (!totalSeconds && totalSeconds !== 0) return 'N/A';
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes === 0) {
      return `${seconds} sec`;
    }
    
    return seconds > 0 ? `${minutes} min ${seconds} sec` : `${minutes} min`;
  };
  
  // Add protection against browser navigation
  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (isSessionActive) {
          const message = "You have an active workout session. Are you sure you want to leave?";
          event.preventDefault();
          event.returnValue = message;
          return message;
        }
      },
      [isSessionActive]
    )
  );
  
  // Add protection against route changes
  useEffect(() => {
    const handleBeforeNavigate = (e: PopStateEvent) => {
      if (isSessionActive) {
        // If a user clicks the back button while a session is active
        if (sessionTrackerRef.current && SessionTracker.navigationGuard) {
          // Show our custom confirmation dialog
          const shouldProceed = window.confirm(
            "You have an active workout session. Navigating away will pause your workout. Continue?"
          );
          
          if (!shouldProceed) {
            // Prevent navigation
            e.preventDefault();
            // Push the current page again to neutralize the back button press
            window.history.pushState(null, '', window.location.pathname);
          } else {
            // User confirmed, so we should pause the session before they leave
            if (activeSession?.status === SessionStatus.ACTIVE) {
              sessionService.pauseSession(activeSession.id)
                .then(() => {
                  enqueueSnackbar('Your workout has been paused', { variant: 'info' });
                })
                .catch((err) => {
                  console.error('Failed to pause session:', err);
                });
            }
          }
        }
      }
    };

    // Listen for popstate event (browser back/forward buttons)
    window.addEventListener('popstate', handleBeforeNavigate);
    
    return () => {
      window.removeEventListener('popstate', handleBeforeNavigate);
    };
  }, [isSessionActive, activeSession, enqueueSnackbar]);
  
  // Add pagination handler
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Add a function to handle "Show All" button click
  const handleShowAllSessions = () => {
    setShowAllHistory(true);
    loadUserSessions();
  };
  
  // Modify the fetchCompleteSessionData function to use the extended interface and correctly process data
  const fetchCompleteSessionData = async (sessionId: string): Promise<ExtendedWorkoutSession | null> => {
    try {
      console.log(`Fetching complete data for session ${sessionId}`);
      
      // Get the detailed session data
      const sessionResponse = await sessionService.getSessionById(sessionId);
      
      // Check if we got a valid session response
      if (!sessionResponse) {
        console.error('Received empty session response');
        return null;
      }
      
      // Cast to extended session type
      const session = sessionResponse as ExtendedWorkoutSession;
      
      // Log the raw session data to debug
      console.log('Raw session data:', session);
      
      // If session already has exerciseResults, we don't need to fetch more data in some cases
      if (session.exerciseResults && Object.keys(session.exerciseResults).length > 0) {
        console.log('Session already has exercise results:', Object.keys(session.exerciseResults).length);
      }
      
      // Get the session summary data if needed
      if (!session.summary || !session.summary.formScore) {
        try {
          const summaryData = await sessionService.getSessionSummary(sessionId);
          if (summaryData) {
            console.log('Summary data retrieved:', summaryData);
            session.summary = {
              ...session.summary || {},
              ...summaryData
            };
          }
        } catch (summaryError) {
          console.warn('Failed to fetch summary data:', summaryError);
        }
      }
      
      // Get exercise data if needed
      if (!session.exerciseData) {
        try {
          const exerciseData = await sessionService.getSessionExercises(sessionId);
          if (exerciseData) {
            console.log('Exercise data retrieved:', exerciseData);
            session.exerciseData = exerciseData;
            
            // If we have exercises in the sequence but no names, try to enhance them
            if (session.exerciseSequence && session.exerciseSequence.originalPlan) {
              // Additional processing to extract names and details if needed
            }
          }
        } catch (exerciseError) {
          console.warn('Failed to fetch exercise data:', exerciseError);
        }
      }
      
      // Ensure exerciseResults exists to prevent errors
      if (!session.exerciseResults) {
        session.exerciseResults = {};
      }
      
      console.log('Complete session data:', session);
      return session;
    } catch (error) {
      console.error(`Error fetching session data for ${sessionId}:`, error);
      return null;
    }
  };
  
  // Add new function to handle session selection for summary view
  const handleSelectSession = async (session: WorkoutSession, index: number) => {
    setSummaryLoading(true);
    
    try {
      // First check if session is valid
      if (!session || !session.id) {
        console.error("Invalid session selected", session);
        enqueueSnackbar("Invalid session selected", { variant: "error" });
        setSummaryLoading(false);
        return;
      }
      
      console.log("Selecting session:", session.id);
      
      // Skip the data fetching and just use the session as is for safety
      setSummarySession(session as ExtendedWorkoutSession);
      setSummarySessionIndex(index);
    } catch (error) {
      console.error('Error selecting session:', error);
    } finally {
      setSummaryLoading(false);
    }
  };
  
  // Update navigation functions for summary sessions
  const handleNextSummary = async () => {
    const validSessions = completedSessions.filter(s => s != null);
    if (summarySessionIndex < validSessions.length - 1) {
      const newIndex = summarySessionIndex + 1;
      try {
        const nextSession = validSessions[newIndex];
        if (nextSession && nextSession.id) {
          await handleSelectSession(nextSession, newIndex);
        }
      } catch (error) {
        console.error("Error navigating to next session:", error);
        enqueueSnackbar("Error loading session details", { variant: "error" });
      }
    }
  };
  
  const handlePreviousSummary = async () => {
    const validSessions = completedSessions.filter(s => s != null);
    if (summarySessionIndex > 0) {
      const newIndex = summarySessionIndex - 1;
      try {
        const prevSession = validSessions[newIndex];
        if (prevSession && prevSession.id) {
          await handleSelectSession(prevSession, newIndex);
        }
      } catch (error) {
        console.error("Error navigating to previous session:", error);
        enqueueSnackbar("Error loading session details", { variant: "error" });
      }
    }
  };
  
  // Effect to load the initial summary session with complete data
  useEffect(() => {
    if (completedSessions.length > 0 && !summarySession) {
      handleSelectSession(completedSessions[0], 0);
    }
  }, [completedSessions, summarySession]);
  
  // Add a helper function to check if session has valid summary data
  const hasValidSummaryData = (session: WorkoutSession | null): boolean => {
    if (!session || !session.id) return false;
    return session.status === SessionStatus.COMPLETED && 
           session.workoutPlan != null && 
           (session.summary != null || session.caloriesBurned != null);
  };
  
  // Refresh data when navigating to summary tab, but only once
  useEffect(() => {
    // Only refresh when switching TO the summary tab
    if (tabValue === 3 && prevTabValueRef.current !== 3) {
      loadUserSessions();
    }
    
    // Update previous tab value
    prevTabValueRef.current = tabValue;
  }, [tabValue, loadUserSessions]);
  
  return (
    <PageContainer>
      <Box sx={{ width: '100%', pb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="session tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab 
            label="Sessions Overview" 
            id="session-tab-0"
            aria-controls="session-tabpanel-0"
            disabled={isSessionActive}
          />
          <Tab 
            label={activeSession ? "Current Session" : "Start Session"} 
            id="session-tab-1"
            aria-controls="session-tabpanel-1"
          />
          <Tab 
            label="History" 
            id="session-tab-2"
            aria-controls="session-tabpanel-2"
            disabled={isSessionActive}
          />
          <Tab 
            label="Session Summaries" 
            id="session-tab-3"
            aria-controls="session-tabpanel-3"
            disabled={isSessionActive}
            icon={<Assignment fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : (
            <Box p={3}>
              <SectionTitle gutterBottom>
                Select a Workout Plan
              </SectionTitle>
              
              <Grid container spacing={3}>
                {workoutPlans && workoutPlans.map((plan) => (
                  <Grid item xs={12} sm={6} md={4} key={plan?.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        transition: '0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => plan && handlePlanSelect(plan)}
                    >
                      <CardActionArea>
                        {plan?.imageUrl && (
                          <CardMedia
                            component="img"
                            height="140"
                            image={plan.imageUrl}
                            alt={plan.name || 'Workout'}
                          />
                        )}
                        <CardContent>
                          <SubsectionTitle gutterBottom>
                            {plan?.name || 'Unnamed Workout'}
                          </SubsectionTitle>
                          <BodyText color="text.secondary" noWrap>
                            {plan?.description || 'No description available'}
                          </BodyText>
                          <Box mt={2} display="flex" justifyContent="space-between">
                            <Chip 
                              size="small" 
                              label={`${plan?.exercises?.length || 0} exercises`} 
                              color="primary" 
                              variant="outlined" 
                            />
                            <Chip 
                              size="small" 
                              label={`${plan?.estimatedDuration || 0} min`} 
                              color="secondary" 
                              variant="outlined" 
                            />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
                
                {(!workoutPlans || workoutPlans.length === 0) && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      No workout plans available. Create a workout plan first!
                    </Alert>
                  </Grid>
                )}
              </Grid>
              
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination 
                  count={totalPages || 2} 
                  page={currentPage} 
                  onChange={handlePageChange} 
                  color="primary" 
                  shape="rounded"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                      fontWeight: 500,
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading session...
              </Typography>
            </Box>
          ) : activeSession ? (
            // If we have an active session, show the session tracker
            activeSession.workoutPlan ? (
              <SessionTracker 
                key={`session-${activeSession.id}`}
                workoutPlanId={activeSession.workoutPlan.id}
                existingSession={activeSession}
                onComplete={handleSessionComplete}
                onCancel={handleSessionCancel}
                onSessionActiveChange={setIsSessionActive}
                ref={sessionTrackerRef}
              />
            ) : (
              <Box p={3} textAlign="center">
                <SectionTitle color="error" gutterBottom>
                  Error: Session data is incomplete
                </SectionTitle>
                <BodyText color="text.secondary" paragraph>
                  The workout plan information is missing. Please try again.
                </BodyText>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleSessionCancel()}
                >
                  Back to Workouts
                </Button>
              </Box>
            )
          ) : completedSession ? (
            // If we have a completed session, show the summary
            <Box mt={3}>
              <SessionSummary session={completedSession} />
              <Box mt={3} display="flex" justifyContent="center">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setTabValue(0)}
                  sx={{ mr: 2 }}
                >
                  New Workout
                </Button>
              </Box>
            </Box>
          ) : recentSessions.filter(s => s != null && s.status === SessionStatus.PAUSED).length > 0 ? (
            // Only show the resume paused workout view if we don't have an active session
            <Box p={3}>
              <SectionTitle gutterBottom>
                Resume Paused Workout
              </SectionTitle>
              
              {recentSessions
                .filter(s => s != null && s.status === SessionStatus.PAUSED)
                .slice(0, 1) // Only show the most recent paused session
                .map(session => (
                  <Paper 
                    key={session.id}
                    sx={{ 
                      p: 4, 
                      mb: 3, 
                      borderLeft: '4px solid', 
                      borderColor: 'info.main',
                      backgroundColor: 'background.paper',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: '8px'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" fontWeight="600">
                        {session.workoutPlan?.name || 'Workout Session'}
                      </Typography>
                      <Chip 
                        label="PAUSED" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    
                    <Typography variant="body1" color="text.secondary" mb={3}>
                      {session.workoutPlan?.description || 'No description available'}
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Started
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {session.startTime ? 
                              formatSessionDate(new Date(session.startTime.toString()))
                              : 'Unknown'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Duration
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {formatDuration(session.totalDuration || 0)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Calories Burned
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {session.caloriesBurned || 0}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Progress
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {session.exerciseResults ? Object.keys(session.exerciseResults).length : 0} of {session.exerciseSequence?.originalPlan?.length || 0} exercises
                        </Typography>
                        <Typography variant="body2">
                          {session.exerciseSequence?.originalPlan?.length 
                            ? Math.round((Object.keys(session.exerciseResults || {}).length / session.exerciseSequence.originalPlan.length) * 100) 
                            : 0}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={session.exerciseSequence?.originalPlan?.length 
                          ? (Object.keys(session.exerciseResults || {}).length / session.exerciseSequence.originalPlan.length) * 100
                          : 0} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box mt={2} display="flex" justifyContent="center">
                      <Button 
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={loading ? null : <PlayArrow />}
                        onClick={() => {
                          setLoading(true);
                          enqueueSnackbar('Resuming session...', { variant: 'info' });
                          handleResumeSession();
                        }}
                        disabled={loading}
                        sx={{ 
                          px: 5, 
                          py: 1.5,
                          fontSize: '1.1rem',
                          borderRadius: '8px', 
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                          '&:hover': { 
                            boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                            transform: 'translateY(-2px)' 
                          },
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
                        }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Resume Workout'}
                      </Button>
                    </Box>
                  </Paper>
                ))}
            </Box>
          ) : selectedPlan ? (
            <Box p={3}>
              <SectionTitle gutterBottom>
                Start a New Session
              </SectionTitle>
              
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <SubsectionTitle gutterBottom>
                  {selectedPlan.name}
                </SubsectionTitle>
                
                <BodyText paragraph>
                  {selectedPlan.description}
                </BodyText>
                
                <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                  <Chip 
                    label={`Difficulty: ${selectedPlan.difficulty}`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`${selectedPlan.estimatedDuration} minutes`} 
                    color="secondary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`${selectedPlan.exercises.length} exercises`} 
                    color="info" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`Category: ${selectedPlan.workoutCategory}`} 
                    color="default" 
                    variant="outlined" 
                  />
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box display="flex" justifyContent="space-between">
                  <Button 
                    variant="outlined" 
                    onClick={() => handleWorkoutPlanDetails(selectedPlan.id)}
                  >
                    View Plan Details
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleStartSession}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Start Workout Session'
                    )}
                  </Button>
                </Box>
              </Paper>
            </Box>
          ) : (
              <Box p={3} textAlign="center">
                <Alert 
                severity="info" 
                  icon={<InfoOutlined />}
                sx={{ mb: 2, backgroundColor: 'rgba(3, 169, 244, 0.1)' }}
                >
                  No workout session available.
                </Alert>
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => setTabValue(0)}
                sx={{ mt: 3 }}
                >
                  Select Workout
                </Button>
              </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {sessionsLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : recentSessions.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {recentSessions.filter(session => session != null).map((session) => (
                  <Grid item xs={12} sm={6} md={4} key={session.id}>
                    <Card variant="outlined" sx={{ 
                      borderRadius: 2, 
                      transition: '0.3s', 
                      '&:hover': { 
                        transform: 'translateY(-8px)', 
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <Box 
                        sx={{ 
                          height: '6px', 
                          width: '100%', 
                          bgcolor: session.status === SessionStatus.COMPLETED ? 'success.main' :
                            session.status === SessionStatus.ACTIVE ? 'warning.main' :
                            session.status === SessionStatus.CANCELLED ? 'error.main' : 'grey.400'
                        }} 
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <BodyText variant="h6" sx={{ fontWeight: 600 }}>
                            {session.workoutPlan?.name || 'Unnamed Workout'}
                          </BodyText>
                          <Chip 
                            size="small" 
                            label={session.status} 
                            color={
                              session.status === SessionStatus.COMPLETED ? 'success' :
                              session.status === SessionStatus.ACTIVE ? 'warning' :
                              session.status === SessionStatus.CANCELLED ? 'error' : 'default'
                            }
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                        
                        <BodyText variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                          {session.startTime && formatSessionDate(new Date(session.startTime.toString()))}
                        </BodyText>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <BodyText variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Duration
                            </BodyText>
                            <BodyText variant="body1" fontWeight="600">
                              {session.totalDuration || (session.summary?.totalDuration) ? 
                                formatDuration(session.totalDuration || session.summary?.totalDuration || 0) : 
                                'N/A'}
                            </BodyText>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <BodyText variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Calories
                            </BodyText>
                            <BodyText variant="body1" fontWeight="600">
                              {session.caloriesBurned || session.summary?.caloriesBurned || 'N/A'}
                            </BodyText>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Add Show More button */}
              {!showAllHistory && recentSessions.length >= SESSIONS_PER_PAGE && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleShowAllSessions}
                    disabled={sessionsLoading}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    {sessionsLoading ? <CircularProgress size={24} /> : 'Show All Sessions'}
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info">
              You haven't completed any workout sessions yet. Start a new session to track your progress!
            </Alert>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          {sessionsLoading || summaryLoading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading session data...
              </Typography>
            </Box>
          ) : completedSessions.length > 0 && summarySession ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <SectionTitle>
                  Session Summary
                </SectionTitle>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {summarySessionIndex + 1} of {completedSessions.length}
                  </Typography>
                  
                  <ButtonGroup variant="outlined" size="small">
                    <IconButton 
                      onClick={handlePreviousSummary}
                      disabled={summarySessionIndex === 0 || summaryLoading}
                      color="primary"
                    >
                      <NavigateBefore />
                    </IconButton>
                    <IconButton 
                      onClick={handleNextSummary}
                      disabled={summarySessionIndex === completedSessions.length - 1 || summaryLoading}
                      color="primary"
                    >
                      <NavigateNext />
                    </IconButton>
                  </ButtonGroup>
                </Stack>
              </Box>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 0, 
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 3
                }}
              >
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h6" fontWeight={600}>
                    {summarySession.workoutPlan?.name || 'Workout Session'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {summarySession.startTime && formatSessionDate(new Date(summarySession.startTime.toString()))}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  <SessionSummary 
                    session={summarySession}
                    key={`summary-${summarySession.id}`} // Add key to force re-render when switching
                  />
                </Box>
              </Paper>
              
              <Box display="flex" justifyContent="center" mt={4}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setTabValue(0)}
                  sx={{ mx: 1 }}
                >
                  New Workout
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={() => setTabValue(2)}
                  sx={{ mx: 1 }}
                >
                  View All History
                </Button>
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              You haven't completed any workout sessions yet. Start a workout to see summaries here!
            </Alert>
          )}
        </TabPanel>
      </Box>
    </PageContainer>
  );
};

export default SessionPage; 