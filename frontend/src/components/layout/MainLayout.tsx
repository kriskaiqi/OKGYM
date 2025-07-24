import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Fade,
  ListItemButton,
  Button,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  FitnessCenter as WorkoutIcon,
  Timeline as ProgressIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  Help as HelpIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  Bookmark as BookmarkIcon,
  MenuBook as LibraryIcon,
  StarRate as FeaturedIcon,
  Explore as ExploreIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

import {
  StyledAppBar,
  StyledDrawer,
  LogoBox,
  Logo,
  StyledToolbar,
  NavSection,
  SearchButton,
  DrawerHeader,
  NavItem,
  ContentContainer,
  ProfileButton,
  StyledBadge,
  SidebarDivider,
  MenuSection
} from './MainLayout.styles';

const drawerWidth = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Workouts', icon: <WorkoutIcon />, path: '/workout-plans' },
    { text: 'Progress', icon: <ProgressIcon />, path: '/progress' },
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  const secondaryMenuItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help & Support', icon: <HelpIcon />, path: '/help' },
  ];

  const drawer = (
    <div>
      <LogoBox>
        <Logo variant="h6" noWrap>
          <motion.img 
            src="/assets/logo.svg" 
            alt="OKGYM"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "easeInOut", repeat: 0 }}
          />
          OKGYM
        </Logo>
      </LogoBox>
      
      <Box sx={{ p: 2, pt: 3 }}>
        <MenuSection>
          <Typography variant="body2">MAIN MENU</Typography>
        </MenuSection>
        
        <List>
          {menuItems.map((item, index) => (
            <NavItem
              key={item.text}
              selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
              onClick={() => {
                if (isMobile) {
                  setMobileOpen(false);
                }
                navigate(item.path);
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </NavItem>
          ))}
        </List>
        
        <SidebarDivider />
        
        <MenuSection>
          <Typography variant="body2">ACCOUNT</Typography>
        </MenuSection>
        
        <List>
          {secondaryMenuItems.map((item) => (
            <NavItem
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </NavItem>
          ))}
        </List>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: scrolled ? 3 : 1, 
          backdropFilter: 'blur(8px)',
          backgroundColor: theme.palette.mode === 'light' 
            ? (scrolled ? alpha(theme.palette.background.default, 0.95) : alpha(theme.palette.background.default, 0.9))
            : (scrolled ? alpha(theme.palette.background.default, 0.95) : alpha(theme.palette.background.default, 0.9))
        }}
      >
        <StyledToolbar>
          <NavSection>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {isMobile && (
              <Logo variant="h6" noWrap>
                OKGYM
              </Logo>
            )}
          </NavSection>
          
          <NavSection>
            <SearchButton sx={{ display: { xs: 'none', md: 'flex' } }}>
              <SearchIcon />
              Search exercises, workouts...
            </SearchButton>
          </NavSection>
          
          <NavSection>
            <Tooltip title="Notifications">
              <IconButton color="primary" size="large" sx={{ mr: { xs: 1, md: 2 } }}>
                <StyledBadge badgeContent={3} color="error" overlap="circular">
                  <NotificationsIcon />
                </StyledBadge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account settings">
              <ProfileButton onClick={handleMenuOpen}>
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: 'primary.main',
                    border: '2px solid white'
                  }}
                >
                  {user?.firstName?.[0] || 'U'}
                </Avatar>
              </ProfileButton>
            </Tooltip>
          </NavSection>
        </StyledToolbar>
      </StyledAppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <StyledDrawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
            }}
          >
            {drawer}
          </StyledDrawer>
        ) : (
          <StyledDrawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
            }}
            open
          >
            {drawer}
          </StyledDrawer>
        )}
      </Box>
      <ContentContainer
        sx={{
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Height of AppBar
          transition: theme.transitions.create('padding', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </ContentContainer>
      
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: 200,
            overflowY: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
          <ListItemIcon>
            <ProfileIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem component={Link} to="/favorites" onClick={handleMenuClose}>
          <ListItemIcon>
            <FavoriteIcon fontSize="small" />
          </ListItemIcon>
          Favorites
        </MenuItem>
        <MenuItem component={Link} to="/history" onClick={handleMenuClose}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          History
        </MenuItem>
        <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout; 