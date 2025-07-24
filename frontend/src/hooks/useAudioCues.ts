import { useRef, useCallback, useEffect } from 'react';

// Audio cue categories
export enum AudioCueCategory {
  WORKOUT_FLOW = 'WORKOUT_FLOW',
  FORM_GUIDANCE = 'FORM_GUIDANCE',
  MOTIVATION = 'MOTIVATION',
  EXERCISE_SPECIFIC = 'EXERCISE_SPECIFIC'
}

// Audio cue types
export enum AudioCueType {
  // Workout Flow
  START_WORKOUT = 'START_WORKOUT',
  NEXT_EXERCISE = 'NEXT_EXERCISE',
  REST_PERIOD = 'REST_PERIOD',
  WORKOUT_COMPLETE = 'WORKOUT_COMPLETE',
  
  // Form Guidance
  BACK_STRAIGHT = 'BACK_STRAIGHT',
  CORE_ENGAGEMENT = 'CORE_ENGAGEMENT',
  BREATHING = 'BREATHING',
  MOVEMENT_CONTROL = 'MOVEMENT_CONTROL',
  FULL_ROM = 'FULL_ROM',
  
  // Exercise-specific
  HEEL_DRIVE = 'HEEL_DRIVE',
  PEAK_CONTRACTION = 'PEAK_CONTRACTION',
  ELBOW_POSITION = 'ELBOW_POSITION',
  NECK_POSITION = 'NECK_POSITION',
  POWER_GENERATION = 'POWER_GENERATION',
  
  // Motivation
  PUSH_THROUGH = 'PUSH_THROUGH',
  FINAL_REP = 'FINAL_REP',
  CONFIDENCE_BOOST = 'CONFIDENCE_BOOST',
  PROGRESS_UPDATE = 'PROGRESS_UPDATE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  
  // New milestone cues
  HALFWAY_POINT = 'HALFWAY_POINT',
  SET_MILESTONE = 'SET_MILESTONE'
}

// Audio cue types to prioritize even if another audio is playing
// These are critical cues that should never be skipped
const PRIORITY_CUES = [
  AudioCueType.FINAL_REP,
  AudioCueType.WORKOUT_COMPLETE
];

// Exercise type to audio cue mapping
export enum ExerciseType {
  LOWER_BODY = 'LOWER_BODY',
  UPPER_BODY_PUSH = 'UPPER_BODY_PUSH',
  UPPER_BODY_PULL = 'UPPER_BODY_PULL',
  CORE = 'CORE',
  EXPLOSIVE = 'EXPLOSIVE',
  ISOLATION = 'ISOLATION'
}

/**
 * Audio Cue Script Reference Guide
 * This maps each audio cue to its corresponding file and spoken content
 * 
 * The 15 Unique Audio Files:
 * -------------------------
 * 1. start-workout.mp3 - "Let's begin your workout!"
 * 2. next-exercise.mp3 - "Moving to next exercise"
 * 3. rest-now.mp3 - "Take a rest now"
 * 4. workout-complete.mp3 - "Workout complete, great job!"
 * 5. back-straight.mp3 - "Keep your back straight"
 * 6. engage-core.mp3 - "Engage your core"
 * 7. breathe-steady.mp3 - "Breathe steady"
 * 8. control-movement.mp3 - "Control the movement"
 * 9. full-range.mp3 - "Full range of motion"
 * 10. drive-heels.mp3 - "Drive through your heels"
 * 11. squeeze-top.mp3 - "Squeeze at the top"
 * 12. elbows-90.mp3 - "Elbows at 90 degrees"
 * 13. chin-tucked.mp3 - "Keep your chin tucked"
 * 14. explode-up.mp3 - "Explode up"
 * 15. push-through.mp3 - "Push through!"
 * 16. last-rep.mp3 - "Last rep!"
 * 17. got-this.mp3 - "You've got this!"
 * 18. almost-there.mp3 - "Almost there!"
 * 19. achievement.mp3 - "Achievement unlocked!"
 * 20. halfway-there.mp3 - "Halfway there, maintain form"
 * 21. set-milestone.mp3 - "Great set, keep it up"
 */

// Mapping of audio cue types to filenames
const AUDIO_CUE_MAP: Record<AudioCueType, string> = {
  // Workout Flow
  [AudioCueType.START_WORKOUT]: 'start-workout.mp3',    // Specific start workout cue
  [AudioCueType.NEXT_EXERCISE]: 'next-exercise.mp3',    // Specific next exercise cue
  [AudioCueType.REST_PERIOD]: 'rest-now.mp3',           // Specific rest period cue
  [AudioCueType.WORKOUT_COMPLETE]: 'workout-complete.mp3', // Specific workout complete cue
  
  // Form Guidance
  [AudioCueType.BACK_STRAIGHT]: 'back-straight.mp3',
  [AudioCueType.CORE_ENGAGEMENT]: 'engage-core.mp3',
  [AudioCueType.BREATHING]: 'breathe-steady.mp3',
  [AudioCueType.MOVEMENT_CONTROL]: 'control-movement.mp3',
  [AudioCueType.FULL_ROM]: 'full-range.mp3',
  
  // Exercise-specific
  [AudioCueType.HEEL_DRIVE]: 'drive-heels.mp3',
  [AudioCueType.PEAK_CONTRACTION]: 'squeeze-top.mp3',
  [AudioCueType.ELBOW_POSITION]: 'elbows-90.mp3',
  [AudioCueType.NECK_POSITION]: 'chin-tucked.mp3',
  [AudioCueType.POWER_GENERATION]: 'explode-up.mp3',
  
  // Motivation
  [AudioCueType.PUSH_THROUGH]: 'push-through.mp3',
  [AudioCueType.FINAL_REP]: 'last-rep.mp3',
  [AudioCueType.CONFIDENCE_BOOST]: 'got-this.mp3',
  [AudioCueType.PROGRESS_UPDATE]: 'almost-there.mp3',
  [AudioCueType.ACHIEVEMENT]: 'achievement.mp3',        // Specific achievement cue
  
  // New milestone cues
  [AudioCueType.HALFWAY_POINT]: 'halfway-there.mp3',    // New halfway point cue
  [AudioCueType.SET_MILESTONE]: 'set-milestone.mp3'     // New set milestone cue
};

// Exercise type to recommended audio cues
export const EXERCISE_TYPE_CUES: Record<ExerciseType, AudioCueType[]> = {
  [ExerciseType.LOWER_BODY]: [AudioCueType.HEEL_DRIVE, AudioCueType.BACK_STRAIGHT],
  [ExerciseType.UPPER_BODY_PUSH]: [AudioCueType.ELBOW_POSITION, AudioCueType.CORE_ENGAGEMENT],
  [ExerciseType.UPPER_BODY_PULL]: [AudioCueType.PEAK_CONTRACTION, AudioCueType.BACK_STRAIGHT],
  [ExerciseType.CORE]: [AudioCueType.NECK_POSITION, AudioCueType.CORE_ENGAGEMENT],
  [ExerciseType.EXPLOSIVE]: [AudioCueType.POWER_GENERATION, AudioCueType.BREATHING],
  [ExerciseType.ISOLATION]: [AudioCueType.PEAK_CONTRACTION, AudioCueType.MOVEMENT_CONTROL]
};

export interface AudioCueOptions {
  volume?: number;
  disabled?: boolean;
  skipDuringPlayback?: boolean; // New option to control queue behavior
}

/**
 * Custom hook for managing audio cues during workouts
 */
export function useAudioCues(options: AudioCueOptions = {}) {
  const { 
    volume = 1.0, 
    disabled = false,
    skipDuringPlayback = true // Default to skipping cues during playback
  } = options;
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Queue system to prevent overlapping audio cues
  const isPlaying = useRef(false);
  const queueRef = useRef<AudioCueType[]>([]);
  const lastPlayedCue = useRef<AudioCueType | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [volume]);
  
  // Process queue of audio cues
  const processQueue = useCallback(() => {
    if (disabled || !audioRef.current || isPlaying.current || queueRef.current.length === 0) {
      return;
    }
    
    const nextCue = queueRef.current.shift();
    if (!nextCue) return;
    
    const filename = AUDIO_CUE_MAP[nextCue];
    if (!filename) return;
    
    try {
      isPlaying.current = true;
      lastPlayedCue.current = nextCue;
      audioRef.current.src = `/audio/cues/${filename}`;
      
      // Set up event handlers
      const handleEnded = () => {
        isPlaying.current = false;
        audioRef.current?.removeEventListener('ended', handleEnded);
        // Process next item in queue if any
        setTimeout(processQueue, 300); // Small delay between cues
      };
      
      audioRef.current.addEventListener('ended', handleEnded);
      
      // Play the audio
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio playback error:", error);
          isPlaying.current = false;
          audioRef.current?.removeEventListener('ended', handleEnded);
          setTimeout(processQueue, 300);
        });
      }
    } catch (error) {
      console.error("Failed to play audio cue:", error);
      isPlaying.current = false;
      setTimeout(processQueue, 300);
    }
  }, [disabled]);
  
  // Play a specific audio cue
  const playCue = useCallback((cueType: AudioCueType) => {
    if (disabled) return;
    
    // If audio is already playing and this is not a priority cue
    if (isPlaying.current && skipDuringPlayback && !PRIORITY_CUES.includes(cueType)) {
      // Skip this cue entirely instead of queueing it
      return;
    }
    
    // Skip if we just played this exact cue to avoid repetition
    if (lastPlayedCue.current === cueType) {
      return;
    }
    
    // Add to queue and process
    queueRef.current.push(cueType);
    if (!isPlaying.current) {
      processQueue();
    }
  }, [disabled, processQueue, skipDuringPlayback]);
  
  // Play an audio cue for a specific exercise type
  const playExerciseTypeCue = useCallback((exerciseType: ExerciseType, repIndex?: number, totalReps?: number) => {
    if (disabled) return;
    
    const recommendedCues = EXERCISE_TYPE_CUES[exerciseType];
    if (!recommendedCues || recommendedCues.length === 0) return;
    
    // If rep information is provided, choose cue based on progress
    if (repIndex !== undefined && totalReps !== undefined && totalReps > 0) {
      const progress = repIndex / totalReps;
      
      if (repIndex === 0) {
        // First rep - form guidance
        playCue(recommendedCues[0]);
      } else if (progress >= 0.7 && progress < 0.9) {
        // Later reps - motivation
        playCue(AudioCueType.PUSH_THROUGH);
      } else if (repIndex === totalReps - 1) {
        // Last rep
        playCue(AudioCueType.FINAL_REP);
      }
    } else {
      // Just play the first recommended cue if no rep info
      playCue(recommendedCues[0]);
    }
  }, [disabled, playCue]);
  
  return {
    playCue,
    playExerciseTypeCue,
    isPlaying: isPlaying.current,
    getAudioCueFilename: (cueType: AudioCueType) => AUDIO_CUE_MAP[cueType]
  };
}

export default useAudioCues; 