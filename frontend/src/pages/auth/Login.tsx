import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, 
  TextField, 
  Typography, 
  Container, 
  Alert, 
  Paper,
  InputAdornment,
  IconButton,
  styled,
  alpha,
  Zoom,
  Fade,
  Grid,
  Stack,
  Checkbox,
  FormControlLabel,
  Divider,
  useTheme,
  Card,
  CardMedia,
  InputBase,
  FormControl,
  InputLabel,
  Switch
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon, 
  Lock as LockIcon,
  FitnessCenter as FitnessCenterIcon,
  ErrorOutline as ErrorIcon,
  CheckCircleOutlined as CheckIcon
} from '@mui/icons-material';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

// Styled components
const LoginContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.primary.dark, 0.75)})`,
  padding: 0,
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/assets/images/gym-pattern-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.07,
    zIndex: 0,
  },
  '@keyframes gradientAnimation': {
    '0%': {
      backgroundPosition: '0% 50%'
    },
    '50%': {
      backgroundPosition: '100% 50%'
    },
    '100%': {
      backgroundPosition: '0% 50%'
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.dark, 0.3)}, 
      ${alpha(theme.palette.primary.main, 0.1)}, 
      ${alpha(theme.palette.secondary.dark, 0.2)})`,
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 15s ease infinite',
    zIndex: 0,
    opacity: 0.6,
  }
}));

const BrandColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
  height: '100%',
  padding: theme.spacing(6, 4),
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '10%',
    right: '-50px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.3)} 0%, rgba(255,255,255,0) 70%)`,
    zIndex: -1,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '15%',
    left: '-30px',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.25)} 0%, rgba(255,255,255,0) 70%)`,
    zIndex: -1,
  }
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(4, 6),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8)
    : theme.palette.background.paper,
  backdropFilter: 'blur(10px)',
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3, 4),
  }
}));

const StyledInput = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: 'relative',
  '& label': {
    color: alpha(theme.palette.text.primary, 0.6),
    fontSize: '0.875rem',
    fontWeight: 500,
    transform: 'none',
    position: 'relative',
    marginBottom: theme.spacing(0.8),
  },
  '& label.Mui-focused': {
    color: theme.palette.primary.main,
  },
  '& .MuiInputBase-root': {
    backgroundColor: alpha(theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.paper, 0.6),
    borderRadius: 12,
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    fontSize: '0.95rem',
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.2s ease',
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-error': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.error.main, 0.25)}`,
      borderColor: theme.palette.error.main,
    },
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    padding: 0,
  },
  '& .MuiInputAdornment-root': {
    marginRight: theme.spacing(1),
    '& .MuiSvgIcon-root': {
      fontSize: 20,
    }
  }
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '0.75rem',
  marginTop: theme.spacing(0.5),
  marginLeft: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(4),
  position: 'relative',
  padding: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: alpha(theme.palette.primary.main, 0.15),
    borderRadius: '12px',
    transform: 'rotate(-3deg)',
    zIndex: -1,
  },
  '& svg': {
    fontSize: 42,
    color: theme.palette.common.white,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
  }
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  width: '100%',
  margin: theme.spacing(3, 0),
  '&::before, &::after': {
    borderColor: alpha(theme.palette.divider, 0.5),
  }
}));

const ImageWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 380,
  marginLeft: theme.spacing(2),
  height: 480,
  borderRadius: '24px 24px 100px 24px',
  overflow: 'hidden',
  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.25)',
  transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
  transition: 'all 0.5s ease-out',
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%': {
      transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg) translateY(0px)'
    },
    '50%': {
      transform: 'perspective(1000px) rotateY(-2deg) rotateX(2deg) translateY(-15px)'
    },
    '100%': {
      transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg) translateY(0px)'
    }
  },
  '&:hover': {
    animation: 'none',
    transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    '& .overlay': {
      opacity: 0
    },
    '& .image': {
      transform: 'scale(1.05)'
    },
    '&::after': {
      opacity: 1
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    padding: 1,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    zIndex: 2
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.6)}`,
    opacity: 0,
    transition: 'opacity 0.5s ease',
    zIndex: 1
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: 340,
    height: 430
  },
  [theme.breakpoints.down('md')]: {
    margin: '0 auto',
    marginTop: theme.spacing(4),
    maxWidth: 320,
    height: 400
  }
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(
    to bottom, 
    rgba(0,0,0,0) 20%, 
    ${alpha(theme.palette.primary.dark, 0.4)} 100%
  )`,
  zIndex: 1,
  transition: 'opacity 0.5s ease',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: 'translateY(-2px)'
  },
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(90deg, 
      ${alpha(theme.palette.primary.main, 0)}, 
      ${alpha(theme.palette.common.white, 0.1)}, 
      ${alpha(theme.palette.primary.main, 0)}
    )`,
    transform: 'translateX(-100%)',
    transition: 'transform 1s ease',
  },
  '&:hover::before': {
    transform: 'translateX(100%)',
  }
}));

const RememberMeSwitch = styled(Switch)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    backgroundColor: alpha(theme.palette.text.primary, 0.3),
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
  '& .MuiSwitch-switchBase.Mui-checked': {
    transform: 'translateX(16px)',
    '& + .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

// Add new components for feature list
const FeatureList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(4),
  width: '100%',
  maxWidth: 320,
  margin: '0 auto',
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  background: alpha(theme.palette.background.paper, 0.1),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
  fontSize: '0.95rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(5px)',
    background: alpha(theme.palette.background.paper, 0.2),
  }
}));

const WelcomeHeading = styled(Typography)(({ theme }) => ({
  position: 'relative',
  fontWeight: 800,
  marginBottom: theme.spacing(3),
  display: 'inline-block',
  fontSize: '2.2rem',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40%',
    height: 4,
    borderRadius: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
  }
}));

// Validation functions
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

const Login: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    email: false,
    password: false,
  });
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Validate form fields when they change
  useEffect(() => {
    if (touchedFields.email) {
      if (!email) {
        setEmailError('Email is required');
      } else if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
    
    if (touchedFields.password) {
      if (!password) {
        setPasswordError('Password is required');
      } else if (!validatePassword(password)) {
        setPasswordError('Password must be at least 6 characters');
      } else {
        setPasswordError('');
      }
    }
  }, [email, password, touchedFields]);
  
  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to trigger validation
    setTouchedFields({
      email: true,
      password: true,
    });
    
    // Check for validation errors
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    // Basic validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log('Login: Attempting login with email:', email);
      await login(email, password);
      
      // Show success animation before redirecting
      setLoginSuccess(true);
      
      // Delay navigation to show success animation
      setTimeout(() => {
      console.log('Login: Login successful, redirecting to dashboard');
      navigate('/');
      }, 1200);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      if (!loginSuccess) {
      setLoading(false);
      }
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <LoginContainer maxWidth={false}>
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          width: '100%',
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          py: { xs: 3, sm: 6 }
        }}
      >
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Brand Column */}
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <BrandColumn>
              <Fade in={true} timeout={1000}>
                <Box sx={{ width: '100%', position: 'relative' }}>
                  {/* Logo Section - Top Left */}
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: { xs: '-60px', md: '-90px' },
                      left: { xs: '50%', md: '0' },
                      transform: { xs: 'translateX(-50%)', md: 'none' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 2,
                      zIndex: 10,
                      cursor: 'pointer',
                      animation: 'fadeInDown 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), pulse 4s infinite ease-in-out 1.2s',
                      '@keyframes fadeInDown': {
                        '0%': {
                          opacity: 0,
                          transform: { xs: 'translateX(-50%) translateY(-30px)', md: 'translateY(-30px)' }
                        },
                        '100%': {
                          opacity: 1,
                          transform: { xs: 'translateX(-50%) translateY(0)', md: 'translateY(0)' }
                        }
                      },
                      '@keyframes pulse': {
                        '0%': { transform: { xs: 'translateX(-50%) scale(1)', md: 'scale(1)' } },
                        '50%': { transform: { xs: 'translateX(-50%) scale(1.05)', md: 'scale(1.05)' } },
                        '100%': { transform: { xs: 'translateX(-50%) scale(1)', md: 'scale(1)' } }
                      },
                      '&:hover': {
                        '.logo-icon': {
                          transform: 'rotate(45deg) scale(1.2)',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.5s ease'
                        },
                        '.logo-text': {
                          letterSpacing: '2px',
                          backgroundPosition: 'right center',
                          textShadow: '0 4px 12px rgba(0,0,0,0.4)',
                          transform: 'scale(1.05)',
                          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        },
                        '.logo-container': {
                          transform: 'rotate(-3deg)',
                          boxShadow: `0 15px 30px ${alpha(theme.palette.common.black, 0.3)}`,
                          background: alpha(theme.palette.primary.main, 0.4),
                        }
                      }
                    }}
                  >
                    <Box 
                      className="logo-container"
                      sx={{ 
                        position: 'relative',
                        bgcolor: alpha(theme.palette.primary.dark, 0.3),
                        p: 1.5,
                        borderRadius: 2,
                        display: 'flex',
                        backdropFilter: 'blur(8px)',
                        boxShadow: `0 10px 20px ${alpha(theme.palette.common.black, 0.15)}`,
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.dark, 0.5),
                          boxShadow: `0 15px 30px ${alpha(theme.palette.common.black, 0.2)}`
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: -100,
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, 
                            transparent, 
                            ${alpha(theme.palette.common.white, 0.3)}, 
                            transparent)`,
                          animation: 'shimmer 4s infinite',
                          '@keyframes shimmer': {
                            '0%': { left: '-100%' },
                            '50%': { left: '200%' },
                            '100%': { left: '200%' }
                          }
                        }
                      }}
                    >
                      <FitnessCenterIcon 
                        className="logo-icon"
                        sx={{ 
                          fontSize: '2.25rem', 
                          color: 'white',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                          animation: 'spin 15s linear infinite',
                          transformOrigin: 'center',
                          transition: 'transform 0.3s ease, filter 0.3s ease',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }} 
                      />
                    </Box>
                    <Typography 
                      className="logo-text"
                      variant="h4" 
                      fontWeight={800} 
                      sx={{ 
                        letterSpacing: 1.2,
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        background: `linear-gradient(to right, 
                          ${theme.palette.primary.light} 0%, 
                          ${theme.palette.common.white} 50%, 
                          ${theme.palette.primary.light} 100%)`,
                        backgroundSize: '200% auto',
                        backgroundPosition: 'left center',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        transition: 'all 0.3s ease',
                        animation: 'shine 8s linear infinite',
                        '@keyframes shine': {
                          '0%': { backgroundPosition: '0% center' },
                          '50%': { backgroundPosition: '100% center' },
                          '100%': { backgroundPosition: '0% center' }
                        }
                      }}
                    >
                      OKGYM
                    </Typography>
                  </Box>

                  {/* Content and Image in Side-by-Side Layout */}
                  <Box sx={{ 
                    display: 'flex',
                    pt: { xs: 6, md: 4 },
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5
                  }}>
                    {/* Text Section */}
                    <Box sx={{ 
                      width: { xs: '100%', md: '45%' },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: { xs: 'center', md: 'flex-start' },
                      order: { xs: 1, md: 1 }
                    }}>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 800, 
                          mb: 2.5,
                          color: 'white',
                          position: 'relative',
                          display: 'inline-block',
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), text-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px) scale(1.01)',
                            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -10,
                            left: 0,
                            width: '60%',
                            height: 2,
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${alpha(theme.palette.secondary.light, 0.5)})`,
                            transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          },
                          '&:hover::after': {
                            width: '80%',
                          }
                        }}
                      >
                        Welcome back!
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'white',
                          opacity: 0.95, 
                          fontSize: '1.15rem',
                          lineHeight: 1.7,
                          mb: 4,
                          textAlign: { xs: 'center', md: 'left' },
                          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        Your personal fitness journey continues.
                      </Typography>
                      
                      <Stack 
                        spacing={2} 
                        sx={{ 
                          width: '100%',
                          textAlign: 'left',
                        }}
                      >
                        {/* Feature List Items */}
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.dark, 0.15),
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              bgcolor: alpha(theme.palette.primary.dark, 0.25),
                              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                              '& .feature-icon': {
                                transform: 'scale(1.15) rotate(10deg)',
                                bgcolor: theme.palette.primary.main,
                              }
                            }
                          }}
                        >
                          <Box 
                            className="feature-icon"
                            sx={{ 
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 18, color: 'white' }} />
                          </Box>
                          <Typography sx={{ 
                            color: 'white', 
                            fontWeight: 500,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)'
                            }
                          }}>
                            Track your daily workouts
                          </Typography>
                        </Box>
                        
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.dark, 0.15),
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              bgcolor: alpha(theme.palette.primary.dark, 0.25),
                              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                              '& .feature-icon': {
                                transform: 'scale(1.15) rotate(10deg)',
                                bgcolor: theme.palette.primary.main,
                              }
                            }
                          }}
                        >
                          <Box 
                            className="feature-icon"
                            sx={{ 
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 18, color: 'white' }} />
                          </Box>
                          <Typography sx={{ 
                            color: 'white', 
                            fontWeight: 500,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)'
                            }
                          }}>
                            Access personalized fitness plans
                          </Typography>
                        </Box>
                        
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.dark, 0.15),
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              bgcolor: alpha(theme.palette.primary.dark, 0.25),
                              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                              '& .feature-icon': {
                                transform: 'scale(1.15) rotate(10deg)',
                                bgcolor: theme.palette.primary.main,
                              }
                            }
                          }}
                        >
                          <Box 
                            className="feature-icon"
                            sx={{ 
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 18, color: 'white' }} />
                          </Box>
                          <Typography sx={{ 
                            color: 'white', 
                            fontWeight: 500,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)'
                            }
                          }}>
                            Monitor your progress visually
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    
                    {/* Image Section */}
                    <Box sx={{ 
                      width: { xs: '85%', md: '50%' },
                      order: { xs: 0, md: 2 }
                    }}>
                      <Box
                        sx={{
                          position: 'relative',
                          height: { xs: '400px', md: '480px' },
                          width: '100%',
                          borderRadius: { xs: '20px', md: '24px 24px 100px 24px' },
                          overflow: 'hidden',
                          boxShadow: '0 16px 32px rgba(0,0,0,0.25)',
                          transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                          animation: 'float 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                          transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          '&:hover': {
                            animation: 'none',
                            transform: 'perspective(1000px) rotateY(2deg) rotateX(-2deg) scale(1.03) translateY(-8px)',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
                            '& .image-overlay': {
                              opacity: 0
                            },
                            '& .fitness-image': {
                              transform: 'scale(1.08)',
                              filter: 'brightness(1.05)'
                            }
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 'inherit',
                            padding: 0.5,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            opacity: 0.6,
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                            zIndex: 2,
                            transition: 'opacity 0.4s ease-in-out'
                          },
                          '&:hover::before': {
                            opacity: 0.8
                          }
                        }}
                      >
                        <Box
                          className="fitness-image"
                          component="img"
                          src="/assets/images/fitness-illustration.jpg"
                          alt="Fitness"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            filter: 'brightness(1)'
                          }}
                        />
                        <Box
                          className="image-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(
                              to bottom, 
                              rgba(0,0,0,0) 20%, 
                              ${alpha(theme.palette.primary.dark, 0.4)} 100%
                            )`,
                            zIndex: 1,
                            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </BrandColumn>
          </Grid>
          
          {/* Login Form Column */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={800}>
              <LoginPaper elevation={4}>
                <Box sx={{ width: '100%', maxWidth: 450, mx: 'auto' }}>
                  {/* Theme Toggle */}
                  <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <ThemeToggle />
                  </Box>
                  
                  {/* Logo - Visible only on mobile */}
                  <Box sx={{ 
                    display: { xs: 'flex', md: 'none' }, 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 4, 
                    justifyContent: 'center' 
                  }}>
                    <FitnessCenterIcon color="primary" sx={{ fontSize: 30 }} />
                    <Typography variant="h4" fontWeight={700} color="primary">
                      OKGYM
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography component="h1" variant="h4" fontWeight={700} gutterBottom>
              Sign in to OKGYM
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials to access your account
            </Typography>
          </Box>
          
          <Zoom in={!!error} timeout={300}>
            <Box sx={{ mb: error ? 3 : 0 }}>
              {error && (
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mb: 2,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.main
                          }}
                          icon={<ErrorIcon />}
                        >
                  {error}
                </Alert>
              )}
            </Box>
          </Zoom>
          
                  <Box 
                    component="form"
                    sx={{
                      opacity: 0,
                      transform: 'translateY(20px)',
                      animation: 'fadeInUp 0.5s ease forwards 0.2s',
                      '@keyframes fadeInUp': {
                        to: {
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      }
                    }}
                    onSubmit={handleSubmit} 
                    noValidate
                  >
                    <StyledInput fullWidth>
                      <InputLabel htmlFor="email" shrink>
                        Email Address
                      </InputLabel>
                      <InputBase
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
              disabled={loading}
                        className={emailError ? 'Mui-error' : ''}
                        placeholder="Enter your email address"
                        fullWidth
                        startAdornment={
                  <InputAdornment position="start">
                            <EmailIcon color={emailError ? "error" : "inherit"} />
                  </InputAdornment>
                        }
                      />
                      {emailError && (
                        <ErrorMessage>
                          <ErrorIcon fontSize="small" />
                          {emailError}
                        </ErrorMessage>
                      )}
                    </StyledInput>
                    
                    <StyledInput fullWidth>
                      <InputLabel htmlFor="password" shrink>
                        Password
                      </InputLabel>
                      <InputBase
                        id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleFieldBlur('password')}
              disabled={loading}
                        className={passwordError ? 'Mui-error' : ''}
                        placeholder="Enter your password"
                        fullWidth
                        startAdornment={
                  <InputAdornment position="start">
                            <LockIcon color={passwordError ? "error" : "inherit"} />
                  </InputAdornment>
                        }
                        endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                              size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                        }
                      />
                      {passwordError && (
                        <ErrorMessage>
                          <ErrorIcon fontSize="small" />
                          {passwordError}
                        </ErrorMessage>
                      )}
                    </StyledInput>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 3
                    }}>
                      <FormControlLabel
                        control={
                          <RememberMeSwitch 
                            checked={rememberMe} 
                            onChange={(e) => setRememberMe(e.target.checked)}
                            size="small"
                            inputProps={{ 'aria-label': 'Remember me' }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            Remember me
                          </Typography>
                        }
                      />
                      <Link 
                        to="/forgot-password" 
                        style={{ 
                          color: theme.palette.primary.main, 
                          textDecoration: 'none',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          position: 'relative',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme.palette.secondary.main;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme.palette.primary.main;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Forgot password?
                      </Link>
                    </Box>
                    
                    <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              isLoading={loading}
                      color={loginSuccess ? "success" : "primary"}
                      sx={{ 
                        mt: 1,
                        position: 'relative',
                        borderRadius: '12px',
                        py: 1.5,
                        overflow: 'hidden',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: `linear-gradient(45deg, 
                          ${theme.palette.primary.main}, 
                          ${theme.palette.primary.dark})`,
                        boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 12px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
                          background: `linear-gradient(45deg, 
                            ${theme.palette.primary.main}, 
                            ${alpha(theme.palette.secondary.main, 0.8)})`,
                        },
                        '&:active': {
                          transform: 'translateY(-1px)',
                          boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: -100,
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, 
                            transparent, 
                            ${alpha(theme.palette.common.white, 0.2)}, 
                            transparent)`,
                          animation: 'buttonShimmer 3s infinite',
                          '@keyframes buttonShimmer': {
                            '0%': { left: '-100%' },
                            '100%': { left: '200%' }
                          }
                        }
                      }}
                    >
                      {loginSuccess ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckIcon fontSize="small" />
                          Success
                        </Box>
                      ) : (
                        <Box sx={{ 
                          position: 'relative',
                          display: 'inline-block',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            width: '0%',
                            height: '2px',
                            bottom: -2,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'white',
                            transition: 'width 0.3s ease',
                          },
                          '&:hover::after': {
                            width: '80%',
                          }
                        }}>
              Sign In
                        </Box>
                      )}
                    </StyledButton>
                    
                    <StyledDivider>OR</StyledDivider>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                            color: theme.palette.primary.main, 
                    textDecoration: 'none',
                            fontWeight: 600,
                            position: 'relative',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = theme.palette.secondary.main;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = theme.palette.primary.main;
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                >
                  Sign up
                </Link>
              </Typography>
                    </Box>
            </Box>
          </Box>
        </LoginPaper>
      </Fade>
          </Grid>
        </Grid>
      </Box>
    </LoginContainer>
  );
};

export default Login; 