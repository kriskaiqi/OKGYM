import React, { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import useAudioCues, { AudioCueType, ExerciseType, AudioCueOptions } from '../hooks/useAudioCues';

interface AudioCueContextValue {
  playCue: (cueType: AudioCueType) => void;
  playExerciseTypeCue: (exerciseType: ExerciseType, repIndex?: number, totalReps?: number) => void;
  isPlaying: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

// Create context with default values
const AudioCueContext = createContext<AudioCueContextValue>({
  playCue: () => {},
  playExerciseTypeCue: () => {},
  isPlaying: false,
  isEnabled: true,
  setEnabled: () => {},
  volume: 1.0,
  setVolume: () => {}
});

interface AudioCueProviderProps {
  children: ReactNode;
  initialOptions?: AudioCueOptions;
}

export const AudioCueProvider: React.FC<AudioCueProviderProps> = ({ 
  children, 
  initialOptions = { volume: 1.0, disabled: false }
}) => {
  // State for audio settings
  const [isEnabled, setEnabled] = useState(!initialOptions.disabled);
  const [volume, setVolume] = useState(initialOptions.volume || 1.0);
  
  // Audio cue hook
  const { 
    playCue: playCueHook, 
    playExerciseTypeCue: playExerciseTypeCueHook,
    isPlaying 
  } = useAudioCues({ 
    volume, 
    disabled: !isEnabled 
  });
  
  // Wrapper functions to apply current settings
  const playCue = useCallback((cueType: AudioCueType) => {
    if (isEnabled) {
      playCueHook(cueType);
    }
  }, [isEnabled, playCueHook]);
  
  const playExerciseTypeCue = useCallback((
    exerciseType: ExerciseType, 
    repIndex?: number, 
    totalReps?: number
  ) => {
    if (isEnabled) {
      playExerciseTypeCueHook(exerciseType, repIndex, totalReps);
    }
  }, [isEnabled, playExerciseTypeCueHook]);
  
  // Update volume in real-time when it changes
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume))); // Clamp to 0-1 range
  }, []);
  
  // Value for the context
  const contextValue: AudioCueContextValue = {
    playCue,
    playExerciseTypeCue,
    isPlaying,
    isEnabled,
    setEnabled,
    volume,
    setVolume: handleVolumeChange
  };
  
  return (
    <AudioCueContext.Provider value={contextValue}>
      {children}
    </AudioCueContext.Provider>
  );
};

// Custom hook to use the audio cue context
export const useAudioCueContext = () => useContext(AudioCueContext);

export default AudioCueProvider; 