# Model Training Details

## Overview
This document details the model training process for each exercise in the OKGYM system, focusing on the technical implementation and training methodology.

## Common Training Components

### 1. Data Preprocessing Pipeline
```python
# Standard scaling of features
sc = StandardScaler()
X = pd.DataFrame(sc.transform(X))

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1234)
```

### 2. Model Training Algorithms
All exercises use the following algorithms:
- Logistic Regression (LR)
- Support Vector Classifier (SVC)
- K-Nearest Neighbors (KNN)
- Decision Tree Classifier (DTC)
- Stochastic Gradient Descent Classifier (SGDC)
- Random Forest Classifier (RF)
- Ridge Classifier

### 3. Feature Engineering
Each exercise uses specific landmarks from MediaPipe Pose:
- Squat: 9 keypoints (36 features)
  - NOSE, LEFT_SHOULDER, RIGHT_SHOULDER
  - LEFT_HIP, RIGHT_HIP
  - LEFT_KNEE, RIGHT_KNEE
  - LEFT_ANKLE, RIGHT_ANKLE

- Bicep Curl: 9 keypoints (36 features)
  - NOSE, LEFT_SHOULDER, RIGHT_SHOULDER
  - LEFT_ELBOW, RIGHT_ELBOW
  - LEFT_WRIST, RIGHT_WRIST
  - LEFT_HIP, RIGHT_HIP

- Lunge: 13 keypoints (52 features)
  - NOSE, LEFT_SHOULDER, RIGHT_SHOULDER
  - LEFT_HIP, RIGHT_HIP
  - LEFT_KNEE, RIGHT_KNEE
  - LEFT_ANKLE, RIGHT_ANKLE
  - LEFT_HEEL, RIGHT_HEEL
  - LEFT_FOOT_INDEX, RIGHT_FOOT_INDEX

Each landmark provides 4 features:
- x: Normalized x-coordinate [0.0, 1.0]
- y: Normalized y-coordinate [0.0, 1.0]
- z: Depth relative to hip midpoint
- visibility: Likelihood of landmark being visible [0.0, 1.0]

## Exercise-Specific Training

### 1. Squat Model

#### Dataset
- Total samples: 4,160
- Features: 36 (landmark coordinates)
- Labels: down (0), up (1)

#### Training Process
```python
# Label encoding
df.loc[df["label"] == "down", "label"] = 0
df.loc[df["label"] == "up", "label"] = 1

# Feature extraction
X = df.drop("label", axis=1)
y = df["label"].astype('int')

# Model training
algorithms = [
    ("LR", LogisticRegression()),
    ("SVC", SVC(probability=True)),
    ("KNN", KNeighborsClassifier()),
    ("DTC", DecisionTreeClassifier()),
    ("SGDC", CalibratedClassifierCV(SGDClassifier())),
    ("RF", RandomForestClassifier())
]

for name, model in algorithms:
    trained_model = model.fit(X_train, y_train)
```

### 2. Bicep Curl Model

#### Dataset
- Total samples: 15,372
- Features: 36 (landmark coordinates)
- Labels: C (0), L (1)

#### Training Process
```python
# Label encoding
df.loc[df["label"] == "C", "label"] = 0
df.loc[df["label"] == "L", "label"] = 1

# Feature extraction
X = df.drop("label", axis=1)
y = df["label"].astype('int')

# Model training
algorithms = [
    ("LR", LogisticRegression()),
    ("SVC", SVC(probability=True)),
    ("KNN", KNeighborsClassifier()),
    ("DTC", DecisionTreeClassifier()),
    ("SGDC", CalibratedClassifierCV(SGDClassifier())),
    ("RF", RandomForestClassifier())
]

for name, model in algorithms:
    trained_model = model.fit(X_train, y_train)
```

### 3. Lunge Model

#### Dataset
- Total samples: 24,244
- Features: 52 (landmark coordinates)
- Labels: I (INIT), M (MID), D (DOWN)

#### Training Process
```python
# Feature extraction
X = df.drop("label", axis=1)
y = df["label"]

# Model training
algorithms = [
    ("LR", LogisticRegression()),
    ("SVC", SVC(probability=True)),
    ("KNN", KNeighborsClassifier()),
    ("DTC", DecisionTreeClassifier()),
    ("SGDC", SGDClassifier()),
    ("Ridge", RidgeClassifier()),
    ("RF", RandomForestClassifier())
]

for name, model in algorithms:
    trained_model = model.fit(X_train, y_train)
```

## Model Persistence

### Saving Trained Models
```python
# Save individual models
with open("./model/sklearn/stage_LR_model.pkl", "wb") as f:
    pickle.dump(models["LR"], f)

with open("./model/sklearn/stage_SVC_model.pkl", "wb") as f:
    pickle.dump(models["SVC"], f)

with open("./model/sklearn/stage_Ridge_model.pkl", "wb") as f:
    pickle.dump(models["Ridge"], f)

# Save scaler
with open("./model/input_scaler.pkl", "wb") as f:
    pickle.dump(sc, f)
```

## Training Performance

### Computational Resources
1. **Training Time**
   - Random Forest: ~2-3 minutes
   - Support Vector Classifier: ~1-2 minutes
   - Logistic Regression/KNN: < 1 minute

2. **Memory Usage**
   - Random Forest: High (due to multiple trees)
   - Support Vector Classifier: Medium
   - Logistic Regression/KNN: Low

### Training Parameters
1. **Random Forest**
   - n_estimators: 100
   - max_depth: None
   - min_samples_split: 2
   - min_samples_leaf: 1

2. **Support Vector Classifier**
   - kernel: 'rbf'
   - C: 1.0
   - gamma: 'scale'

3. **Logistic Regression**
   - solver: 'lbfgs'
   - max_iter: 1000
   - multi_class: 'auto'

4. **K-Nearest Neighbors**
   - n_neighbors: 5
   - weights: 'uniform'
   - algorithm: 'auto'

5. **Stochastic Gradient Descent**
   - loss: 'hinge'
   - penalty: 'l2'
   - max_iter: 1000

6. **Ridge Classifier**
   - alpha: 1.0
   - solver: 'auto'
   - normalize: False 