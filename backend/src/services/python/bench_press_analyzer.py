import sys
import json
import numpy as np
import logging
import os
import traceback
from typing import List, Dict, Any, Tuple, Literal, Optional

# Configure logging
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('BenchPressAnalyzer')

# Error types
ERROR_TYPES = Literal[
    'INVALID_INPUT',
    'INVALID_LANDMARK',
    'METRICS_CALCULATION_ERROR',
    'ANALYSIS_ERROR',
    'incorrect_form',
    'uneven_pressing',
    'UNKNOWN'
]

# Error severities
ERROR_SEVERITIES = Literal[
    'error',
    'warning',
    'low',
    'medium',
    'high'
]

# Stage types
STAGE_TYPES = Literal[
    'up',
    'down',
    'middle',
    'unknown'
]

# Define indices for required landmarks based on the expected input format
NOSE = 0
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
LEFT_ELBOW = 13
RIGHT_ELBOW = 14
LEFT_WRIST = 15
RIGHT_WRIST = 16

# Utility functions
def calculate_angle(a: list, b: list, c: list) -> float:
    '''
    Calculate the angle between 3 points
    Unit of the angle will be in Degree
    '''
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    # Calculate vectors
    ba = a - b
    bc = c - b
    
    # Calculate dot product and norms
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    
    # Handle numerical errors that might cause cosine_angle to be slightly outside [-1, 1]
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    
    # Calculate angle
    angle = np.arccos(cosine_angle)
    
    # Convert to degrees
    angle = np.degrees(angle)

    return angle

class BenchPressPoseAnalysis:
    def __init__(self, visibility_threshold):
        # Initialize thresholds
        self.visibility_threshold = visibility_threshold
        
        # Thresholds for bench press analysis
        self.ANGLE_THRESHOLD = 145  # Increased from 130 for easier down position detection
        self.UP_ANGLE_THRESHOLD = 160  # Angle threshold for up position
        
        # State tracking
        self.counter = 0
        self.stage = "down"
        self.is_visible = True
        self.is_pressing = False
        self.prev_left_shoulder_angle = None
        self.prev_right_shoulder_angle = None
        
        # Error tracking
        self.detected_errors = {
            "UNEVEN_PRESSING": 0,
            "INCOMPLETE_PRESS": 0
        }
        
    def reset(self):
        """Reset counters and error tracking"""
        self.counter = 0
        self.stage = "down"
        self.is_visible = True
        self.is_pressing = False
        self.prev_left_shoulder_angle = None
        self.prev_right_shoulder_angle = None
        self.detected_errors = {
            "UNEVEN_PRESSING": 0,
            "INCOMPLETE_PRESS": 0
        }
        
    def get_counter(self) -> int:
        """Return the current repetition count"""
        return self.counter
        
    def get_joints(self, landmarks) -> bool:
        """
        Check for joints' visibility then get joints coordinate
        """
        required_landmarks = [
            LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST,
            RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST
        ]
        
        # Ensure landmarks list has sufficient length
        if len(landmarks) <= max(required_landmarks):
            self.is_visible = False
            return self.is_visible
        
        # Check visibility of all required landmarks
        joints_visibility = [
            landmarks[lm]['visibility'] for lm in required_landmarks
        ]
        
        is_visible = all([vis > self.visibility_threshold for vis in joints_visibility])
        self.is_visible = is_visible
        
        if not is_visible:
            return self.is_visible
            
        # Get joints' coordinates
        self.left_shoulder = [
            landmarks[LEFT_SHOULDER]['x'],
            landmarks[LEFT_SHOULDER]['y']
        ]
        self.left_elbow = [
            landmarks[LEFT_ELBOW]['x'],
            landmarks[LEFT_ELBOW]['y']
        ]
        self.left_wrist = [
            landmarks[LEFT_WRIST]['x'],
            landmarks[LEFT_WRIST]['y']
        ]
        
        self.right_shoulder = [
            landmarks[RIGHT_SHOULDER]['x'],
            landmarks[RIGHT_SHOULDER]['y']
        ]
        self.right_elbow = [
            landmarks[RIGHT_ELBOW]['x'],
            landmarks[RIGHT_ELBOW]['y']
        ]
        self.right_wrist = [
            landmarks[RIGHT_WRIST]['x'],
            landmarks[RIGHT_WRIST]['y']
        ]
        
        return self.is_visible
            
    def analyze_pose(self, landmarks):
        """
        Analyze the bench press pose and detect errors
        Returns: (left_shoulder_angle, right_shoulder_angle, is_visible, errors)
        """
        left_shoulder_angle = None
        right_shoulder_angle = None
        errors = []
        
        # Get joint positions
        self.get_joints(landmarks)
        
        # Cancel calculation if visibility is poor
        if not self.is_visible:
            logger.warning("BENCH_PRESS_DEBUG: Poor visibility detected, can't calculate angles")
            return left_shoulder_angle, right_shoulder_angle, self.is_visible, errors
            
        # Calculate angles between shoulder, elbow, and wrist
        try:
            left_shoulder_angle = int(calculate_angle(self.left_shoulder, self.left_elbow, self.left_wrist))
            logger.info(f"BENCH_PRESS_DEBUG: Left shoulder angle calculated: {left_shoulder_angle}°")
        except Exception as e:
            logger.error(f"BENCH_PRESS_DEBUG: Error calculating left shoulder angle: {e}")
            left_shoulder_angle = None
            
        try:
            right_shoulder_angle = int(calculate_angle(self.right_shoulder, self.right_elbow, self.right_wrist))
            logger.info(f"BENCH_PRESS_DEBUG: Right shoulder angle calculated: {right_shoulder_angle}°")
        except Exception as e:
            logger.error(f"BENCH_PRESS_DEBUG: Error calculating right shoulder angle: {e}")
            right_shoulder_angle = None
        
        # Exit early if both angles couldn't be calculated
        if left_shoulder_angle is None and right_shoulder_angle is None:
            logger.error("BENCH_PRESS_DEBUG: Could not calculate any shoulder angles")
            return left_shoulder_angle, right_shoulder_angle, False, errors
        
        # Track previous stage and determine current stage
        previous_stage = self.stage
        
        # Detect pressing stage based on angles
        if not self.is_pressing and left_shoulder_angle < self.ANGLE_THRESHOLD and right_shoulder_angle < self.ANGLE_THRESHOLD:
            self.is_pressing = True
            self.stage = "down"
        elif self.is_pressing and left_shoulder_angle > self.UP_ANGLE_THRESHOLD and right_shoulder_angle > self.UP_ANGLE_THRESHOLD:
            self.is_pressing = False
            self.stage = "up"
            # Count rep when transitioning from down to up
            if previous_stage == "down":
                self.counter += 1
                logger.info(f"Bench Press rep counted: {self.counter}")
        
        # Check for uneven pressing (more than 15 degrees difference)
        if abs(left_shoulder_angle - right_shoulder_angle) > 15:
            errors.append({
                "type": "uneven_pressing",
                "severity": "medium",
                "message": "Keep both arms even during the press"
            })
            self.detected_errors["UNEVEN_PRESSING"] += 1
        
        # Check for incomplete pressing form
        if self.stage == "up" and (left_shoulder_angle < 150 or right_shoulder_angle < 150):
            errors.append({
                "type": "incorrect_form",
                "severity": "low",
                "message": "Extend arms fully for complete range of motion"
            })
            self.detected_errors["INCOMPLETE_PRESS"] += 1
        
        # Save previous angles
        self.prev_left_shoulder_angle = left_shoulder_angle
        self.prev_right_shoulder_angle = right_shoulder_angle
        
        return left_shoulder_angle, right_shoulder_angle, self.is_visible, errors

class BenchPressAnalyzer:
    def __init__(self):
        try:
            # Set thresholds
            self.visibility_threshold = 0.1  # Reduced from 0.65 to match situp threshold
            
            # Create analyzer
            self.analyzer = BenchPressPoseAnalysis(
                visibility_threshold=self.visibility_threshold
            )
            
            logger.info("BenchPressAnalyzer initialized successfully")
            logger.info("""
            BENCH PRESS DETECTION CONFIGURATION:
            - Visibility threshold: 0.3
            - Angle threshold for press detection: 130 degrees
            - Up angle threshold: 160 degrees
            - Will detect uneven pressing and provide form feedback
            """)
        except Exception as e:
            logger.error(f"Error initializing BenchPressAnalyzer: {e}")
            logger.error(traceback.format_exc())
            raise
    
    def reset_rep_counter(self) -> None:
        """Reset repetition counter"""
        logger.warning("RESET_DEBUG: Resetting rep counter in BenchPressAnalyzer")
        old_count = self.analyzer.get_counter()
        
        self.analyzer.reset()
        
        new_count = self.analyzer.get_counter()
        
        logger.warning(f"RESET_DEBUG: Bench Press counter reset from {old_count} to {new_count}")
    
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
    
    def analyze_pose(self, landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Analyze the pose data and return metrics, stage, errors, and scores.
        
        Args:
            landmarks: List of landmark dictionaries with x, y, z and visibility.
                
        Returns:
            Dictionary with stage, metrics, errors, repCount, and formScore.
        """
        try:
            logger.info("BENCH_PRESS_DEBUG: Starting pose analysis")
            
            if not landmarks or not isinstance(landmarks, list):
                logger.error("BENCH_PRESS_DEBUG: No pose landmarks provided in input data")
                return {
                    'success': False,
                    'error': {
                        'type': 'INVALID_INPUT',
                        'severity': 'error',
                        'message': 'No pose landmarks provided'
                    }
                }
            
            # Validate landmark structure
            for landmark in landmarks:
                if not all(key in landmark for key in ['x', 'y', 'z', 'visibility']):
                    logger.error("BENCH_PRESS_DEBUG: Invalid landmark structure in input data")
                    return {
                        'success': False,
                        'error': {
                            'type': 'INVALID_LANDMARK',
                            'severity': 'error',
                            'message': 'Invalid landmark structure'
                        }
                    }
            
            # Use landmarks directly
            raw_landmarks = landmarks
            logger.info(f"BENCH_PRESS_DEBUG: Received {len(raw_landmarks)} landmarks")
            
            # Default values in case of errors
            stage = "down"
            left_shoulder_angle = None
            right_shoulder_angle = None
            is_visible = False
            errors = []
            
            # Analyze bench press pose
            logger.info("BENCH_PRESS_DEBUG: Analyzing bench press pose")
            try:
                left_shoulder_angle, right_shoulder_angle, is_visible, errors = self.analyzer.analyze_pose(raw_landmarks)
                logger.info(f"BENCH_PRESS_DEBUG: Pose analysis complete. Left angle: {left_shoulder_angle}, Right angle: {right_shoulder_angle}, Visible: {is_visible}")
            except Exception as analyze_err:
                logger.error(f"BENCH_PRESS_DEBUG: Error in bench press pose analysis: {analyze_err}")
                logger.error(traceback.format_exc())
                left_shoulder_angle, right_shoulder_angle, is_visible, errors = None, None, False, []
            
            # Calculate form score
            form_score = 100
            try:
                form_score = self.calculate_form_score(errors)
                logger.info(f"BENCH_PRESS_DEBUG: Form score: {form_score}")
            except Exception as score_err:
                logger.error(f"BENCH_PRESS_DEBUG: Error calculating form score: {score_err}")
            
            # Get rep count
            rep_count = 0
            try:
                rep_count = self.analyzer.get_counter()
                logger.info(f"BENCH_PRESS_DEBUG: Repetition count: {rep_count}")
            except Exception as rep_err:
                logger.error(f"BENCH_PRESS_DEBUG: Error getting rep count: {rep_err}")
            
            # Get current stage
            try:
                stage = self.analyzer.stage
                logger.info(f"BENCH_PRESS_DEBUG: Current stage: {stage}")
            except Exception as stage_err:
                logger.error(f"BENCH_PRESS_DEBUG: Error getting stage: {stage_err}")
                stage = "down"  # Default to down stage
            
            # Compile metrics
            metrics = {
                "leftShoulderAngle": left_shoulder_angle,
                "rightShoulderAngle": right_shoulder_angle,
                "isVisible": is_visible
            }
            
            logger.info("BENCH_PRESS_DEBUG: Analysis complete, returning results")
            # Return complete analysis result
            return {
                'success': True,
                'result': {
                    'stage': stage,
                    'metrics': metrics,
                    'errors': errors,
                    'formScore': form_score,
                    'repCount': rep_count
                }
            }
            
        except Exception as e:
            logger.error(f"BENCH_PRESS_DEBUG: Error analyzing pose: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'success': False,
                'error': {
                    'type': 'ANALYSIS_ERROR',
                    'severity': 'error',
                    'message': str(e)
                }
            }

# Parse JSON input and run analyzer
def analyze_from_json(json_data: str) -> Dict[str, Any]:
    """Analyze bench press pose from JSON data"""
    try:
        # Parse the JSON data
        data = json.loads(json_data)
        
        # Extract landmarks from the data
        if "landmarks" in data:
            landmarks = data["landmarks"]
            
            # Create analyzer and analyze the pose
            analyzer = BenchPressAnalyzer()
            result = analyzer.analyze_pose(landmarks)
            
            return result
        else:
            return {
                'success': False,
                'error': {
                    'type': 'INVALID_INPUT',
                    'severity': 'error',
                    'message': 'No landmarks found in input data'
                }
            }
    except Exception as e:
        logger.error(f"Error in bench press analysis: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            'success': False,
            'error': {
                'type': 'ANALYSIS_ERROR',
                'severity': 'error',
                'message': str(e)
            }
        }

if __name__ == "__main__":
    # Read JSON data from stdin
    json_data = sys.stdin.read()
    
    # Analyze the pose
    result = analyze_from_json(json_data)
    
    # Print the result as JSON
    print(json.dumps(result)) 