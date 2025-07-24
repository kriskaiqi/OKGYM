# Workout Plans Implementation Checklist

This document provides a structured checklist for implementing the 30 workout plans according to the database seeding plan.

## Beginner Workout Plans (10)

### Full Body Focus
- [x] **Beginner Bodyweight Basics** (25 min)
  - Equipment: None/Minimal
  - 5-6 foundational exercises
  - Focus: Proper form, movement patterns

- [x] **Beginner Full Body Workout** (30 min)
  - Equipment: Light dumbbells, bench, resistance bands
  - 6 exercises for all major muscle groups
  - Focus: Building strength foundation

- [x] **Beginner Stability & Core** (30 min)
  - Equipment: Stability ball, resistance bands
  - 5-7 stability-focused exercises
  - Focus: Balance, core development

- [x] **Beginner Circuit Training** (35 min)
  - Equipment: Mixed (minimal)
  - 8 exercises in circuit format
  - Focus: Building endurance, movement variety

### Split Routines
- [x] **Beginner Upper Body** (30 min)
  - Equipment: Dumbbells, resistance bands
  - 6 exercises for chest, back, shoulders, arms
  - Focus: Upper body strength development

- [x] **Beginner Lower Body** (30 min)
  - Equipment: Bodyweight, light dumbbells
  - 5 exercises for legs, glutes
  - Focus: Lower body mobility and strength

- [x] **Beginner Push Workout** (25 min)
  - Equipment: Dumbbells, bench
  - 5 pushing exercises (chest, shoulders, triceps)
  - Focus: Pushing movement patterns

- [x] **Beginner Pull Workout** (25 min)
  - Equipment: Resistance bands, dumbbells
  - 5 pulling exercises (back, biceps)
  - Focus: Pulling movement patterns

- [x] **Beginner Mobility & Flexibility** (30 min)
  - Equipment: Yoga mat, foam roller
  - 8-10 mobility exercises
  - Focus: Joint mobility, flexibility

- [x] **Beginner Cardio-Strength** (35 min)
  - Equipment: Minimal
  - 7 exercises combining cardio and strength
  - Focus: Building endurance and basic strength

## Intermediate Workout Plans (10)

### Split Routines
- [x] **Intermediate Upper-Lower Split: Upper Body** (45 min)
  - Equipment: Dumbbells, barbells, cables
  - 8 exercises focusing on upper body
  - Focus: Strength and muscle development

- [x] **Intermediate Upper-Lower Split: Lower Body** (45 min)
  - Equipment: Squat rack, dumbbells
  - 7 exercises focusing on lower body
  - Focus: Lower body strength and power

- [x] **Intermediate Push-Pull-Legs: Push** (45 min)
  - Equipment: Bench, dumbbells, cables
  - 7 exercises for chest, shoulders, triceps
  - Focus: Pushing strength and hypertrophy

- [x] **Intermediate Push-Pull-Legs: Pull** (45 min)
  - Equipment: Pull-up bar, dumbbells, cables
  - 7 exercises for back and biceps
  - Focus: Pulling strength and development

- [x] **Intermediate Push-Pull-Legs: Legs** (45 min)
  - Equipment: Squat rack, leg machines
  - 6-7 exercises for legs and glutes
  - Focus: Lower body strength and development

- [x] **Intermediate Core & Conditioning** (40 min)
  - Equipment: Various
  - 8 exercises targeting core with cardio elements
  - Focus: Core strength and conditioning

### Specialized
- [x] **Intermediate HIIT Training** (35 min)
  - Equipment: Minimal
  - 10 exercises in high-intensity format
  - Focus: Cardiovascular fitness, fat burning

- [x] **Intermediate Upper Body Strength** (45 min)
  - Equipment: Dumbbells, bench, pull-up bar, barbells
  - 6 exercises for chest, back, shoulders, arms
  - Focus: Upper body strength and muscle development

- [x] **Intermediate Hypertrophy Focus** (55 min)
  - Equipment: Full gym setup
  - 8 exercises with multiple sets
  - Focus: Muscle building and development

- [x] **Intermediate Power & Strength** (50 min)
  - Equipment: Barbells, plyometric equipment
  - 6-7 compound and power exercises
  - Focus: Strength and power development

## Advanced Workout Plans (10)

### Split Routines
- [x] **Advanced Push-Pull** (60 min)
  - Equipment: Full gym setup
  - 8 exercises alternating push/pull movements
  - Focus: Advanced strength development

- [x] **Advanced Upper Body Specialization** (60 min)
  - Equipment: Full gym setup
  - 8 exercises with progressive loading
  - Focus: Upper body strength and hypertrophy

- [x] **Advanced Lower Body Power** (60 min)
  - Equipment: Full gym setup, plyometrics
  - 7 exercises with strength and power focus
  - Focus: Lower body power and development

- [x] **Advanced Core & Stability** (50 min)
  - Equipment: Specialized stability equipment
  - 8 advanced core exercises
  - Focus: Elite core strength and stability

### Specialized
- [x] **Advanced HIIT & Conditioning** (45 min)
  - Equipment: Various
  - 12 exercises in complex patterns
  - Focus: Elite conditioning and metabolic stress

- [x] **Advanced Olympic Lifting Focus** (65 min)
  - Equipment: Olympic lifting equipment
  - 6 Olympic lift variations and accessories
  - Focus: Olympic lifting technique and strength

- [x] **Advanced Powerlifting Training** (70 min)
  - Equipment: Powerlifting equipment
  - 5-6 exercises focused on powerlifting
  - Focus: Maximal strength development

- [x] **Advanced Hypertrophy Specialization** (65 min)
  - Equipment: Full gym setup
  - 8 exercises with volume focus
  - Focus: Maximum muscle development

- [x] **Advanced Athletic Performance** (60 min)
  - Equipment: Varied athletic equipment
  - 8-9 exercises for athletic development
  - Focus: Sport-specific performance

- [x] **Advanced Functional Fitness** (55 min)
  - Equipment: Varied functional equipment
  - 10 exercises combining strength and conditioning
  - Focus: Elite functional fitness

## Implementation Notes
- Each workout plan should be implemented using the template function in `seedWorkoutPlans.ts`
- Exercise configurations should match the difficulty level of the workout
- Appropriate muscle groups, equipment, and tags should be assigned
- Progression models should be configured according to workout focus
- Media assets (images and videos) will be automatically created by the seeding process
- **IMPORTANT**: Only use exercises that are defined in the exercise database (see `backend/exercise-database-plan.md`). Do not create or reference exercises that are not in this list.

## Required Enums Reference
When implementing workout plans, use these enum values for the corresponding fields:

### Difficulty
```typescript
export enum Difficulty {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    ELITE = "ELITE"  // For the most challenging levels
}
```

### WorkoutCategory
```typescript
export enum WorkoutCategory {
    // Strength-focused
    STRENGTH = "STRENGTH",
    HYPERTROPHY = "HYPERTROPHY",
    POWER = "POWER",
    
    // Endurance-focused
    ENDURANCE = "ENDURANCE",
    CARDIO = "CARDIO",
    HIIT = "HIIT",
    
    // Specialized
    CIRCUIT = "CIRCUIT",
    FLEXIBILITY = "FLEXIBILITY",
    RECOVERY = "RECOVERY",
    SPORT_SPECIFIC = "SPORT_SPECIFIC",
    SKILL = "SKILL",
    
    // Body focus
    FULL_BODY = "FULL_BODY",
    UPPER_BODY = "UPPER_BODY",
    LOWER_BODY = "LOWER_BODY",
    CORE = "CORE",
    
    // Split types
    PUSH = "PUSH",
    PULL = "PULL",
    LEGS = "LEGS"
}
```

### FitnessGoal
```typescript
export enum FitnessGoal {
    // Physical transformation goals
    STRENGTH_GAIN = "STRENGTH_GAIN",
    MUSCLE_BUILDING = "MUSCLE_BUILDING", 
    HYPERTROPHY = "HYPERTROPHY",     // Alias for MUSCLE_BUILDING
    FAT_LOSS = "FAT_LOSS",
    WEIGHT_LOSS = "WEIGHT_LOSS",     // Alias for FAT_LOSS
    
    // Performance goals
    ENDURANCE = "ENDURANCE",
    POWER_DEVELOPMENT = "POWER_DEVELOPMENT",
    ATHLETICISM = "ATHLETICISM",
    SPORT_SPECIFIC = "SPORT_SPECIFIC",
    SKILL_DEVELOPMENT = "SKILL_DEVELOPMENT",
    
    // General wellness goals
    GENERAL_FITNESS = "GENERAL_FITNESS",
    FLEXIBILITY = "FLEXIBILITY",
    MOBILITY = "MOBILITY",
    MAINTENANCE = "MAINTENANCE",
    ACTIVE_RECOVERY = "ACTIVE_RECOVERY",
    REHABILITATION = "REHABILITATION",
    
    // Special purpose
    CUSTOM = "CUSTOM"  // For user-defined goals
}
```

### Exercise Configuration Enums
For exercise configurations, use these enums:

#### ExerciseRole
```typescript
export enum ExerciseRole {
    PRIMARY = "PRIMARY",       // Main compound exercise
    SECONDARY = "SECONDARY",   // Supporting compound exercise
    ACCESSORY = "ACCESSORY",   // Isolation exercise
    WARMUP = "WARMUP",         // Preparation exercise
    FINISHER = "FINISHER",     // End-of-workout high-intensity exercise
    SKILL = "SKILL",           // Technique-focused exercise
    MOBILITY = "MOBILITY"      // Flexibility/mobility exercise
}
```

#### SetType
```typescript
export enum SetType {
    STRAIGHT = "STRAIGHT",           // Same weight/reps across all sets
    PYRAMID = "PYRAMID",             // Increasing weight, decreasing reps
    REVERSE_PYRAMID = "REVERSE_PYRAMID", // Decreasing weight, increasing reps
    DROP = "DROP",                   // Drop sets with decreasing weight
    SUPER = "SUPER",                 // Supersets with minimal rest
    NORMAL = "NORMAL",               // Standard set structure
    TRISET = "TRISET",               // Three exercises in sequence
    GIANT_SET = "GIANT_SET",         // Four or more exercises in sequence
    CIRCUIT = "CIRCUIT"              // Circuit training format
}
```

#### SetStructure
```typescript
export enum SetStructure {
    REGULAR = "REGULAR",
    DROP_SET = "DROP_SET",
    REST_PAUSE = "REST_PAUSE",
    AMRAP = "AMRAP",           // As Many Reps As Possible
    EMOM = "EMOM",             // Every Minute On the Minute
    TABATA = "TABATA",
    PYRAMID = "PYRAMID",
    REVERSE_PYRAMID = "REVERSE_PYRAMID"
}
```

### Progression Enums
For progression models, use:

#### ProgressionType
```typescript
export enum ProgressionType {
    LINEAR = "LINEAR",             // Steady progression
    UNDULATING = "UNDULATING",     // Variable progression
    DAILY_UNDULATING = "DAILY_UNDULATING", // Daily variable progression
    WEEKLY_UNDULATING = "WEEKLY_UNDULATING", // Weekly variable progression
    WAVE = "WAVE",                // Wave-loading progression
    BLOCK = "BLOCK",              // Block periodization
    CONJUGATE = "CONJUGATE",      // Conjugate method
    CONCURRENT = "CONCURRENT"     // Multiple goals simultaneously
}
```

#### MeasurementType
```typescript
export enum MeasurementType {
    REPS = "REPS",                // Repetition-based
    DURATION = "DURATION",        // Time-based
    DISTANCE = "DISTANCE",        // Distance-based
    WEIGHT = "WEIGHT",            // Weight/resistance-based
    COMBO = "COMBO"               // Combination of measurements
}
```

## Approved Exercise List Reference
When adding exercises to a workout plan, use the exact names from the following categories:

### Upper Body
- **Chest**: Push-up, Dumbbell Bench Press, Barbell Bench Press, Incline Dumbbell Press, Decline Push-up, Cable Fly, Dumbbell Pullover, Chest Dip
- **Back**: Pull-up, Lat Pulldown, Seated Row, Bent-Over Row, T-Bar Row, Face Pull, Straight-Arm Pulldown
- **Shoulders**: Military Press, Lateral Raise, Front Raise, Dumbbell Shoulder Press, Rear Delt Fly, Arnold Press, Upright Row
- **Biceps**: Hammer Curl, Concentration Curl, Preacher Curl, Chin-Up, Barbell Curl
- **Triceps**: Tricep Pushdown, Overhead Tricep Extension, Diamond Push-Up, Skull Crusher
- **Forearms**: Wrist Curl
- **Combined Upper Body**: Clean and Press, Push Press, Dumbbell Thruster

### Lower Body
- **Quadriceps**: Barbell Back Squat, Front Squat, Leg Press, Leg Extension, Bulgarian Split Squat, Bodyweight Squat
- **Hamstrings**: Leg Curl, Romanian Deadlift, Good Morning, Nordic Hamstring Curl, Glute-Ham Raise
- **Glutes**: Hip Thrust, Glute Bridge, Cable Pull Through, Curtsy Lunge, Banded Lateral Walk
- **Calves**: Standing Calf Raise, Seated Calf Raise, Donkey Calf Raise, Single-Leg Calf Raise
- **Full Lower Body**: Forward Lunge
- **Posterior Chain**: Kettlebell Swing, Sumo Deadlift, Single-Leg Deadlift, Back Extension

### Core
- **Abdominal**: Crunch, Hanging Leg Raise, Ab Rollout, Toe Touches, Hollow Hold
- **Obliques**: Russian Twist, Bicycle Crunch
- **Core Stabilization**: Plank, Side Plank, Dead Bug, Bird Dog, Pallof Press, Wood Chop, Reverse Crunch, Ab Wheel Rollout

### Cardio
- **HIIT**: Mountain Climbers, Burpee, High Knees, Sprint
- **Mixed Cardio**: Jump Rope, Box Jump, Jumping Jack, Bear Crawl, Elliptical Trainer, Rowing Machine

### Flexibility/Mobility
- **Stretches**: Shoulder Dislocates, Hip Flexor Stretch, Hamstring Stretch, World's Greatest Stretch, Downward Dog

## Approved Equipment List Reference
When adding equipment to a workout plan, use the exact names from this list:

1. **Dumbbells** - Variable weight handheld weights
2. **Barbell** - Standard Olympic barbell
3. **Weight Plates** - Plates for barbells and machines
4. **Bench** - Adjustable workout bench
5. **Squat Rack** - Rack for barbell exercises
6. **Resistance Bands** - Elastic bands for resistance training
7. **Kettlebell** - Cast iron weight with handle
8. **Medicine Ball** - Weighted ball for dynamic exercises
9. **Plyo Box** - Box for jumping and step exercises
10. **Jump Rope** - Rope for cardiovascular training
11. **Battle Ropes** - Heavy ropes for HIIT training
12. **Yoga Mat** - Mat for floor exercises
13. **Foam Roller** - Cylindrical foam tool for myofascial release
14. **Pull-up Bar** - Bar for pull-up exercises
15. **TRX Suspension Trainer** - Strap system for bodyweight training
16. **Stability Ball** - Large inflated ball for stability training
17. **Bosu Ball** - Half-ball stability trainer
18. **Ab Roller Wheel** - Wheel for core training
19. **Gliding Discs** - Discs for low-friction exercises
20. **Agility Ladder** - Ladder for footwork and agility drills

## Approved Workout Tag List Reference
When adding tags to a workout plan, use the exact names from this list:

1. **Beginner** - Suitable for individuals new to fitness training
2. **Intermediate** - For those with some fitness experience
3. **Advanced** - Challenging workouts for experienced fitness enthusiasts
4. **Strength** - Focused on building muscular strength and power
5. **Hypertrophy** - Designed for muscle growth and size development
6. **Fat Loss** - Aimed at reducing body fat and improving body composition
7. **Cardio** - Emphasizes cardiovascular endurance and stamina
8. **HIIT** - High-Intensity Interval Training for efficient fat burning
9. **Mobility** - Focuses on joint mobility and range of motion
10. **Recovery** - Low-intensity sessions for active recovery
11. **Full Body** - Targets all major muscle groups in a single session
12. **Upper Body** - Focuses on chest, back, shoulders, and arms
13. **Lower Body** - Targets legs, glutes, and lower body muscles
14. **Core** - Emphasizes abdominal and core muscle development
15. **Circuit** - Structured as a series of exercises with minimal rest

## Progress Tracking
- Current completion: 30/30 workout plans (100%)
- Last updated: May 2024

## Implementation Timeline
- Phase 1: Complete all beginner workout plans
- Phase 2: Complete all intermediate workout plans
- Phase 3: Complete all advanced workout plans 