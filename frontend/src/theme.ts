import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { 
  fadeIn, scaleIn, pulse, slideUp, shake, rotate, bounce, 
  gradientFlow, shimmer, float, wave, zoom, spin, fadeScale,
  slideFade, pop, ripple, glow, morph 
} from './styles/animations';

// Common theme options shared between light and dark modes
const getCommonThemeOptions = (): ThemeOptions => ({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.00833em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em',
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.0075em',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
      lineHeight: 1.5,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 20px',
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            animation: `${glow} 1.5s ease-in-out infinite`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '5px',
            height: '5px',
            background: 'rgba(255, 255, 255, 0.5)',
            opacity: '0',
            borderRadius: '100%',
            transform: 'scale(1, 1) translate(-50%)',
            transformOrigin: '50% 50%',
          },
          '&:focus:not(:active)::after': {
            animation: `${ripple} 1s ease-out`,
          },
        },
        contained: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          animation: `${fadeIn} 0.3s ease-in-out`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.1)',
            '& .MuiCardMedia-root': {
              transform: 'scale(1.05)',
            },
          },
        },
      },
    },
    MuiCardMedia: {
      styleOverrides: {
        root: {
          transition: 'transform 0.5s ease-in-out',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            animation: `${pop} 0.3s ease-in-out`,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            transform: 'translateX(4px)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
            animation: `${morph} 3s ease-in-out infinite`,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        },
        bar: {
          borderRadius: 8,
          animation: `${shimmer} 2s infinite linear`,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          position: 'relative',
          '&:hover': {
            textDecoration: 'underline',
            transform: 'translateY(-1px)',
            '&::after': {
              width: '100%',
              left: '0',
            },
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '0',
            height: '2px',
            bottom: '-2px',
            left: '50%',
            background: 'currentColor',
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
        root: {
          padding: '16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            animation: `${wave} 0.5s ease-in-out`,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          animation: `${scaleIn} 0.3s ease-in-out`,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          animation: `${shimmer} 2s infinite linear`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
            animation: `${spin} 0.5s ease-in-out`,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
            animation: `${float} 2s ease-in-out infinite`,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          animation: `${fadeScale} 0.2s ease-out`,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          animation: `${slideFade} 0.3s ease-out`,
        },
      },
    },
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
});

// Light mode palette
const getLightPalette = () => ({
  mode: 'light' as PaletteMode,
  primary: {
    main: '#3f51b5', // Indigo - energetic yet professional
    light: '#757de8',
    dark: '#002984',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff5722', // Deep orange - energetic, motivational
    light: '#ff8a50',
    dark: '#c41c00',
    contrastText: '#ffffff',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000',
  },
  info: {
    main: '#00b0ff',
    light: '#69e2ff',
    dark: '#0081cb',
    contrastText: '#ffffff',
  },
  success: {
    main: '#43a047',
    light: '#76d275',
    dark: '#00701a',
    contrastText: '#ffffff',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(0, 0, 0, 0.12)',
  },
});

// Dark mode palette
const getDarkPalette = () => ({
  mode: 'dark' as PaletteMode,
  primary: {
    main: '#5c6bc0', // Lighter indigo for dark mode
    light: '#8e99f3',
    dark: '#26418f',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff7043', // Lighter deep orange for dark mode
    light: '#ffa270',
    dark: '#c63f17',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef5350',
    light: '#ff867c',
    dark: '#b61827',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ffa726',
    light: '#ffd95b',
    dark: '#c77800',
    contrastText: '#000000',
  },
  info: {
    main: '#29b6f6',
    light: '#73e8ff',
    dark: '#0086c3',
    contrastText: '#ffffff',
  },
  success: {
    main: '#66bb6a',
    light: '#98ee99',
    dark: '#338a3e',
    contrastText: '#ffffff',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: 'rgba(255, 255, 255, 0.54)',
    hover: 'rgba(255, 255, 255, 0.04)',
    selected: 'rgba(255, 255, 255, 0.08)',
    disabled: 'rgba(255, 255, 255, 0.26)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(255, 255, 255, 0.12)',
  },
});

// Create theme based on mode
export const getTheme = (mode: PaletteMode = 'light') => {
  const commonOptions = getCommonThemeOptions();
  const palette = mode === 'light' ? getLightPalette() : getDarkPalette();

  return createTheme({
    ...commonOptions,
    palette,
    components: {
      ...commonOptions.components,
      MuiPaper: {
        ...commonOptions.components?.MuiPaper,
        styleOverrides: {
          ...commonOptions.components?.MuiPaper?.styleOverrides,
          root: Object.assign(
            {}, 
            commonOptions.components?.MuiPaper?.styleOverrides?.root || {},
            {
              backgroundImage: 'none',
              boxShadow: mode === 'light' 
                ? '0px 4px 12px rgba(0, 0, 0, 0.05)'
                : '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }
          ),
        },
      },
    },
  });
};

// Default theme (light mode)
export const theme = getTheme('light'); 