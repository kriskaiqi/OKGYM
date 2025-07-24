# Exercise Model Training Documentation

## Overview
This document details the machine learning model training process for various exercises in the fitness analysis system. Each exercise has its own specialized model trained using different algorithms and techniques.

## Common Training Process

### Data Preprocessing
```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# Load dataset
df = pd.read_csv("train.csv")

# Standard Scaling of features
sc = StandardScaler()
X = df.drop("label", axis=1)
X = pd.DataFrame(sc.transform(X))
y = df["label"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1234)
```

### Feature Extraction
```python
def extract_features(landmarks):
    """
    Extract features from pose landmarks
    """
    features = []
    
    # Calculate distances between key points
    def calculate_distance(point1, point2):
        return np.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    # Calculate angles between key points
    def calculate_angle(a, b, c):
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360-angle
            
        return angle
    
    # Extract features for each frame
    for frame in landmarks:
        frame_features = []
        
        # Add raw coordinates
        frame_features.extend(frame.flatten())
        
        # Add calculated distances and angles
        # Example for squat: knee angles, hip angles, etc.
        frame_features.append(calculate_angle(frame[11], frame[13], frame[15]))  # Left knee angle
        frame_features.append(calculate_angle(frame[12], frame[14], frame[16]))  # Right knee angle
        
        features.append(frame_features)
    
    return np.array(features)
```

### Model Training
```python
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.calibration import CalibratedClassifierCV

# Define algorithms with specific parameters
algorithms = [
    ("LR", LogisticRegression(
        max_iter=1000,
        solver='lbfgs',
        multi_class='multinomial'
    )),
    ("SVC", SVC(
        probability=True,
        kernel='rbf',
        gamma='scale'
    )),
    ("KNN", KNeighborsClassifier(
        n_neighbors=5,
        weights='distance',
        metric='euclidean'
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
        min_samples_split=2,
        min_samples_leaf=1
    ))
]

# Train models
models = {}
for name, model in algorithms:
    print(f"Training {name}...")
    trained_model = model.fit(X_train, y_train)
    models[name] = trained_model
```

## Exercise-Specific Implementations

### Squat Model
```python
def extract_squat_features(landmarks):
    """
    Extract specific features for squat analysis
    """
    features = []
    
    for frame in landmarks:
        frame_features = []
        
        # Knee angles
        left_knee_angle = calculate_angle(frame[23], frame[25], frame[27])  # Left knee
        right_knee_angle = calculate_angle(frame[24], frame[26], frame[28])  # Right knee
        
        # Hip angles
        left_hip_angle = calculate_angle(frame[11], frame[23], frame[25])  # Left hip
        right_hip_angle = calculate_angle(frame[12], frame[24], frame[26])  # Right hip
        
        # Foot width
        foot_width = calculate_distance(frame[27], frame[28])  # Distance between ankles
        
        frame_features.extend([
            left_knee_angle,
            right_knee_angle,
            left_hip_angle,
            right_hip_angle,
            foot_width
        ])
        
        features.append(frame_features)
    
    return np.array(features)
```

### Bicep Curl Model
```python
def extract_bicep_features(landmarks):
    """
    Extract specific features for bicep curl analysis
    """
    features = []
    
    for frame in landmarks:
        frame_features = []
        
        # Elbow angles
        left_elbow_angle = calculate_angle(frame[11], frame[13], frame[15])  # Left elbow
        right_elbow_angle = calculate_angle(frame[12], frame[14], frame[16])  # Right elbow
        
        # Shoulder angles
        left_shoulder_angle = calculate_angle(frame[13], frame[11], frame[23])  # Left shoulder
        right_shoulder_angle = calculate_angle(frame[14], frame[12], frame[24])  # Right shoulder
        
        frame_features.extend([
            left_elbow_angle,
            right_elbow_angle,
            left_shoulder_angle,
            right_shoulder_angle
        ])
        
        features.append(frame_features)
    
    return np.array(features)
```

### Plank Model
```python
def extract_plank_features(landmarks):
    """
    Extract specific features for plank analysis
    """
    features = []
    
    for frame in landmarks:
        frame_features = []
        
        # Shoulder-hip alignment
        shoulder_hip_angle = calculate_angle(frame[11], frame[23], frame[24])  # Shoulder-hip line
        
        # Hip-knee alignment
        hip_knee_angle = calculate_angle(frame[23], frame[25], frame[27])  # Left side
        hip_knee_angle += calculate_angle(frame[24], frame[26], frame[28])  # Right side
        
        # Core stability
        core_stability = calculate_distance(frame[11], frame[23])  # Shoulder-hip distance
        
        frame_features.extend([
            shoulder_hip_angle,
            hip_knee_angle,
            core_stability
        ])
        
        features.append(frame_features)
    
    return np.array(features)
```

### Lunge Model
```python
def extract_lunge_features(landmarks):
    """
    Extract specific features for lunge analysis
    """
    features = []
    
    for frame in landmarks:
        frame_features = []
        
        # Knee angles
        front_knee_angle = calculate_angle(frame[23], frame[25], frame[27])  # Front knee
        back_knee_angle = calculate_angle(frame[24], frame[26], frame[28])  # Back knee
        
        # Hip angles
        front_hip_angle = calculate_angle(frame[11], frame[23], frame[25])  # Front hip
        back_hip_angle = calculate_angle(frame[12], frame[24], frame[26])  # Back hip
        
        # Stance width
        stance_width = calculate_distance(frame[27], frame[28])  # Distance between feet
        
        frame_features.extend([
            front_knee_angle,
            back_knee_angle,
            front_hip_angle,
            back_hip_angle,
            stance_width
        ])
        
        features.append(frame_features)
    
    return np.array(features)
```

## Implementation Details

### Model Persistence
```python
import pickle
import os

def save_models(models, scaler, model_dir="./model/sklearn"):
    """
    Save trained models and scaler
    """
    # Create directory if it doesn't exist
    os.makedirs(model_dir, exist_ok=True)
    
    # Save models
    for name, model in models.items():
        with open(f"{model_dir}/{name}_model.pkl", "wb") as f:
            pickle.dump(model, f)
    
    # Save scaler
    with open(f"{model_dir}/input_scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

def load_models(model_dir="./model/sklearn"):
    """
    Load trained models and scaler
    """
    models = {}
    
    # Load models
    for model_file in os.listdir(model_dir):
        if model_file.endswith("_model.pkl"):
            name = model_file.replace("_model.pkl", "")
            with open(f"{model_dir}/{model_file}", "rb") as f:
                models[name] = pickle.load(f)
    
    # Load scaler
    with open(f"{model_dir}/input_scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    
    return models, scaler
```

