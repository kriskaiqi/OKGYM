import sys
import json
import numpy as np
import logging
import os
import traceback
import time
from typing import List, Dict, Any, Tuple, Literal, Optional

# Configure logging
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('SitupAnalyzer')

# Error types
ERROR_TYPES = Literal[
    'INVALID_INPUT',
    'INVALID_LANDMARK',
    'METRICS_CALCULATION_ERROR',
    'ANALYSIS_ERROR',
    'incomplete_situp',
    'straight_legs',
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
LEFT_HIP = 23
RIGHT_HIP = 24
LEFT_KNEE = 25
RIGHT_KNEE = 26
LEFT_ANKLE = 27
RIGHT_ANKLE = 28

# Utility functions
def calculate_angle(a: list, b: list, c: list) -> float:
    '''
    Calculate the angle between 3 points
    Unit of the angle will be in Degree
    '''
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    try:
        # Vectors from point b to points a and c
        ba = a - b
        bc = c - b
        
        # Compute the dot product
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        
        # Handle numerical errors
        cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
        
        # Get angle in degrees
        angle = np.degrees(np.arccos(cosine_angle))
        
        # Alternative calculation to verify
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle2 = np.abs(radians*180.0/np.pi)
        
        if angle2 > 180.0:
            angle2 = 360 - angle2
            
        # Log both calculations
        logger.info(f"Angle calculation methods: arccos: {angle:.1f}°, arctan2: {angle2:.1f}°")
        
        # Use the arccos method as it's more reliable for our use case
        return angle
    except Exception as e:
        logger.error(f"Error calculating angle: {e}")
        # Return default value
        return 180.0

def calculate_distance(point1: list, point2: list) -> float:
    '''
    Calculate the distance between 2 points
    '''
    point1 = np.array(point1)
    point2 = np.array(point2)
    
    # Calculate Euclidean distance
    return np.sqrt(np.sum((point1 - point2) ** 2))

class SitupPoseAnalysis:
    def __init__(self, visibility_threshold):
        # Initialize thresholds
        self.visibility_threshold = visibility_threshold
        
        # Thresholds for situp analysis - updated based on user observations
        self.MIN_ANGLE_CHANGE = 20  # Minimum angle change required to count a rep
        self.DOWN_ANGLE_THRESHOLD = 120  # Updated: torso angle for down position with properly bent knees
        self.UP_ANGLE_THRESHOLD = 90   # Updated: torso angle when sitting up (less than 90 degrees)
        
        # Knee angle thresholds - updated based on user observations
        self.KNEE_IDEAL_MIN = 40  # Updated: Ideal knee bend (40-45 degrees)
        self.KNEE_IDEAL_MAX = 45
        self.KNEE_ACCEPTABLE_MIN = 45  # Acceptable knee bend range
        self.KNEE_ACCEPTABLE_MAX = 90
        self.KNEE_STRAIGHT_THRESHOLD = 150  # Consider knees straight if angle is above this
        
        # State tracking
        self.counter = 0
        self.stage = "down"
        self.is_visible = True
        self.last_counted_time = 0  # Time when last rep was counted
        self.min_rep_interval = 1.0  # Minimum time between reps (seconds)
        self.min_angle_detected = 180  # Track the minimum angle (lying down position)
        self.is_in_rep = False  # Whether currently in the middle of a rep
        self.knee_position_quality = "unknown"  # Track knee position quality (ideal, acceptable, straight)
        self.head_pos = None  # Head position for determining down position
        
        # Error tracking
        self.detected_errors = {
            "INCOMPLETE_SITUP": 0,
            "STRAIGHT_LEGS": 0
        }
        
    def reset(self):
        """Reset counters and error tracking"""
        self.counter = 0
        self.stage = "down"
        self.is_visible = True
        self.last_counted_time = 0
        self.min_angle_detected = 180
        self.is_in_rep = False
        self.knee_position_quality = "unknown"
        self.head_pos = None
        self.detected_errors = {
            "INCOMPLETE_SITUP": 0,
            "STRAIGHT_LEGS": 0
        }
        
    def get_counter(self) -> int:
        """Return the current repetition count"""
        return self.counter
        
    def get_joints(self, landmarks) -> bool:
        """
        Check for joints' visibility then get joints coordinate
        """
        # Define indices based on constants
        head_idx = NOSE  # Use nose for head position
        shoulder_idx = LEFT_SHOULDER
        hip_idx = LEFT_HIP
        knee_idx = LEFT_KNEE
        ankle_idx = LEFT_ANKLE
        
        # Also try right side if landmarks available
        r_shoulder_idx = RIGHT_SHOULDER
        r_hip_idx = RIGHT_HIP
        r_knee_idx = RIGHT_KNEE
        r_ankle_idx = RIGHT_ANKLE
        
        # Ensure landmarks list has sufficient length
        if len(landmarks) <= max(shoulder_idx, hip_idx, knee_idx, ankle_idx):
            logger.error(f"Not enough landmarks. Got {len(landmarks)}, need at least {max(shoulder_idx, hip_idx, knee_idx, ankle_idx) + 1}")
            self.is_visible = False
            return self.is_visible
        
        # Log visibility values for debugging
        try:
            head_vis = landmarks[head_idx]['visibility']
            l_shoulder_vis = landmarks[shoulder_idx]['visibility']
            l_hip_vis = landmarks[hip_idx]['visibility']
            l_knee_vis = landmarks[knee_idx]['visibility']
            l_ankle_vis = landmarks[ankle_idx]['visibility'] if ankle_idx < len(landmarks) else 0
            
            r_shoulder_vis = landmarks[r_shoulder_idx]['visibility']
            r_hip_vis = landmarks[r_hip_idx]['visibility']
            r_knee_vis = landmarks[r_knee_idx]['visibility']
            r_ankle_vis = landmarks[r_ankle_idx]['visibility'] if r_ankle_idx < len(landmarks) else 0
            
            logger.info(f"Visibility scores - Head: {head_vis:.2f}, L shoulder: {l_shoulder_vis:.2f}, L hip: {l_hip_vis:.2f}, L knee: {l_knee_vis:.2f}, L ankle: {l_ankle_vis:.2f}")
            logger.info(f"Visibility scores - R shoulder: {r_shoulder_vis:.2f}, R hip: {r_hip_vis:.2f}, R knee: {r_knee_vis:.2f}, R ankle: {r_ankle_vis:.2f}")
        except Exception as e:
            logger.error(f"Error logging visibility: {e}")
        
        # Check visibility for left side
        l_joints_visibility = [
            landmarks[shoulder_idx]['visibility'],
            landmarks[hip_idx]['visibility'],
            landmarks[knee_idx]['visibility']
        ]
        
        # Check visibility for right side
        r_joints_visibility = [
            landmarks[r_shoulder_idx]['visibility'],
            landmarks[r_hip_idx]['visibility'],
            landmarks[r_knee_idx]['visibility']
        ]
        
        # Check if either side has good visibility
        l_is_visible = all([vis > self.visibility_threshold for vis in l_joints_visibility])
        r_is_visible = all([vis > self.visibility_threshold for vis in r_joints_visibility])
        
        # Use the side with better visibility
        if l_is_visible or r_is_visible:
            self.is_visible = True
            
            # Choose which side to use (prefer the side with better knee visibility)
            use_right_side = (landmarks[r_knee_idx]['visibility'] > landmarks[knee_idx]['visibility'])
            
            logger.info(f"Using {'right' if use_right_side else 'left'} side for angle calculation")
            
            if use_right_side:
                shoulder_idx = r_shoulder_idx
                hip_idx = r_hip_idx
                knee_idx = r_knee_idx
                ankle_idx = r_ankle_idx
        else:
            logger.warning("Poor visibility for both left and right sides")
            self.is_visible = False
            return self.is_visible

        # Get joints' coordinates
        self.shoulder = [
            landmarks[shoulder_idx]['x'],
            landmarks[shoulder_idx]['y'],
        ]
        self.hip = [
            landmarks[hip_idx]['x'],
            landmarks[hip_idx]['y'],
        ]
        self.knee = [
            landmarks[knee_idx]['x'],
            landmarks[knee_idx]['y'],
        ]
        
        # Get head position
        if landmarks[head_idx]['visibility'] > self.visibility_threshold:
            self.head_pos = [
                landmarks[head_idx]['x'],
                landmarks[head_idx]['y'],
            ]
            logger.info(f"Head position: ({self.head_pos[0]:.2f}, {self.head_pos[1]:.2f})")
        else:
            self.head_pos = None
            logger.info("Head not visible enough")
        
        # Log joint coordinates for debugging
        logger.info(f"Joint positions - Shoulder: ({self.shoulder[0]:.2f}, {self.shoulder[1]:.2f})")
        logger.info(f"Joint positions - Hip: ({self.hip[0]:.2f}, {self.hip[1]:.2f})")
        logger.info(f"Joint positions - Knee: ({self.knee[0]:.2f}, {self.knee[1]:.2f})")
        
        # Get ankle if visible enough
        if ankle_idx < len(landmarks) and landmarks[ankle_idx]['visibility'] > self.visibility_threshold:
            self.ankle = [
                landmarks[ankle_idx]['x'],
                landmarks[ankle_idx]['y'],
            ]
            logger.info(f"Joint positions - Ankle: ({self.ankle[0]:.2f}, {self.ankle[1]:.2f})")
        else:
            self.ankle = None
            logger.info("Ankle not visible enough")

        return self.is_visible
            
    def analyze_pose(self, landmarks):
        """
        Analyze the sit-up pose and detect errors
        Returns: (torso_angle, knee_angle, is_visible, errors)
        """
        torso_angle = None
        knee_angle = None
        errors = []
        current_time = time.time()
        
        # Get joint positions
        self.get_joints(landmarks)
        
        # Cancel calculation if visibility is poor
        if not self.is_visible:
            return torso_angle, knee_angle, self.is_visible, errors
        
        # Calculate knee angle first to check proper form
        if self.ankle is not None:
            try:
                knee_angle = int(calculate_angle(self.hip, self.knee, self.ankle))
                logger.info(f"Current knee angle: {knee_angle} degrees")
                
                # Categorize knee bend quality
                if knee_angle >= self.KNEE_IDEAL_MIN and knee_angle <= self.KNEE_IDEAL_MAX:
                    self.knee_position_quality = "ideal"
                    logger.info("Knee position: IDEAL bend (40-45°)")
                elif knee_angle > self.KNEE_IDEAL_MAX and knee_angle <= self.KNEE_ACCEPTABLE_MAX:
                    self.knee_position_quality = "acceptable"
                    logger.info("Knee position: ACCEPTABLE bend (45-90°)")
                elif knee_angle > self.KNEE_STRAIGHT_THRESHOLD:
                    self.knee_position_quality = "straight"
                    logger.info("Knee position: STRAIGHT legs (>150°)")
                else:
                    self.knee_position_quality = "other"
                    logger.info(f"Knee position: OTHER angle ({knee_angle}°)")
                
                # Add appropriate feedback based on knee position
                if self.knee_position_quality == "straight":
                    errors.append({
                        "type": "straight_legs",
                        "severity": "high",
                        "message": "Bend your knees to approximately 40-45 degrees for ideal form"
                    })
                    self.detected_errors["STRAIGHT_LEGS"] += 1
                    logger.warning(f"Straight legs detected: {knee_angle}° (ideal is 40-45°)")
                elif self.knee_position_quality != "ideal" and self.knee_position_quality != "acceptable":
                    errors.append({
                        "type": "improper_knee_angle",
                        "severity": "medium",
                        "message": f"Adjust knee bend closer to 40-45 degrees for ideal form (current: {knee_angle}°)"
                    })
                    logger.warning(f"Improper knee angle: {knee_angle}° (ideal is 40-45°)")
            except Exception as e:
                logger.error(f"Error calculating knee angle: {e}")
                knee_angle = None
                self.knee_position_quality = "unknown"
        else:
            logger.warning("Ankle not visible, can't calculate knee angle")
            self.knee_position_quality = "unknown"
        
        # Calculate torso angle (between shoulder, hip, and knee)
        try:
            torso_angle = int(calculate_angle(self.shoulder, self.hip, self.knee))
            logger.info(f"Current torso angle: {torso_angle} degrees")
        except Exception as e:
            logger.error(f"Error calculating torso angle: {e}")
            torso_angle = 180  # Default to flat position
        
        # Limit extreme angles to reasonable range
        if torso_angle > 180:
            logger.warning(f"Capping extreme torso angle: {torso_angle} -> 180")
            torso_angle = 180
        elif torso_angle < 0:
            logger.warning(f"Capping negative torso angle: {torso_angle} -> 0")
            torso_angle = 0
        
        # Determine the current position (up/down) based on torso angle and head position
        is_down_position = False
        is_up_position = False
        
        # Determine angle thresholds based on knee position quality
        down_threshold = self.DOWN_ANGLE_THRESHOLD
        up_threshold = self.UP_ANGLE_THRESHOLD
        min_angle_change = self.MIN_ANGLE_CHANGE
        
        # Adjust thresholds based on knee quality
        if self.knee_position_quality == "ideal":
            # Ideal knee bend (40-45°) - widen down range, narrow up range
            down_threshold = 110  # Reduced from 120 for wider down range
            up_threshold = 85  # Reduced from 90 for narrower up range
            logger.info(f"Using modified thresholds for ideal knee bend (40-45°): down={down_threshold}°, up={up_threshold}°")
        elif self.knee_position_quality == "acceptable":
            # Acceptable knee bend (45-90°) - slightly adjusted thresholds
            down_threshold += 5  # Require slightly higher angle for down
            min_angle_change += 5  # Require slightly more angle change
        elif self.knee_position_quality == "straight":
            # Straight legs (>150°) - require significantly more angle change
            down_threshold += 15  # Higher threshold for down position
            min_angle_change += 15  # Require more angle change
        
        # Check for down position
        if torso_angle >= down_threshold:
            # Check head position if available (head should be low, meaning high y-value)
            if self.head_pos is not None:
                # Head is near the bottom of the frame
                if self.head_pos[1] > 0.7:  # y-coordinate > 0.7 means head is in bottom 30% of frame
                    is_down_position = True
                    logger.info(f"Down position detected - torso angle: {torso_angle}°, head position: {self.head_pos[1]:.2f}, threshold: {down_threshold}°")
                else:
                    logger.info(f"Head not near ground - position: {self.head_pos[1]:.2f}")
            else:
                # If head not visible, just use torso angle
                is_down_position = True
                logger.info(f"Down position detected based on torso angle only: {torso_angle}° >= {down_threshold}°")
        
        # Check for up position - torso is more vertical (less than 90 degrees)
        if torso_angle < up_threshold:
            is_up_position = True
            logger.info(f"Up position detected - torso angle: {torso_angle}° < {up_threshold}°")
        
        # Track minimum angle when in down position
        if is_down_position and not self.is_in_rep:
            if torso_angle < self.min_angle_detected:
                self.min_angle_detected = torso_angle
                logger.info(f"Updated minimum angle: {self.min_angle_detected}")
            
            self.stage = "down"
        
        # Detect rep based on angle change
        angle_change = self.min_angle_detected - torso_angle
        logger.info(f"Angle change from minimum: {angle_change}° (knee position: {self.knee_position_quality}, min required: {min_angle_change}°)")
        
        # Previous stage tracking
        previous_stage = self.stage
        
        # Handle state transitions
        if is_down_position:
            # We're in the down position
            if self.stage != "down":
                logger.info(f"Transitioning to down position - angle: {torso_angle}°")
                self.stage = "down"
        elif is_up_position and previous_stage == "down":
            # We've transitioned from down to up - count a rep
            self.stage = "up"
            
            # Only count if enough time has passed and sufficient angle change based on knee position
            if current_time - self.last_counted_time >= self.min_rep_interval and angle_change >= min_angle_change:
                self.counter += 1
                logger.info(f"Sit-up rep counted: {self.counter} with {self.knee_position_quality} knee position (angle change: {angle_change}°)")
                self.last_counted_time = current_time
            else:
                if angle_change < min_angle_change:
                    logger.info(f"Insufficient angle change for rep count: {angle_change}° < {min_angle_change}°")
                else:
                    logger.info(f"Ignored rapid rep: {current_time - self.last_counted_time:.2f}s < {self.min_rep_interval}s")
        elif is_up_position:
            self.stage = "up"
        
        # Log any stage transitions
        if previous_stage != self.stage:
            logger.info(f"Stage transition: {previous_stage} -> {self.stage} (angle: {torso_angle}°)")
        
        # Detect incomplete situp
        if self.stage == "up" and torso_angle >= up_threshold:
            errors.append({
                "type": "incomplete_situp",
                "severity": "medium",
                "message": f"Sit up more to reach at least a {up_threshold}° angle (current: {torso_angle}°)"
            })
            self.detected_errors["INCOMPLETE_SITUP"] += 1
        
        return torso_angle, knee_angle, self.is_visible, errors

class SitupAnalyzer:
    def __init__(self):
        try:
            # Set thresholds
            self.visibility_threshold = 0.3  # Reduced from 0.65 to be more forgiving
            
            # Create analyzer
            self.analyzer = SitupPoseAnalysis(
                visibility_threshold=self.visibility_threshold
            )
            
            logger.info("SitupAnalyzer initialized successfully")
            logger.info("""
            SITUP DETECTION CONFIGURATION:
            - Visibility threshold: 0.3
            - Minimum angle change for rep: 20 degrees
            - Down angle threshold: 120 degrees
            - Up angle threshold: 90 degrees
            - Proper knee angle range: 40-45 degrees
            - Will detect improper knee position and count reps with proper form more easily
            - Will attempt to use both left and right sides for improved detection
            """)
        except Exception as e:
            logger.error(f"Error initializing SitupAnalyzer: {e}")
            logger.error(traceback.format_exc())
            raise

    def reset_rep_counter(self) -> None:
        """Reset repetition counter"""
        logger.warning("RESET_DEBUG: Resetting rep counter in SitupAnalyzer")
        old_count = self.analyzer.get_counter()
        
        self.analyzer.reset()
        
        new_count = self.analyzer.get_counter()
        
        logger.warning(f"RESET_DEBUG: Situp counter reset from {old_count} to {new_count}")
    
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
            logger.info("\n==== SITUP_DEBUG: Starting pose analysis ====")
            
            if not landmarks or not isinstance(landmarks, list):
                logger.error("SITUP_DEBUG: No pose landmarks provided in input data")
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
                    logger.error("SITUP_DEBUG: Invalid landmark structure in input data")
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
            logger.info(f"SITUP_DEBUG: Received {len(raw_landmarks)} landmarks")
            
            # Default values in case of errors
            stage = "down"
            torso_angle = None
            knee_angle = None
            is_visible = False
            errors = []
            
            # Analyze situp pose
            logger.info("SITUP_DEBUG: Analyzing situp pose")
            try:
                torso_angle, knee_angle, is_visible, errors = self.analyzer.analyze_pose(raw_landmarks)
                logger.info(f"SITUP_DEBUG: Pose analysis complete. Torso angle: {torso_angle}, Knee angle: {knee_angle}, Visible: {is_visible}")
            except Exception as analyze_err:
                logger.error(f"SITUP_DEBUG: Error in situp pose analysis: {analyze_err}")
                logger.error(traceback.format_exc())
                torso_angle, knee_angle, is_visible, errors = None, None, False, []
            
            # Calculate form score
            form_score = 100
            try:
                form_score = self.calculate_form_score(errors)
                logger.info(f"SITUP_DEBUG: Form score: {form_score}")
            except Exception as score_err:
                logger.error(f"SITUP_DEBUG: Error calculating form score: {score_err}")
            
            # Get rep count
            rep_count = 0
            try:
                rep_count = self.analyzer.get_counter()
                logger.info(f"SITUP_DEBUG: Repetition count: {rep_count}")
            except Exception as rep_err:
                logger.error(f"SITUP_DEBUG: Error getting rep count: {rep_err}")
            
            # Get current stage
            try:
                stage = self.analyzer.stage
                logger.info(f"SITUP_DEBUG: Current stage: {stage}")
            except Exception as stage_err:
                logger.error(f"SITUP_DEBUG: Error getting stage: {stage_err}")
                stage = "down"  # Default to down stage
            
            # Compile metrics
            metrics = {
                "torsoAngle": torso_angle,
                "kneeAngle": knee_angle,
                "isVisible": is_visible
            }
            
            logger.info("SITUP_DEBUG: Analysis complete, returning results")
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
            logger.error(f"SITUP_DEBUG: Error analyzing pose: {str(e)}")
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
    """Analyze situp pose from JSON data"""
    try:
        # Parse the JSON data
        data = json.loads(json_data)
        
        # Extract landmarks from the data
        if "landmarks" in data:
            landmarks = data["landmarks"]
            
            # Create analyzer and analyze the pose
            analyzer = SitupAnalyzer()
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
        logger.error(f"Error in situp analysis: {str(e)}")
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