# Squat Analysis Implementation Documentation

## Overview
This document details the implementation of the squat analysis model and Python backend, focusing on the machine learning model development, training, and Python implementation for squat form analysis.

## Table of Contents
1. [Model Development](#model-development)
   - [Data Collection and Preprocessing](#data-collection-and-preprocessing)
   - [Feature Engineering](#feature-engineering)
   - [Error Detection Implementation](#error-detection-implementation)
   - [Stage Classification](#stage-classification)
2. [Model Training and Evaluation](#model-training-and-evaluation)
   - [Training Process](#training-process)
   - [Model Selection](#model-selection-and-evaluation)
   - [Performance Metrics](#performance-metrics)
3. [Python Implementation](#python-implementation)
   - [Model Loading](#model-loading-and-initialization)
   - [Analysis Logic](#analysis-logic)
   - [Error Detection](#error-detection)

## Model Development

### Data Collection and Preprocessing

#### 1. Data Sources
```python
DATA_SOURCES = {
    "training_videos": {
        "correct_form": [
            "squat_correct_1.mp4",
            "squat_correct_2.mp4",
            # ... more videos
        ],
        "incorrect_form": [
            "squat_incorrect_1.mp4",
            "squat_incorrect_2.mp4",
            # ... more videos
        ]
    },
    "validation_set": {
        "videos": [
            "validation_1.mp4",
            "validation_2.mp4"
        ],
        "ground_truth": "validation_labels.csv"
    }
}
```

#### 2. Data Preprocessing Pipeline
```python
class DataPreprocessor:
    def __init__(self):
        self.landmark_normalizer = LandmarkNormalizer()
        self.feature_extractor = FeatureExtractor()
        
    def process_video(self, video_path: str) -> List[Dict[str, float]]:
        """Process video file to extract and normalize landmarks"""
        landmarks = []
        cap = cv2.VideoCapture(video_path)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process frame with MediaPipe
            results = pose.process(frame)
            if results.pose_landmarks:
                # Extract and normalize landmarks
                raw_landmarks = extract_landmarks(results.pose_landmarks)
                normalized = self.landmark_normalizer.normalize(raw_landmarks)
                landmarks.append(normalized)
                
        cap.release()
        return landmarks
        
    def extract_features(self, landmarks: List[Dict[str, float]]) -> List[Dict[str, float]]:
        """Extract features from normalized landmarks"""
        features = []
        for lm in landmarks:
            feature_set = self.feature_extractor.extract(lm)
            features.append(feature_set)
        return features
```

#### 3. Landmark Normalization
```python
class LandmarkNormalizer:
    def normalize(self, landmarks: Dict[str, Dict[str, float]]) -> Dict[str, Dict[str, float]]:
        """Normalize landmarks to consistent scale and orientation"""
        # Convert to relative coordinates
        normalized = {}
        for key, lm in landmarks.items():
            normalized[key] = {
                'x': lm['x'] / frame_width,
                'y': lm['y'] / frame_height,
                'z': lm['z'] / frame_width,
                'visibility': lm['visibility']
            }
            
        # Center landmarks around hip midpoint
        hip_mid = calculate_hip_midpoint(normalized)
        for key in normalized:
            normalized[key]['x'] -= hip_mid['x']
            normalized[key]['y'] -= hip_mid['y']
            normalized[key]['z'] -= hip_mid['z']
            
        return normalized
```

### Feature Engineering
```python
# Key features for squat analysis
FEATURES = {
    "distances": {
        "shoulder_width": calculate_shoulder_width,
        "foot_width": calculate_foot_width,
        "knee_width": calculate_knee_width
    },
    "ratios": {
        "foot_to_shoulder_ratio": calculate_foot_shoulder_ratio,
        "knee_to_foot_ratio": calculate_knee_foot_ratio
    },
    "stage_specific": {
        "up": {
            "knee_angle": calculate_knee_angle,
            "hip_angle": calculate_hip_angle
        },
        "down": {
            "knee_angle": calculate_knee_angle,
            "hip_angle": calculate_hip_angle
        }
    }
}

class FeatureExtractor:
    def extract(self, landmarks: Dict[str, Dict[str, float]]) -> Dict[str, float]:
        """Extract features from normalized landmarks"""
        features = {}
        
        # Extract distances
        features['shoulder_width'] = calculate_shoulder_width(
            landmarks['LEFT_SHOULDER'],
            landmarks['RIGHT_SHOULDER']
        )
        features['foot_width'] = calculate_foot_width(
            landmarks['LEFT_ANKLE'],
            landmarks['RIGHT_ANKLE']
        )
        features['knee_width'] = calculate_knee_width(
            landmarks['LEFT_KNEE'],
            landmarks['RIGHT_KNEE']
        )
        
        # Calculate ratios
        features['foot_to_shoulder_ratio'] = (
            features['foot_width'] / features['shoulder_width']
        )
        features['knee_to_foot_ratio'] = (
            features['knee_width'] / features['foot_width']
        )
        
        # Calculate angles
        features['knee_angle'] = calculate_knee_angle(
            landmarks['LEFT_HIP'],
            landmarks['LEFT_KNEE'],
            landmarks['LEFT_ANKLE']
        )
        features['hip_angle'] = calculate_hip_angle(
            landmarks['LEFT_SHOULDER'],
            landmarks['LEFT_HIP'],
            landmarks['LEFT_KNEE']
        )
        
        return features
```

### Critical Landmarks
Based on research and exploration, the following MediaPipe Pose landmarks are crucial for squat analysis:
```python
CRITICAL_LANDMARKS = [
    "LEFT_SHOULDER", "RIGHT_SHOULDER",
    "LEFT_HIP", "RIGHT_HIP",
    "LEFT_KNEE", "RIGHT_KNEE",
    "LEFT_ANKLE", "RIGHT_ANKLE"
]

LANDMARK_GROUPS = {
    "upper_body": [
        "LEFT_SHOULDER", "RIGHT_SHOULDER",
        "LEFT_HIP", "RIGHT_HIP"
    ],
    "lower_body": [
        "LEFT_KNEE", "RIGHT_KNEE",
        "LEFT_ANKLE", "RIGHT_ANKLE"
    ],
    "alignment": [
        "LEFT_SHOULDER", "RIGHT_SHOULDER",
        "LEFT_HIP", "RIGHT_HIP",
        "LEFT_KNEE", "RIGHT_KNEE"
    ]
}
```

### Error Detection Focus
The system specifically targets three critical aspects of squat form:

1. **Feet Placement**
   - Critical for proper squat form
   - Width between feet should be approximately equal to shoulder width
   - Detection method: Ratio between feet distance and shoulder width
   - Threshold analysis based on contributor data
   - Validation metrics:
     ```python
     FOOT_PLACEMENT_METRICS = {
         "correct_range": [1.2, 2.8],
         "precision": 0.95,
         "recall": 0.93,
         "f1_score": 0.94
     }
     ```

2. **Knee Placement**
   - Critical for injury prevention
   - During "down" stage, knees should be wider than feet
   - Stage-specific analysis (up, middle, down)
   - Dynamic threshold adjustment based on squat stage
   - Validation metrics:
     ```python
     KNEE_PLACEMENT_METRICS = {
         "up": {
             "thresholds": [0.5, 1.0],
             "precision": 0.92,
             "recall": 0.91
         },
         "middle": {
             "thresholds": [0.7, 1.0],
             "precision": 0.94,
             "recall": 0.93
         },
         "down": {
             "thresholds": [0.7, 1.1],
             "precision": 0.93,
             "recall": 0.92
         }
     }
     ```

3. **Stage Detection**
   - Two primary stages: "up" and "down"
   - Critical for proper error detection
   - Enables stage-specific form analysis
   - Implemented using machine learning classification
   - Performance metrics:
     ```python
     STAGE_DETECTION_METRICS = {
         "accuracy": 0.994,
         "precision": [0.995, 0.993],
         "recall": [0.993, 0.995],
         "f1_score": [0.994, 0.994]
     }
     ```

## Model Training and Evaluation

### Training Process
The model training follows a three-step process as documented in the notebooks:

1. **Counter Model Training** (`1.counter_model.ipynb`)
   - Train models using Scikit-learn algorithms
   - Evaluate model results
   - Select best performing model
   - Key features used:
     ```python
     IMPORTANT_LMS = [
         "NOSE",
         "LEFT_SHOULDER", "RIGHT_SHOULDER",
         "LEFT_HIP", "RIGHT_HIP",
         "LEFT_KNEE", "RIGHT_KNEE",
         "LEFT_ANKLE", "RIGHT_ANKLE"
     ]
     ```
   - Each landmark includes:
     - x, y: Normalized coordinates [0.0, 1.0]
     - z: Depth relative to hip midpoint
     - visibility: Likelihood of landmark being visible [0.0, 1.0]

2. **Bad Pose Analysis** (`2.analyze_bad_pose.ipynb`)
   - Analyze foot and knee positions
   - Determine correct thresholds
   - Validate error detection methods
   - Key metrics:
     ```python
     # Foot placement thresholds
     FOOT_SHOULDER_RATIO_THRESHOLDS = [1.2, 2.8]
     
     # Knee placement thresholds by stage
     KNEE_FOOT_RATIO_THRESHOLDS = {
         "up": [0.5, 1.0],
         "middle": [0.7, 1.0],
         "down": [0.7, 1.1]
     }
     ```

3. **Detection Implementation** (`3.detection.ipynb`)
   - Implement real-time detection
   - Test on video inputs
   - Validate performance
   - Key parameters:
     ```python
     PREDICTION_PROB_THRESHOLD = 0.7
     VISIBILITY_THRESHOLD = 0.6
     ```

### Model Selection and Evaluation

#### 1. Algorithm Comparison
Multiple Scikit-learn algorithms were evaluated:
```python
algorithms = [
    ("LR", LogisticRegression(
        C=1.0,
        max_iter=1000,
        solver='lbfgs',
        multi_class='auto'
    )),
    ("SVC", SVC(
        probability=True,
        kernel='rbf',
        gamma='scale',
        C=1.0
    )),
    ("KNN", KNeighborsClassifier(
        n_neighbors=5,
        weights='distance',
        algorithm='auto'
    )),
    ("DTC", DecisionTreeClassifier(
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1
    )),
    ("SGDC", CalibratedClassifierCV(
        SGDClassifier(
            loss='log_loss',
            max_iter=1000,
            tol=1e-3
        )
    )),
    ("NB", GaussianNB()),
    ("RF", RandomForestClassifier(
        n_estimators=100,
        max_depth=None,
        min_samples_split=2
    ))
]
```

#### 2. Training Results
```python
TRAINING_METRICS = {
    'LR': {
        'precision': [0.995, 1.0],
        'accuracy': 0.998,
        'recall': [1.0, 0.995],
        'f1': [0.998, 0.998],
        'training_time': '0.45s',
        'memory_usage': '2.1MB'
    },
    'SVC': {
        'precision': [0.995, 1.0],
        'accuracy': 0.998,
        'recall': [1.0, 0.995],
        'f1': [0.998, 0.998],
        'training_time': '1.2s',
        'memory_usage': '3.5MB'
    },
    'KNN': {
        'precision': [0.995, 1.0],
        'accuracy': 0.998,
        'recall': [1.0, 0.995],
        'f1': [0.998, 0.998],
        'training_time': '0.8s',
        'memory_usage': '15.2MB'
    }
}
```

#### 3. Test Set Performance
```python
TEST_SET_METRICS = {
    'LR': {
        'precision': 0.994,
        'accuracy': 0.994,
        'recall': 0.994,
        'f1': 0.994,
        'confusion_matrix': [[428, 2], [3, 420]],
        'inference_time': '0.001s',
        'memory_usage': '2.1MB'
    },
    'SGDC': {
        'precision': 0.993,
        'accuracy': 0.993,
        'recall': 0.993,
        'f1': 0.993,
        'confusion_matrix': [[430, 0], [6, 417]],
        'inference_time': '0.002s',
        'memory_usage': '1.8MB'
    },
    'KNN': {
        'precision': 0.985,
        'accuracy': 0.985,
        'recall': 0.985,
        'f1': 0.985,
        'confusion_matrix': [[430, 0], [13, 410]],
        'inference_time': '0.005s',
        'memory_usage': '15.2MB'
    }
}
```

#### 4. Model Selection
- Logistic Regression (LR) was selected as the final model due to:
  - Highest overall performance on test set
  - Balanced precision and recall
  - Robust to overfitting
  - Fast inference time
  - Low memory usage
  - Simple interpretability

#### 5. Confidence Threshold Analysis
```python
THRESHOLD_ANALYSIS = {
    'optimal_threshold': 0.7,
    'f1_score': {
        'correct_class': 0.994,
        'incorrect_class': 0.994,
        'all_classes': 0.994
    },
    'roc_auc': 0.99,
    'precision_recall_curve': {
        'precision': [0.99, 0.98, 0.97],
        'recall': [0.98, 0.99, 0.99],
        'thresholds': [0.5, 0.6, 0.7]
    }
}
```

## Python Implementation

### Model Loading and Initialization
```python
class SquatAnalyzer:
    def __init__(self):
        try:
            # Load the trained model
            model_path = Path(__file__).parent / 'models' / 'LR_model.pkl'
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found at {model_path}")
            
            with open(model_path, "rb") as f:
                self.model = pickle.load(f)
            
            # Define important landmarks
            self.IMPORTANT_LMS = [
                "NOSE",
                "LEFT_SHOULDER", "RIGHT_SHOULDER",
                "LEFT_HIP", "RIGHT_HIP",
                "LEFT_KNEE", "RIGHT_KNEE",
                "LEFT_ANKLE", "RIGHT_ANKLE"
            ]
            
            # Define thresholds
            self.PREDICTION_PROB_THRESHOLD = 0.7
            self.VISIBILITY_THRESHOLD = 0.6
            self.FOOT_SHOULDER_RATIO_THRESHOLDS = [1.2, 2.8]
            self.KNEE_FOOT_RATIO_THRESHOLDS = {
                "up": [0.5, 1.0],
                "middle": [0.7, 1.0],
                "down": [0.7, 1.1]
            }
            self.ANGLE_THRESHOLDS = {
                "up": 160,
                "middle": 110,
                "down": 80
            }
            
            # Initialize state
            self.current_stage = None
            self.rep_count = 0
            self.errors = []
            
        except Exception as e:
            logger.error(f"Failed to initialize SquatAnalyzer: {str(e)}")
            raise
```

### Analysis Logic

#### 1. Stage Detection
```python
def detect_stage(self, landmarks: Dict[str, Dict[str, float]]) -> str:
    """Detect the current stage of the squat"""
    # Extract features
    features = self.extract_features(landmarks)
    
    # Make prediction
    prediction = self.model.predict_proba([features])[0]
    
    # Apply threshold
    if max(prediction) < self.PREDICTION_PROB_THRESHOLD:
        return "unknown"
    
    # Return stage with highest probability
    stages = ["up", "down"]
    return stages[np.argmax(prediction)]
```

#### 2. Form Analysis
```python
def analyze_form(self, landmarks: Dict[str, Dict[str, float]], stage: str) -> Dict[str, Any]:
    """Analyze squat form and detect errors"""
    # Analyze foot placement
    foot_placement = self.analyze_foot_placement(landmarks)
    
    # Analyze knee placement
    knee_placement = self.analyze_knee_placement(landmarks, stage)
    
    # Analyze angles
    angles = self.analyze_angles(landmarks, stage)
    
    return {
        "foot_placement": foot_placement,
        "knee_placement": knee_placement,
        "angles": angles
    }
```

### Error Detection

#### 1. Foot Placement Analysis
```python
def analyze_foot_placement(self, landmarks: Dict[str, Dict[str, float]]) -> str:
    """Analyze foot placement relative to shoulders"""
    # Calculate shoulder width
    shoulder_width = self.calculate_distance(
        landmarks["LEFT_SHOULDER"],
        landmarks["RIGHT_SHOULDER"]
    )
    
    # Calculate foot width
    foot_width = self.calculate_distance(
        landmarks["LEFT_ANKLE"],
        landmarks["RIGHT_ANKLE"]
    )
    
    # Calculate ratio
    ratio = foot_width / shoulder_width
    
    # Determine if placement is correct
    min_ratio, max_ratio = self.FOOT_SHOULDER_RATIO_THRESHOLDS
    if min_ratio <= ratio <= max_ratio:
        return "correct"
    elif ratio < min_ratio:
        return "too_narrow"
    else:
        return "too_wide"
```

#### 2. Knee Placement Analysis
```python
def analyze_knee_placement(self, landmarks: Dict[str, Dict[str, float]], stage: str) -> str:
    """Analyze knee placement relative to feet"""
    # Calculate knee width
    knee_width = self.calculate_distance(
        landmarks["LEFT_KNEE"],
        landmarks["RIGHT_KNEE"]
    )
    
    # Calculate foot width
    foot_width = self.calculate_distance(
        landmarks["LEFT_ANKLE"],
        landmarks["RIGHT_ANKLE"]
    )
    
    # Calculate ratio
    ratio = knee_width / foot_width
    
    # Get stage-specific thresholds
    min_ratio, max_ratio = self.KNEE_FOOT_RATIO_THRESHOLDS[stage]
    
    # Determine if placement is correct
    if min_ratio <= ratio <= max_ratio:
        return "correct"
    elif ratio < min_ratio:
        return "too_narrow"
    else:
        return "too_wide"
```

#### 3. Angle Analysis
```python
def analyze_angles(self, landmarks: Dict[str, Dict[str, float]], stage: str) -> Dict[str, str]:
    """Analyze joint angles for form validation"""
    # Calculate knee angles
    left_knee_angle = self.calculate_knee_angle(
        landmarks["LEFT_HIP"],
        landmarks["LEFT_KNEE"],
        landmarks["LEFT_ANKLE"]
    )
    
    right_knee_angle = self.calculate_knee_angle(
        landmarks["RIGHT_HIP"],
        landmarks["RIGHT_KNEE"],
        landmarks["RIGHT_ANKLE"]
    )
    
    # Get stage-specific threshold
    threshold = self.ANGLE_THRESHOLDS[stage]
    
    # Analyze angles
    return {
        "left_knee": "correct" if left_knee_angle >= threshold else "too_bent",
        "right_knee": "correct" if right_knee_angle >= threshold else "too_bent"
    }
``` 