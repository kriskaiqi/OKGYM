import { 
  styled, 
  alpha, 
  Card, 
  CardMedia, 
  Box, 
  Chip,
  ListItem,
  Button,
  IconButton,
  Tab,
  CardContent,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { ExerciseDifficulty } from '../../types/exercise';
import { 
  fadeIn, scaleIn, slideUp, pulse, pop, 
  gradientFlow, glow, slideIn, bounce 
} from '../../styles/animations';
import { keyframes } from '@mui/system';

// Animation for section transitions
export const fadeInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Enhanced animation for elements
const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// New refined animation for text elements
const textReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
    letter-spacing: -0.05em;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    letter-spacing: normal;
  }
`;

const tabFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled components for ExerciseDetail
export const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    transform: 'translateY(-6px)',
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
  },
  animation: `${fadeInScale} 0.4s ease-out`,
}));

export const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

export const ExerciseImage = styled(CardMedia)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 0,
  paddingBottom: '42.86%', // 21:9 ultra-wide aspect ratio (9/21 = 0.4286 = 42.86%)
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '16px 16px 0 0',
  transition: 'all 0.7s ease',
  transform: 'scale(1)',
  filter: 'brightness(0.9)',
  '&:hover': {
    transform: 'scale(1.03)',
    transition: 'all 3.5s ease',
    filter: 'brightness(1)',
  }
}));

export const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(5, 4),
  color: 'white',
  zIndex: 2,
  background: `linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)`,
  animation: `${fadeInAnimation} 0.6s ease-out`,
  transition: 'padding 0.3s ease',
  '&:hover': {
    padding: theme.spacing(5.5, 4),
  }
}));

export const ExerciseHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  marginBottom: theme.spacing(4),
  animation: `${fadeInAnimation} 0.5s ease-out`,
}));

export const ExerciseTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.25rem',
  fontWeight: 800,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  textShadow: '0 1px 2px rgba(0,0,0,0.05)',
  animation: `${textReveal} 0.6s ease-out`,
  [theme.breakpoints.up('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.85rem',
  },
}));

export const ExerciseDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.15rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(1),
  lineHeight: 1.8,
  maxWidth: '90%',
  animation: `${textReveal} 0.8s ease-out`,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    fontSize: '1.05rem',
  },
}));

export const ChipsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(2),
  animation: `${fadeInAnimation} 0.7s ease-out`,
}));

export const DifficultyChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'difficulty',
})<{ difficulty: string }>(({ theme, difficulty }) => {
  let backgroundColor = theme.palette.primary.main;
  let textColor = theme.palette.primary.contrastText;
  
  if (difficulty === 'BEGINNER' || difficulty === 'beginner') {
    backgroundColor = theme.palette.success.main;
    textColor = theme.palette.success.contrastText;
  } else if (difficulty === 'INTERMEDIATE' || difficulty === 'intermediate') {
    backgroundColor = theme.palette.warning.main;
    textColor = theme.palette.warning.contrastText;
  } else if (difficulty === 'ADVANCED' || difficulty === 'advanced') {
    backgroundColor = theme.palette.error.main;
    textColor = theme.palette.error.contrastText;
  }

  return {
    backgroundColor,
    color: textColor,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: `0 6px 14px ${alpha(backgroundColor, 0.35)}`,
    padding: '6px 16px',
    height: '36px',
    fontSize: '0.95rem',
    letterSpacing: '0.05em',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: `0 8px 20px ${alpha(backgroundColor, 0.5)}`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      padding: '1px',
      background: `linear-gradient(45deg, ${alpha(backgroundColor, 0.8)}, transparent)`,
      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      maskComposite: 'exclude',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover::before': {
      opacity: 1,
    }
  };
});

export const MetadataItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderRadius: '8px',
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  transition: 'all 0.2s ease',
  height: '48px',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1.5),
    fontSize: '1.3rem',
    color: theme.palette.primary.main,
    transition: 'transform 0.2s ease',
    flexShrink: 0,
  },
  '&:hover .MuiSvgIcon-root': {
    transform: 'scale(1.15)',
  },
  '& .MuiTypography-root': {
    whiteSpace: 'nowrap',
  },
  '& .MuiRating-root': {
    flexShrink: 0,
  }
}));

export const ContentContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 3),
  position: 'relative',
  borderRadius: '16px',
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  backdropFilter: 'blur(8px)',
  animation: `${fadeInAnimation} 0.5s ease-out`,
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.06)}`,
  },
}));

export const SectionTitle = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  position: 'relative',
  paddingBottom: theme.spacing(1.5),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '80px',
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.light, 0.7)} 100%)`,
    borderRadius: '4px',
    transition: 'width 0.3s ease, transform 0.3s ease',
  },
  '&:hover::after': {
    width: '140px',
    transform: 'translateX(10px)',
  },
  '& .MuiTypography-root': {
    fontSize: '1.6rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: theme.palette.text.primary,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.4rem',
    },
  },
}));

export const InstructionItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: 0,
  position: 'relative',
}));

export const InstructionNumber = styled(Box)(({ theme }) => ({
  minWidth: '30px',
  minHeight: '30px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  fontWeight: 'bold'
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 'bold',
  padding: theme.spacing(1.4, 4),
  borderRadius: '12px',
  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  fontSize: '0.95rem',
  letterSpacing: '0.02em',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 14px 28px ${alpha(theme.palette.primary.main, 0.35)}`,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
    marginRight: theme.spacing(1),
    transition: 'transform 0.2s ease',
  },
  '&:hover .MuiSvgIcon-root': {
    transform: 'translateY(-2px)',
  }
}));

export const BackButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  }
}));

export const FavoriteButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  borderRadius: '50%',
  padding: theme.spacing(1),
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
  }
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 500,
  textTransform: 'none',
  minWidth: 120,
  fontSize: '1.05rem',
  transition: 'all 0.3s ease',
  opacity: 0.7,
  padding: theme.spacing(1.5, 2.5),
  borderRadius: '8px',
  position: 'relative',
  overflow: 'hidden',
  '&.Mui-selected': {
    fontWeight: 700,
    opacity: 1,
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    '&::after': {
      width: '50%',
      opacity: 1,
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '6px',
    left: '25%',
    width: '0%',
    height: '3px',
    borderRadius: '3px',
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s ease, opacity 0.3s ease',
    opacity: 0,
  },
  '&:hover': {
    opacity: 0.9,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    '&::after': {
      width: '30%',
      opacity: 0.7,
    }
  }
}));

export const AnimatedSection = styled(Box)(({ theme }) => ({
  animation: `${fadeInAnimation} 0.5s ease-out forwards`,
}));

export const DetailInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  '& .label': {
    fontWeight: 'bold',
    minWidth: '150px',
    color: theme.palette.text.secondary,
  },
  '& .value': {
    flex: 1,
  }
}));

// New styled components for enhanced exercise detail display

export const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
  },
  animation: `${fadeInScale} 0.5s ease-out forwards`,
}));

export const StatTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    fontSize: '1.5rem',
    },
  '& .MuiTypography-root': {
    fontWeight: 600,
    fontSize: '1.1rem',
    letterSpacing: '0.01em',
  }
}));

export const StatValue = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 800,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
  letterSpacing: '-0.03em',
}));

export const SafetyTipItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.warning.light, 0.08),
  borderRadius: '16px',
  borderLeft: `5px solid ${theme.palette.warning.main}`,
  boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 10px 30px ${alpha(theme.palette.warning.main, 0.1)}`,
    transform: 'translateY(-5px) translateX(2px)',
    backgroundColor: alpha(theme.palette.warning.light, 0.12),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `radial-gradient(circle at top left, 
      ${alpha(theme.palette.warning.light, 0.15)}, 
      transparent 70%)`,
    opacity: 0,
    transition: 'opacity 0.5s ease',
    zIndex: 0,
  },
  '&:hover::before': {
    opacity: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
  animation: `${fadeInAnimation} 0.6s ease-out`,
  animationDelay: 'calc(0.15s * var(--index, 0))',
}));

export const BenefitItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.success.light, 0.08),
  borderRadius: '16px',
  borderLeft: `5px solid ${theme.palette.success.main}`,
  boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 10px 30px ${alpha(theme.palette.success.main, 0.1)}`,
    transform: 'translateY(-5px) translateX(2px)',
    backgroundColor: alpha(theme.palette.success.light, 0.12),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `radial-gradient(circle at bottom left, 
      ${alpha(theme.palette.success.light, 0.15)}, 
      transparent 70%)`,
    opacity: 0,
    transition: 'opacity 0.5s ease',
    zIndex: 0,
  },
  '&:hover::before': {
    opacity: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
  animation: `${fadeInAnimation} 0.6s ease-out`,
  animationDelay: 'calc(0.15s * var(--index, 0))',
}));

export const StepItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
  zIndex: 1,
  '&:hover': {
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
    transform: 'translateX(6px) translateY(-2px)',
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '-20px',
    top: '50%',
    width: '20px',
    height: '3px',
    backgroundColor: alpha(theme.palette.primary.main, 0.4),
    transform: 'translateY(-50%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
  animation: `${fadeInAnimation} 0.5s ease-out forwards`,
  animationDelay: 'calc(0.15s * var(--index, 0))',
}));

export const StepNumber = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.dark, 0.8)})`,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  marginRight: theme.spacing(3),
  fontSize: '1.1rem',
  flexShrink: 0,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  border: `2px solid ${alpha('#fff', 0.2)}`,
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
  }
}));

export const StepContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  '& p': {
    margin: 0,
    lineHeight: 1.8,
    fontSize: '1.05rem',
  }
}));

export const InstructionsContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(5),
  marginTop: theme.spacing(4),
  paddingLeft: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '20px',
    top: '10px',
    bottom: '10px',
    width: '2px',
    backgroundImage: `linear-gradient(to bottom, 
      ${alpha(theme.palette.primary.main, 0)}, 
      ${alpha(theme.palette.primary.main, 0.4)} 20%, 
      ${alpha(theme.palette.primary.main, 0.4)} 80%, 
      ${alpha(theme.palette.primary.main, 0)}
    )`,
    zIndex: 0,
    borderRadius: '1px',
  }
}));

export const SetupItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.primary.light, 0.08),
  borderRadius: '16px',
  borderLeft: `5px solid ${theme.palette.primary.main}`,
  boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
    transform: 'translateY(-5px) translateX(2px)',
    backgroundColor: alpha(theme.palette.primary.light, 0.12),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `radial-gradient(circle at top right, 
      ${alpha(theme.palette.primary.light, 0.15)}, 
      transparent 60%)`,
    opacity: 0,
    transition: 'opacity 0.5s ease',
    zIndex: 0,
  },
  '&:hover::before': {
    opacity: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
  animation: `${fadeInAnimation} 0.6s ease-out`,
  animationDelay: 'calc(0.15s * var(--index, 0))',
}));

export const KeyPointItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.info.light, 0.08),
  borderRadius: '16px', 
  borderLeft: `5px solid ${theme.palette.info.main}`,
  boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 10px 30px ${alpha(theme.palette.info.main, 0.1)}`,
    transform: 'translateY(-5px) translateX(2px)',
    backgroundColor: alpha(theme.palette.info.light, 0.12),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `radial-gradient(circle at bottom right, 
      ${alpha(theme.palette.info.light, 0.15)}, 
      transparent 70%)`,
    opacity: 0,
    transition: 'opacity 0.5s ease',
    zIndex: 0,
  },
  '&:hover::before': {
    opacity: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
  animation: `${fadeInAnimation} 0.6s ease-out`,
  animationDelay: 'calc(0.15s * var(--index, 0))',
}));

export const MuscleChip = styled(Chip, {
  shouldForwardProp: (prop) => !['primary'].includes(prop as string),
})<{ primary?: boolean }>(({ theme, primary }) => ({
  margin: theme.spacing(0.8),
  fontWeight: primary ? 600 : 500,
  backgroundColor: primary 
    ? alpha(theme.palette.primary.main, 0.9) 
    : alpha(theme.palette.grey[700], 0.75),
  color: 'white',
  boxShadow: `0 4px 12px ${alpha(primary ? theme.palette.primary.main : theme.palette.grey[700], 0.25)}`,
  height: '34px',
  fontSize: '0.95rem',
  padding: theme.spacing(0, 1.5),
  '&:hover': {
    backgroundColor: primary 
      ? alpha(theme.palette.primary.main, 1) 
      : alpha(theme.palette.grey[800], 0.9),
    transform: 'translateY(-3px)',
    boxShadow: `0 6px 16px ${alpha(primary ? theme.palette.primary.main : theme.palette.grey[700], 0.35)}`,
  },
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
}));

export const RatingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    transform: 'translateY(-2px)',
  },
  '& .MuiRating-root': {
    marginRight: theme.spacing(1),
  },
  '& .MuiTypography-root': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  }
}));

// Add the missing EquipmentChip component
export const EquipmentChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.info.main, 0.1),
  color: theme.palette.info.dark,
  margin: theme.spacing(0.5),
  borderRadius: '16px',
  fontWeight: 500,
  height: '32px',
  fontSize: '0.9rem',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}`,
  position: 'relative',
  '& .MuiChip-icon': {
    color: theme.palette.info.main,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.info.main, 0.2),
    transform: 'translateY(-3px)',
    boxShadow: `0 6px 16px ${alpha(theme.palette.info.main, 0.25)}`,
  }
}));

// Add the missing TabContainer component
export const TabContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  '& .MuiTabs-root': {
    minHeight: '60px',
    borderBottom: 'none',
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    borderRadius: '12px',
    padding: theme.spacing(1),
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    backdropFilter: 'blur(8px)',
    '& .MuiTabs-flexContainer': {
      gap: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'space-between',
        gap: 0,
      },
    },
  },
  '& .MuiTabs-indicator': {
    height: 0, // We're using custom indicator in the tab itself
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(3),
  },
}));

export const TabPanelContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 2),
  animation: `${fadeInScale} 0.5s ease-out`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 1),
  },
}));

export const ExerciseInfoCard = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(3),
  height: '100%',
  boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
    transform: 'translateY(-4px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const ExerciseSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.4rem',
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  position: 'relative',
  paddingBottom: theme.spacing(1.5),
  letterSpacing: '-0.01em',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50px',
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.7)})`,
    borderRadius: '3px',
    transition: 'width 0.3s ease, transform 0.3s ease',
  },
  '&:hover::after': {
    width: '80px',
    transform: 'translateX(5px)',
  },
}));

export const ExerciseDetailContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(5),
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(5, 4),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 2),
    gap: theme.spacing(4),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
    gap: theme.spacing(3),
  },
  animation: `${fadeInAnimation} 0.4s ease-out`,
}));

export const ExerciseCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.18)}`,
  transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    transform: 'translateY(-10px) scale(1.01)',
    boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.28)}`,
  },
}));

export const MuscleGroupsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  borderRadius: '12px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  animation: `${fadeInAnimation} 0.5s ease-out`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.06)}`,
  },
  transition: 'all 0.3s ease',
}));

export const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(5),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: theme.spacing(2.5),
  },
  animation: `${fadeInAnimation} 0.6s ease-out`,
}));

export const MetricCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  height: '100%',
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.7)})`,
    opacity: 0.8,
    transition: 'opacity 0.3s ease, height 0.3s ease',
  },
  '&:hover': {
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
    transform: 'translateY(-8px)',
    '&::before': {
      opacity: 1,
      height: '6px',
    }
  },
  animation: `${fadeInScale} 0.5s ease-out forwards`,
  animationDelay: 'calc(0.15s * var(--index, 0))',
}));

export const MetricIcon = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2.5),
  background: alpha(theme.palette.primary.main, 0.12),
  color: theme.palette.primary.main,
  transition: 'all 0.3s ease',
  '& svg': {
    fontSize: '2rem',
  },
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    background: alpha(theme.palette.primary.main, 0.18),
  }
}));

export const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.25rem',
  fontWeight: 800,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
}));

export const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 500,
}));

export const RatingBarContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
    transform: 'translateY(-4px)',
  },
  animation: `${fadeInAnimation} 0.5s ease-out`,
}));

export const RatingBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  '&:hover .MuiLinearProgress-root': {
    height: '10px',
  },
}));

export const RatingLabel = styled(Typography)(({ theme }) => ({
  minWidth: '24px',
  fontSize: '0.9rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.primary,
}));

export const RatingCount = styled(Typography)(({ theme }) => ({
  minWidth: '40px',
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  textAlign: 'right',
}));

export const RatingProgress = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  height: '8px',
  backgroundColor: alpha(theme.palette.grey[300], 0.5),
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
  transition: 'height 0.3s ease',
}));

export const RatingProgressFill = styled(Box)<{ value: number }>(({ theme, value }) => ({
  height: '100%',
  width: `${value}%`,
  backgroundColor: theme.palette.primary.main,
  borderRadius: '4px',
  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
}));

export const ExerciseInfoRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)',
  gap: theme.spacing(4),
  marginBottom: theme.spacing(5),
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));

export const ExerciseImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '350px',
  overflow: 'hidden',
  borderRadius: '12px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  },
}));

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

export const SectionDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(5, 0),
  opacity: 0.8,
  height: '2px',
  backgroundImage: `linear-gradient(90deg, 
    ${alpha(theme.palette.divider, 0)}, 
    ${alpha(theme.palette.divider, 0.4)} 20%, 
    ${alpha(theme.palette.divider, 0.7)} 50%,
    ${alpha(theme.palette.divider, 0.4)} 80%,
    ${alpha(theme.palette.divider, 0)}
  )`,
  '&::before, &::after': {
    borderColor: 'transparent',
  },
}));

export const CategoryTag = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 600,
  borderRadius: '16px',
  padding: theme.spacing(0.5, 0),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'translateY(-2px)',
  },
}));

export const BackButtonStyled = styled(Button)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(1, 2.5),
  borderRadius: '10px',
  textTransform: 'none',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    transform: 'translateX(-6px)',
    color: theme.palette.primary.main,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.3rem',
    marginRight: theme.spacing(0.8),
    transition: 'transform 0.2s ease',
  },
  '&:hover .MuiSvgIcon-root': {
    transform: 'translateX(-4px)',
  }
}));

export const AnimatedTabPanel = styled(Box)(({ theme }) => ({
  animation: `${tabFadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
  padding: theme.spacing(4, 0),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 0),
  },
}));

export const TabsWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: '16px',
  padding: theme.spacing(1.5),
  boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
  marginBottom: theme.spacing(4),
  position: 'sticky',
  top: theme.spacing(2),
  zIndex: 10,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

// Add more compact equipment container styling
export const EquipmentContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
})); 