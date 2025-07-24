import logging
import traceback
import sys
import json
import numpy as np
import pickle
import os
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional, Union
import time

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('lunge_analyzer')

# Add a handler to ensure logs go to stderr
handler = logging.StreamHandler(sys.stderr)
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# MediaPipe pose landmark indices
LANDMARK_INDICES = {
    "NOSE": 0,
    "LEFT_EYE_INNER": 1,
    "LEFT_EYE": 2,
    "LEFT_EYE_OUTER": 3,
    "RIGHT_EYE_INNER": 4,
    "RIGHT_EYE": 5,
    "RIGHT_EYE_OUTER": 6,
    "LEFT_EAR": 7,
    "RIGHT_EAR": 8,
    "MOUTH_LEFT": 9,
    "MOUTH_RIGHT": 10,
    "LEFT_SHOULDER": 11,
    "RIGHT_SHOULDER": 12,
    "LEFT_ELBOW": 13,
    "RIGHT_ELBOW": 14,
    "LEFT_WRIST": 15,
    "RIGHT_WRIST": 16,
    "LEFT_PINKY": 17,
    "RIGHT_PINKY": 18,
    "LEFT_INDEX": 19,
    "RIGHT_INDEX": 20,
    "LEFT_THUMB": 21,
    "RIGHT_THUMB": 22,
    "LEFT_HIP": 23,
    "RIGHT_HIP": 24,
    "LEFT_KNEE": 25,
    "RIGHT_KNEE": 26,
    "LEFT_ANKLE": 27,
    "RIGHT_ANKLE": 28,
    "LEFT_HEEL": 29,
    "RIGHT_HEEL": 30,
    "LEFT_FOOT_INDEX": 31,
    "RIGHT_FOOT_INDEX": 32
}

# Important landmarks for lunge detection
IMPORTANT_LANDMARKS = [
    "NOSE",
    "LEFT_SHOULDER",
    "RIGHT_SHOULDER",
    "LEFT_HIP",
    "RIGHT_HIP",
    "LEFT_KNEE",
    "RIGHT_KNEE",
    "LEFT_ANKLE",
    "RIGHT_ANKLE",
    "LEFT_HEEL",
    "RIGHT_HEEL",
    "LEFT_FOOT_INDEX",
    "RIGHT_FOOT_INDEX"
]

# Thresholds
VISIBILITY_THRESHOLD = 0.6
KNEE_ANGLE_THRESHOLD = [60, 125]
PREDICTION_PROB_THRESHOLD = 0.8

def calculate_angle(a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> float:
    """Calculate the angle between three points"""
    # Convert to numpy arrays for vector operations
    a = np.array([a[0], a[1]])
    b = np.array([b[0], b[1]])
    c = np.array([c[0], c[1]])
    
    # Calculate vectors
    ba = a - b
    bc = c - b
    
    # Calculate angle in radians using dot product
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    
    # Convert to degrees
    angle = np.degrees(angle)
    
    return angle

def analyze_knee_angle(landmarks: List[Dict[str, float]], stage: str) -> Dict[str, Any]:
    """
    Calculate angle of each knee and detect errors when in the DOWN position
    
    Args:
        landmarks: List of pose landmarks from MediaPipe
        stage: Current exercise stage
        
    Returns:
        Dictionary with analysis results
    """
    results = {
        "error": None,
        "right": {"error": None, "angle": None},
        "left": {"error": None, "angle": None}
    }

    # Calculate right knee angle
    right_hip = (
        landmarks[LANDMARK_INDICES["RIGHT_HIP"]]["x"],
        landmarks[LANDMARK_INDICES["RIGHT_HIP"]]["y"]
    )
    right_knee = (
        landmarks[LANDMARK_INDICES["RIGHT_KNEE"]]["x"],
        landmarks[LANDMARK_INDICES["RIGHT_KNEE"]]["y"]
    )
    right_ankle = (
        landmarks[LANDMARK_INDICES["RIGHT_ANKLE"]]["x"],
        landmarks[LANDMARK_INDICES["RIGHT_ANKLE"]]["y"]
    )
    results["right"]["angle"] = calculate_angle(right_hip, right_knee, right_ankle)

    # Calculate left knee angle
    left_hip = (
        landmarks[LANDMARK_INDICES["LEFT_HIP"]]["x"],
        landmarks[LANDMARK_INDICES["LEFT_HIP"]]["y"]
    )
    left_knee = (
        landmarks[LANDMARK_INDICES["LEFT_KNEE"]]["x"],
        landmarks[LANDMARK_INDICES["LEFT_KNEE"]]["y"]
    )
    left_ankle = (
        landmarks[LANDMARK_INDICES["LEFT_ANKLE"]]["x"],
        landmarks[LANDMARK_INDICES["LEFT_ANKLE"]]["y"]
    )
    results["left"]["angle"] = calculate_angle(left_hip, left_knee, left_ankle)

    # Skip error checking if not in down position
    if stage != "down":
        return results

    # Check for knee angle errors only in down position
    results["error"] = False

    # Check right knee angle
    if KNEE_ANGLE_THRESHOLD[0] <= results["right"]["angle"] <= KNEE_ANGLE_THRESHOLD[1]:
        results["right"]["error"] = False
    else:
        results["right"]["error"] = True
        results["error"] = True

    # Check left knee angle
    if KNEE_ANGLE_THRESHOLD[0] <= results["left"]["angle"] <= KNEE_ANGLE_THRESHOLD[1]:
        results["left"]["error"] = False
    else:
        results["left"]["error"] = True
        results["error"] = True

    return results

def extract_important_keypoints(results, important_landmarks: list) -> list:
    '''Extract important keypoints from mediapipe pose detection'''
    try:
        # Check if results is in MediaPipe format or direct landmarks format
        if hasattr(results, 'pose_landmarks') and hasattr(results.pose_landmarks, 'landmark'):
            # MediaPipe format
            landmarks = results.pose_landmarks.landmark
            
            data = []
            for lm in important_landmarks:
                keypoint = landmarks[LANDMARK_INDICES[lm]]
                # Access attributes for MediaPipe format
                data.append([keypoint.x, keypoint.y, keypoint.z, keypoint.visibility])
        else:
            # Direct landmarks list format
            landmarks = results  # Assuming results is the list of landmarks
            
            data = []
            for lm in important_landmarks:
                lm_index = LANDMARK_INDICES[lm]
                if lm_index < len(landmarks):
                    keypoint = landmarks[lm_index]
                    # Access dictionary values for direct format
                    data.append([keypoint['x'], keypoint['y'], keypoint['z'], keypoint['visibility']])
                else:
                    # Use zeros for missing landmarks
                    data.append([0.0, 0.0, 0.0, 0.0])
        
        return np.array(data).flatten().tolist()
    except Exception as e:
        logger.error(f"Error extracting keypoints: {str(e)}")
        logger.error(traceback.format_exc())
        return []

def _detect_knee_over_toe_geometric(landmarks: List[Dict[str, float]]) -> bool:
    """
    Detect knee over toe using geometric calculations
    
    Args:
        landmarks: List of pose landmarks from MediaPipe
        
    Returns:
        True if error detected, False otherwise
    """
    # This is a geometric approach to knee over toe detection
    # It checks if the knee extends beyond the toe in the horizontal direction
    
    # Extract knee, ankle and foot positions
    left_knee_x = landmarks[LANDMARK_INDICES["LEFT_KNEE"]]["x"]
    left_ankle_x = landmarks[LANDMARK_INDICES["LEFT_ANKLE"]]["x"]
    left_foot_x = landmarks[LANDMARK_INDICES["LEFT_FOOT_INDEX"]]["x"]
    
    right_knee_x = landmarks[LANDMARK_INDICES["RIGHT_KNEE"]]["x"]
    right_ankle_x = landmarks[LANDMARK_INDICES["RIGHT_ANKLE"]]["x"]
    right_foot_x = landmarks[LANDMARK_INDICES["RIGHT_FOOT_INDEX"]]["x"]
    
    # Check visibility to ensure reliable measurements
    left_knee_v = landmarks[LANDMARK_INDICES["LEFT_KNEE"]]["visibility"]
    left_ankle_v = landmarks[LANDMARK_INDICES["LEFT_ANKLE"]]["visibility"]
    left_foot_v = landmarks[LANDMARK_INDICES["LEFT_FOOT_INDEX"]]["visibility"]
    
    right_knee_v = landmarks[LANDMARK_INDICES["RIGHT_KNEE"]]["visibility"]
    right_ankle_v = landmarks[LANDMARK_INDICES["RIGHT_ANKLE"]]["visibility"]
    right_foot_v = landmarks[LANDMARK_INDICES["RIGHT_FOOT_INDEX"]]["visibility"]
    
    # Calculate horizontal distance ratio (positive means knee is beyond toe)
    left_error = False
    right_error = False
    
    # Reduced threshold for easier detection
    THRESHOLD = 0.02
    
    # Only check if visibility is good enough for key points
    if left_knee_v > 0.5 and left_foot_v > 0.5:
        # For left side (assuming x increases from right to left in the image)
        
        # Direct knee over toe check - reduced threshold
        knee_over_toe = left_knee_x > left_foot_x + THRESHOLD
        
        # Secondary check - knee ahead of ankle
        knee_over_ankle = left_knee_x > left_ankle_x + THRESHOLD
        
        # Normalize distances to account for different body proportions
        if left_ankle_v > 0.5:
            # Calculate the expected position based on ankle-to-toe distance
            ankle_toe_dist = abs(left_ankle_x - left_foot_x)
            # If knee extends more than 60% of the way from ankle to toe, flag it
            position_ratio = (left_knee_x - left_ankle_x) / (ankle_toe_dist) if ankle_toe_dist > 0 else 0
            ratio_error = position_ratio > 0.6
        else:
            ratio_error = False
        
        # Combine the checks - if any detect an error, flag it
        left_error = knee_over_toe or (knee_over_ankle and ratio_error)
        
        logger.info(f"Left knee-toe: knee_x={left_knee_x:.3f}, ankle_x={left_ankle_x:.3f}, foot_x={left_foot_x:.3f}, " +
                   f"diff={left_knee_x-left_foot_x:.3f}, knee_over_toe={knee_over_toe}, " +
                   f"knee_over_ankle={knee_over_ankle}, ratio_error={ratio_error}, error={left_error}")
    
    if right_knee_v > 0.5 and right_foot_v > 0.5:
        # For right side (assuming x increases from right to left in the image)
    
        # Direct knee over toe check - reduced threshold
        knee_over_toe = right_knee_x < right_foot_x - THRESHOLD
        
        # Secondary check - knee ahead of ankle 
        knee_over_ankle = right_knee_x < right_ankle_x - THRESHOLD
        
        # Normalize distances to account for different body proportions
        if right_ankle_v > 0.5:
            # Calculate the expected position based on ankle-to-toe distance
            ankle_toe_dist = abs(right_ankle_x - right_foot_x)
            # If knee extends more than 60% of the way from ankle to toe, flag it
            position_ratio = (right_ankle_x - right_knee_x) / (ankle_toe_dist) if ankle_toe_dist > 0 else 0
            ratio_error = position_ratio > 0.6
        else:
            ratio_error = False
            
        # Combine the checks - if any detect an error, flag it
        right_error = knee_over_toe or (knee_over_ankle and ratio_error)
        
        logger.info(f"Right knee-toe: knee_x={right_knee_x:.3f}, ankle_x={right_ankle_x:.3f}, foot_x={right_foot_x:.3f}, " +
                   f"diff={right_foot_x-right_knee_x:.3f}, knee_over_toe={knee_over_toe}, " +
                   f"knee_over_ankle={knee_over_ankle}, ratio_error={ratio_error}, error={right_error}")
    
    logger.info(f"Knee over toe geometric check - Left error: {left_error}, Right error: {right_error}")
    
    return left_error or right_error

class RepCounter:
    """Track repetition counts for lunge exercise"""
    
    def __init__(self):
        self.count = 0
        self.current_stage = "unknown"
        self.previous_stage = "unknown"
    
    def update_stage(self, stage: str):
        """
        Update the current stage and count repetitions
        
        Args:
            stage: New stage of the exercise
        """
        if stage == "down" and self.current_stage in ["init", "mid"]:
            self.count += 1
            
        self.previous_stage = self.current_stage
        self.current_stage = stage
    
    def get_count(self) -> int:
        """Get the current repetition count"""
        return self.count
    
    def reset(self):
        """Reset the counter"""
        self.count = 0
        self.current_stage = "unknown"
        self.previous_stage = "unknown"

def get_static_file_url(path: str) -> str:
    """Get path to static files from the core directory"""
    # Find model in current directory first, then try core directory
    current_path = Path(__file__).parent / Path(path).name
    if current_path.exists():
        logger.debug(f"Found model file at: {str(current_path)}")
        return str(current_path)
    
    # For the lunge model, we need to check subfolder paths
    if path.startswith("err_") and "sklearn" not in path:
        # Look in sklearn subfolder for error detection models
        core_path = Path(__file__).parent.parent.parent.parent.parent / "core" / "lunge_model" / "model" / "sklearn" / Path(path).name
    elif path.startswith("stage_") and "sklearn" not in path:
        # Look in sklearn subfolder for stage detection models
        core_path = Path(__file__).parent.parent.parent.parent.parent / "core" / "lunge_model" / "model" / "sklearn" / Path(path).name
    else:
        # For other files like the scaler, look in the main model directory
        core_path = Path(__file__).parent.parent.parent.parent.parent / "core" / "lunge_model" / "model" / Path(path).name
    
    if core_path.exists():
        logger.debug(f"Found model file at: {str(core_path)}")
    else:
        logger.warning(f"Model file not found at: {str(core_path)}")
        
    return str(core_path)

class LungeAnalyzer:
    """
    Analyze lunge exercise form using pose landmarks
    """
    
    # Class constants for model paths
    STAGE_ML_MODEL_PATH = None
    ERR_ML_MODEL_PATH = None
    INPUT_SCALER_PATH = None
    
    # Thresholds
    PREDICTION_PROB_THRESHOLD = 0.8
    KNEE_ANGLE_THRESHOLD = [60, 125]
    
    def __init__(self):
        """Initialize the lunge analyzer"""
        self.rep_counter = RepCounter()
        self.previous_stage = "unknown"
        self.VISIBILITY_THRESHOLD = 0.6
        
        # Set model paths
        self._initialize_model_paths()
        
        # Initialize important landmarks for ML model
        self.init_important_landmarks()
        
        # Load ML models for stage and error detection
        self.load_machine_learning_model()
        
        logger.info("Lunge analyzer initialized")
    
    def _initialize_model_paths(self):
        """Initialize the model file paths"""
        self.STAGE_ML_MODEL_PATH = get_static_file_url("stage_LR_model.pkl")
        self.ERR_ML_MODEL_PATH = get_static_file_url("err_LR_model.pkl")
        self.INPUT_SCALER_PATH = get_static_file_url("input_scaler.pkl")
        
        logger.debug(f"Model paths - Stage: {self.STAGE_ML_MODEL_PATH}, Error: {self.ERR_ML_MODEL_PATH}, Scaler: {self.INPUT_SCALER_PATH}")
    
    def init_important_landmarks(self) -> None:
        """
        Define important landmarks for lunge detection
        """
        self.important_landmarks = IMPORTANT_LANDMARKS
        
        # Generate column headers for the dataframe
        self.headers = ["label"]  # Label column
        
        for lm in self.important_landmarks:
            self.headers += [
                f"{lm.lower()}_x",
                f"{lm.lower()}_y",
                f"{lm.lower()}_z",
                f"{lm.lower()}_v",
            ]
            
    def load_machine_learning_model(self) -> None:
        """
        Load machine learning models for stage and error detection
        """
        try:
            # Set default - assume we can't use ML for detection
            self.stage_model = None
            self.err_model = None
            self.input_scaler = None
            self.use_ml_for_detection = False
            
            # Check if the model files exist
            logger.debug("Checking model files existence")
            stage_model_exists = os.path.exists(self.STAGE_ML_MODEL_PATH)
            err_model_exists = os.path.exists(self.ERR_ML_MODEL_PATH)
            scaler_exists = os.path.exists(self.INPUT_SCALER_PATH)
            
            if not stage_model_exists or not err_model_exists or not scaler_exists:
                logger.warning("One or more model files not found. Using fallback geometric detection")
                return
                
            # Import required libraries
            try:
                global pd
                import pandas as pd
                logger.debug("Successfully imported pandas")
            except ImportError as imp_err:
                logger.error(f"Error importing required libraries: {imp_err}")
                return
                
            # Load the model files
            try:
                # Load stage detection model
                logger.debug("Loading ML models and scaler")
                with open(self.STAGE_ML_MODEL_PATH, "rb") as f:
                    try:
                        self.stage_model = pickle.load(f)
                    except Exception as model_err:
                        logger.error(f"Error loading stage detection model: {model_err}")
                        logger.error(traceback.format_exc())
                        return
                
                # Load error detection model
                with open(self.ERR_ML_MODEL_PATH, "rb") as f:
                    try:
                        self.err_model = pickle.load(f)
                    except Exception as model_err:
                        logger.error(f"Error loading error detection model: {model_err}")
                        logger.error(traceback.format_exc())
                        return
    
                # Load input scaler
                with open(self.INPUT_SCALER_PATH, "rb") as f2:
                    try:
                        self.input_scaler = pickle.load(f2)
                    except Exception as scaler_err:
                        logger.error(f"Error loading input scaler: {scaler_err}")
                        logger.error(traceback.format_exc())
                        return
                
                # Test the models with sample data
                logger.debug("Testing models with sample data")
                # Create a simple test dataframe with the correct number of features
                test_features = len(self.headers) - 1  # Subtract 1 for the label column
                test_data = pd.DataFrame(np.zeros((1, test_features)), columns=self.headers[1:])
                scaled_test_data = pd.DataFrame(self.input_scaler.transform(test_data))
                
                # Test stage model
                try:
                    self.stage_model.predict(scaled_test_data)
                except Exception as test_err:
                    logger.error(f"Error testing stage model: {test_err}")
                    logger.error(traceback.format_exc())
                    self.stage_model = None
                    return
                
                # Test error model
                try:
                    self.err_model.predict(scaled_test_data)
                except Exception as test_err:
                    logger.error(f"Error testing error model: {test_err}")
                    logger.error(traceback.format_exc())
                    self.err_model = None
                    return
                
                self.use_ml_for_detection = True
                logger.info("Successfully loaded and tested ML models for lunge detection")
            except Exception as test_err:
                logger.error(f"Error during model loading and testing: {test_err}")
                logger.error(traceback.format_exc())
                self.stage_model = None
                self.err_model = None
                self.input_scaler = None
                
        except Exception as e:
            logger.error(f"Error loading ML models: {e}")
            logger.error(traceback.format_exc())
            self.stage_model = None
            self.err_model = None
            self.input_scaler = None
    
    def detect_stage(self, landmarks: List[Dict[str, float]]) -> str:
        """
        Determine the current stage of the lunge exercise using ML model only
        """
        try:
            # Use ML model for stage detection
            if hasattr(self, 'stage_model') and self.stage_model is not None and self.input_scaler is not None:
                try:
                    start_time = time.time()
                    
                    # Create a MediaPipe-compatible results object
                    landmark_objects = []
                    for lm in landmarks:
                        landmark_obj = type('obj', (object,), {
                            'x': lm['x'], 
                            'y': lm['y'], 
                            'z': lm['z'], 
                            'visibility': lm['visibility']
                        })
                        landmark_objects.append(landmark_obj)
                    
                    pose_landmarks = type('obj', (object,), {'landmark': landmark_objects})
                    processed_result = type('obj', (object,), {'pose_landmarks': pose_landmarks})
                    
                    # Extract keypoints for the model
                    row = extract_important_keypoints(processed_result, self.important_landmarks)
                    X = pd.DataFrame([row], columns=self.headers[1:])
                    
                    # Scale the features
                    X_scaled = pd.DataFrame(self.input_scaler.transform(X))
                    
                    # Make prediction
                    stage_predicted_class = self.stage_model.predict(X_scaled)[0]
                    stage_probabilities = self.stage_model.predict_proba(X_scaled)[0]
                    
                    # Log prediction results in a single line
                    class_probs = {
                        "I": f"{stage_probabilities[0]:.3f}",
                        "M": f"{stage_probabilities[1]:.3f}", 
                        "D": f"{stage_probabilities[2]:.3f}"
                    }
                    
                    end_time = time.time()
                    logger.debug(f"Stage prediction: {stage_predicted_class}, Probs: {class_probs}, Time: {(end_time - start_time)*1000:.2f}ms")
                    
                    # Map predicted class to stage
                    stage_map = {
                        "I": "init",
                        "M": "mid",
                        "D": "down"
                    }
                    
                    # Get the stage from the predicted class
                    stage = stage_map.get(stage_predicted_class, "unknown")
                    return stage
                except Exception as e:
                    logger.error(f"Error in ML-based stage detection: {e}")
                    logger.error(traceback.format_exc())
                    return "unknown"
            else:
                logger.error("ML model not available for stage detection")
                return "unknown"
        except Exception as e:
            logger.error(f"Error in stage detection: {str(e)}")
            return "unknown"
    
    def analyze_pose(self, landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Analyze a single frame of lunge pose
        """
        try:
            # Ensure we have landmarks
            if not landmarks or len(landmarks) < 33:
                logger.error("Invalid landmarks input")
                return {
                    "success": False,
                    "error": {
                        "type": "INVALID_INPUT",
                        "severity": "error",
                        "message": "Missing or insufficient landmarks"
                    }
                }
            
            # Create a MediaPipe-compatible results object for ML detection
            logger.info("Starting pose analysis")
            try:
                # Create a compatible structure that matches what MediaPipe would provide
                landmark_objects = []
                for lm in landmarks:
                    landmark_obj = type('obj', (object,), {
                        'x': lm['x'], 
                        'y': lm['y'], 
                        'z': lm['z'], 
                        'visibility': lm['visibility']
                    })
                    landmark_objects.append(landmark_obj)
                
                pose_landmarks = type('obj', (object,), {'landmark': landmark_objects})
                processed_result = type('obj', (object,), {'pose_landmarks': pose_landmarks})
                logger.debug("MediaPipe-compatible result object created")
            except Exception as e:
                logger.error(f"Error creating MediaPipe-compatible result: {e}")
                logger.error(traceback.format_exc())
                processed_result = None
            
            # Detect the current stage using ML model if available
            current_stage = self.detect_stage(landmarks)
            logger.info(f"Detected stage: {current_stage}")
            
            # Update the rep counter
            self.rep_counter.update_stage(current_stage)
            logger.info(f"Current rep count: {self.rep_counter.get_count()}")
            
            # Initialize error list
            errors = []
            error_flags = {
                "kneeAngleError": False,
                "kneeOverToeError": False,
                "leftKneeError": False,
                "rightKneeError": False
            }
            
            # Initialize metrics
            metrics = {
                "leftKneeAngle": None,
                "rightKneeAngle": None
            }
            
            # Only analyze form in down position
            if current_stage == "down":
                logger.info("In down position, checking for errors")
                
                # Analyze knee angles
                knee_analysis = analyze_knee_angle(landmarks, current_stage)
                logger.info(f"Knee angles - Left: {knee_analysis['left']['angle']:.1f}°, Right: {knee_analysis['right']['angle']:.1f}°")
                
                # Store knee angles in metrics
                metrics["leftKneeAngle"] = knee_analysis["left"]["angle"]
                metrics["rightKneeAngle"] = knee_analysis["right"]["angle"]
                
                # Check for knee angle errors
                if knee_analysis["error"]:
                    error_flags["kneeAngleError"] = True
                    logger.warning("Knee angle error detected")
                    
                    # Check which knee has the error
                    if knee_analysis["left"]["error"]:
                        error_flags["leftKneeError"] = True
                        errors.append({
                            "type": "knee_angle",
                            "message": "Left knee angle is not in proper range. Aim for 60-125 degrees.",
                            "severity": "high"
                        })
                        logger.warning("Left knee angle error")
                    
                    if knee_analysis["right"]["error"]:
                        error_flags["rightKneeError"] = True
                        errors.append({
                            "type": "knee_angle",
                            "message": "Right knee angle is not in proper range. Aim for 60-125 degrees.",
                            "severity": "high"
                        })
                        logger.warning("Right knee angle error")
                
                # Check for knee over toe error using ML model if available
                knee_over_toe = self.detect_knee_over_toe(landmarks, processed_result)
                metrics["kneeOverToe"] = knee_over_toe
                
                if knee_over_toe:
                    error_flags["kneeOverToeError"] = True
                    errors.append({
                        "type": "knee_over_toe",
                        "message": "Knee is extending beyond toes. Ensure proper alignment.",
                        "severity": "high"
                    })
                    logger.warning("Knee over toe error detected")
            
            # Calculate form score based on errors
            form_score = self.calculate_form_score(errors)
            logger.info(f"Form score: {form_score}")
            
            # Log final analysis summary
            logger.info(f"Analysis complete - Stage: {current_stage}, Score: {form_score}, Errors: {len(errors)}")
            
            # Return the analysis result
            return {
                "success": True,
                "result": {
                    "stage": current_stage,
                    "metrics": metrics,
                    "errors": errors,
                    "errorFlags": error_flags,
                    "formScore": form_score,
                    "repCount": self.rep_counter.get_count()
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing lunge pose: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                "success": False,
                "error": {
                    "type": "ANALYSIS_ERROR",
                    "severity": "error",
                    "message": str(e)
                }
            }
    
    def calculate_form_score(self, errors: List[Dict[str, str]]) -> int:
        """
        Calculate form score based on detected errors
        
        Args:
            errors: List of form errors
            
        Returns:
            Form score (0-100)
        """
        base_score = 100
        
        for error in errors:
            if error["severity"] == "high":
                base_score -= 20
            elif error["severity"] == "medium":
                base_score -= 10
            elif error["severity"] == "low":
                base_score -= 5
        
        return max(0, min(100, base_score))
    
    def reset_counter(self):
        """Reset the repetition counter"""
        logger.info("Resetting rep counter")
        old_count = self.rep_counter.get_count()
        self.rep_counter.reset()
        new_count = self.rep_counter.get_count()
        logger.debug(f"Counter reset from {old_count} to {new_count}")
        
    def reset_rep_counter(self):
        """Reset the repetition counter (alias for compatibility with ExerciseAnalyzerServer)"""
        logger.debug("reset_rep_counter called, redirecting to reset_counter")
        self.reset_counter()

    def detect_knee_over_toe(self, landmarks: List[Dict[str, float]], processed_result=None) -> bool:
        """
        Detect knee over toe error using geometric method primarily
        """
        try:
            logger.info("Using geometric detection for knee over toe error")
            result = _detect_knee_over_toe_geometric(landmarks)
            logger.info(f"Knee over toe error detected: {result}")
            return result
        
        except Exception as e:
            logger.error(f"Error in knee over toe detection: {str(e)}")
            logger.error(traceback.format_exc())
            return False

def analyze_from_json(json_data: str) -> Dict[str, Any]:
    """
    Analyze lunge pose from JSON data
    
    Args:
        json_data: JSON string containing pose landmarks
        
    Returns:
        Analysis results dictionary
    """
    try:
        # Parse JSON data
        data = json.loads(json_data)
        
        # Get landmarks
        if 'landmarks' in data:
            landmarks = data['landmarks']
        else:
            return {
                "success": False,
                "error": {
                    "type": "INVALID_INPUT",
                    "severity": "error",
                    "message": "No landmarks found in input data"
                }
            }
        
        # Create analyzer and analyze pose
        analyzer = LungeAnalyzer()
        result = analyzer.analyze_pose(landmarks)
        
        return result
    except Exception as e:
        logger.error(f"Error analyzing from JSON: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": {
                "type": "ANALYSIS_ERROR",
                "severity": "error",
                "message": str(e)
            }
        }
        
def reset_counter() -> Dict[str, Any]:
    """Reset the lunge counter"""
    try:
        analyzer = LungeAnalyzer()
        analyzer.reset_counter()
        return {"success": True}
    except Exception as e:
        logger.error(f"Error resetting counter: {str(e)}")
        return {
            "success": False,
            "error": {
                "type": "RESET_ERROR",
                "severity": "error",
                "message": str(e)
            }
        }

if __name__ == "__main__":
    # Read JSON data from stdin
    json_data = sys.stdin.read()
    
    # Check if this is a reset request
    if json_data.strip() == "RESET":
        result = reset_counter()
    else:
        result = analyze_from_json(json_data)
    
    # Print the result as JSON
    print(json.dumps(result)) 