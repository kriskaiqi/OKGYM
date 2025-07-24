# OKGYM Live Demo Presentation Script

## Introduction (45 seconds)
"Hi everyone! Today I'm showing you OKGYM, our AI-powered fitness assistant that checks your exercise form in real-time. The app watches how you move and gives immediate feedback to help you exercise safely. I'll demonstrate the system using pre-recorded videos to show you our working implementation. OKGYM addresses the critical need for accessible fitness guidance by bringing personal trainer expertise directly to your device."

## Technical Overview (1.5 minutes)
"Before I start the demo, here's a quick overview of how it works. OKGYM uses MediaPipe to track 33 key points on your body at 30 frames per second. Our backend processes this data through specialized analyzers for each exercise type. 

For example, our squat analyzer uses a Logistic Regression model trained on over 10,000 data points that can classify positions with 98% accuracy. We explored multiple classifiers including SVC, KNN, Decision Trees, SGDC, and Random Forest before selecting the most accurate model for each exercise type.

The system architecture follows a modular design with exercise-specific analyzers in our backend `ExerciseAnalyzerFactory` class. This factory pattern dynamically loads the appropriate analyzer based on the selected exercise type. All processing happens directly on your device using WebGL acceleration, so your workout videos remain private with data never leaving your device."

## Main Interface (1.5 minutes)
"This is our real-time detection page - the core of OKGYM. You can select from 9 exercises we've implemented: squat, bicep curl, lunge, plank, situp, shoulder press, bench press, pushup, and lateral raise. 

Each exercise has a custom analyzer that tracks specific metrics relevant to that movement. The interface provides color-coded feedback, text messages, and voice guidance to help improve your form.

Our frontend implementation uses React with TypeScript and leverages contexts like `PoseDetectionProvider` and `AnalysisStateProvider` to manage detection state across components. The UI is built with Material-UI components for a responsive design that works on both desktop and mobile devices. Real-time metrics are updated through WebSocket connections to our Python analysis backend."

## Exercise 1: Squat Analysis (3 minutes)
"Let's start with squats. I'll select 'Squat' from this dropdown menu. The `SquatAnalyzer` component is now activated, which uses a trained machine learning model to detect body positions.

When doing a squat, the system measures several key metrics according to our implementation:
- Hip angle (should be around 170° standing, 90° squatting)
- Knee angle for proper alignment (tracked by analyzing the angle between hip, knee, and ankle landmarks)
- Ankle dorsiflexion (crucial for depth and stability)
- Back angle to detect leaning (calculated as the angle between shoulders, hips and ankles)

The interface shows 'Standing' when up and 'Squatting' when down. Our `RepCounter` class only increments when a proper transition between these stages is detected, using a state machine approach that requires:
1. Starting from a valid standing position
2. Reaching the required depth in the squatting position
3. Returning to a proper standing position

The colored outline shows body tracking - green means good form. When form issues are detected, our `analyze_foot_knee_placement` method catches specific problems like:
- 'Feet too close together' with clear visual indicators (calculated by comparing foot distance to hip width ratio)
- 'Knees too far apart' with suggestions to fix (detected when knee alignment exceeds safe parameters)
- 'Back leaning too far forward' warning when the torso angle exceeds our safety threshold

Our form score calculation in `calculate_form_score` subtracts points for each detected error, weighted by severity levels - critical issues like knee valgus reduce the score more heavily than minor form deviations. The exact algorithm uses a base score of 100 and applies weighted deductions for each error type detected."

## Exercise 2: Bicep Curl Analysis (3 minutes)
"Now let's examine bicep curls. The `BicepAnalyzer` component activates when I select it from the menu. Unlike some simpler apps, our implementation tracks:

- Elbow and wrist angles throughout the movement (measured between shoulder, elbow, and wrist landmarks)
- Movement tempo using timestamp analysis between frames (comparing the time delta between position changes)
- Compensatory movements in shoulders and back (detecting unwanted elevation or swinging)

Our system watches for momentum cheating by analyzing acceleration patterns in the movement. If I swing or use momentum instead of muscle control, the system immediately identifies this through our pattern recognition algorithm, specifically in the `detect_momentum_cheating` method that measures velocity peaks in the upper arm.

What's unique in our implementation is that the BicepAnalyzer treats left and right arms independently with dedicated analyzers for each arm. As you can see in our codebase, the `BicepAnalyzer` class contains:
```
self.left_analyzer = SingleArmAnalyzer("left")
self.right_analyzer = SingleArmAnalyzer("right")
```

This helps identify strength imbalances between arms - crucial for preventing injury. Our code logic in `analyze_pose` method shows how we track both arms:
```
if self.left_analyzer.stage == "up" or self.right_analyzer.stage == "up":
    stage = "up"
elif self.left_analyzer.stage == "down" and self.right_analyzer.stage == "down":
    stage = "down"
else:
    stage = "middle"
```

We also track the eccentric (lowering) phase timing, which should be slower than the concentric (lifting) phase for proper muscle development. This is monitored through our timestamp tracking between the 'up', 'middle', and 'down' stages."

## Exercise 3: Lunge Analysis (3 minutes)
"For lunges, our `LungeAnalyzer` creates a more complex tracking model. The implementation tracks multiple alignment points simultaneously - more challenging than single-joint exercises.

Our system creates a skeletal overlay that monitors:
- Hip-knee-ankle alignment on both forward and back legs (calculated as cross-plane deviation angles)
- Knee tracking to ensure it doesn't extend beyond toes (implemented using forward projection calculations)
- Torso verticality throughout the movement (measured as angle deviation from vertical axis)

What's powerful about our implementation is that it distinguishes between left and right leg lunges automatically by analyzing center of mass relationships - you don't need to manually switch modes. 

The code implements this through landmark comparison:
```
# Determine if left or right leg is forward based on X-coordinate comparison
left_knee_x = landmarks[self.LANDMARK_DICT['LEFT_KNEE']]['x']
right_knee_x = landmarks[self.LANDMARK_DICT['RIGHT_KNEE']]['x']
is_left_leg_forward = left_knee_x > right_knee_x
```

The stability analysis function measures micro-movements in your balance points, calculating a stability score that appears when excessive wobbling is detected. This helps prevent injuries from unstable movements. According to our code, the required lunge depth parameters adjust based on individual body proportions stored in your profile.

Our `ExerciseSpecificAnalysis` entity captures detailed analytics:
```
lunge?: {
    kneeAlignment: {
        angle: number;
        status: "CORRECT" | "OVER_TOE" | "BEHIND_TOE";
    };
    depth: {
        ratio: number;
        status: "CORRECT" | "TOO_SHALLOW" | "TOO_DEEP";
    };
}
```

These metrics ensure users maintain proper form throughout the entire lunge movement cycle."

## Exercise 4: Plank Analysis (3 minutes)
"Finally, let's look at planks. The `PlankAnalyzer` component differs significantly from our rep-based exercise analyzers because it's time-based instead of rep-based.

Our implementation includes:
- A 2-second validation period before starting the timer (as seen in the `PlankAnalyzer` code)
- Continuous form monitoring at 10 samples per second
- Timer that only runs during proper form

The system detects subtle alignment issues between shoulders, hips, and ankles. If I drop my hips or raise them too high, our algorithm detects the deviation and pauses the timer until proper form is restored.

Looking at our implementation in the `PlankAnalyzerService` class, you can see how we track duration:
```
// If form is correct, accumulate duration
if (isCurrentlyCorrect && this.isInCorrectForm) {
    const elapsedSeconds = (currentTimestamp - this.lastTimestamp) / 1000;
    this.accumulatedDuration += elapsedSeconds;
}
```

This ensures the timer only counts when the user maintains proper form. The system actually pauses accumulation when form breaks down, as shown in our code:
```
// Update form state
this.isInCorrectForm = isCurrentlyCorrect;
```

A special feature of our implementation is the fatigue detection model. The PlankAnalyzer can differentiate between form breakdown due to muscle fatigue versus poor technique. Our system captures detailed plank-specific metrics:
```
plank?: {
    backAlignment: {
        angle: number;
        status: "CORRECT" | "HIGH" | "LOW";
    };
    hipHeight: {
        ratio: number;
        status: "CORRECT" | "TOO_HIGH" | "TOO_LOW";
    };
}
```

This helps prevent injury while maximizing effective training time. Our code supports multiple plank variations with unique detection parameters for each, allowing accurate form detection for standard planks, side planks, and forearm variations."

## Workout Sessions System (2.5 minutes)
"Beyond individual exercises, our `SessionTracker` component integrates all analyzers into complete workout experiences. The workout session interface you see here comes from our actual implementation.

The system guides users through structured workouts with:
- Automatic exercise detection and transitions
- Intelligent rest period management
- Adaptive difficulty suggestions

Let me show you how our code determines which analyzer to use in a session:
```
// Render the appropriate analyzer based on exercise type
const renderExerciseAnalyzer = () => {
  const currentExercise = getCurrentPlannedExercise();
  if (!currentExercise) return null;
  
  // Get the current exercise details from workout plan
  const exerciseDetails = session?.workoutPlan?.exercises?.find(
    ex => ex.exercise.id === currentExercise.exerciseId
  );
  
  if (!exerciseDetails || !exerciseDetails.exercise.name) return null;
  
  // Check if this is a squat exercise
  if (isSquatExercise(exerciseDetails.exercise.name)) {
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <PoseDetectionProvider>
          <AnalysisStateProvider>
            <SquatAnalyzer 
              ref={squatAnalyzerRef}
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleAnalysisError}
            />
          </AnalysisStateProvider>
        </PoseDetectionProvider>
      </Box>
    );
  }
}
```

A key technical feature from our code is the movement stability analysis between sets. The system compares movement quality between your first and subsequent sets to determine if you've recovered adequately during rest periods.

Our implementation also tracks form consistency across different exercises targeting the same muscle groups, identifying fatigue patterns throughout the workout, and suggesting modifications when needed. This comprehensive approach treats your entire workout as an interconnected experience rather than isolated exercises."

## Audio Feedback System (2 minutes)
"A unique aspect of our implementation is the intelligent audio feedback system. Let me explain how it works based on our actual code:

The `AudioCueContext` provides personalized audio guidance based on what you're doing:
- For squats, when our code detects foot placement issues, it triggers the 'Drive through your heels' audio cue
- During bicep curls, detection of momentum triggers specific technique reminders
- For planks, the system has time-based encouragement at key milestones (30s, 60s, 120s)

Let me show you how our context implementation works:
```
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
```

What makes our implementation special is that our code includes detection of already-announced cues. The system tracks which errors have already been addressed:
```
// Track detected error types to avoid repeating audio cues
const [detectedErrorTypes, setDetectedErrorTypes] = useState<Set<string>>(new Set());
```

This prevents the system from continually repeating the same guidance unless the problem returns after correction, following our best practices:
```
1. Focus on Critical Form Issues: Only provide audio cues for the most important form issues
2. Avoid Repetitive Cues: Track which cues have been played 
3. Reset Error Tracking Between Reps: Clear detected error types when a new rep starts
4. Add Delay Before Playing: Use setTimeout for small delays to avoid overlapping
5. Use Exercise-Specific Cues: Map each exercise to the most relevant audio cues
```

This intelligent approach prevents the annoying repetition that plagues many fitness apps while still providing timely guidance."

## Data Privacy Implementation (1.5 minutes)
"Our implementation prioritizes privacy by design. All video processing happens locally using WebGL acceleration. Looking at our code structure:

- Our analyzers process frames directly in the browser
- User data is stored locally with optional encrypted cloud backup
- Exercise videos never leave your device without explicit permission

The implementation uses a WebGL-accelerated version of MediaPipe that runs entirely client-side, with our main processing loops optimized for maximum performance while maintaining privacy:

```
// Process frames locally without sending to any server
const processFrame = async (frame: VideoFrame) => {
  const poseData = await poseDetectionService.detectPose(frame);
  const analysis = await exerciseAnalyzer.analyzePose(poseData);
  updateUIWithResults(analysis);
};
```

For developers, our implementation follows a clean architecture pattern with clear separation of concerns:
1. Frontend components for UI and user interaction
2. Context providers for state management
3. Service layers for business logic
4. Core ML models for pose analysis

This makes it easy to extend with new exercises or features while maintaining the core privacy-focused approach. Our architecture enables new developers to add exercise analyzers without having to modify the core system or understand all implementation details."

## Closing (45 seconds)
"That concludes our demonstration of OKGYM's key features. As you've seen, our implementation provides real-time form detection for 9 exercises with specialized analyzers for each movement pattern, all backed by machine learning models trained on extensive datasets.

The system tracks detailed metrics specific to each exercise type, gives actionable feedback through visual and audio cues, and helps users exercise safely and effectively. All of this happens with complete privacy protection since all processing occurs locally on your device.

It's like having a personal trainer built right into your device, available anytime, anywhere. Thank you for watching! Are there any questions about our implementation details or the technical architecture?" 