import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Toolbar,
  Paper,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  useTheme as useMuiTheme
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useAuth } from '../contexts/AuthContext';
import { useWorkoutSession } from '../App';
import { Header, Sidebar } from '../components/layout';
import { SafeNavigationLink, WorkoutSessionNotifications } from '../components/common';

// Navigation items
const navItems = [
  { name: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { name: 'Workouts', icon: <FitnessCenterIcon />, path: '/workout-plans' },
  { name: 'Sessions', icon: <DirectionsRunIcon />, path: '/sessions' },
  { name: 'Exercises', icon: <DirectionsRunIcon />, path: '/exercises' },
  { name: 'Progress', icon: <BarChartIcon />, path: '/progress' },
  { name: 'Achievements', icon: <EmojiEventsIcon />, path: '/achievements' },
  { name: 'Real Time Detection', icon: <VideocamIcon />, path: '/real-time-detection' },
  { name: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

// Admin nav items
const adminNavItems = [
  { name: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin' },
  { name: 'AI Testing', icon: <AdminPanelSettingsIcon />, path: '/ai-testing' },
];

const drawerWidth = 240;

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const muiTheme = useMuiTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: authLogout, loading: authLoading } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isWorkoutActive, confirmNavigation } = useWorkoutSession();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Set bottom nav value based on current path
  useEffect(() => {
    const index = navItems.findIndex(item => location.pathname.startsWith(item.path));
    if (index !== -1) {
      setBottomNavValue(index);
    }
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    // If workout is active, confirm before navigating
    if (isWorkoutActive && !location.pathname.startsWith(path)) {
      confirmNavigation(() => {
        navigate(path);
        if (isMobile) {
          setDrawerOpen(false);
        }
      });
    } else {
      // No active workout, navigate directly
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
      }
    }
  };

  const handleLogout = () => {
    // If there's an active workout, confirm before logging out
    if (isWorkoutActive) {
      const shouldLogout = window.confirm(
        "You have an active workout session. Logging out will cause you to lose your current session progress. Are you sure?"
      );
      if (!shouldLogout) {
        return;
      }
    }
    
    authLogout();
    handleUserMenuClose();
    navigate('/login');
  };

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };

  // Get user role display string
  const getUserRoleDisplay = () => {
    if (!user) return 'User';
    return user.role === 'ADMIN' ? 'Administrator' : 'Fitness Enthusiast';
  };

  return (
    <Box sx={{ 
              display: 'flex',
      minHeight: '100vh', 
      backgroundColor: theme.palette.mode === 'dark' 
        ? muiTheme.palette.background.default 
        : '#f5f7fa'
    }}>
      {/* Notification handler for workout sessions */}
      <WorkoutSessionNotifications />
      
      {/* Header */}
      <Header 
        navItems={navItems}
        onDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
        handleUserMenuOpen={handleUserMenuOpen}
        userMenuAnchorEl={userMenuAnchorEl}
        handleUserMenuClose={handleUserMenuClose}
        handleLogout={handleLogout}
        getUserInitials={getUserInitials}
      />
      
      {/* Sidebar */}
      <Sidebar 
        drawerWidth={drawerWidth}
        mobileOpen={drawerOpen}
        onDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
        navItems={navItems}
        adminNavItems={adminNavItems}
        getUserInitials={getUserInitials}
        getUserDisplayName={getUserDisplayName}
        getUserRoleDisplay={getUserRoleDisplay}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          ml: { xs: 0, md: `${drawerWidth}px` }, // Add left margin on desktop to prevent overlap
          transition: 'margin 0.2s ease-out',
        }}
      >
        {/* Spacer that matches header height */}
        <Box sx={{ height: { xs: 64, sm: 70 } }} />
        
        {/* Main content area */}
        <Box 
          sx={{ 
            flexGrow: 1,
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 3 },
            pb: isMobile ? 8 : 3, // Add extra padding at bottom for mobile nav
            maxWidth: '1600px',
            width: '100%',
            mx: 'auto', // Center content horizontally
          }}
        >
          <Outlet />
        </Box>
      </Box>
      
      {/* Bottom navigation for mobile */}
      {isMobile && (
        <Paper 
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            borderRadius: 0,
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              setBottomNavValue(newValue);
              // Only show main navigation items in bottom nav
              const mobileNavItems = navItems.filter(item => 
                !['/settings'].includes(item.path)
              );
              const path = mobileNavItems[newValue].path;
              
              // Check if there's an active workout before navigation
              if (isWorkoutActive && !location.pathname.startsWith(path)) {
                confirmNavigation(() => {
                  navigate(path);
                });
              } else {
                navigate(path);
              }
            }}
            showLabels
            sx={{ 
              height: 64, 
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '6px 0',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                }
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                '&.Mui-selected': {
                  fontSize: '0.7rem',
                }
              },
            }}
          >
            {/* Only render main navigation items in the bottom navigation */}
            {navItems
              .filter(item => !['/settings'].includes(item.path))
              .map((item) => (
                <BottomNavigationAction 
                  key={item.name}
                  label={item.name} 
                  icon={item.icon} 
                />
              ))
            }
            {/* Add profile link to bottom nav */}
            <BottomNavigationAction
              label="Profile"
              icon={<AccountCircleIcon />}
              onClick={() => navigate('/profile')}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default MainLayout; 