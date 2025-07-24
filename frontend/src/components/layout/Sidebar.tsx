import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Skeleton,
  ListItemButton,
  alpha,
  useTheme,
  Badge,
  ListItemProps
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { SafeNavigationLink } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/user';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isMobile: boolean;
  navItems: Array<{ name: string; icon: React.ReactNode; path: string }>;
  adminNavItems: Array<{ name: string; icon: React.ReactNode; path: string }>;
  getUserInitials: () => string;
  getUserDisplayName: () => string;
  getUserRoleDisplay: () => string;
}

const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  mobileOpen,
  onDrawerToggle,
  isMobile,
  navItems,
  adminNavItems,
  getUserInitials,
  getUserDisplayName,
  getUserRoleDisplay
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Check if user is admin, using multiple sources for reliability
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const theme = useTheme();

  // Handle profile navigation
  const handleProfileClick = () => {
    if (location.pathname !== '/profile') {
      // Close drawer on mobile if needed
      if (isMobile) {
        onDrawerToggle();
      }
      // Navigate to profile using React Router
      navigate('/profile');
    }
  };

  const drawer = (
    <Box 
      sx={{ 
        width: drawerWidth, 
        overflowX: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.7)}, ${alpha(theme.palette.background.paper, 0.9)})`
          : `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 1)})`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '1px',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(to bottom, ${alpha(theme.palette.divider, 0.1)}, ${alpha(theme.palette.divider, 0.2)}, ${alpha(theme.palette.divider, 0.1)})`
            : `linear-gradient(to bottom, ${alpha(theme.palette.divider, 0.05)}, ${alpha(theme.palette.divider, 0.15)}, ${alpha(theme.palette.divider, 0.05)})`,
        }
      }}
    >
      <Box sx={{ height: { xs: 64, sm: 70 } }} /> {/* Spacer for header */}
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 3.5,
          px: 2,
          mx: 2,
          my: 2,
          bgcolor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.primary.dark, 0.2)
            : alpha(theme.palette.primary.light, 0.15),
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          borderRadius: '12px',
          boxShadow: theme.palette.mode === 'dark'
            ? `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`
            : `0 4px 12px ${alpha(theme.palette.primary.light, 0.15)}`,
          border: `1px solid ${
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.dark, 0.2)
              : alpha(theme.palette.primary.light, 0.2)
          }`,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.primary.dark, 0.25)
              : alpha(theme.palette.primary.light, 0.25),
            transform: 'scale(1.02)'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.6)}, transparent)`,
          }
        }}
        onClick={handleProfileClick}
      >
        {authLoading ? (
          <>
            <Skeleton variant="circular" width={70} height={70} sx={{ mb: 1.5 }} />
            <Skeleton variant="text" width="60%" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" />
          </>
        ) : (
          <>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxShadow: '0 0 0 2px rgba(0,0,0,0.05)'
                  }}
                />
              }
            >
              <Avatar
                alt={getUserDisplayName()}
                src={user?.profilePicture || ''}
                sx={{ 
                  width: 70, 
                  height: 70, 
                  mb: 1.5,
                  bgcolor: !user?.profilePicture ? 'secondary.main' : undefined,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                  border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(3deg)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    border: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                  }
                }}
              >
                {!user?.profilePicture && getUserInitials()}
              </Avatar>
            </Badge>
            <Typography 
              variant="h6" 
              noWrap 
              fontWeight="600"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {getUserDisplayName()}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.text.primary, 0.7) 
                  : alpha(theme.palette.text.secondary, 0.9),
                mt: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '4px',
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.3)
                  : alpha(theme.palette.background.paper, 0.5),
                fontSize: '0.75rem',
                letterSpacing: '0.03em'
              }}
            >
              {getUserRoleDisplay()}
            </Typography>
          </>
        )}
      </Box>
      
      <Box
        sx={{
          mx: 2,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.5)}, transparent)`
        }}
      />
      
      <Box 
        sx={{ 
          pt: 2, 
          flexGrow: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.primary.main, 0.2),
            borderRadius: '3px',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.3),
            }
          }
        }}
      >
        <List component="nav" sx={{ pt: 1, pb: 1 }}>
          {navItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <ListItem 
                key={item.name} 
                disablePadding 
                sx={{ 
                  mb: 0.75,
                  opacity: 1,
                  transform: 'translateX(0)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  animation: `fadeInLeft 0.3s ease both`,
                  animationDelay: `${index * 0.05 + 0.1}s`,
                  '@keyframes fadeInLeft': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateX(-20px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateX(0)'
                    }
                  }
                }}
              >
                <SafeNavigationLink
                  to={item.path}
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    display: 'block',
                    width: '100%'
                  }}
                  onNavigate={isMobile ? onDrawerToggle : undefined}
                >
                  <ListItemButton 
                    selected={isActive}
                    sx={{
                      py: 1.2,
                      px: 2.5,
                      mx: 1.5,
                      borderRadius: '10px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.primary.main, 0.2)
                          : alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.primary.main, 0.25)
                            : alpha(theme.palette.primary.main, 0.15),
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          borderRadius: '0 4px 4px 0',
                          opacity: 1,
                          transform: 'translateX(0)'
                        }
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.primary.main, 0.05),
                        transform: 'translateX(4px)'
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: '0 4px 4px 0',
                        opacity: 0,
                        transform: 'translateX(-4px)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 40, 
                        color: isActive ? 'primary.main' : 'inherit',
                        transition: 'transform 0.2s ease',
                        transform: isActive ? 'scale(1.2)' : 'scale(1)',
                        filter: isActive ? 'drop-shadow(0 0 1px rgba(0,0,0,0.1))' : 'none'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.name} 
                      primaryTypographyProps={{ 
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.95rem',
                        letterSpacing: isActive ? '0.02em' : 'normal',
                        sx: { transition: 'all 0.2s ease' }
                      }}
                    />
                  </ListItemButton>
                </SafeNavigationLink>
              </ListItem>
            );
          })}
        </List>
        
        {isAdmin && (
          <>
            <Box
              sx={{
                mx: 3,
                my: 2,
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.5)}, transparent)`
              }}
            />
            
            <Box
              sx={{
                mx: 3,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  py: 0.5,
                  px: 1.5,
                  borderRadius: '4px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  fontSize: '0.7rem',
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.error.dark, 0.2)
                    : alpha(theme.palette.error.light, 0.2),
                  color: theme.palette.mode === 'dark'
                    ? theme.palette.error.light
                    : theme.palette.error.dark,
                  display: 'inline-block'
                }}
              >
                ADMIN
              </Typography>
            </Box>
            
            <List component="nav" dense sx={{ pt: 0.5, pb: 1 }}>
              {adminNavItems.map((item, index) => {
                const isActive = location.pathname.startsWith(item.path);
                
                return (
                  <ListItem 
                    key={item.name} 
                    disablePadding 
                    sx={{ 
                      mb: 0.75,
                      opacity: 1,
                      transform: 'translateX(0)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                      animation: `fadeInLeft 0.3s ease both`,
                      animationDelay: `${(index + navItems.length) * 0.05 + 0.1}s`,
                      '@keyframes fadeInLeft': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateX(-20px)'
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)'
                        }
                      }
                    }}
                  >
                    <SafeNavigationLink
                      to={item.path}
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        display: 'block',
                        width: '100%'
                      }}
                      onNavigate={isMobile ? onDrawerToggle : undefined}
                    >
                      <ListItemButton 
                        selected={isActive}
                        sx={{
                          py: 1.2,
                          px: 2.5,
                          mx: 1.5,
                          borderRadius: '10px',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? alpha(theme.palette.error.main, 0.15)
                              : alpha(theme.palette.error.main, 0.1),
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? alpha(theme.palette.error.main, 0.2)
                                : alpha(theme.palette.error.main, 0.15),
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '4px',
                              background: theme.palette.error.main,
                              borderRadius: '0 4px 4px 0',
                              opacity: 1,
                              transform: 'translateX(0)'
                            }
                          },
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? alpha(theme.palette.error.main, 0.1)
                              : alpha(theme.palette.error.main, 0.05),
                            transform: 'translateX(4px)'
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            background: theme.palette.error.main,
                            borderRadius: '0 4px 4px 0',
                            opacity: 0,
                            transform: 'translateX(-4px)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                        <ListItemIcon 
                          sx={{ 
                            minWidth: 40, 
                            color: isActive ? 'error.main' : alpha(theme.palette.error.main, 0.7),
                            transition: 'transform 0.2s ease',
                            transform: isActive ? 'scale(1.2)' : 'scale(1)'
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.name} 
                          primaryTypographyProps={{ 
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '0.95rem',
                            color: isActive ? 'error.main' : alpha(theme.palette.text.primary, 0.87),
                            letterSpacing: isActive ? '0.02em' : 'normal',
                            sx: { transition: 'all 0.2s ease' }
                          }}
                        />
                      </ListItemButton>
                    </SafeNavigationLink>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </Box>
      
      <Box
        sx={{
          p: 2.5,
          textAlign: 'center',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.4)
            : alpha(theme.palette.primary.light, 0.05),
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            letterSpacing: '0.03em',
            opacity: 0.7
          }}
        >
          OKGYM v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            boxShadow: '0 0 20px rgba(0,0,0,0.2)'
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          position: 'fixed',
          '& .MuiDrawer-paper': { 
            position: 'static',
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '2px 0 10px rgba(0,0,0,0.03)'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar; 