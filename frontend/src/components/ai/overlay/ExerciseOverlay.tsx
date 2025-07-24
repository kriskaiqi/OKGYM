import React from 'react';
import { Box } from '@mui/material';
import { ExerciseError } from '../../../types/ai/exercise';
import SquatOverlay from './SquatOverlay';
import SitupOverlay from './SitupOverlay';
import ShoulderPressOverlay from './ShoulderPressOverlay';
import BenchPressOverlay from './BenchPressOverlay';
import PushupOverlay from './PushupOverlay';
import LateralRaiseOverlay from './LateralRaiseOverlay';
import LungeOverlay from './LungeOverlay';
import BicepOverlay from './BicepOverlay';
import PlankOverlay from './PlankOverlay';

interface ExerciseOverlayProps {
  metrics: any;
  errors: ExerciseError[];
  exerciseType: string;
  style?: React.CSSProperties;
  isLiveMode?: boolean;
}

const ExerciseOverlay: React.FC<ExerciseOverlayProps> = ({ 
  metrics, 
  errors, 
  exerciseType,
  style,
  isLiveMode = false
}) => {
  // Render the appropriate overlay based on exercise type
  const renderExerciseOverlay = () => {
    switch (exerciseType) {
      case 'squat':
        return <SquatOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      case 'situp':
        return <SitupOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      case 'shoulder_press':
        return <ShoulderPressOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      case 'bench_press':
        return <BenchPressOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      case 'pushup':
        return <PushupOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      case 'lateral_raise':
        return <LateralRaiseOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      case 'lunge':
        return <LungeOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      case 'bicep_curl':
        return <BicepOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      case 'plank':
        return <PlankOverlay metrics={metrics} errors={errors} isLiveMode={isLiveMode} />;
      // Add other exercise types here when implementing them
      default:
        return null; // Default case for now
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
      style={style}
    >
      {renderExerciseOverlay()}
    </Box>
  );
};

export default ExerciseOverlay; 