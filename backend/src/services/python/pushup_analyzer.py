import numpy as np
import json
import sys
import logging
from typing import Dict, List, Tuple, Any, Optional, Union

# Setup logging
logging.basicConfig(level=logging.INFO,
                  format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('pushup_analyzer')

# Define required landmarks for this exercise
REQUIRED_LANDMARKS = [
    0,  # nose
    11, 12,  # shoulders
    13, 14,  # elbows
    15, 16,  # wrists
    23, 24,  # hips
    25, 26,  # knees
    27, 28   # ankles
]

class PushupPoseAnalysis:
    """Class to hold pushup analysis results"""
    def __init__(self):
        self.stage = "unknown"
        self.rep_count = 0
        self.form_score = 100
        self.errors = []
        self.metrics = {}
        self.is_visible = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert analysis to dictionary for JSON response"""
        return {
            "stage": self.stage,
            "repCount": self.rep_count,
            "formScore": self.form_score,
            "errors": self.errors,
            "metrics": self.metrics,
            "isVisible": self.is_visible
        }

class PushupAnalyzer:
    """Analyzer for pushup poses"""
    
    def __init__(self):
        """Initialize the analyzer with default values"""
        # Counter for reps
        self.counter = 0
        
        # Track state
        self.current_stage = "up"
        self.previous_stage = "up"
        self.is_pushing_up = False
        self.prev_angle = None
        # Add state tracking to better handle transitions
        self.went_down = False  # Track if we've gone to the down position in this rep cycle
        
        # Thresholds for analysis
        self.VISIBILITY_THRESHOLD = 0.2
        # Adjust thresholds to be more lenient for better rep detection
        self.ANGLE_UP_THRESHOLD = 130  # Was 140 - lowered to make it easier to detect UP position
        self.ANGLE_DOWN_THRESHOLD = 120  # Was 110 - increased to make it easier to detect DOWN position
        self.ANGLE_DELTA_THRESHOLD = 10
        
        logger.info("Pushup analyzer initialized with UP threshold: %d, DOWN threshold: %d", 
                   self.ANGLE_UP_THRESHOLD, self.ANGLE_DOWN_THRESHOLD)
    
    def calculate_angle(self, a: Dict[str, float], b: Dict[str, float], c: Dict[str, float]) -> float:
        """Calculate the angle between three points"""
        # Convert to numpy arrays for vector operations
        a_array = np.array([a["x"], a["y"]])
        b_array = np.array([b["x"], b["y"]])
        c_array = np.array([c["x"], c["y"]])
        
        # Calculate vectors
        ba = b_array - a_array
        bc = b_array - c_array
        
        # Calculate angle using dot product
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        cosine_angle = np.clip(cosine_angle, -1.0, 1.0)  # Clip to handle numerical errors
        angle = np.degrees(np.arccos(cosine_angle))
        
        return angle
    
    def check_visibility(self, landmarks: List[Dict[str, float]]) -> bool:
        """Check if enough required landmarks are visible"""
        # Instead of requiring all landmarks to be visible,
        # only require 70% of them to be visible
        visible_count = 0
        total_required = len(REQUIRED_LANDMARKS)
        
        for idx in REQUIRED_LANDMARKS:
            if idx < len(landmarks) and landmarks[idx]["visibility"] >= self.VISIBILITY_THRESHOLD:
                visible_count += 1
        
        # Return true if at least 70% of required landmarks are visible
        visibility_percentage = visible_count / total_required
        return visibility_percentage >= 0.7
    
    def detect_errors(self, landmarks: List[Dict[str, float]], metrics: Dict[str, float]) -> List[Dict[str, str]]:
        """Detect errors in the pushup form"""
        errors = []
        
        # Check for visibility issues
        if not self.check_visibility(landmarks):
            errors.append({
                "type": "visibility",
                "message": "Cannot see body clearly. Adjust your position.",
                "severity": "high"
            })
            return errors
        
        # Check for uneven arm angles
        left_arm_angle = metrics.get("leftArmAngle", 0)
        right_arm_angle = metrics.get("rightArmAngle", 0)
        
        if abs(left_arm_angle - right_arm_angle) > 20:
            errors.append({
                "type": "uneven_arms",
                "message": "Arms are uneven. Keep shoulders level.",
                "severity": "medium"
            })
        
        # Check for proper form
        if self.current_stage == "down" and (left_arm_angle > 120 or right_arm_angle > 120):
            errors.append({
                "type": "incomplete_pushup",
                "message": "Go lower for a complete push-up.",
                "severity": "medium"
            })
        
        # Check back alignment
        # For simplicity, we'll use the alignment of shoulders and hips as a proxy
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        left_hip = landmarks[23]
        right_hip = landmarks[24]
        
        shoulder_y = (left_shoulder["y"] + right_shoulder["y"]) / 2
        hip_y = (left_hip["y"] + right_hip["y"]) / 2
        
        if abs(shoulder_y - hip_y) > 0.1:  # Threshold for back alignment
            errors.append({
                "type": "back_alignment",
                "message": "Keep your back straight during push-ups.",
                "severity": "high"
            })
        
        return errors
    
    def detect_stage(self, left_arm_angle: float, right_arm_angle: float) -> str:
        """Determine the current stage of the exercise"""
        avg_angle = (left_arm_angle + right_arm_angle) / 2
        
        # Enhanced logging for debugging rep counting issues
        logger.info(f"Current arm angle: {avg_angle:.1f} degrees, Left: {left_arm_angle:.1f}, Right: {right_arm_angle:.1f}")
        logger.info(f"Previous stage: {self.current_stage}, Required for UP: > {self.ANGLE_UP_THRESHOLD}, Required for DOWN: < {self.ANGLE_DOWN_THRESHOLD}")
        
        if avg_angle > self.ANGLE_UP_THRESHOLD:
            return "up"
        elif avg_angle < self.ANGLE_DOWN_THRESHOLD:
            return "down"
        else:
            return "middle"
    
    def calculate_form_score(self, errors: List[Dict[str, str]]) -> int:
        """Calculate a form score based on detected errors"""
        score = 100
        
        for error in errors:
            if error["severity"] == "high":
                score -= 15
            elif error["severity"] == "medium":
                score -= 10
            elif error["severity"] == "low":
                score -= 5
        
        # Ensure score is between 0 and 100
        return max(0, min(100, score))
    
    def analyze_pose(self, landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
        """Analyze the pushup pose and return results"""
        analysis = PushupPoseAnalysis()
        
        try:
            # Check visibility first
            analysis.is_visible = self.check_visibility(landmarks)
            if not analysis.is_visible:
                analysis.errors.append({
                    "type": "visibility",
                    "message": "Cannot see body clearly. Adjust your position.",
                    "severity": "high"
                })
                return {
                    "success": True,
                    "result": analysis.to_dict()
                }
            
            # Extract key landmarks
            left_shoulder = landmarks[11]
            left_elbow = landmarks[13]
            left_wrist = landmarks[15]
            right_shoulder = landmarks[12]
            right_elbow = landmarks[14]
            right_wrist = landmarks[16]
            
            # Calculate arm angles
            left_arm_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
            right_arm_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            
            # Calculate metrics
            metrics = {
                "leftArmAngle": left_arm_angle,
                "rightArmAngle": right_arm_angle,
                "armAngleDelta": abs(left_arm_angle - right_arm_angle)
            }
            
            # Detect current stage
            current_stage = self.detect_stage(left_arm_angle, right_arm_angle)
            
            # Log stage transition for debugging
            if current_stage != self.current_stage:
                logger.info(f"Stage changed: {self.current_stage} -> {current_stage}")
            
            # Enhanced rep counting logic:
            # 1. If going to DOWN position, mark that we've reached down
            if current_stage == "down":
                self.went_down = True
                logger.info("Went to DOWN position - marking for potential rep")
                
            # 2. Count rep when transitioning from down to up (either directly or through middle)
            if current_stage == "up" and self.went_down:
                # Count a rep if we were previously down or in middle after being down
                if self.current_stage in ["down", "middle"]:
                self.counter += 1
                    logger.info(f"Push-up rep counted! Total: {self.counter}, Transition: {self.current_stage} -> {current_stage}")
                    self.went_down = False  # Reset for next rep
                
            # Additional logging for state changes
            elif self.current_stage != current_stage:
                logger.info(f"Stage changed but NO rep counted: {self.current_stage} -> {current_stage}")
            
            # Update stage
            self.previous_stage = self.current_stage
            self.current_stage = current_stage
            
            # Detect form errors
            errors = self.detect_errors(landmarks, metrics)
            
            # Calculate form score
            form_score = self.calculate_form_score(errors)
            
            # Update analysis object
            analysis.stage = current_stage
            analysis.rep_count = self.counter
            analysis.metrics = metrics
            analysis.errors = errors
            analysis.form_score = form_score
            
            return {
                "success": True,
                "result": analysis.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing pushup pose: {str(e)}")
            return {
                "success": False,
                "error": {
                    "type": "ANALYSIS_ERROR",
                    "message": f"Failed to analyze pushup pose: {str(e)}",
                    "severity": "error"
                }
            }
    
    def reset_counter(self) -> Dict[str, Any]:
        """Reset the repetition counter"""
        logger.info(f"Resetting pushup counter from {self.counter} to 0")
        self.counter = 0
        # Also reset the current stage to ensure clean state
        self.current_stage = "up"
        self.previous_stage = "up"
        self.went_down = False  # Reset the down position tracking
        
        logger.info("""
        PUSHUP REP COUNTING GUIDE:
        - For a rep to count, you must go from UP position to DOWN position and back to UP
        - UP position: arms extended (angle > %d degrees)
        - DOWN position: arms bent (angle < %d degrees)
        - Keep your body visible to the camera throughout the exercise
        """, self.ANGLE_UP_THRESHOLD, self.ANGLE_DOWN_THRESHOLD)
        
        return {
            "success": True,
            "message": "Push-up counter reset successfully"
        }
        
    def reset_rep_counter(self) -> Dict[str, Any]:
        """Alias for reset_counter to maintain compatibility with the backend service"""
        logger.info("reset_rep_counter called - forwarding to reset_counter")
        return self.reset_counter()

def analyze_from_json(json_data: str) -> Dict[str, Any]:
    """Analyze pushup pose from JSON data"""
    try:
        # Parse the JSON data
        data = json.loads(json_data)
        
        # Extract landmarks from the data
        landmarks = data.get("poseLandmarks", [])
        
        if not landmarks:
            logger.error("No landmarks found in the data")
            return {
                "success": False,
                "error": {
                    "type": "INVALID_DATA",
                    "message": "No landmarks found in the data",
                    "severity": "error"
                }
            }
        
        # Create analyzer and analyze the pose
        analyzer = PushupAnalyzer()
        result = analyzer.analyze_pose(landmarks)
        
        return result
    except Exception as e:
        logger.error(f"Error in pushup analysis: {str(e)}")
        return {
            "success": False,
            "error": {
                "type": "ANALYSIS_ERROR",
                "message": f"Error in pushup analysis: {str(e)}",
                "severity": "error"
            }
        }

if __name__ == "__main__":
    # Read JSON data from stdin
    json_data = sys.stdin.read()
    
    # Analyze the pose
    result = analyze_from_json(json_data)
    
    # Print the result as JSON
    print(json.dumps(result)) 