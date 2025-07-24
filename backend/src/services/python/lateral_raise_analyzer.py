import numpy as np
import json
import sys
import logging
from typing import Dict, List, Tuple, Any, Optional, Union

# Setup logging
logging.basicConfig(level=logging.INFO,
                  format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('lateral_raise_analyzer')

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

class LateralRaisePoseAnalysis:
    """Class to hold lateral raise analysis results"""
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

class LateralRaiseAnalyzer:
    """Analyzer for lateral raise poses"""
    
    def __init__(self):
        """Initialize the analyzer with default values"""
        # Counter for reps
        self.counter = 0
        
        # Track state
        self.current_stage = "up"
        self.previous_stage = "up"
        self.is_raising = False
        self.prev_left_angle = None
        self.prev_right_angle = None
        
        # Thresholds for analysis
        self.VISIBILITY_THRESHOLD = 0.2
        self.ANGLE_UP_THRESHOLD = 120  # Angle threshold for arms raised
        self.ANGLE_DELTA_THRESHOLD = 15  # Threshold for significant movement
        self.ANGLE_STABLE_THRESHOLD = 7  # Threshold for stable position
        
        logger.info("Lateral raise analyzer initialized")
    
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
        """Detect errors in the lateral raise form"""
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
                "message": "Keep both arms at the same height during lateral raises.",
                "severity": "medium"
            })
        
        # Check for too high raise
        if left_arm_angle > 170 or right_arm_angle > 170:
            errors.append({
                "type": "excessive_raise",
                "message": "Avoid raising arms too high above shoulder level.",
                "severity": "medium"
            })
        
        # Check for insufficient raise
        if self.current_stage == "down" and (left_arm_angle < 100 or right_arm_angle < 100):
            errors.append({
                "type": "insufficient_raise",
                "message": "Raise arms to at least shoulder level for full range of motion.",
                "severity": "medium"
            })
        
        # Check for body swinging
        # This would be more complex in a real implementation, 
        # we'd look at hip/shoulder movement over time
        
        return errors
    
    def detect_stage(self, left_arm_angle: float, right_arm_angle: float, 
                    left_delta: float, right_delta: float) -> str:
        """Determine the current stage of the exercise"""
        avg_angle = (left_arm_angle + right_arm_angle) / 2
        
        # Log the current angles for debugging
        logger.info(f"Left arm angle: {left_arm_angle:.1f}, Right arm angle: {right_arm_angle:.1f}")
        logger.info(f"Left delta: {left_delta:.1f}, Right delta: {right_delta:.1f}")
        
        # If both angles are above threshold, we're in the 'down' position (INVERTED)
        if avg_angle > self.ANGLE_UP_THRESHOLD:
            return "down"
        # Otherwise, we're in the 'up' position (INVERTED)
        else:
            return "up"
    
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
        """Analyze the lateral raise pose and return results"""
        analysis = LateralRaisePoseAnalysis()
        
        try:
            # Ensure landmarks is not empty
            if not landmarks or len(landmarks) < 15:
                logger.error(f"Invalid landmarks data: received {len(landmarks) if landmarks else 0} landmarks")
                analysis.errors.append({
                    "type": "INVALID_INPUT",
                    "message": "Insufficient landmark data for analysis",
                    "severity": "error"
                })
                return {
                    "success": False,
                    "error": {
                        "type": "INVALID_INPUT",
                        "message": "Insufficient landmark data for analysis",
                        "severity": "error"
                    }
                }
            
            # Ensure all required landmarks are present and have the required attributes
            for idx in REQUIRED_LANDMARKS:
                if idx >= len(landmarks):
                    logger.error(f"Missing landmark: {idx}")
                    return {
                        "success": False,
                        "error": {
                            "type": "INVALID_INPUT",
                            "message": f"Missing landmark: {idx}",
                            "severity": "error"
                        }
                    }
                
                landmark = landmarks[idx]
                required_attributes = ["x", "y", "visibility"]
                for attr in required_attributes:
                    if attr not in landmark:
                        logger.error(f"Landmark {idx} missing attribute: {attr}")
                        landmark[attr] = 0.0 if attr != "visibility" else 0.0
            
            # Check visibility first
            analysis.is_visible = self.check_visibility(landmarks)
            if not analysis.is_visible:
                analysis.errors.append({
                    "type": "visibility",
                    "message": "Cannot see body clearly. Adjust your position.",
                    "severity": "high"
                })
                # Important: Ensure we preserve the rep counter even when visibility is lost
                analysis.rep_count = self.counter
                analysis.stage = self.current_stage
                # Set a reasonable form score for visibility issues
                analysis.form_score = 70
                return {
                    "success": True,
                    "result": analysis.to_dict()
                }
            
            # Extract key landmarks
            left_shoulder = landmarks[11]
            left_elbow = landmarks[13]
            left_hip = landmarks[23]
            right_shoulder = landmarks[12]
            right_elbow = landmarks[14]
            right_hip = landmarks[24]
            
            # Calculate arm angles (angle between shoulder, elbow, and hip)
            left_arm_angle = self.calculate_angle(left_shoulder, left_elbow, left_hip)
            right_arm_angle = self.calculate_angle(right_shoulder, right_elbow, right_hip)
            
            # Calculate angle deltas (change in angle since last frame)
            left_delta = 0
            right_delta = 0
            
            if self.prev_left_angle is not None and self.prev_right_angle is not None:
                left_delta = abs(left_arm_angle - self.prev_left_angle)
                right_delta = abs(right_arm_angle - self.prev_right_angle)
                
                # Determine if we're in the raising motion
                if not self.is_raising and left_delta > self.ANGLE_DELTA_THRESHOLD and right_delta > self.ANGLE_DELTA_THRESHOLD:
                    self.is_raising = True
                    logger.info("Started raising motion")
                # Determine if we've stabilized (stopped moving)
                elif self.is_raising and left_delta < self.ANGLE_STABLE_THRESHOLD and right_delta < self.ANGLE_STABLE_THRESHOLD:
                    self.is_raising = False
                    logger.info("Finished raising motion")
            
            # Save current angles for next frame's delta calculation
            self.prev_left_angle = left_arm_angle
            self.prev_right_angle = right_arm_angle
            
            # Calculate metrics
            metrics = {
                "leftArmAngle": left_arm_angle,
                "rightArmAngle": right_arm_angle,
                "armAngleDelta": abs(left_arm_angle - right_arm_angle),
                "leftDelta": left_delta,
                "rightDelta": right_delta
            }
            
            # Detect current stage
            current_stage = self.detect_stage(left_arm_angle, right_arm_angle, left_delta, right_delta)
            
            # Count reps when transitioning from raising motion to stable position
            # with arms above threshold
            if self.is_raising and left_arm_angle > self.ANGLE_UP_THRESHOLD and right_arm_angle > self.ANGLE_UP_THRESHOLD:
                if self.current_stage == "up" and current_stage == "down":
                    self.counter += 1
                    logger.info(f"Lateral raise counted! Total: {self.counter}")
            
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
            logger.error(f"Error analyzing lateral raise pose: {str(e)}")
            return {
                "success": False,
                "error": {
                    "type": "ANALYSIS_ERROR",
                    "message": f"Failed to analyze lateral raise pose: {str(e)}",
                    "severity": "error"
                }
            }
    
    def reset_counter(self) -> Dict[str, Any]:
        """Reset the repetition counter"""
        logger.info(f"Resetting lateral raise counter from {self.counter} to 0")
        self.counter = 0
        # Also reset the current stage to ensure clean state
        self.current_stage = "up"
        self.previous_stage = "up"
        self.is_raising = False
        self.prev_left_angle = None
        self.prev_right_angle = None
        
        logger.info("""
        LATERAL RAISE REP COUNTING GUIDE:
        - For a rep to count, you must raise both arms from your sides to at least shoulder level
        - Arms should be raised to the sides (lateral raises)
        - Maintain controlled movement throughout the exercise
        - Keep your body visible to the camera throughout the exercise
        """)
        
        return {
            "success": True,
            "message": "Lateral raise counter reset successfully"
        }
    
    def reset_rep_counter(self) -> Dict[str, Any]:
        """Alias for reset_counter to maintain compatibility with the backend service"""
        logger.info("reset_rep_counter called - forwarding to reset_counter")
        return self.reset_counter()

def analyze_from_json(json_data: str) -> Dict[str, Any]:
    """Analyze lateral raise pose from JSON data"""
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
        analyzer = LateralRaiseAnalyzer()
        result = analyzer.analyze_pose(landmarks)
        
        return result
    except Exception as e:
        logger.error(f"Error in lateral raise analysis: {str(e)}")
        return {
            "success": False,
            "error": {
                "type": "ANALYSIS_ERROR",
                "message": f"Error in lateral raise analysis: {str(e)}",
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