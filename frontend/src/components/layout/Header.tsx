import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Badge, 
  Avatar, 
  Menu, 
  MenuItem,
  Chip,
  alpha,
  useTheme,
  Divider,
  useScrollTrigger
} from '@mui/material';
import { SafeNavigationLink } from '../common';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkoutSession } from '../../App';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  navItems: Array<{ name: string; icon: React.ReactNode; path: string }>;
  onDrawerToggle: () => void;
  isMobile: boolean;
  handleUserMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  userMenuAnchorEl: null | HTMLElement;
  handleUserMenuClose: () => void;
  handleLogout: () => void;
  getUserInitials: () => string;
}

const Header: React.FC<HeaderProps> = ({
  navItems,
  onDrawerToggle,
  isMobile,
  handleUserMenuOpen,
  userMenuAnchorEl,
  handleUserMenuClose,
  handleLogout,
  getUserInitials
}) => {
  const { user } = useAuth();
  const { isWorkoutActive } = useWorkoutSession();
  const theme = useTheme();
  const location = useLocation();
  
  // Add scroll trigger to change header appearance on scroll
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50
  });

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: scrollTrigger ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
        backgroundImage: 'none',
        backgroundColor: 'transparent',
        backdropFilter: 'blur(10px)',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(to right, ${alpha(theme.palette.background.default, scrollTrigger ? 0.97 : 0.85)}, ${alpha(theme.palette.background.default, scrollTrigger ? 0.98 : 0.95)})`
          : `linear-gradient(to right, ${alpha(theme.palette.primary.main, scrollTrigger ? 0.97 : 0.85)}, ${alpha(theme.palette.primary.dark, scrollTrigger ? 0.98 : 0.95)})`,
        borderBottom: `1px solid ${alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.05 : 0.1)}`,
        transition: 'all 0.3s ease-in-out',
        height: scrollTrigger ? { xs: 58, sm: 64 } : { xs: 64, sm: 70 },
        borderRadius: '0 0 0 0',
        marginLeft: 0,
        marginRight: 0,
        width: '100%',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '5%',
          right: '5%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.7)}, transparent)`,
        },
      }}
      elevation={0}
    >
      <Toolbar sx={{ 
        minHeight: scrollTrigger ? { xs: 58, sm: 64 } : { xs: 64, sm: 70 }, 
        px: { xs: 2, sm: 4 },
        transition: 'all 0.3s ease',
      }}>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ 
              mr: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                backgroundColor: alpha(theme.palette.common.white, 0.15)
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <SafeNavigationLink 
          to="/dashboard" 
          style={{ 
            textDecoration: 'none', 
            color: 'inherit', 
            display: 'flex' 
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.2)
                : alpha(theme.palette.common.white, 0.15),
              borderRadius: '8px',
              px: 1.5,
              py: 0.5,
              transition: 'all 0.3s ease',
              mr: 2,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                background: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.background.paper, 0.3)
                  : alpha(theme.palette.common.white, 0.25),
                transform: 'translateY(-2px)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                opacity: 0.8,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                opacity: 0.8,
              }
          }}
        >
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
                background: `linear-gradient(45deg, ${theme.palette.common.white}, ${alpha(theme.palette.common.white, 0.7)})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  letterSpacing: '.25rem',
                },
                '&::before': {
                  content: '"O"',
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  transform: 'translateY(-50%)',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  opacity: 0.9,
                  fontSize: '1.2em',
                  filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
                }
              }}
          >
              <span style={{ opacity: 0 }}>O</span>KGYM
          </Typography>
          </Box>
        </SafeNavigationLink>

        <Box sx={{ flexGrow: 1 }} />

        {isWorkoutActive && (
          <Chip
            icon={<PlayCircleOutlineIcon />}
            label="Active Workout"
            color="warning"
            size="small"
            sx={{ 
              mr: 2,
              py: 0.6,
              fontWeight: 500,
              animation: 'pulse 2s infinite',
              boxShadow: `0 0 10px ${alpha(theme.palette.warning.main, 0.4)}`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.5)}`,
              '@keyframes pulse': {
                '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0.4)}` },
                '70%': { boxShadow: `0 0 0 10px ${alpha(theme.palette.warning.main, 0)}` },
                '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0)}` }
              }
            }}
          />
        )}

        {!isMobile && (
          <Box 
            sx={{ 
              display: 'flex',
              background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.15)
                : alpha(theme.palette.common.white, 0.1),
              borderRadius: '10px',
              px: 1,
              mx: 1,
            }}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              
              return (
              <SafeNavigationLink 
                key={item.name}
                to={item.path}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Button
                  color="inherit"
                  sx={{ 
                    px: 2,
                    py: 1,
                    mx: 0.5,
                    position: 'relative',
                    fontSize: '0.9rem',
                      fontWeight: isActive ? 600 : 500,
                    textTransform: 'none',
                      transition: 'all 0.2s ease',
                      borderRadius: '8px',
                      color: isActive ? 'white' : alpha(theme.palette.common.white, 0.9),
                      backgroundColor: isActive ? alpha(theme.palette.common.white, 0.1) : 'transparent',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, isActive ? 0.15 : 0.1),
                        transform: 'translateY(-2px)'
                      },
                  }}
                >
                    <Box sx={{ 
                      position: 'relative', 
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}>
                      <Typography component="span" sx={{ zIndex: 2 }}>
                  {item.name}
                      </Typography>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -5,
                          left: '50%',
                          width: isActive ? '100%' : '0%',
                          height: '2px',
                          backgroundColor: theme.palette.common.white,
                          transition: 'all 0.3s ease',
                          transform: 'translateX(-50%)',
                          opacity: isActive ? 1 : 0,
                          zIndex: 1,
                        }}
                      />
                    </Box>
                  {isWorkoutActive && item.path === '/sessions' && (
                    <Box
                      component="span"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 6,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'error.main',
                          boxShadow: '0 0 0 2px #fff',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.4)' },
                            '70%': { boxShadow: '0 0 0 6px rgba(255, 0, 0, 0)' },
                            '100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' }
                          },
                          zIndex: 3
                      }}
                    />
                  )}
                </Button>
              </SafeNavigationLink>
              );
            })}
          </Box>
        )}

        <Box 
          sx={{ 
            ml: 2, 
            display: 'flex', 
            alignItems: 'center',
            background: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.15)
              : alpha(theme.palette.common.white, 0.1),
            borderRadius: '10px',
            px: 1,
          }}
        >
          <IconButton 
            color="inherit" 
            aria-label="notifications"
            sx={{ 
              ml: 0.5,
              bgcolor: isWorkoutActive ? alpha(theme.palette.common.white, 0.1) : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.2),
                transform: 'scale(1.05)'
              }
            }}
          >
            <Badge 
              badgeContent={isWorkoutActive ? 1 : 0} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  animation: isWorkoutActive ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.4)' },
                    '70%': { boxShadow: '0 0 0 6px rgba(255, 0, 0, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' }
                  }
                }
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <ThemeToggle 
            sx={{ 
              ml: 1,
              p: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05) rotate(5deg)'
              }
            }} 
          />
          
          <Box sx={{ ml: 0.5, mr: 0.5, height: '30px', width: '1px', bgcolor: alpha(theme.palette.common.white, 0.2) }} />
          
          <IconButton
            onClick={handleUserMenuOpen}
            size="small"
            aria-label="account"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            sx={{ 
              ml: 0.5,
              border: `2px solid ${alpha(theme.palette.common.white, 0.5)}`,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.1),
                transform: 'scale(1.05)',
                border: `2px solid ${alpha(theme.palette.common.white, 0.8)}`,
                boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`
              }
            }}
          >
            <Avatar
              alt={user?.firstName || 'User'}
              src={user?.profilePicture || ''}
              sx={{
                width: 34,
                height: 34,
                bgcolor: !user?.profilePicture ? 'secondary.main' : undefined,
                transition: 'all 0.3s ease'
              }}
            >
              {!user?.profilePicture && getUserInitials()}
            </Avatar>
          </IconButton>
          <KeyboardArrowDownIcon 
            fontSize="small" 
            sx={{ 
              ml: 0.5, 
              opacity: 0.7,
              transition: 'all 0.2s',
              transform: Boolean(userMenuAnchorEl) ? 'rotate(180deg)' : 'rotate(0deg)'
            }} 
          />
          
          <Menu
            id="menu-appbar"
            anchorEl={userMenuAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
            sx={{
              mt: 1,
              '& .MuiPaper-root': {
                borderRadius: '0 0 12px 12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                minWidth: 200,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                overflow: 'visible',
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
                  borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                },
              }
            }}
          >
            <Box 
              sx={{ 
                px: 2, 
                py: 1.5, 
                display: 'flex', 
                alignItems: 'center',
                background: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.dark, 0.05)
                  : alpha(theme.palette.primary.light, 0.05),
              }}
            >
              <Avatar
                alt={user?.firstName || 'User'}
                src={user?.profilePicture || ''}
                sx={{
                  width: 40,
                  height: 40,
                  mr: 1.5,
                  bgcolor: !user?.profilePicture ? 'secondary.main' : undefined,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                {!user?.profilePicture && getUserInitials()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" noWrap fontWeight="600">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ 
              my: 0.5, 
              opacity: 0.6,
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.7)}, transparent)`
            }} />
            <MenuItem 
              onClick={handleUserMenuClose} 
              sx={{ 
                py: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  pl: 2
                }
              }}
            >
              <SafeNavigationLink 
                to="/profile" 
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <AccountCircleIcon sx={{ mr: 1.5, fontSize: '1.25rem', color: theme.palette.primary.main }} />
                <Typography variant="body2">Profile</Typography>
              </SafeNavigationLink>
            </MenuItem>
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                py: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.05),
                  pl: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <LogoutIcon sx={{ mr: 1.5, fontSize: '1.25rem', color: theme.palette.error.main }} />
                <Typography variant="body2">Logout</Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 