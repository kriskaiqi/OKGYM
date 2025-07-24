import sys
import json
import numpy as np
import pandas as pd
import pickle
import math
import logging
import os
import traceback
from pathlib import Path
from typing import List, Dict, Any, Tuple, Literal, Optional
import time
import cv2
import mediapipe as mp

# Configure logging
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('BicepAnalyzer')

# MediaPipe initialization
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose
mp_drawing_styles = mp.solutions.drawing_styles

# Error types matching TypeScript interface
ERROR_TYPES = Literal[
    'INVALID_INPUT',
    'INVALID_LANDMARK',
    'METRICS_CALCULATION_ERROR',
    'ANALYSIS_ERROR',
    'loose_upper_arm',
    'peak_contraction',
    'lean_back',
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

# Utility functions
def calculate_angle(point1: list, point2: list, point3: list) -> float:
    '''
    Calculate the angle between 3 points
    Unit of the angle will be in Degree
    '''
    point1 = np.array(point1)
    point2 = np.array(point2)
    point3 = np.array(point3)

    # Calculate angle
    angleInRad = np.arctan2(point3[1] - point2[1], point3[0] - point2[0]) - np.arctan2(point1[1] - point2[1], point1[0] - point2[0])
    angleInDeg = np.abs(angleInRad * 180.0 / np.pi)

    angleInDeg = angleInDeg if angleInDeg <= 180 else 360 - angleInDeg
    return angleInDeg

def calculate_distance(point1: list, point2: list) -> float:
    '''
    Calculate the distance between 2 points
    '''
    point1 = np.array(point1)
    point2 = np.array(point2)
    
    # Calculate Euclidean distance
    return np.sqrt(np.sum((point1 - point2) ** 2))

def extract_important_keypoints(results, important_landmarks: list) -> list:
    '''
    Extract important keypoints from mediapipe pose detection
    Exactly matching implementation in 5.detection.ipynb
    '''
    try:
        landmarks = results.pose_landmarks.landmark
        
        data = []
        for lm in important_landmarks:
            keypoint = landmarks[mp_pose.PoseLandmark[lm].value]
            data.append([keypoint.x, keypoint.y, keypoint.z, keypoint.visibility])
        
        return np.array(data).flatten().tolist()
    except Exception as e:
        logger.error(f"Error extracting keypoints: {str(e)}")
        logger.error(traceback.format_exc())
        return []

def get_static_file_url(path: str) -> str:
    """Get path to static files using absolute path as specified in logs"""
    # Use absolute path as specified
    base_path = r"C:\Users\DELL\Desktop\OKGYM\core\bicep_model\model"
    model_path = Path(base_path) / Path(path).name
    
    # Check if file exists
    if model_path.exists():
        logger.warning(f"BICEP_DEBUG: Found file at: {str(model_path)}")
    else:
        logger.warning(f"BICEP_DEBUG: File not found at: {str(model_path)}")
        
    return str(model_path)

class BicepPoseAnalysis:
    def __init__(self, side, stage_down_threshold, stage_up_threshold, peak_contraction_threshold, loose_upper_arm_angle_threshold, visibility_threshold):
        # Initialize thresholds
        self.stage_down_threshold = stage_down_threshold
        self.stage_up_threshold = stage_up_threshold
        self.peak_contraction_threshold = peak_contraction_threshold
        self.loose_upper_arm_angle_threshold = loose_upper_arm_angle_threshold
        self.visibility_threshold = visibility_threshold

        # Side identification
        self.side = side
        
        # State tracking
        self.counter = 0
        self.stage = "down"
        self.is_visible = True
        
        # Error tracking
        self.detected_errors = {
            "LOOSE_UPPER_ARM": 0,
            "PEAK_CONTRACTION": 0
        }
        
        # Params for loose upper arm error detection
        self.loose_upper_arm = False
        
        # Params for peak contraction error detection
        self.peak_contraction_angle = 1000
        
    def reset(self):
        """Reset counters and error tracking"""
        self.counter = 0
        self.stage = "down"
        self.is_visible = True
        self.peak_contraction_angle = 1000
        self.loose_upper_arm = False
        self.detected_errors = {
            "PEAK_CONTRACTION": 0,
            "LOOSE_UPPER_ARM": 0
        }
        
    def get_counter(self) -> int:
        """Return the current repetition count"""
        return self.counter
        
    def get_joints(self, landmarks) -> bool:
        """
        Check for joints' visibility then get joints coordinate
        """
        side = self.side.upper()
        
        # Define indices for required landmarks based on MediaPipe pose landmarks
        shoulder_idx = mp_pose.PoseLandmark[f"{side}_SHOULDER"].value
        elbow_idx = mp_pose.PoseLandmark[f"{side}_ELBOW"].value
        wrist_idx = mp_pose.PoseLandmark[f"{side}_WRIST"].value
        
        # Ensure landmarks list has sufficient length
        if len(landmarks) <= max(shoulder_idx, elbow_idx, wrist_idx):
            self.is_visible = False
            return self.is_visible
        
        # Check visibility
        joints_visibility = [
            landmarks[shoulder_idx]['visibility'],
            landmarks[elbow_idx]['visibility'],
            landmarks[wrist_idx]['visibility'],
        ]

        is_visible = all([vis > self.visibility_threshold for vis in joints_visibility])
        self.is_visible = is_visible

        if not is_visible:
            return self.is_visible

        # Get joints' coordinates
        self.shoulder = [
            landmarks[shoulder_idx]['x'],
            landmarks[shoulder_idx]['y'],
        ]
        self.elbow = [
            landmarks[elbow_idx]['x'],
            landmarks[elbow_idx]['y'],
        ]
        self.wrist = [
            landmarks[wrist_idx]['x'],
            landmarks[wrist_idx]['y'],
        ]

        return self.is_visible
            
    def analyze_pose(self, landmarks, lean_back_error=False):
        """
        Analyze the arm pose and detect errors
        Returns: (curl_angle, upper_arm_angle, is_visible, errors)
        """
        curl_angle = None
        upper_arm_angle = None
        errors = []
        has_error = False
        
        self.get_joints(landmarks)
        
        # Cancel calculation if visibility is poor
        if not self.is_visible:
            return curl_angle, upper_arm_angle, self.is_visible, errors
            
        # * Calculate curl angle for counter
        bicep_curl_angle = int(calculate_angle(self.shoulder, self.elbow, self.wrist))
        if bicep_curl_angle > self.stage_down_threshold:
            self.stage = "down"
        elif bicep_curl_angle < self.stage_up_threshold and self.stage == "down":
            self.stage = "up"
            self.counter += 1

        # * Calculate the angle between the upper arm (shoulder & joint) and the Y axis
        shoulder_projection = [
            self.shoulder[0],
            1,
        ]  # Represent the projection of the shoulder to the X axis
        ground_upper_arm_angle = int(
            calculate_angle(self.elbow, self.shoulder, shoulder_projection)
        )
        
        # Stop further analysis if lean back error occurred
        if lean_back_error:
            return bicep_curl_angle, ground_upper_arm_angle, self.is_visible, errors
            
        # * Evaluation for LOOSE UPPER ARM error
        if ground_upper_arm_angle > self.loose_upper_arm_angle_threshold:
            has_error = True
            
            # Limit the saved frame
            if not self.loose_upper_arm:
                self.loose_upper_arm = True
                self.detected_errors["LOOSE_UPPER_ARM"] += 1
                errors.append({
                    "type": "loose_upper_arm",
                    "severity": "medium",
                    "message": f"Arm is not kept close to body ({ground_upper_arm_angle}°)"
                })
        else:
            self.loose_upper_arm = False
            
        # * Evaluate PEAK CONTRACTION error
        if self.stage == "up" and bicep_curl_angle < self.peak_contraction_angle:
            # Save peaked contraction every rep
            self.peak_contraction_angle = bicep_curl_angle
            
        elif self.stage == "down":
            # * Evaluate if the peak is higher than the threshold if True, marked as an error
            if (self.peak_contraction_angle != 1000 and 
                self.peak_contraction_angle >= self.peak_contraction_threshold):
                
                self.detected_errors["PEAK_CONTRACTION"] += 1
                errors.append({
                    "type": "peak_contraction",
                    "severity": "medium",
                    "message": f"Insufficient curl range of motion ({self.peak_contraction_angle}°)"
                })
                has_error = True
            
            # Reset params
            self.peak_contraction_angle = 1000
            
        return bicep_curl_angle, ground_upper_arm_angle, self.is_visible, errors

class BicepAnalyzer:
    def __init__(self):
        try:
            # Initialize MediaPipe
            self._mp_pose = mp_pose
            
            # Set thresholds (match the provided code)
            self.visibility_threshold = 0.65
            
            # Params for counter
            self.stage_up_threshold = 100  # Changed from 90 to 100
            self.stage_down_threshold = 120
            
            # Params to catch FULL RANGE OF MOTION error
            self.peak_contraction_threshold = 60
            
            # LOOSE UPPER ARM error detection
            self.loose_upper_arm_angle_threshold = 40
            
            # STANDING POSTURE error detection
            self.posture_error_threshold = 0.95
            
            # Setup important landmarks for ML model
            self.init_important_landmarks()
            
            # Flag to track if we've already tried to load the model
            self.model_loading_attempted = False
            
            # Set up model placeholders but don't load yet - lazy loading will happen when/if needed
            self.model = None
            self.input_scaler = None
            self.use_ml_for_lean_back = False
            
            # Create analyzers for left and right arms
            self.left_analyzer = BicepPoseAnalysis(
                side="left",
                stage_down_threshold=self.stage_down_threshold,
                stage_up_threshold=self.stage_up_threshold,
                peak_contraction_threshold=self.peak_contraction_threshold,
                loose_upper_arm_angle_threshold=self.loose_upper_arm_angle_threshold,
                visibility_threshold=self.visibility_threshold
            )
            
            self.right_analyzer = BicepPoseAnalysis(
                side="right",
                stage_down_threshold=self.stage_down_threshold,
                stage_up_threshold=self.stage_up_threshold,
                peak_contraction_threshold=self.peak_contraction_threshold,
                loose_upper_arm_angle_threshold=self.loose_upper_arm_angle_threshold,
                visibility_threshold=self.visibility_threshold
            )
            
            # Lean back tracking
            self.stand_posture = "C"
            self.previous_stand_posture = "C"
            
            logger.info("BicepAnalyzer initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing BicepAnalyzer: {e}")
            logger.error(traceback.format_exc())
            raise

    def init_important_landmarks(self) -> None:
        """
        Determine Important landmarks for bicep curl detection
        """
        self.important_landmarks = [
            "NOSE",
            "LEFT_SHOULDER",
            "RIGHT_SHOULDER",
            "RIGHT_ELBOW",
            "LEFT_ELBOW",
            "RIGHT_WRIST",
            "LEFT_WRIST",
            "LEFT_HIP",
            "RIGHT_HIP",
        ]

        # Generate all columns of the data frame
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
        Load machine learning model for lean back detection exactly as in notebook (5.detection.ipynb)
        Only load once if needed as a fallback
        """
        # Don't attempt to load more than once
        if self.model_loading_attempted:
            return

        self.model_loading_attempted = True

        try:
            # Set default - assume we can't use ML for lean back detection
            self.model = None
            self.input_scaler = None
            self.use_ml_for_lean_back = False
            
            # Paths for model and scaler - exact match to notebook paths
            logger.warning("BICEP_DEBUG: Attempting to load ML model for lean back detection")
            ml_model_path = get_static_file_url("KNN_model.pkl")
            input_scaler_path = get_static_file_url("input_scaler.pkl")
            
            logger.warning(f"BICEP_DEBUG: Model path: {ml_model_path}")
            logger.warning(f"BICEP_DEBUG: Scaler path: {input_scaler_path}")
            
            # Check if files exist
            model_file = Path(ml_model_path)
            scaler_file = Path(input_scaler_path)
            
            if not model_file.exists():
                logger.warning(f"BICEP_DEBUG: ML model file not found at {model_file}.")
                return
            
            if not scaler_file.exists():
                logger.warning(f"BICEP_DEBUG: Input scaler not found at {scaler_file}.")
                return
                
            # Import required libraries
            try:
                global pd, np
                import pandas as pd
                import numpy as np
                logger.warning("BICEP_DEBUG: Successfully imported pandas and numpy")
            except ImportError as imp_err:
                logger.error(f"BICEP_DEBUG: Error importing required libraries: {imp_err}")
                return
                
            # Load the model - exactly like the notebook (cell #7)
            try:
                logger.warning("BICEP_DEBUG: Loading KNN model file")
                with open(model_file, "rb") as f:
                    knn_model = pickle.load(f)
                    logger.warning(f"BICEP_DEBUG: KNN model loaded successfully: {type(knn_model)}")
    
                logger.warning("BICEP_DEBUG: Loading input scaler file")
                with open(scaler_file, "rb") as f2:
                    input_scaler = pickle.load(f2)
                    logger.warning(f"BICEP_DEBUG: Input scaler loaded successfully: {type(input_scaler)}")
                
                # Create direct references to the model and scaler
                self.model = knn_model
                self.input_scaler = input_scaler
                
                # Log model classes to verify it's correctly set up
                logger.warning(f"BICEP_DEBUG: Model classes: {knn_model.classes_}")
                
                self.use_ml_for_lean_back = True
                logger.warning("BICEP_DEBUG: Successfully loaded ML model for lean back detection")
                    
            except Exception as load_err:
                logger.error(f"BICEP_DEBUG: Error loading ML model: {load_err}")
                logger.error(traceback.format_exc())
                self.model = None
                self.input_scaler = None
                self.use_ml_for_lean_back = False
                
        except Exception as e:
            logger.error(f"BICEP_DEBUG: Error in load_machine_learning_model: {e}")
            logger.error(traceback.format_exc())
            self.model = None
            self.input_scaler = None
            self.use_ml_for_lean_back = False
    
    def _validate_feature_extraction_and_prediction(self):
        """
        Simple validation of model loading - minimized to avoid confusion
        """
        try:
            # Just log that model is loaded
            logger.warning("BICEP_DEBUG: Model and scaler loaded successfully")
            
            # Log model classes for reference
            if hasattr(self.model, 'classes_'):
                logger.warning(f"BICEP_DEBUG: Model classes: {self.model.classes_}")
                
        except Exception as e:
            logger.error(f"BICEP_DEBUG: Error in model validation: {e}")
            logger.error(traceback.format_exc())
            
    def reset_rep_counter(self) -> None:
        """Reset repetition counters for both arms"""
        logger.warning("RESET_DEBUG: Resetting rep counter in BicepAnalyzer")
        old_left_count = self.left_analyzer.get_counter()
        old_right_count = self.right_analyzer.get_counter()
        
        self.left_analyzer.reset()
        self.right_analyzer.reset()
        
        # Reset lean back tracking
        self.stand_posture = "C"
        self.previous_stand_posture = "C"
        
        new_left_count = self.left_analyzer.get_counter()
        new_right_count = self.right_analyzer.get_counter()
        
        logger.warning(f"RESET_DEBUG: Left arm counter reset from {old_left_count} to {new_left_count}")
        logger.warning(f"RESET_DEBUG: Right arm counter reset from {old_right_count} to {new_right_count}")
    
    def detect_lean_back_geometric(self, landmarks: List[Dict[str, float]]) -> bool:
        """
        Improved method to detect if the user is leaning back during bicep curls.
        Checks if shoulder, hip, and ankle form a straight line.
        
        Args:
            landmarks: List of landmark dictionaries
            
        Returns:
            Boolean indicating if lean back is detected
        """
        try:
            # Get landmark indices
            left_shoulder_idx = self._mp_pose.PoseLandmark.LEFT_SHOULDER.value
            right_shoulder_idx = self._mp_pose.PoseLandmark.RIGHT_SHOULDER.value
            left_hip_idx = self._mp_pose.PoseLandmark.LEFT_HIP.value
            right_hip_idx = self._mp_pose.PoseLandmark.RIGHT_HIP.value
            left_ankle_idx = self._mp_pose.PoseLandmark.LEFT_ANKLE.value
            right_ankle_idx = self._mp_pose.PoseLandmark.RIGHT_ANKLE.value
            
            # Early return if landmarks are missing or low visibility
            required_indices = [
                left_shoulder_idx, right_shoulder_idx,
                left_hip_idx, right_hip_idx,
                left_ankle_idx, right_ankle_idx
            ]
            
            if len(landmarks) <= max(required_indices):
                return False
            
            # Check visibility of required landmarks
            threshold = 0.5
            if (landmarks[left_shoulder_idx]['visibility'] < threshold or
                landmarks[right_shoulder_idx]['visibility'] < threshold or
                landmarks[left_hip_idx]['visibility'] < threshold or
                landmarks[right_hip_idx]['visibility'] < threshold or
                landmarks[left_ankle_idx]['visibility'] < threshold or
                landmarks[right_ankle_idx]['visibility'] < threshold):
                logger.warning("BICEP_GEO: Low visibility for required landmarks")
                return False
            
            # Calculate midpoints to use average body line
            shoulder_midpoint = [
                (landmarks[left_shoulder_idx]['x'] + landmarks[right_shoulder_idx]['x']) / 2,
                (landmarks[left_shoulder_idx]['y'] + landmarks[right_shoulder_idx]['y']) / 2
            ]
            
            hip_midpoint = [
                (landmarks[left_hip_idx]['x'] + landmarks[right_hip_idx]['x']) / 2, 
                (landmarks[left_hip_idx]['y'] + landmarks[right_hip_idx]['y']) / 2
            ]
            
            ankle_midpoint = [
                (landmarks[left_ankle_idx]['x'] + landmarks[right_ankle_idx]['x']) / 2,
                (landmarks[left_ankle_idx]['y'] + landmarks[right_ankle_idx]['y']) / 2
            ]
            
            # Calculate the angle between hip-to-shoulder and hip-to-ankle
            alignment_angle = calculate_angle(shoulder_midpoint, hip_midpoint, ankle_midpoint)
            
            # The alignment_angle indicates how straight the body is:
            # - 180 degrees = perfect straight line (ideal posture)
            # - <165 degrees = shoulders are behind the line from hip to ankle (leaning back)
            # - >180 degrees = shoulders are in front of the line (leaning forward)
            angle_threshold = 165  # Anything less than this indicates leaning back
            
            is_leaning_back = alignment_angle < angle_threshold
            
            # Log the detection for debugging
            if is_leaning_back:
                logger.warning(f"BICEP_GEO: Lean back detected! Alignment angle: {alignment_angle:.2f}° (threshold: {angle_threshold}°)")
            else:
                logger.debug(f"BICEP_GEO: Good posture. Alignment angle: {alignment_angle:.2f}° (threshold: {angle_threshold}°)")
            
            return is_leaning_back
            
        except Exception as e:
            logger.error(f"BICEP_GEO: Error in geometric lean back detection: {e}")
            logger.error(traceback.format_exc())
            return False

    def detect_lean_back(self, landmarks: List[Dict[str, float]], results=None, use_geometric=True) -> bool:
        """
        Detect if the user is leaning back during the exercise.
        Uses geometric approach by default, with ML as fallback.
        
        Args:
            landmarks: List of landmark dictionaries
            results: MediaPipe results object (needed for ML approach)
            use_geometric: Whether to use geometric approach (True) or ML approach (False)
            
        Returns:
            Boolean indicating if lean back is detected
        """
        # Try geometric approach first
        try:
            is_leaning_back = self.detect_lean_back_geometric(landmarks)
            if is_leaning_back:
                return True
        except Exception as e:
            logger.warning(f"BICEP_DEBUG: Geometric lean back detection failed: {e}, trying ML fallback")
            # Continue to ML fallback if geometric approach fails
        
        # If geometric approach didn't detect leaning back or failed, try ML as fallback
        # Only if we have the required result object
        if results is not None:
            try:
                # Lazy load ML model if needed and not loaded yet
                if not self.model_loading_attempted:
                    logger.warning("BICEP_DEBUG: Lazy loading ML model as fallback")
                    self.load_machine_learning_model()
                
                # Check if ML model is available after loading attempt
                if self.use_ml_for_lean_back:
                    return self._detect_lean_back_ml(landmarks, results)
            except Exception as ml_err:
                logger.error(f"BICEP_DEBUG: ML fallback lean back detection failed: {ml_err}")
        
        # Return False if both approaches failed or ML model is not available
        return False

    def _detect_lean_back_ml(self, landmarks: List[Dict[str, float]], results) -> bool:
        """
        Original ML-based lean back detection method (renamed from detect_lean_back)
        """
        logger.warning("BICEP_DEBUG: Starting lean back detection (ML-only)")
        
        # If model wasn't loaded successfully during initialization, we can't detect lean back
        if not hasattr(self, 'model') or self.model is None or not self.use_ml_for_lean_back:
            # Don't try to load the model here - it should have been loaded during initialization
            logger.warning("BICEP_DEBUG: ML model not available for lean back detection")
            return False
            
        try:
            # Extract keypoints exactly like in the notebook 
            logger.warning("BICEP_DEBUG: Extracting keypoints for ML detection")
            
            # Use MediaPipe format results
            mediapipe_results = results
            
            # Extract keypoints exactly as done in notebook
            keypoints = extract_important_keypoints(mediapipe_results, self.important_landmarks)
            logger.warning(f"BICEP_DEBUG: Extracted {len(keypoints)} keypoints")
            
            # Create DataFrame exactly as in notebook (column names matching self.headers[1:])
            X = pd.DataFrame([keypoints], columns=self.headers[1:])
            logger.warning(f"BICEP_DEBUG: Created DataFrame with columns: {list(X.columns)[:5]}...")
            
            # Transform with scaler - exactly as in notebook
            X = pd.DataFrame(self.input_scaler.transform(X))
            logger.warning(f"BICEP_DEBUG: Scaled features shape: {X.shape}")
            
            # Get prediction using exact same approach as notebook
            predicted_class = self.model.predict(X)[0]
            prediction_probabilities = self.model.predict_proba(X)[0]
            
            # Log raw outputs for debugging
            logger.warning(f"BICEP_DEBUG: Raw prediction: {predicted_class}")
            logger.warning(f"BICEP_DEBUG: Raw probabilities: {prediction_probabilities}")
            
            # Use higher threshold (0.95) like in the working implementation
            posture_threshold = 0.95
            
            # Get probability of the predicted class
            class_prediction_probability = prediction_probabilities[np.argmax(prediction_probabilities)]
            
            # Instead of defaulting to "C", only set the posture if confidence is high enough
            previous_stand_posture = self.stand_posture
            
            if class_prediction_probability >= posture_threshold:
                self.stand_posture = predicted_class
            
            # Determine lean back probability - index 1 is for class "L" (leaning back)
            lean_back_probability = prediction_probabilities[1] if len(prediction_probabilities) > 1 else 0
            
            # Log in exactly the same format as notebook display
            logger.warning(f"BICEP_DEBUG: ML lean back result: {predicted_class}, {self.stand_posture}, {lean_back_probability:.1f}")
            
            # Check specifically for "L" classification as in working implementation
            is_leaning_back = (self.stand_posture == "L")
            
            # Update state for next frame
            self.previous_stand_posture = previous_stand_posture
            
            return is_leaning_back
            
        except Exception as e:
            logger.error(f"BICEP_DEBUG: Error in ML lean back detection: {e}")
            logger.error(traceback.format_exc())
            return False
            
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
            # Make sure model was loaded during initialization (don't attempt to reload)
            if not self.model_loading_attempted:
                logger.warning("BICEP_DEBUG: Model loading was never attempted - this should not happen")
                # Set the flag to true but don't load the model here to avoid delays
                self.model_loading_attempted = True
            
            logger.info("BICEP_DEBUG: Starting pose analysis")
            
            if not landmarks or not isinstance(landmarks, list):
                logger.error("BICEP_DEBUG: No pose landmarks provided in input data")
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
                    logger.error("BICEP_DEBUG: Invalid landmark structure in input data")
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
            logger.info(f"BICEP_DEBUG: Received {len(raw_landmarks)} landmarks")
            
            # Default values in case of errors
            stage = "down"
            left_curl_angle = None
            right_curl_angle = None
            left_upper_arm_angle = None
            right_upper_arm_angle = None
            left_arm_visible = False
            right_arm_visible = False
            shoulder_width = None
            left_errors = []
            right_errors = []
            all_errors = []
            lean_back_error = False
            
            # Create a MediaPipe-compatible results object
            logger.info("BICEP_DEBUG: Creating MediaPipe-compatible results object")
            try:
                # Create a compatible structure that matches what MediaPipe would provide
                landmark_objects = []
                for lm in raw_landmarks:
                    # Create an object with attributes x, y, z, visibility 
                    landmark_obj = type('obj', (object,), {
                        'x': lm['x'], 
                        'y': lm['y'], 
                        'z': lm['z'], 
                        'visibility': lm['visibility']
                    })
                    landmark_objects.append(landmark_obj)
                
                # Create a complete pose_landmarks object with the landmark attribute
                pose_landmarks = type('obj', (object,), {'landmark': landmark_objects})
                processed_result = type('obj', (object,), {'pose_landmarks': pose_landmarks})
                
                logger.info(f"BICEP_DEBUG: Successfully created MediaPipe-compatible result object with {len(landmark_objects)} landmarks")
            except Exception as e:
                logger.error(f"BICEP_DEBUG: Error creating MediaPipe-compatible result: {e}")
                logger.error(traceback.format_exc())
                processed_result = None
                return {
                    'success': False,
                    'error': {
                        'type': 'METRICS_CALCULATION_ERROR',
                        'severity': 'error', 
                        'message': f'Error creating MediaPipe result: {str(e)}'
                    }
                }
            
            # Detect lean back using geometric method by default
            logger.info("BICEP_DEBUG: Detecting lean back")
            try:
                # Use geometric detection by default (set to True)
                lean_back_error = self.detect_lean_back(raw_landmarks, processed_result, use_geometric=True)
                logger.info(f"BICEP_DEBUG: Lean back detection result: {lean_back_error}")
                
                if lean_back_error:
                    all_errors.append({
                        'type': 'lean_back',
                        'severity': 'high',
                        'message': 'Leaning back during exercise'
                    })
            except Exception as e:
                logger.error(f"BICEP_DEBUG: Error in lean back detection: {e}")
                logger.error(traceback.format_exc())
                all_errors.append({
                    'type': 'ANALYSIS_ERROR',
                    'severity': 'error',
                    'message': f'Lean back detection failed: {str(e)}'
                })
            
            # Analyze left and right arms
            logger.info("BICEP_DEBUG: Analyzing left arm")
            try:
                left_curl_angle, left_upper_arm_angle, left_arm_visible, left_errors = self.left_analyzer.analyze_pose(
                    raw_landmarks, lean_back_error
                )
                logger.info(f"BICEP_DEBUG: Left arm analysis complete. Curl angle: {left_curl_angle}, Visible: {left_arm_visible}")
                all_errors.extend(left_errors)
            except Exception as left_err:
                logger.error(f"BICEP_DEBUG: Error in left arm analysis: {left_err}")
                logger.error(traceback.format_exc())
                left_curl_angle, left_upper_arm_angle, left_arm_visible, left_errors = None, None, False, []
            
            logger.info("BICEP_DEBUG: Analyzing right arm")
            try:
                right_curl_angle, right_upper_arm_angle, right_arm_visible, right_errors = self.right_analyzer.analyze_pose(
                    raw_landmarks, lean_back_error
                )
                logger.info(f"BICEP_DEBUG: Right arm analysis complete. Curl angle: {right_curl_angle}, Visible: {right_arm_visible}")
                all_errors.extend(right_errors)
            except Exception as right_err:
                logger.error(f"BICEP_DEBUG: Error in right arm analysis: {right_err}")
                logger.error(traceback.format_exc())
                right_curl_angle, right_upper_arm_angle, right_arm_visible, right_errors = None, None, False, []
            
            # Calculate shoulder width if both shoulders are visible
            logger.info("BICEP_DEBUG: Calculating shoulder width")
            try:
                left_shoulder = raw_landmarks[self._mp_pose.PoseLandmark.LEFT_SHOULDER.value]
                right_shoulder = raw_landmarks[self._mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
                
                if (left_shoulder['visibility'] > self.visibility_threshold and 
                    right_shoulder['visibility'] > self.visibility_threshold):
                    shoulder_width = calculate_distance(
                        [left_shoulder['x'], left_shoulder['y']],
                        [right_shoulder['x'], right_shoulder['y']]
                    )
                    logger.info(f"BICEP_DEBUG: Shoulder width calculated: {shoulder_width}")
                else:
                    logger.info("BICEP_DEBUG: Shoulders not visible enough for width calculation")
            except Exception as sw_err:
                logger.error(f"BICEP_DEBUG: Error calculating shoulder width: {sw_err}")
                logger.error(traceback.format_exc())
            
            # Determine overall stage based on the arms
            try:
                if self.left_analyzer.stage == "up" or self.right_analyzer.stage == "up":
                    stage = "up"
                elif self.left_analyzer.stage == "down" and self.right_analyzer.stage == "down":
                    stage = "down"
                else:
                    stage = "middle"
                logger.info(f"BICEP_DEBUG: Current stage: {stage}")
            except Exception as stage_err:
                logger.error(f"BICEP_DEBUG: Error determining stage: {stage_err}")
                stage = "down"  # Default to down stage
            
            # Calculate form score
            form_score = 100
            try:
                form_score = self.calculate_form_score(all_errors)
                logger.info(f"BICEP_DEBUG: Form score: {form_score}")
            except Exception as score_err:
                logger.error(f"BICEP_DEBUG: Error calculating form score: {score_err}")
            
            # Sum reps from both arms (or choose the higher one)
            rep_count = 0
            try:
                rep_count = max(self.left_analyzer.get_counter(), self.right_analyzer.get_counter())
                logger.info(f"BICEP_DEBUG: Repetition count: {rep_count}")
            except Exception as rep_err:
                logger.error(f"BICEP_DEBUG: Error getting rep count: {rep_err}")
            
            # Compile metrics
            metrics = {
                "leftCurlAngle": left_curl_angle,
                "rightCurlAngle": right_curl_angle,
                "leftUpperArmAngle": left_upper_arm_angle,
                "rightUpperArmAngle": right_upper_arm_angle,
                "leftArmVisible": left_arm_visible,
                "rightArmVisible": right_arm_visible,
                "shoulderWidth": shoulder_width,
                "hipAngle": None,
                "reps": {
                    "left": self.left_analyzer.get_counter() if left_arm_visible else 0,
                    "right": self.right_analyzer.get_counter() if right_arm_visible else 0
                }
            }
            
            logger.info("BICEP_DEBUG: Analysis complete, returning results")
            # Return complete analysis result
            return {
                'success': True,
                'result': {
                    'stage': stage,
                    'metrics': metrics,
                    'errors': all_errors,
                    'formScore': form_score,
                    'repCount': rep_count
                }
            }
            
        except Exception as e:
            logger.error(f"BICEP_DEBUG: Error analyzing pose: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'success': False,
                'error': {
                    'type': 'ANALYSIS_ERROR',
                    'severity': 'error',
                    'message': str(e)
                }
            }

def main():
    """
    Test the bicep curl detection
    """
    try:
        analyzer = BicepAnalyzer()
        # Test initialize
        print("BicepAnalyzer initialized successfully")
        
        # Test reset counter
        analyzer.reset_rep_counter()
        print("Reset counter successful")
        
        print("Test complete")
        
    except Exception as e:
        print(f"Error in test: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main() 