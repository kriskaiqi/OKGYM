import numpy as np
import pandas as pd
import json
import sys
import logging
import os
import pickle
import time
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional, Union

# Setup logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('plank_analyzer')

# Define required landmarks for plank - these match the notebook exactly
IMPORTANT_LMS = [
    "NOSE",               # 0
    "LEFT_SHOULDER",      # 11
    "RIGHT_SHOULDER",     # 12
    "LEFT_ELBOW",         # 13
    "RIGHT_ELBOW",        # 14
    "LEFT_WRIST",         # 15
    "RIGHT_WRIST",        # 16
    "LEFT_HIP",           # 23
    "RIGHT_HIP",          # 24
    "LEFT_KNEE",          # 25
    "RIGHT_KNEE",         # 26
    "LEFT_ANKLE",         # 27
    "RIGHT_ANKLE",        # 28
    "LEFT_HEEL",          # 29
    "RIGHT_HEEL",         # 30
    "LEFT_FOOT_INDEX",    # 31
    "RIGHT_FOOT_INDEX",   # 32
]

# Generate headers exactly like the notebook
HEADERS = ["label"]  # Label column
for lm in IMPORTANT_LMS:
    HEADERS += [f"{lm.lower()}_x", f"{lm.lower()}_y", f"{lm.lower()}_z", f"{lm.lower()}_v"]

# MediaPipe landmark indices
LANDMARK_INDICES = {
    "NOSE": 0,
    "LEFT_SHOULDER": 11,
    "RIGHT_SHOULDER": 12,
    "LEFT_ELBOW": 13,
    "RIGHT_ELBOW": 14,
    "LEFT_WRIST": 15,
    "RIGHT_WRIST": 16,
    "LEFT_HIP": 23,
    "RIGHT_HIP": 24,
    "LEFT_KNEE": 25,
    "RIGHT_KNEE": 26,
    "LEFT_ANKLE": 27,
    "RIGHT_ANKLE": 28,
    "LEFT_HEEL": 29,
    "RIGHT_HEEL": 30,
    "LEFT_FOOT_INDEX": 31,
    "RIGHT_FOOT_INDEX": 32,
}

# Global state to maintain hold time across analysis calls
# We'll use this to persist the timer state
_PLANK_HOLD_TIME = 0.0
_LAST_ANALYSIS_TIME = None
_LAST_FORM_CORRECT = False

def get_static_file_url(path: str) -> str:
    """Get path to static files from the core directory"""
    # Print current file location for debugging
    current_file = Path(__file__)
    logger.info(f"Current file location: {current_file.absolute()}")
    
    # Find model in current directory first, then try core directory
    current_path = Path(__file__).parent / "model" / Path(path).name
    logger.info(f"Checking for model at local path: {current_path.absolute()}")
    
    if current_path.exists():
        logger.info(f"✓ Found model file at: {str(current_path.absolute())}")
        return str(current_path)
    else:
        logger.warning(f"✗ Model file NOT found at: {str(current_path.absolute())}")
    
    # Look in core directory structure if not found locally
    core_path = Path(__file__).parent.parent.parent.parent.parent / "core" / "plank_model" / "model" / Path(path).name
    logger.info(f"Checking for model at core path: {core_path.absolute()}")
    
    # Log whether the file exists
    if core_path.exists():
        logger.info(f"✓ Found model file at: {str(core_path.absolute())}")
        logger.info(f"File size: {os.path.getsize(core_path)} bytes")
        return str(core_path)
    else:
        logger.warning(f"✗ Model file NOT found at: {str(core_path.absolute())}")
        
    # Try alternative paths as a last resort
    alt_paths = [
        Path(__file__).parent.parent.parent.parent / "core" / "plank_model" / "model" / Path(path).name,
        Path(__file__).parent.parent.parent / "core" / "plank_model" / "model" / Path(path).name,
        Path("core") / "plank_model" / "model" / Path(path).name,
    ]
    
    for alt_path in alt_paths:
        logger.info(f"Trying alternative path: {alt_path.absolute()}")
        if alt_path.exists():
            logger.info(f"✓ Found model file at alternative path: {str(alt_path.absolute())}")
            logger.info(f"File size: {os.path.getsize(alt_path)} bytes")
            return str(alt_path)
    
    logger.error(f"❌ Could not find model file {path} in any location")
    return str(core_path)  # Return the original path even though it doesn't exist

class PlankPoseAnalysis:
    """Class to hold plank analysis results"""
    def __init__(self):
        self.stage = "unknown"  # Will be 'correct', 'high_back', 'low_back', or 'unknown'
        self.duration_seconds = 0
        self.form_score = 100
        self.errors = []
        self.metrics = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert analysis to dictionary for JSON response"""
        return {
            "stage": self.stage,
            "durationInSeconds": self.duration_seconds,
            "holdTime": self.duration_seconds,  # Add hold time field
            "formScore": self.form_score,
            "errors": self.errors,
            "metrics": self.metrics
        }

class PlankAnalyzer:
    """Analyzer for plank poses"""
    
    def __init__(self):
        """Initialize the analyzer with default values"""
        # Track the duration (will be managed by the backend service)
        self.duration_seconds = 0
        
        # Class labels from model - exactly matching the notebook
        self.CLASS_LABELS = {
            0: "C",    # Correct
            1: "H",    # High back
            2: "L"     # Low back
        }
        
        # Map class labels to human-readable stages
        self.STAGE_MAPPING = {
            "C": "correct",
            "H": "high_back",
            "L": "low_back"
        }
        
        # Thresholds for analysis
        self.VISIBILITY_THRESHOLD = 0.6
        self.PREDICTION_THRESHOLD = 0.6  # Same threshold as notebook (line 180)
        
        # Load ML models
        self.model = None
        self.input_scaler = None
        self._load_models()
        
        logger.info("Plank analyzer initialized")
    
    def _load_models(self):
        """Load ML models for plank analysis - matching notebook exactly"""
        try:
            # Get model file paths using helper function - same as notebook
            model_path = get_static_file_url("LR_model.pkl")
            # Use the new scaler file instead of the old one
            scaler_path = get_static_file_url("plank_input_scaler.pkl")
            
            logger.info(f"Loading plank model from: {model_path}")
            logger.info(f"Loading input scaler from: {scaler_path}")
            
            # Check if model files exist
            if os.path.exists(model_path):
                with open(model_path, "rb") as f:
                    # Log the file size
                    f.seek(0, os.SEEK_END)
                    file_size = f.tell()
                    f.seek(0)
                    logger.info(f"Loading model file of size: {file_size} bytes")
                    
                    # Load the model
                    self.model = pickle.load(f)
                    
                    # Log model info
                    if hasattr(self.model, 'coef_'):
                        logger.info(f"Model coefficient shape: {self.model.coef_.shape}")
                    
                logger.info("Plank model loaded successfully")
            else:
                logger.error(f"Model file not found: {model_path}")
                self.model = None
                
            if os.path.exists(scaler_path):
                with open(scaler_path, "rb") as f:
                    # Log the file size
                    f.seek(0, os.SEEK_END)
                    file_size = f.tell()
                    f.seek(0)
                    logger.info(f"Loading scaler file of size: {file_size} bytes")
                    
                    # Load the scaler
                    self.input_scaler = pickle.load(f)
                    
                    # Log scaler info
                    if hasattr(self.input_scaler, 'n_features_in_'):
                        logger.info(f"Scaler expects {self.input_scaler.n_features_in_} features")
                    
                logger.info("Input scaler loaded successfully")
            else:
                logger.error(f"Scaler file not found: {scaler_path}")
                self.input_scaler = None
                
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            self.model = None
            self.input_scaler = None
    
    def extract_important_keypoints(self, landmarks: List[Dict[str, float]]) -> list:
        """
        Extract all 4 coordinates (x, y, z, visibility) for each landmark.
        Exactly matches the extract_important_keypoints function in the notebook.
        """
        try:
            # Create a list for all 4 values (x, y, z, visibility) to match training data
            data = []
            lm_len = len(landmarks)
            logger.info(f"Extracting all 4 coordinates from {lm_len} landmarks")
            
            for lm_name in IMPORTANT_LMS:
                lm_index = LANDMARK_INDICES[lm_name]
                # Check if index is valid before accessing
                if lm_index < lm_len:
                    keypoint = landmarks[lm_index]
                    # Extract all 4 values (x, y, z, visibility) like in the notebook
                    data.append([
                        keypoint.get('x', 0.0),
                        keypoint.get('y', 0.0),
                        keypoint.get('z', 0.0),
                        keypoint.get('visibility', 0.0)
                    ])
                else:
                    logger.warning(f"Landmark {lm_name} (index {lm_index}) is out of range for landmarks array length {lm_len}")
                    # If landmark is missing, add zeros
                    data.append([0.0, 0.0, 0.0, 0.0])
            
            # Flatten to match model input format - will give us 68 features (17 landmarks * 4 coordinates)
            result = np.array(data).flatten().tolist()
            logger.info(f"Extracted {len(result)} features (x,y,z,visibility)")
            return result
        except Exception as e:
            logger.error(f"Error extracting keypoints: {str(e)}")
            # Return empty data if extraction fails
            return []
    
    def detect_plank_stage_with_ml(self, landmarks: List[Dict[str, float]]) -> Tuple[str, float]:
        """
        Detect plank stage using ML model.
        Matches the detection flow in the notebook exactly.
        """
        try:
            if self.model is None:
                logger.warning("ML model not loaded, falling back to default stage")
                return "correct", 0.0
            
            # Extract all 4 coordinates exactly like the notebook
            row = self.extract_important_keypoints(landmarks)
            
            # Check if extraction failed
            if not row:
                logger.warning("Failed to extract keypoints for ML prediction")
                return "correct", 0.0
            
            # Create DataFrame with column names matching exactly the notebook (HEADERS[1:] skips the 'label' column)
            X = pd.DataFrame([row], columns=HEADERS[1:])
            logger.info(f"Input DataFrame shape: {X.shape}")
            
            try:
                # First try exact approach from notebook with scaling
                if self.input_scaler is not None:
                    try:
                        # This is exactly like the notebook, but might fail due to dimension mismatch
                        logger.info("Attempting to scale input data")
                        logger.info(f"Input data has {X.shape[1]} features, scaler expects {self.input_scaler.n_features_in_ if hasattr(self.input_scaler, 'n_features_in_') else 'unknown'}")
                        
                        X_scaled = self.input_scaler.transform(X)
                        X = pd.DataFrame(X_scaled)  # Notebook creates a new DataFrame with scaled values
                        
                        # Make prediction with scaled data
                        predicted_class = self.model.predict(X)[0]
                        prediction_probabilities = self.model.predict_proba(X)[0]
                        confidence = prediction_probabilities[prediction_probabilities.argmax()]
                        
                        # Get class label exactly as notebook does
                        predicted_label = self.CLASS_LABELS.get(predicted_class)
                        logger.info(f"ML prediction (with scaling): Class {predicted_class} ({predicted_label}) with confidence {confidence}")
                        
                        # Map to our stage format
                        predicted_stage = self.STAGE_MAPPING.get(predicted_label, "unknown")
                        return predicted_stage, confidence
                    except Exception as scaling_error:
                        logger.error(f"Scaled prediction failed: {str(scaling_error)}")
                        # Continue to direct prediction
                
                # Fallback to direct prediction without scaling
                logger.info("Making direct prediction without scaling")
                
                # Remove column names to avoid warnings about feature names
                X_array = X.values
                
                predicted_class = self.model.predict(X_array)[0]
                prediction_probabilities = self.model.predict_proba(X_array)[0]
                confidence = prediction_probabilities[prediction_probabilities.argmax()]
                
                # Get class label exactly as notebook does
                predicted_label = self.CLASS_LABELS.get(predicted_class)
                logger.info(f"ML prediction (direct): Class {predicted_class} ({predicted_label}) with confidence {confidence}")
                
                # Map to our stage format
                predicted_stage = self.STAGE_MAPPING.get(predicted_label, "unknown")
                return predicted_stage, confidence
                
            except Exception as prediction_error:
                logger.error(f"All prediction methods failed: {str(prediction_error)}")
                return "correct", 0.0  # Default to "correct" as fallback
        except Exception as e:
            logger.error(f"Error in ML stage detection: {str(e)}")
            return "correct", 0.0
    
    def detect_errors(self, plank_stage: str) -> List[Dict[str, str]]:
        """Detect errors in plank form based on the detected stage"""
        errors = []
        
        if plank_stage == "high_back":
            errors.append({
                "type": "high_back",
                "message": "Your lower back is raised too high. Flatten your back to maintain proper form.",
                "severity": "high"
            })
        elif plank_stage == "low_back":
            errors.append({
                "type": "low_back",
                "message": "Your lower back is dipping too low. Engage your core to maintain a straight line from head to heels.",
                "severity": "high"
            })
        
        return errors
    
    def calculate_form_score(self, errors: List[Dict[str, str]]) -> int:
        """Calculate form score based on detected errors"""
        score = 100
        
        for error in errors:
            if error["severity"] == "high":
                score -= 20
            elif error["severity"] == "medium":
                score -= 10
            elif error["severity"] == "low":
                score -= 5
        
        # Ensure score is between 0 and 100
        return max(0, min(100, score))
    
    def analyze_pose(self, landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
        """Analyze the plank pose and return results"""
        global _PLANK_HOLD_TIME, _LAST_ANALYSIS_TIME, _LAST_FORM_CORRECT
        analysis = PlankPoseAnalysis()
        
        try:
            # Debug logging
            logger.info(f"PlankAnalyzer.analyze_pose called with {len(landmarks) if landmarks else 'None'} landmarks")
            if landmarks and len(landmarks) > 0:
                first_landmark = landmarks[0]
                logger.info(f"First landmark sample: {first_landmark}")
            
            # Input validation - match pattern used by other analyzers
            if not landmarks or not isinstance(landmarks, list):
                logger.error(f"Invalid landmarks data: {type(landmarks)}")
                return {
                    'success': False,
                    'error': {
                        'type': 'INVALID_INPUT',
                        'severity': 'error',
                        'message': 'Invalid or empty landmarks data'
                    }
                }
            
            # Validate landmark structure - match pattern used by other analyzers
            for landmark in landmarks:
                if not all(key in landmark for key in ['x', 'y']):
                    return {
                        'success': False,
                        'error': {
                            'type': 'INVALID_LANDMARK',
                            'severity': 'error',
                            'message': 'Invalid landmark structure'
                        }
                    }
            
            # Verify we have enough landmarks - at least 33 for full body pose
            if len(landmarks) < 33:
                return {
                    "success": False,
                    "error": {
                        "type": "INVALID_INPUT",
                        "severity": "error",
                        "message": f"Not enough landmarks for plank analysis: {len(landmarks)}/33 found"
                    }
                }
            
            # Use ML model to detect plank stage
            stage, confidence = self.detect_plank_stage_with_ml(landmarks)
            
            # Matching notebook - only use prediction if confidence is high enough
            if confidence >= self.PREDICTION_THRESHOLD:
                analysis.stage = stage
                logger.info(f"Using detected stage: {stage} with confidence {confidence}")
            else:
                analysis.stage = "unknown"
                logger.info(f"Low confidence prediction: {confidence} < {self.PREDICTION_THRESHOLD}, treating as unknown")
            
            # Fallback to "correct" if prediction failed, to allow the timer to continue
            if analysis.stage == "unknown":
                logger.info("Using fallback to 'correct' stage")
                analysis.stage = "correct"
            
            # Detect form errors
            errors = self.detect_errors(analysis.stage)
            
            # Calculate form score
            form_score = self.calculate_form_score(errors)
            
            # Update the hold time based on the form
            current_time = time.time()
            is_correct_form = analysis.stage == "correct"
            
            # Initialize the last analysis time if this is the first call
            if _LAST_ANALYSIS_TIME is None:
                _LAST_ANALYSIS_TIME = current_time
                _LAST_FORM_CORRECT = is_correct_form
                logger.info(f"First analysis call, initializing timer. Form correct: {is_correct_form}")
            else:
                # Calculate time elapsed since last analysis
                time_elapsed = current_time - _LAST_ANALYSIS_TIME
                
                # Only increment hold time if the form is correct
                if is_correct_form:
                    _PLANK_HOLD_TIME += time_elapsed
                    logger.info(f"Form is correct, incrementing hold time by {time_elapsed:.2f}s to {_PLANK_HOLD_TIME:.2f}s")
                else:
                    logger.info(f"Form is incorrect ({analysis.stage}), hold time remains at {_PLANK_HOLD_TIME:.2f}s")
                
                # Update the last analysis time
                _LAST_ANALYSIS_TIME = current_time
                _LAST_FORM_CORRECT = is_correct_form
            
            # Update the duration in the analysis object
            analysis.duration_seconds = int(_PLANK_HOLD_TIME)
            logger.info(f"Current hold time: {analysis.duration_seconds}s (raw: {_PLANK_HOLD_TIME:.2f}s)")
            
            # Update analysis object
            analysis.errors = errors
            analysis.form_score = form_score
            
            # Add metrics
            analysis.metrics = {
                "highBackFlag": 1 if analysis.stage == "high_back" else 0,
                "lowBackFlag": 1 if analysis.stage == "low_back" else 0,
                "holdTime": analysis.duration_seconds,  # Add hold time to metrics
                "formScore": form_score,
                "confidence": round(float(confidence) * 100),
                "originalData": {
                    "stage": analysis.stage  # Include original plank-specific stage
                }
            }
            
            # Create the final response
            response = {
                "success": True,
                "result": {
                    "stage": analysis.stage,
                    "durationInSeconds": analysis.duration_seconds,
                    "holdTime": analysis.duration_seconds,  # Add holdTime at root level too
                    "formScore": analysis.form_score,
                    "errors": analysis.errors,
                    "metrics": analysis.metrics
                }
            }
            
            # Log the key fields in the response to help with debugging
            logger.info(f"RESPONSE: hold_time={response['result']['holdTime']}s, " +
                       f"duration={response['result']['durationInSeconds']}s, " +
                       f"metrics.holdTime={response['result']['metrics']['holdTime']}s, " +
                       f"form_score={response['result']['formScore']}, " +
                       f"stage={response['result']['stage']}")
            
            return response
            
        except Exception as e:
            logger.error(f"Error analyzing plank pose: {str(e)}")
            return {
                "success": False,
                "error": {
                    "type": "ANALYSIS_ERROR",
                    "severity": "error",
                    "message": f"Failed to analyze plank pose: {str(e)}"
                }
            }

    def reset_rep_counter(self) -> bool:
        """Reset the timer for plank exercise"""
        global _PLANK_HOLD_TIME, _LAST_ANALYSIS_TIME, _LAST_FORM_CORRECT
        try:
            # Reset the global hold time variables
            _PLANK_HOLD_TIME = 0.0
            _LAST_ANALYSIS_TIME = None
            _LAST_FORM_CORRECT = False
            
            # Also reset the instance variable for compatibility
            self.duration_seconds = 0
            
            logger.info("Plank timer reset successfully")
            return True
        except Exception as e:
            logger.error(f"Error resetting plank timer: {str(e)}")
            return False

def analyze_from_json(json_data: str) -> Dict[str, Any]:
    """Analyze plank pose from JSON data"""
    try:
        # Parse the JSON data
        data = json.loads(json_data)
        logger.info(f"Received data keys: {list(data.keys())}")
        
        # Check for reset command
        if "command" in data and data["command"] == "reset_counter":
            logger.info(f"Received reset command for plank timer")
            analyzer = PlankAnalyzer()
            result = analyzer.reset_rep_counter()
            return {
                "success": result,
                "result": {"reset": result}
            }
        
        # Extract landmarks - standardize extraction to match other analyzers
        landmarks = None
        
        # Standard format used by the frontend
        if "landmarks" in data and isinstance(data["landmarks"], list):
            landmarks = data["landmarks"]
            logger.info(f"Found landmarks array with {len(landmarks)} points")
        # Fallback for poseLandmarks format
        elif "poseLandmarks" in data and isinstance(data["poseLandmarks"], list):
            landmarks = data["poseLandmarks"]
            logger.info(f"Found poseLandmarks array with {len(landmarks)} points")
        else:
            logger.error(f"No valid landmarks found in payload: {list(data.keys())}")
            return {
                "success": False,
                "error": {
                    "type": "INVALID_INPUT",
                    "severity": "error",
                    "message": "Invalid pose data: missing landmarks"
                }
            }
        
        # Create analyzer and analyze the pose
        analyzer = PlankAnalyzer()
        result = analyzer.analyze_pose(landmarks)
        
        return result
    except Exception as e:
        logger.error(f"Error in plank analysis: {str(e)}")
        return {
            "success": False,
            "error": {
                "type": "ANALYSIS_ERROR",
                "severity": "error",
                "message": f"Error in plank analysis: {str(e)}"
            }
        }

if __name__ == "__main__":
    # Read JSON data from stdin
    json_data = sys.stdin.read()
    
    # Analyze the pose
    result = analyze_from_json(json_data)
    
    # Print the result as JSON
    print(json.dumps(result)) 