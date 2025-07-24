import sys
import json
import numpy as np
import pandas as pd
import pickle
import math
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple, Literal, Optional
import time

# Configure logging - reduce logging level to WARNING for better performance
logging.basicConfig(
    level=logging.WARNING,  # Changed from INFO to WARNING
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('SquatAnalyzer')

# Optimization: Pre-compute squared values for common calculations
VISIBILITY_THRESHOLD_SQ = 0.36  # 0.6^2

# Error types matching TypeScript interface
ERROR_TYPES = Literal[
    'INVALID_INPUT',
    'INVALID_LANDMARK',
    'METRICS_CALCULATION_ERROR',
    'ANALYSIS_ERROR',
    'foot_placement',
    'knee_placement',
    'visibility',
    'UNKNOWN'
]

# Error severities matching TypeScript interface
ERROR_SEVERITIES = Literal[
    'error',
    'warning',
    'low',
    'medium',
    'high'
]

# Stage types matching TypeScript interface
STAGE_TYPES = Literal[
    'up',
    'down',
    'middle',
    'unknown'
]

class RepCounter:
    """Tracks squat repetitions based on stage transitions."""
    def __init__(self):
        self._last_stage = None
        self._rep_count = 0
        self._in_rep = False
        # Store confidence scores to use for counter decisions
        self._stage_confidence = 0.0
        # Track time between transitions to detect quick reps
        self._last_transition_time = 0
        # Store the last few stages to detect patterns
        self._stage_history = []

    def update(self, current_stage: str, confidence: float = 0.0) -> None:
        """
        Update rep count based on stage transitions between down and up.
        Simplified for two-stage model (down/up only).
        """
        # Store confidence score
        self._stage_confidence = confidence
        
        # Track current time for transition detection
        current_time = time.time() * 1000  # Current time in milliseconds
        
        # Add to stage history (keep only last 5 stages)
        self._stage_history.append(current_stage)
        if len(self._stage_history) > 5:
            self._stage_history.pop(0)
        
        # Detect stage transitions
        is_transition = current_stage != self._last_stage
        
        # Log transitions for debugging
        if is_transition and self._last_stage is not None:
            logger.warning(f"TRANSITION: {self._last_stage} -> {current_stage}, confidence={confidence:.2f}")
        
        # Handle stage transitions - simple two-state model
        if current_stage == 'down':
            # When we detect a down position, mark the start of a potential rep
            self._in_rep = True
            logger.warning("Down position detected")
            
        elif current_stage == 'up' and self._in_rep and self._last_stage == 'down':
            # Count rep when transitioning from down to up directly
            self._rep_count += 1
            logger.warning(f"Rep counted: {self._rep_count} with confidence {self._stage_confidence:.2f}")
            self._in_rep = False  # Reset rep state
        
        # Update last stage
        self._last_stage = current_stage

    def get_count(self) -> int:
        """Get current rep count."""
        return self._rep_count

    def reset(self) -> None:
        """Reset rep counter."""
        self._last_stage = None
        self._rep_count = 0
        self._in_rep = False
        self._stage_confidence = 0.0
        self._last_transition_time = 0
        self._stage_history = []

class SquatAnalyzer:
    def __init__(self):
        try:
            # Load the trained model
            model_path = Path(__file__).parent / 'models' / 'LR_model.pkl'
            if not model_path.exists():
                logger.error(f"Model file not found at {model_path}")
                # Fallback to looking in alternative locations
                alt_paths = [
                    Path(__file__).parent.parent.parent.parent / 'core' / 'squat_model' / 'LR_model.pkl',
                    Path(__file__).parent.parent.parent / 'models' / 'LR_model.pkl',
                ]
                
                for alt_path in alt_paths:
                    if alt_path.exists():
                        model_path = alt_path
                        logger.warning(f"Found model at alternative location: {model_path}")
                        break
                else:
                    raise FileNotFoundError(f"Model file not found at {model_path} or alternative locations")
            
            logger.info(f"Loading squat model from {model_path}")
            with open(model_path, "rb") as f:
                self.model = pickle.load(f)
            
            # Define important landmarks (exactly as in the notebook)
            self.IMPORTANT_LMS = [
                "NOSE",
                "LEFT_SHOULDER", "RIGHT_SHOULDER",
                "LEFT_HIP", "RIGHT_HIP",
                "LEFT_KNEE", "RIGHT_KNEE",
                "LEFT_ANKLE", "RIGHT_ANKLE"
            ]
            
            # Define thresholds (match original implementation from the notebook)
            self.PREDICTION_PROB_THRESHOLD = 0.3  # Lower threshold for better sensitivity
            self.VISIBILITY_THRESHOLD = 0.5  # Clear visibility requirement
            
            # Ratio thresholds for form analysis
            self.FOOT_SHOULDER_RATIO_THRESHOLDS = [1.2, 2.8]  # From notebook
            self.KNEE_FOOT_RATIO_THRESHOLDS = {
                "up": [0.5, 1.0],    # From notebook
                "down": [0.7, 1.1]    # From notebook
            }
            
            # Angle thresholds as fallback for ML model
            self.ANGLE_THRESHOLDS = {
                "up": 140,        # Standing position
                "down": 90        # Squatting position
            }
            
            # Initialize landmark mapping 
            self.landmark_map = {
                "NOSE": 0,
                "LEFT_SHOULDER": 11,
                "RIGHT_SHOULDER": 12,
                "LEFT_HIP": 23,
                "RIGHT_HIP": 24,
                "LEFT_KNEE": 25,
                "RIGHT_KNEE": 26,
                "LEFT_ANKLE": 27,
                "RIGHT_ANKLE": 28,
                "LEFT_FOOT_INDEX": 31,
                "RIGHT_FOOT_INDEX": 32
            }
            
            # Performance optimization: Precompute indices for faster lookup
            self.idx_map = {
                "NOSE": 0,
                "LEFT_SHOULDER": 11,
                "RIGHT_SHOULDER": 12,
                "LEFT_HIP": 23,
                "RIGHT_HIP": 24,
                "LEFT_KNEE": 25,
                "RIGHT_KNEE": 26,
                "LEFT_ANKLE": 27,
                "RIGHT_ANKLE": 28,
                "LEFT_FOOT_INDEX": 31,
                "RIGHT_FOOT_INDEX": 32
            }
            
            # Initialize rep counter
            self.rep_counter = RepCounter()
            
            # Add motion smoothing for stable stage detection
            self.last_stages = []  # Store last 3 stage predictions
            
        except Exception as e:
            logger.error(f"Error initializing SquatAnalyzer: {str(e)}")
            raise

    def calculate_distance(self, point1: List[float], point2: List[float]) -> float:
        """
        Calculate Euclidean distance between two points.
        Optimized for performance.
        """
        # Skip expensive sqrt for comparing distances
        dx = point2[0] - point1[0]
        dy = point2[1] - point1[1]
        return math.sqrt(dx*dx + dy*dy)

    def calculate_angle(self, point1: List[float], point2: List[float], point3: List[float]) -> float:
        """Calculate angle between three points in degrees."""
        try:
            # Fast implementation using dot product
            a = np.array(point1) - np.array(point2)
            b = np.array(point3) - np.array(point2)
            
            # Normalize vectors for better numerical stability
            a = a / np.linalg.norm(a)
            b = b / np.linalg.norm(b)
            
            # Calculate angle using dot product
            angle = math.degrees(math.acos(np.clip(np.dot(a, b), -1.0, 1.0)))
            return abs(angle)
        except Exception:
            return 0.0

    def extract_important_keypoints(self, landmarks: List[Dict[str, float]]) -> List[float]:
        """
        Extract important keypoints from landmarks data.
        Optimized version.
        """
        try:
            # Use numpy for better performance
            data = []
            lm_len = len(landmarks)
            
            for lm in self.IMPORTANT_LMS:
                idx = self.landmark_map[lm]
                # Check if index is valid before accessing
                if idx < lm_len:
                    keypoint = landmarks[idx]
                    data.extend([keypoint['x'], keypoint['y'], keypoint['z'], keypoint['visibility']])
                else:
                    # If landmark is missing, use placeholder with low visibility
                    data.extend([0.0, 0.0, 0.0, 0.0])
            return data
        except Exception as e:
            logger.error(f"Error extracting keypoints: {str(e)}")
            raise

    def analyze_foot_knee_placement(self, landmarks: List[Dict[str, float]], stage: str) -> Dict[str, int]:
        """
        Calculate placement metrics and determine if they're correct.
        Optimized for better performance.
        """
        analyzed_results = {
            "foot_placement": -1,
            "knee_placement": -1,
        }
        
        # Fast access to indices
        left_shoulder_idx = self.idx_map["LEFT_SHOULDER"]
        right_shoulder_idx = self.idx_map["RIGHT_SHOULDER"]
        left_foot_idx = self.idx_map["LEFT_FOOT_INDEX"]
        right_foot_idx = self.idx_map["RIGHT_FOOT_INDEX"]
        left_knee_idx = self.idx_map["LEFT_KNEE"]
        right_knee_idx = self.idx_map["RIGHT_KNEE"]
        
        lm_len = len(landmarks)
        
        # Early return if landmarks are incomplete
        if (left_shoulder_idx >= lm_len or right_shoulder_idx >= lm_len or 
            left_foot_idx >= lm_len or right_foot_idx >= lm_len or 
            left_knee_idx >= lm_len or right_knee_idx >= lm_len):
            return analyzed_results
            
        # Get landmarks with direct access (faster than dict lookup in loops)
        left_foot = landmarks[left_foot_idx]
        right_foot = landmarks[right_foot_idx]
        left_shoulder = landmarks[left_shoulder_idx]
        right_shoulder = landmarks[right_shoulder_idx]
        left_knee = landmarks[left_knee_idx]
        right_knee = landmarks[right_knee_idx]
        
        # Early visibility check for foot placement
        if (left_foot['visibility'] < self.VISIBILITY_THRESHOLD or 
            right_foot['visibility'] < self.VISIBILITY_THRESHOLD or
            left_shoulder['visibility'] < self.VISIBILITY_THRESHOLD or
            right_shoulder['visibility'] < self.VISIBILITY_THRESHOLD):
            return analyzed_results
            
        # Calculate measurements
        shoulder_dx = right_shoulder['x'] - left_shoulder['x']
        shoulder_dy = right_shoulder['y'] - left_shoulder['y']
        shoulder_width = math.sqrt(shoulder_dx*shoulder_dx + shoulder_dy*shoulder_dy)
        
        foot_dx = right_foot['x'] - left_foot['x']
        foot_dy = right_foot['y'] - left_foot['y']
        foot_width = math.sqrt(foot_dx*foot_dx + foot_dy*foot_dy)
        
        # Skip calculations if shoulder width is too small to avoid division by zero
        if shoulder_width < 0.01:
            return analyzed_results
            
        # Calculate ratio
        foot_shoulder_ratio = foot_width / shoulder_width
        
        # Analyze foot placement
        min_ratio, max_ratio = self.FOOT_SHOULDER_RATIO_THRESHOLDS
        if min_ratio <= foot_shoulder_ratio <= max_ratio:
            analyzed_results["foot_placement"] = 0
        elif foot_shoulder_ratio < min_ratio:
            analyzed_results["foot_placement"] = 1
        else:
            analyzed_results["foot_placement"] = 2
            
        # Early visibility check for knee placement
        if (left_knee['visibility'] < self.VISIBILITY_THRESHOLD or 
            right_knee['visibility'] < self.VISIBILITY_THRESHOLD):
            return analyzed_results
            
        # Calculate knee width
        knee_width = self.calculate_distance([left_knee['x'], left_knee['y']], [right_knee['x'], right_knee['y']])
        
        # Calculate knee to foot ratio
        knee_foot_ratio = round(knee_width / foot_width, 1) if foot_width > 0 else 0
        
        # Analyze KNEE placement - exactly as in notebook
        if stage in self.KNEE_FOOT_RATIO_THRESHOLDS:
            min_ratio_knee_foot, max_ratio_knee_foot = self.KNEE_FOOT_RATIO_THRESHOLDS[stage]
            
            if min_ratio_knee_foot <= knee_foot_ratio <= max_ratio_knee_foot:
                analyzed_results["knee_placement"] = 0
            elif knee_foot_ratio < min_ratio_knee_foot:
                analyzed_results["knee_placement"] = 1
            elif knee_foot_ratio > max_ratio_knee_foot:
                analyzed_results["knee_placement"] = 2
                
        return analyzed_results

    def analyze_pose(self, landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Analyzes a pose and returns the analysis result.
        Optimized for rep counting with ML model classification.
        """
        try:
            # Input validation
            if not landmarks or not isinstance(landmarks, list):
                return {
                    'success': False,
                    'error': {
                        'type': 'INVALID_INPUT',
                        'severity': 'error',
                        'message': 'Invalid or empty landmarks data'
                    }
                }

            # Validate landmark structure
            for landmark in landmarks:
                if not all(key in landmark for key in ['x', 'y', 'z', 'visibility']):
                    return {
                        'success': False,
                        'error': {
                            'type': 'INVALID_LANDMARK',
                            'severity': 'error',
                            'message': 'Invalid landmark structure'
                        }
                    }
            
            # Determine squat stage - this is critical and must be done first
            stage = self.determine_stage(landmarks)
            
            # Important: The rep counter is updated inside the determine_stage method
            # We don't need to update it again here
            
            # Check for foot and knee placement issues
            placement_analysis = self.analyze_foot_knee_placement(landmarks, stage)
            
            # Process placement results into errors
            form_errors = []
            
            # Process foot placement
            foot_placement = placement_analysis["foot_placement"]
            if foot_placement == 1:
                form_errors.append({
                    'type': 'foot_placement',
                    'severity': 'high',
                    'message': 'Feet too close together'
                })
            elif foot_placement == 2:
                form_errors.append({
                    'type': 'foot_placement',
                    'severity': 'high',
                    'message': 'Feet too far apart'
                })
                
            # Process knee placement
            knee_placement = placement_analysis["knee_placement"]
            if knee_placement == 1:
                form_errors.append({
                    'type': 'knee_placement',
                    'severity': 'high',
                    'message': 'Knees too close together'
                })
            elif knee_placement == 2:
                form_errors.append({
                    'type': 'knee_placement',
                    'severity': 'high',
                    'message': 'Knees too far apart'
                })
            
            # Calculate metrics - do this after all critical validations
            metrics = self.calculate_metrics(landmarks)
            if metrics is None:
                return {
                    'success': False,
                    'error': {
                        'type': 'METRICS_CALCULATION_ERROR',
                        'severity': 'error',
                        'message': 'Failed to calculate pose metrics'
                    }
                }
            
            # Calculate form score (0-100)
            form_score = self.calculate_form_score(form_errors)
            
            # Add rep count to result
            rep_count = self.rep_counter.get_count()
            
            # Log the analysis result for debugging
            logger.info(f"Sending analysis result: stage={stage}, score={form_score}, reps={rep_count}")
            
            return {
                'success': True,
                'result': {
                    'stage': stage,
                    'metrics': metrics,
                    'errors': form_errors,
                    'formScore': form_score,
                    'repCount': rep_count
                }
            }

        except Exception as e:
            logger.error(f'Error in analyze_pose: {str(e)}')
            return {
                'success': False,
                'error': {
                    'type': 'ANALYSIS_ERROR',
                    'severity': 'error',
                    'message': str(e)
                }
            }

    def calculate_form_score(self, errors: List[Dict[str, str]]) -> float:
        """Calculate form score based on errors."""
        base_score = 100
        
        for error in errors:
            if error['severity'] == 'high':
                base_score -= 20
            elif error['severity'] == 'medium':
                base_score -= 10
            elif error['severity'] == 'low':
                base_score -= 5
        
        return max(0, min(100, base_score))

    def reset_rep_counter(self) -> None:
        """Reset the repetition counter. Should be called between sets."""
        logger.warning("RESET_DEBUG: Resetting rep counter in SquatAnalyzer")  # Use warning level for higher visibility
        old_count = self.rep_counter.get_count()
        self.rep_counter.reset()
        new_count = self.rep_counter.get_count()
        logger.warning(f"RESET_DEBUG: Rep counter reset from {old_count} to {new_count}")  # Use warning level for higher visibility

    def determine_stage(self, landmarks: List[Dict[str, float]]) -> str:
        """
        Determine the current stage of the squat using ML prediction only.
        """
        try:
            # Use original visibility threshold
            stage_visibility_threshold = self.VISIBILITY_THRESHOLD
            
            # Check if we have all necessary landmarks
            required_indices = [
                self.landmark_map["LEFT_HIP"], 
                self.landmark_map["RIGHT_HIP"],
                self.landmark_map["LEFT_KNEE"], 
                self.landmark_map["RIGHT_KNEE"],
                self.landmark_map["LEFT_ANKLE"], 
                self.landmark_map["RIGHT_ANKLE"],
                self.landmark_map["LEFT_SHOULDER"], 
                self.landmark_map["RIGHT_SHOULDER"]
            ]
            
            # Early return if landmarks are missing
            if not all(idx < len(landmarks) for idx in required_indices):
                logger.warning("Missing required landmarks for stage determination")
                return 'unknown'
            
            # Stricter visibility check similar to original implementation
            for idx in required_indices:
                if landmarks[idx]['visibility'] < stage_visibility_threshold:
                    logger.debug(f"Landmark at index {idx} has low visibility: {landmarks[idx]['visibility']}")
                    return 'unknown'
                    
            # Use ML model with reduced threshold for better sensitivity
            stage_prediction = 'unknown'
            prediction_confidence = 0.0
            
            try:
                # Extract features for ML model
                features = pd.DataFrame([self.extract_important_keypoints(landmarks)])
                
                # Make prediction using ML model
                predictions = self.model.predict(features)
                probabilities = self.model.predict_proba(features)
                
                # Get the highest probability and its class
                max_prob = max(probabilities[0])
                predicted_class = predictions[0]
                prediction_confidence = max_prob
                
                # Debug log the ML prediction
                logger.warning(f"ML MODEL DEBUG: Predicted class={predicted_class}, confidence={max_prob:.4f}, probabilities={probabilities[0]}")
                
                # Map class to stage according to original model: 0=down, 1=up
                # There is no middle stage in the original model
                if max_prob >= 0.3:  # Using lower threshold for better sensitivity
                    if predicted_class == 0:
                        stage_prediction = 'down'
                    elif predicted_class == 1:
                        stage_prediction = 'up'
                    else:
                        logger.warning(f"Unknown class prediction: {predicted_class}")
                        stage_prediction = 'unknown'
                else:
                    logger.warning(f"Low confidence prediction: class={predicted_class}, conf={max_prob:.4f}")
                    # For low confidence, still use the predicted class to improve sensitivity
                    if predicted_class == 0:
                        stage_prediction = 'down'
                    elif predicted_class == 1:
                        stage_prediction = 'up'
                    else:
                        stage_prediction = 'unknown'
            except Exception as e:
                logger.warning(f"ML model prediction failed: {e}")
                return 'unknown'
            
            # If ML gave us a prediction, use it
            if stage_prediction != 'unknown':
                # Log the final prediction
                logger.warning(f"STAGE DETECTED: {stage_prediction} with confidence {prediction_confidence:.4f}")
                
                # Update the rep counter
                self.rep_counter.update(stage_prediction, prediction_confidence)
                return stage_prediction
            
            # If no prediction, return unknown
            return 'unknown'
                
        except Exception as e:
            logger.error(f"Error determining stage: {str(e)}")
            return 'unknown'

    def calculate_metrics(self, landmarks: List[Dict[str, float]]) -> Optional[Dict[str, float]]:
        """
        Calculate various metrics from the pose data.
        Returns None if critical landmarks are missing/not visible.
        """
        try:
            # First verify we have all needed landmarks
            required_indices = [
                self.landmark_map["LEFT_SHOULDER"], self.landmark_map["RIGHT_SHOULDER"],
                self.landmark_map["LEFT_HIP"], self.landmark_map["RIGHT_HIP"],
                self.landmark_map["LEFT_KNEE"], self.landmark_map["RIGHT_KNEE"],
                self.landmark_map["LEFT_ANKLE"], self.landmark_map["RIGHT_ANKLE"],
            ]
            
            # Early return if landmarks are missing
            if not all(idx < len(landmarks) for idx in required_indices):
                logger.warning("Missing required landmarks for metrics calculation")
                return None
                
            # Check visibility before calculating
            for idx in required_indices:
                if landmarks[idx]['visibility'] < self.VISIBILITY_THRESHOLD:
                    logger.debug(f"Low visibility for landmark at index {idx}")
                    # Continue with calculation, will use what we have
            
            # Calculate widths using both left and right sides for robustness
            left_shoulder = [landmarks[self.landmark_map["LEFT_SHOULDER"]]['x'], 
                           landmarks[self.landmark_map["LEFT_SHOULDER"]]['y']]
            right_shoulder = [landmarks[self.landmark_map["RIGHT_SHOULDER"]]['x'], 
                 landmarks[self.landmark_map["RIGHT_SHOULDER"]]['y']]
            shoulder_width = self.calculate_distance(left_shoulder, right_shoulder)
            
            left_ankle = [landmarks[self.landmark_map["LEFT_ANKLE"]]['x'], 
                         landmarks[self.landmark_map["LEFT_ANKLE"]]['y']]
            right_ankle = [landmarks[self.landmark_map["RIGHT_ANKLE"]]['x'], 
                 landmarks[self.landmark_map["RIGHT_ANKLE"]]['y']]
            feet_width = self.calculate_distance(left_ankle, right_ankle)
            
            left_knee = [landmarks[self.landmark_map["LEFT_KNEE"]]['x'], 
                        landmarks[self.landmark_map["LEFT_KNEE"]]['y']]
            right_knee = [landmarks[self.landmark_map["RIGHT_KNEE"]]['x'], 
                 landmarks[self.landmark_map["RIGHT_KNEE"]]['y']]
            knee_width = self.calculate_distance(left_knee, right_knee)

            # Calculate angles for both sides and take average
            # Left side angles
            left_hip_angle = self.calculate_angle(
                [landmarks[self.landmark_map["LEFT_SHOULDER"]]['x'],
                 landmarks[self.landmark_map["LEFT_SHOULDER"]]['y']],
                [landmarks[self.landmark_map["LEFT_HIP"]]['x'],
                 landmarks[self.landmark_map["LEFT_HIP"]]['y']],
                [landmarks[self.landmark_map["LEFT_KNEE"]]['x'],
                 landmarks[self.landmark_map["LEFT_KNEE"]]['y']]
            )

            left_knee_angle = self.calculate_angle(
                [landmarks[self.landmark_map["LEFT_HIP"]]['x'],
                 landmarks[self.landmark_map["LEFT_HIP"]]['y']],
                [landmarks[self.landmark_map["LEFT_KNEE"]]['x'],
                 landmarks[self.landmark_map["LEFT_KNEE"]]['y']],
                [landmarks[self.landmark_map["LEFT_ANKLE"]]['x'],
                 landmarks[self.landmark_map["LEFT_ANKLE"]]['y']]
            )

            left_ankle_angle = self.calculate_angle(
                [landmarks[self.landmark_map["LEFT_KNEE"]]['x'],
                 landmarks[self.landmark_map["LEFT_KNEE"]]['y']],
                [landmarks[self.landmark_map["LEFT_ANKLE"]]['x'],
                 landmarks[self.landmark_map["LEFT_ANKLE"]]['y']],
                [landmarks[self.landmark_map["LEFT_ANKLE"]]['x'],
                 landmarks[self.landmark_map["LEFT_ANKLE"]]['y'] + 0.1]  # Approximate foot direction
            )

            # Right side angles
            right_hip_angle = self.calculate_angle(
                [landmarks[self.landmark_map["RIGHT_SHOULDER"]]['x'],
                 landmarks[self.landmark_map["RIGHT_SHOULDER"]]['y']],
                [landmarks[self.landmark_map["RIGHT_HIP"]]['x'],
                 landmarks[self.landmark_map["RIGHT_HIP"]]['y']],
                [landmarks[self.landmark_map["RIGHT_KNEE"]]['x'],
                 landmarks[self.landmark_map["RIGHT_KNEE"]]['y']]
            )

            right_knee_angle = self.calculate_angle(
                [landmarks[self.landmark_map["RIGHT_HIP"]]['x'],
                 landmarks[self.landmark_map["RIGHT_HIP"]]['y']],
                [landmarks[self.landmark_map["RIGHT_KNEE"]]['x'],
                 landmarks[self.landmark_map["RIGHT_KNEE"]]['y']],
                [landmarks[self.landmark_map["RIGHT_ANKLE"]]['x'],
                 landmarks[self.landmark_map["RIGHT_ANKLE"]]['y']]
            )

            right_ankle_angle = self.calculate_angle(
                [landmarks[self.landmark_map["RIGHT_KNEE"]]['x'],
                 landmarks[self.landmark_map["RIGHT_KNEE"]]['y']],
                [landmarks[self.landmark_map["RIGHT_ANKLE"]]['x'],
                 landmarks[self.landmark_map["RIGHT_ANKLE"]]['y']],
                [landmarks[self.landmark_map["RIGHT_ANKLE"]]['x'],
                 landmarks[self.landmark_map["RIGHT_ANKLE"]]['y'] + 0.1]  # Approximate foot direction
            )

            # Calculate average angles
            hip_angle = (left_hip_angle + right_hip_angle) / 2
            knee_angle = (left_knee_angle + right_knee_angle) / 2
            ankle_angle = (left_ankle_angle + right_ankle_angle) / 2

            # Calculate ratios - protect against division by zero
            feet_to_shoulder_ratio = feet_width / shoulder_width if shoulder_width > 0 else 0
            knee_to_feet_ratio = knee_width / feet_width if feet_width > 0 else 0

            return {
                'shoulderWidth': round(shoulder_width, 2),
                'feetWidth': round(feet_width, 2),
                'kneeWidth': round(knee_width, 2),
                'feetToShoulderRatio': round(feet_to_shoulder_ratio, 2),
                'kneeToFeetRatio': round(knee_to_feet_ratio, 2),
                'hipAngle': round(hip_angle, 2),
                'kneeAngle': round(knee_angle, 2),
                'ankleAngle': round(ankle_angle, 2)
            }
        except Exception as e:
            logger.error(f"Error calculating metrics: {str(e)}")
            return None

def main():
    try:
        analyzer = SquatAnalyzer()
        
        if len(sys.argv) > 1 and sys.argv[1] == '--test':
            print(json.dumps({'status': 'ok', 'message': 'SquatAnalyzer initialized successfully'}))
            return
            
        # Process pose data
        pose_data = json.loads(sys.argv[1])
        result = analyzer.analyze_pose(pose_data['poseLandmarks'])
        print(json.dumps(result))
        
    except Exception as e:
        error_response = {
            'status': 'error',
            'message': str(e)
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == '__main__':
    main() 