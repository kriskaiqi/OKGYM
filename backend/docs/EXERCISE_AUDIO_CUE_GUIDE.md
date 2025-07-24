# Audio Cue Implementation Guide for Exercise Analyzers

## Overview

This guide explains how to implement audio cues for exercise analyzers in the OKGYM application. Audio cues provide real-time feedback to users during their workouts, helping them maintain proper form and stay motivated.

## How Audio Cues Work

The system uses two main types of audio cues:

1. **Form Correction Cues**: Played when specific form errors are detected
2. **Progress Milestone Cues**: Played at key points during the exercise (first rep, halfway, final rep)

## Implementation Steps for Exercise Analyzers

### 1. Import Required Components

```tsx
import { AudioCueType, ExerciseType } from '../../../../hooks/useAudioCues';
import { useAudioCueContext } from '../../../../contexts/AudioCueContext';
```

### 2. Set Up State Management

```tsx
// Track rep count for audio cues
const [lastRepCount, setLastRepCount] = useState(0);
    
// Track detected error types to avoid repeating audio cues
const [detectedErrorTypes, setDetectedErrorTypes] = useState<Set<string>>(new Set());
    
// Access audio cue context
const { playCue, playExerciseTypeCue } = useAudioCueContext();
```

### 3. Implement Form Correction Audio Cues

When analyzing exercise form, focus on critical form issues:

```tsx
// Handle form errors with specific audio cues
if (data.result.errors && data.result.errors.length > 0) {
  // Get current error types
  const currentErrorTypes = new Set<string>(data.result.errors.map((e: any) => e.type as string));
  
  // Find new error types that weren't previously detected
  const newErrors = Array.from(currentErrorTypes).filter(type => !detectedErrorTypes.has(type));
  
  // Play specific audio cue for form correction errors only
  if (newErrors.length > 0) {
    setTimeout(() => {
      // Play audio cues only for specific form errors
      if (newErrors.includes('error_type_1')) {
        playCue(AudioCueType.RELEVANT_CUE_1);
      } else if (newErrors.includes('error_type_2')) {
        playCue(AudioCueType.RELEVANT_CUE_2);
      }
      
      // Update detected error types
      const updatedErrorTypes = new Set<string>([...Array.from(detectedErrorTypes), ...newErrors]);
      setDetectedErrorTypes(updatedErrorTypes);
    }, 800); // Small delay to avoid audio overlapping
  }
}
```

### 4. Implement Progress Milestone Audio Cues

When rep count changes, provide feedback at key milestones:

```tsx
// Check if rep count has increased
if (newRepCount > lastRepCount) {
  // First rep - play form guidance
  if (newRepCount === 1) {
    playExerciseTypeCue(ExerciseType.YOUR_EXERCISE_TYPE, 0, targetReps);
  } 
  // Halfway point - if target is substantial
  else if (targetReps > 4 && newRepCount === Math.floor(targetReps / 2)) {
    playCue(AudioCueType.HALFWAY_POINT);
  }
  // Later reps - motivation
  else if (targetReps > 0 && newRepCount / targetReps >= 0.7 && newRepCount / targetReps < 0.9) {
    playCue(AudioCueType.PUSH_THROUGH);
  } 
  // Final rep
  else if (targetReps > 0 && newRepCount === targetReps) {
    playCue(AudioCueType.FINAL_REP);
  }
  
  // Reset detected errors when rep count increases
  setDetectedErrorTypes(new Set());
}
```

### 5. Handle Set Completion Audio

In the SessionTracker component, when a set is completed:

```tsx
// Play set milestone audio cue
playCue(AudioCueType.SET_MILESTONE);
```

## Exercise-Specific Implementation Examples

### Bicep Curl Example

For bicep curls, we focus on two critical form issues:

1. **Leaning Back**: Played when the user is leaning back excessively
   ```tsx
   if (newErrors.includes('lean_back')) {
     playCue(AudioCueType.BACK_STRAIGHT); // "Keep your back straight"
   }
   ```

2. **Loose Upper Arm**: Played when the upper arm is not kept stable
   ```tsx
   if (newErrors.includes('loose_upper_arm')) {
     playCue(AudioCueType.ELBOW_POSITION); // "Elbows at 90 degrees"
   }
   ```

### Squat Example (Template)

For squats, potential focus areas could be:

1. **Knee Alignment**: When knees cave inward
   ```tsx
   if (newErrors.includes('knee_valgus')) {
     playCue(AudioCueType.KNEE_ALIGNMENT); // "Knees over toes"
   }
   ```

2. **Depth Issues**: When not reaching proper depth
   ```tsx
   if (newErrors.includes('shallow_depth')) {
     playCue(AudioCueType.FULL_ROM); // "Full range of motion"
   }
   ```

## Audio Cue Types Reference

Here are the available audio cue types and their corresponding messages:

### Form Guidance
- `BACK_STRAIGHT`: "Keep your back straight"
- `CORE_ENGAGEMENT`: "Engage your core"
- `BREATHING`: "Breathe steady"
- `MOVEMENT_CONTROL`: "Control the movement"
- `FULL_ROM`: "Full range of motion"

### Exercise-specific
- `HEEL_DRIVE`: "Drive through your heels"
- `PEAK_CONTRACTION`: "Squeeze at the top"
- `ELBOW_POSITION`: "Elbows at 90 degrees"
- `NECK_POSITION`: "Keep your chin tucked"
- `POWER_GENERATION`: "Explode up"

### Progress Milestones
- `PUSH_THROUGH`: "Push through!"
- `FINAL_REP`: "Last rep!"
- `HALFWAY_POINT`: "Halfway there, maintain form"
- `SET_MILESTONE`: "Great set, keep it up"

## Best Practices

1. **Focus on Critical Form Issues**: Only provide audio cues for the most important form issues to avoid overwhelming the user
2. **Avoid Repetitive Cues**: Track which cues have been played to avoid repeating the same cue multiple times
3. **Reset Error Tracking Between Reps**: Clear detected error types when a new rep starts
4. **Add Delay Before Playing**: Use setTimeout to add a small delay before playing audio cues to avoid overlapping
5. **Use Exercise-Specific Cues**: Map each exercise to the most relevant audio cues

## How to Add New Audio Cues

1. Add the new cue type to the `AudioCueType` enum in `useAudioCues.ts`
2. Record and add the audio file to the `/public/audio/cues/` directory
3. Update the `AUDIO_CUE_MAP` in `useAudioCues.ts` to include the new file

## Testing Audio Cues

To test that your audio cues are working correctly:

1. Perform the exercise with deliberate form errors to trigger correction cues
2. Complete enough repetitions to trigger milestone cues (halfway, 70-90%, final rep)
3. Complete a set to test the set completion cue
4. Check the console for any errors related to audio playback

## Troubleshooting

- If audio cues aren't playing, check browser console for errors
- Verify that the audio files exist in the correct directory
- Make sure audio isn't disabled in the AudioCueContext
- Check that the error types in your analyzer match the conditions in your audio cue logic 