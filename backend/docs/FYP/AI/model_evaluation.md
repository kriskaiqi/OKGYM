# Model Evaluation Results

## Squat Analysis Model

### Model Selection and Performance

The squat analysis model was evaluated using multiple Scikit-learn algorithms. Here are the complete evaluation results for all tested algorithms:

#### Training Results
```python
TRAINING_RESULTS = {
    'LR': {
        'precision': 0.994,
        'accuracy': 0.994,
        'recall': 0.994,
        'f1': 0.994,
        'confusion_matrix': [[428, 2], [3, 420]],
        'training_time': '0.45s',
        'memory_usage': '2.1MB'
    },
    'SVM': {
        'precision': 0.992,
        'accuracy': 0.992,
        'recall': 0.992,
        'f1': 0.992,
        'confusion_matrix': [[426, 4], [3, 420]],
        'training_time': '1.2s',
        'memory_usage': '3.5MB'
    },
    'RF': {
        'precision': 0.991,
        'accuracy': 0.991,
        'recall': 0.991,
        'f1': 0.991,
        'confusion_matrix': [[425, 5], [3, 420]],
        'training_time': '2.8s',
        'memory_usage': '4.2MB'
    },
    'XGB': {
        'precision': 0.990,
        'accuracy': 0.990,
        'recall': 0.990,
        'f1': 0.990,
        'confusion_matrix': [[424, 6], [2, 421]],
        'training_time': '3.5s',
        'memory_usage': '5.1MB'
    }
}
```

#### Algorithm Comparison
```python
ALGORITHM_COMPARISON = {
    'metrics': {
        'precision': ['LR', 'SVM', 'RF', 'XGB'],
        'accuracy': ['LR', 'SVM', 'RF', 'XGB'],
        'recall': ['LR', 'SVM', 'RF', 'XGB'],
        'f1_score': ['LR', 'SVM', 'RF', 'XGB']
    },
    'performance': {
        'training_time': ['LR', 'SVM', 'RF', 'XGB'],
        'memory_usage': ['LR', 'SVM', 'RF', 'XGB'],
        'inference_time': ['LR', 'SVM', 'RF', 'XGB']
    }
}
```

#### Selected Model
Logistic Regression (LR) was selected as the final model due to its superior performance across all metrics:
- Highest precision, accuracy, recall, and F1 score (0.994)
- Fastest training time (0.45s)
- Lowest memory usage (2.1MB)
- Fastest inference time (0.001s)
- Best confusion matrix results with minimal false positives/negatives

### Error Detection Performance

#### 1. Foot Placement Analysis
```python
FOOT_PLACEMENT_METRICS = {
    "correct_range": [1.2, 2.8],
    "precision": 0.95,
    "recall": 0.93,
    "f1_score": 0.94
}
```

#### 2. Knee Placement Analysis
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

#### 3. Stage Detection
```python
STAGE_DETECTION_METRICS = {
    "accuracy": 0.994,
    "precision": [0.995, 0.993],
    "recall": [0.993, 0.995],
    "f1_score": [0.994, 0.994]
}
```

### Confidence Threshold Analysis
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

### Model Characteristics
- Selected Algorithm: Logistic Regression (LR)
- Training Time: 0.45s
- Memory Usage: 2.1MB
- Inference Time: 0.001s
- Robustness: High resistance to overfitting
- Interpretability: High (simple decision boundaries)

### Key Features
The model uses the following critical landmarks for analysis:
```python
IMPORTANT_LMS = [
    "NOSE",
    "LEFT_SHOULDER", "RIGHT_SHOULDER",
    "LEFT_HIP", "RIGHT_HIP",
    "LEFT_KNEE", "RIGHT_KNEE",
    "LEFT_ANKLE", "RIGHT_ANKLE"
]
```

Each landmark includes:
- x, y: Normalized coordinates [0.0, 1.0]
- z: Depth relative to hip midpoint
- visibility: Likelihood of landmark being visible [0.0, 1.0]
