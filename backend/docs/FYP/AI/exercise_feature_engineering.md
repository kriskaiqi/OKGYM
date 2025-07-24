# Exercise Feature Engineering Documentation

## Overview
This document details the feature engineering implementations for four key exercises in the OKGYM system: Squat, Bicep Curl, Plank, and Lunge. Each exercise has its own specialized feature engineering approach while sharing common components.

## Common Components

### 1. MediaPipe Integration
All exercises utilize MediaPipe Pose for landmark detection:
```python
import mediapipe as mp
mp_pose = mp.solutions.pose
```

### 2. Basic Utilities
Shared utility functions across all exercises:
- Frame rescaling
- CSV data handling
- Angle calculations
- Landmark normalization

## Exercise-Specific Implementations

### 1. Squat Analysis

#### Key Landmarks
```python
IMPORTANT_LMS = [
    "NOSE",
    "LEFT_SHOULDER",
    "RIGHT_SHOULDER",
    "LEFT_HIP",
    "RIGHT_HIP",
    "LEFT_KNEE",
    "RIGHT_KNEE",
    "LEFT_ANKLE",
    "RIGHT_ANKLE",
    "LEFT_HEEL",
    "RIGHT_HEEL",
    "LEFT_FOOT_INDEX",
    "RIGHT_FOOT_INDEX"
]
```

#### Feature Engineering
1. **Distance Calculations**
   - Shoulder width
   - Foot width
   - Knee width

2. **Ratio Analysis**
   - Foot-to-shoulder ratio
   - Knee-to-shoulder ratio

3. **Error Detection**
   - Foot placement validation
   - Knee alignment checks

### 2. Bicep Curl Analysis

#### Key Landmarks
```python
IMPORTANT_LMS = [
    "NOSE",
    "LEFT_SHOULDER",
    "RIGHT_SHOULDER",
    "LEFT_ELBOW",
    "RIGHT_ELBOW",
    "LEFT_WRIST",
    "RIGHT_WRIST",
    "LEFT_HIP",
    "RIGHT_HIP"
]
```

#### Feature Engineering
1. **Angle Calculations**
   - Shoulder-elbow-wrist angles
   - Upper arm angle relative to body
   - Peak contraction angles

2. **Error Detection**
   - Lean back detection (ML and geometric)
   - Range of motion validation

3. **Thresholds**
```python
stage_up_threshold = 100
stage_down_threshold = 120
peak_contraction_threshold = 60
loose_upper_arm_angle_threshold = 40
```

### 3. Plank Analysis

#### Key Landmarks
```python
IMPORTANT_LMS = [
    "NOSE",
    "LEFT_SHOULDER",
    "RIGHT_SHOULDER",
    "LEFT_ELBOW",
    "RIGHT_ELBOW",
    "LEFT_WRIST",
    "RIGHT_WRIST",
    "LEFT_HIP",
    "RIGHT_HIP",
    "LEFT_KNEE",
    "RIGHT_KNEE",
    "LEFT_ANKLE",
    "RIGHT_ANKLE",
    "LEFT_HEEL",
    "RIGHT_HEEL",
    "LEFT_FOOT_INDEX",
    "RIGHT_FOOT_INDEX"
]
```

#### Feature Engineering
1. **Posture States**
   - Correct (C)
   - Back too low (L)
   - Back too high (H)

2. **Alignment Analysis**
   - Shoulder-hip alignment
   - Hip-knee alignment
   - Overall body straightness

### 4. Lunge Analysis

#### Key Landmarks
```python
IMPORTANT_LMS = [
    "NOSE",
    "LEFT_SHOULDER",
    "RIGHT_SHOULDER",
    "LEFT_HIP",
    "RIGHT_HIP",
    "LEFT_KNEE",
    "RIGHT_KNEE",
    "LEFT_ANKLE",
    "RIGHT_ANKLE",
    "LEFT_HEEL",
    "RIGHT_HEEL",
    "LEFT_FOOT_INDEX",
    "RIGHT_FOOT_INDEX"
]
```

#### Feature Engineering
1. **Stage Detection**
   - INIT (I): Stand straight
   - MID (M): Before going down
   - DOWN (D): Full lunge position

2. **Angle Analysis**
   - Knee angles
   - Hip angles
   - Ankle angles

## Implementation Notes

### 1. Data Collection
- All exercises use video data collection
- CSV format for storing landmark data
- Standardized column headers across exercises

### 2. Performance Considerations
- Real-time processing requirements
- Memory usage optimization
- Accuracy vs. speed trade-offs

### 3. Error Handling
- Landmark visibility checks
- Data validation
- Edge case handling

## Future Improvements

1. **Enhanced Feature Engineering**
   - Dynamic threshold adjustment
   - Personalized form analysis
   - Advanced error detection

2. **Performance Optimization**
   - Parallel processing
   - Caching mechanisms
   - Reduced feature set

3. **New Features**
   - Exercise-specific scoring
   - Progress tracking
   - Personalized feedback 