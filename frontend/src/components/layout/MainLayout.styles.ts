import { 
  styled, 
  alpha, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Box, 
  Typography, 
  ListItemButton,
  Badge
} from '@mui/material';
import { ListItemButtonProps } from '@mui/material/ListItemButton';
import { 
  fadeIn, scaleIn, pulse, slideUp, 
  pop, ripple, gradientFlow, glow,
  slideIn
} from '../../styles/animations';

const drawerWidth = 240;

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backdropFilter: 'blur(16px)',
  backgroundColor: alpha(theme.palette.background.default, 0.7),
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  animation: `${fadeIn} 0.5s ease-out`,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.7,
    animation: `${gradientFlow} 3s ease infinite`,
  },
}));

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    borderRight: 'none',
    boxShadow: '2px 0 20px rgba(0,0,0,0.07)',
    animation: `${slideIn} 0.5s ease-out`,
    backgroundImage: theme.palette.mode === 'light' 
      ? `linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) 100%), 
         url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${theme.palette.primary.main.slice(1)}' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`
      : `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%), 
         url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${theme.palette.primary.main.slice(1)}' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  },
  '& .MuiListItemButton-root': {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: `${fadeIn} 0.5s ease-out`,
    '&:nth-of-type(2)': { animationDelay: '0.05s' },
    '&:nth-of-type(3)': { animationDelay: '0.1s' },
    '&:nth-of-type(4)': { animationDelay: '0.15s' },
    '&:nth-of-type(5)': { animationDelay: '0.2s' },
    '&:nth-of-type(6)': { animationDelay: '0.25s' },
    '&:nth-of-type(7)': { animationDelay: '0.3s' },
  },
}));

export const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  height: 64,
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
  },
}));

export const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: -0.5,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  animation: `${fadeIn} 0.8s ease-out`,
  transition: 'all 0.3s ease-out',
  '&:hover': {
    transform: 'scale(1.05)',
    letterSpacing: -0.3,
  },
  '& img': {
    height: 32,
    marginRight: theme.spacing(1),
    transition: 'all 0.3s ease-in-out',
    filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))',
    '&:hover': {
      transform: 'rotate(10deg) scale(1.1)',
      filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.4))',
    },
  }
}));

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  height: 64,
  padding: theme.spacing(0, 2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 3),
  },
  '& > *': {
    animation: `${fadeIn} 0.5s ease-out`,
  },
}));

export const NavSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& > *:not(:first-child)': {
    marginLeft: theme.spacing(0.5),
  },
}));

export const SearchButton = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(1, 2),
  background: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  color: theme.palette.text.secondary,
  textTransform: 'none',
  minWidth: 230,
  justifyContent: 'flex-start',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.5s ease-out`,
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
    transition: 'all 0.3s ease-in-out',
  },
  '&:hover .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
    transform: 'scale(1.1) rotate(-5deg)',
  }
}));

export const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

export const NavItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => 
    prop !== 'component' && 
    prop !== 'to' && 
    prop !== 'href'
})<ListItemButtonProps>(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  margin: theme.spacing(0.6, 1),
  marginBottom: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      transform: 'scale(1.1)',
      animation: `${pulse} 2s ease-in-out infinite`,
    },
    '& .MuiListItemText-primary': {
      fontWeight: 600,
      color: theme.palette.primary.main,
      transform: 'translateX(4px)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      animation: `${gradientFlow} 3s ease infinite`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 60%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
      zIndex: -1,
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    transform: 'translateX(4px)',
    '& .MuiListItemIcon-root': {
      transform: 'scale(1.1)',
      animation: `${pop} 0.3s ease-in-out`,
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.text.primary,
      transform: 'translateX(4px)',
    },
  },
  '&:active': {
    transform: 'translateX(2px) scale(0.98)',
  },
}));

export const ContentContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
  overflow: 'auto',
  minHeight: '100vh',
  animation: `${fadeIn} 0.5s ease-out`,
}));

export const ProfileButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius * 3,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-2px)',
  },
  '& .MuiAvatar-root': {
    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    transition: 'all 0.3s ease-in-out',
    boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
    '&:hover': {
      borderColor: theme.palette.primary.main,
      transform: 'scale(1.1) rotate(5deg)',
      animation: `${glow} 1.5s ease-in-out infinite`,
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
}));

export const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    animation: `${pulse} 2s ease-in-out infinite`,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
  '&:hover': {
    '& > *': {
      animation: `${pop} 0.4s ease-in-out`,
    },
  },
}));

export const SidebarDivider = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  height: '1px',
  background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.5)}, transparent)`,
}));

export const MenuSection = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  marginBottom: theme.spacing(1),
  '& .MuiTypography-root': {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 600,
    color: alpha(theme.palette.text.secondary, 0.7),
    marginBottom: theme.spacing(1),
  },
})); 