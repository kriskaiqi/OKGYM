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
logger = logging.getLogger('ShoulderPressAnalyzer')

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

class ShoulderPressPoseAnalysis:
    def __init__(self, visibility_threshold):
        # Initialize thresholds
        self.visibility_threshold = visibility_threshold
        
        # Thresholds for shoulder press analysis
        self.ANGLE_THRESHOLD = 110  # Threshold for press detection
        self.DELTA_START_THRESHOLD = 8  # Minimum delta to detect start of press
        self.DELTA_END_THRESHOLD = 5    # Maximum delta to detect end of motion
        
        # State tracking
        self.counter = 0
        self.stage = "down"
        self.is_visible = True
        self.is_pressing = False
        self.prev_left_angle = None
        self.prev_right_angle = None
        
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
        self.prev_left_angle = None
        self.prev_right_angle = None
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
        Analyze the shoulder press pose and detect errors
        Returns: (left_angle, right_angle, is_visible, errors)
        """
        left_angle = None
        right_angle = None
        errors = []
        
        # Get joint positions
        self.get_joints(landmarks)
        
        # Cancel calculation if visibility is poor
        if not self.is_visible:
            return left_angle, right_angle, self.is_visible, errors
            
        # Calculate angles
        left_angle = int(calculate_angle(self.left_shoulder, self.left_elbow, self.left_wrist))
        right_angle = int(calculate_angle(self.right_shoulder, self.right_elbow, self.right_wrist))
        
        # Check for angle delta if we have previous angles
        if self.prev_left_angle is not None and self.prev_right_angle is not None:
            left_delta = abs(left_angle - self.prev_left_angle)
            right_delta = abs(right_angle - self.prev_right_angle)
            
            # Check for movement
            if not self.is_pressing and left_delta > self.DELTA_START_THRESHOLD and right_delta > self.DELTA_START_THRESHOLD:
                self.is_pressing = True
                self.stage = "middle"
            elif self.is_pressing and left_delta < self.DELTA_END_THRESHOLD and right_delta < self.DELTA_END_THRESHOLD:
                self.is_pressing = False
        
        # Track previous stage before updating
        previous_stage = self.stage
        
        # Detect stage based on angles
        if left_angle < self.ANGLE_THRESHOLD and right_angle < self.ANGLE_THRESHOLD:
            # Only update to "up" stage
                self.stage = "up"
        elif left_angle > 150 and right_angle > 150:
            # If we were in the "up" stage and now we're down, and we weren't already counting a rep
            if previous_stage == "up" and self.stage != "counting":
                # Mark that we're in the process of counting a rep
                self.stage = "counting"
            # If we were in the counting state and are still down, actually count the rep now
            elif previous_stage == "counting":
                self.stage = "down"
                self.counter += 1
                logger.info(f"Shoulder Press rep counted: {self.counter}")
            else:
                self.stage = "down"
        
        # Check for uneven pressing (more than 15 degrees difference)
        if abs(left_angle - right_angle) > 15:
            errors.append({
                "type": "uneven_pressing",
                "severity": "medium",
                "message": "Keep both arms even during the press"
            })
            self.detected_errors["UNEVEN_PRESSING"] += 1
        
        # Check for incomplete pressing form
        if self.stage == "up" and (left_angle > 100 or right_angle > 100):
            errors.append({
                "type": "incorrect_form",
                "severity": "low",
                "message": "Press the weights fully overhead for complete range of motion"
            })
            self.detected_errors["INCOMPLETE_PRESS"] += 1
        
        # Update previous angles
        self.prev_left_angle = left_angle
        self.prev_right_angle = right_angle
        
        return left_angle, right_angle, self.is_visible, errors

class ShoulderPressAnalyzer:
    def __init__(self):
        try:
            # Set thresholds
            self.visibility_threshold = 0.65
            
            # Create analyzer
            self.analyzer = ShoulderPressPoseAnalysis(
                visibility_threshold=self.visibility_threshold
            )
            
            logger.info("ShoulderPressAnalyzer initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing ShoulderPressAnalyzer: {e}")
            logger.error(traceback.format_exc())
            raise
    
    def reset_rep_counter(self) -> None:
        """Reset repetition counter"""
        logger.warning("RESET_DEBUG: Resetting rep counter in ShoulderPressAnalyzer")
        old_count = self.analyzer.get_counter()
        
        self.analyzer.reset()
        
        new_count = self.analyzer.get_counter()
        
        logger.warning(f"RESET_DEBUG: Shoulder Press counter reset from {old_count} to {new_count}")
    
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
            logger.info("SHOULDER_PRESS_DEBUG: Starting pose analysis")
            
            if not landmarks or not isinstance(landmarks, list):
                logger.error("SHOULDER_PRESS_DEBUG: No pose landmarks provided in input data")
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
                    logger.error("SHOULDER_PRESS_DEBUG: Invalid landmark structure in input data")
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
            logger.info(f"SHOULDER_PRESS_DEBUG: Received {len(raw_landmarks)} landmarks")
            
            # Default values in case of errors
            stage = "down"
            left_angle = None
            right_angle = None
            is_visible = False
            errors = []
            
            # Analyze shoulder press pose
            logger.info("SHOULDER_PRESS_DEBUG: Analyzing shoulder press pose")
            try:
                left_angle, right_angle, is_visible, errors = self.analyzer.analyze_pose(raw_landmarks)
                logger.info(f"SHOULDER_PRESS_DEBUG: Pose analysis complete. Left angle: {left_angle}, Right angle: {right_angle}, Visible: {is_visible}")
            except Exception as analyze_err:
                logger.error(f"SHOULDER_PRESS_DEBUG: Error in shoulder press pose analysis: {analyze_err}")
                logger.error(traceback.format_exc())
                left_angle, right_angle, is_visible, errors = None, None, False, []
            
            # Calculate form score
            form_score = 100
            try:
                form_score = self.calculate_form_score(errors)
                logger.info(f"SHOULDER_PRESS_DEBUG: Form score: {form_score}")
            except Exception as score_err:
                logger.error(f"SHOULDER_PRESS_DEBUG: Error calculating form score: {score_err}")
            
            # Get rep count
            rep_count = 0
            try:
                rep_count = self.analyzer.get_counter()
                logger.info(f"SHOULDER_PRESS_DEBUG: Repetition count: {rep_count}")
            except Exception as rep_err:
                logger.error(f"SHOULDER_PRESS_DEBUG: Error getting rep count: {rep_err}")
            
            # Get current stage
            try:
                stage = self.analyzer.stage
                logger.info(f"SHOULDER_PRESS_DEBUG: Current stage: {stage}")
            except Exception as stage_err:
                logger.error(f"SHOULDER_PRESS_DEBUG: Error getting stage: {stage_err}")
                stage = "down"  # Default to down stage
            
            # Compile metrics
            metrics = {
                "leftArmAngle": left_angle,
                "rightArmAngle": right_angle,
                "isVisible": is_visible
            }
            
            logger.info("SHOULDER_PRESS_DEBUG: Analysis complete, returning results")
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
            logger.error(f"SHOULDER_PRESS_DEBUG: Error analyzing pose: {str(e)}")
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
    """Analyze shoulder press pose from JSON data"""
    try:
        # Parse the JSON data
        data = json.loads(json_data)
        
        # Extract landmarks from the data
        if "landmarks" in data:
            landmarks = data["landmarks"]
            
            # Create analyzer and analyze the pose
            analyzer = ShoulderPressAnalyzer()
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
        logger.error(f"Error in shoulder press analysis: {str(e)}")
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