import sys
import json
import signal
import time
import logging
import importlib
from pathlib import Path
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('ExerciseAnalyzerServer')

class ExerciseAnalyzerServer:
    def __init__(self):
        # Map of exercise types to analyzer instances
        self.analyzers = {}
        self.loaded_models = set()
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.shutdown)
        signal.signal(signal.SIGTERM, self.shutdown)
        
        logger.info("Exercise Analyzer Server initialized")
        
    def load_analyzer(self, exercise_type: str) -> bool:
        """Dynamically load an exercise analyzer based on type"""
        if exercise_type in self.analyzers:
            return True
            
        try:
            # Import the appropriate analyzer class
            if exercise_type == "squat":
                # Import the existing SquatAnalyzer
                from squat_analyzer import SquatAnalyzer
                self.analyzers[exercise_type] = SquatAnalyzer()
                self.loaded_models.add(exercise_type)
                logger.info(f"Loaded {exercise_type} analyzer")
                return True
            # Add bicep curl analyzer
            elif exercise_type == "bicep":
                # Import the BicepAnalyzer
                from bicep_analyzer import BicepAnalyzer
                self.analyzers[exercise_type] = BicepAnalyzer()
                self.loaded_models.add(exercise_type)
                logger.info(f"Loaded {exercise_type} analyzer")
                return True
            # Add lunge analyzer
            elif exercise_type == "lunge":
                # Import the LungeAnalyzer
                from lunge_analyzer import LungeAnalyzer
                self.analyzers[exercise_type] = LungeAnalyzer()
                self.loaded_models.add(exercise_type)
                logger.info(f"Loaded {exercise_type} analyzer")
                return True
            # Add plank analyzer
            elif exercise_type == "plank":
                # Import the PlankAnalyzer
                from plank_analyzer import PlankAnalyzer
                self.analyzers[exercise_type] = PlankAnalyzer()
                self.loaded_models.add(exercise_type)
                logger.info(f"Loaded {exercise_type} analyzer")
                return True
            # Add situp analyzer
            elif exercise_type == "situp":
                # Import the SitupAnalyzer
                from situp_analyzer import SitupAnalyzer
                self.analyzers[exercise_type] = SitupAnalyzer()
                self.loaded_models.add(exercise_type)
                logger.info(f"Loaded {exercise_type} analyzer")
                return True
            # Add shoulder press analyzer
            elif exercise_type == "shoulder_press":
                # Import the ShoulderPressAnalyzer
                from shoulder_press_analyzer import ShoulderPressAnalyzer
                self.analyzers[exercise_type] = ShoulderPressAnalyzer()
                self.loaded_models.add(exercise_type)
                logger.info(f"Loaded {exercise_type} analyzer")
                return True
            # Add bench press analyzer
            elif exercise_type == "bench_press":
                # Import the BenchPressAnalyzer
                from bench_press_analyzer import BenchPressAnalyzer
                self.analyzers[exercise_type] = BenchPressAnalyzer()
                self.loaded_models.add(exercise_type)
                logger.info(f"Loaded {exercise_type} analyzer")
                return True
            # Add pushup analyzer
            elif exercise_type == "pushup":
                # Import the PushupAnalyzer
                from pushup_analyzer import PushupAnalyzer
                self.analyzers[exercise_type] = PushupAnalyzer()
                self.loaded_models.add(exercise_type)
                logger.info(f"Loaded {exercise_type} analyzer")
                return True
            # Add lateral raise analyzer
            elif exercise_type == "lateral_raise":
                # Import the LateralRaiseAnalyzer
                from lateral_raise_analyzer import LateralRaiseAnalyzer
                self.analyzers[exercise_type] = LateralRaiseAnalyzer()
                self.loaded_models.add(exercise_type)
                logger.info(f"Loaded {exercise_type} analyzer")
                return True
            # Add more exercise types here as they're implemented
            else:
                logger.error(f"Unknown exercise type: {exercise_type}")
                return False
        except Exception as e:
            logger.error(f"Error loading {exercise_type} analyzer: {str(e)}")
            return False
    
    def analyze_pose(self, exercise_type: str, pose_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze pose data for the given exercise type"""
        # Ensure the analyzer is loaded
        if exercise_type not in self.analyzers:
            success = self.load_analyzer(exercise_type)
            if not success:
                return {
                    "success": False,
                    "error": {
                        "type": "ANALYSIS_ERROR",
                        "severity": "error",
                        "message": f"Failed to load analyzer for {exercise_type}"
                    }
                }
        
        # Analyze the pose
        try:
            analyzer = self.analyzers[exercise_type]
            result = analyzer.analyze_pose(pose_data)
            return result
        except Exception as e:
            logger.error(f"Error analyzing {exercise_type} pose: {str(e)}")
            return {
                "success": False,
                "error": {
                    "type": "ANALYSIS_ERROR",
                    "severity": "error",
                    "message": str(e)
                }
            }
    
    def reset_counter(self, exercise_type: str) -> Dict[str, Any]:
        """Reset the repetition counter for the given exercise type"""
        logger.warning(f"RESET_DEBUG: Processing reset_counter command for {exercise_type}")
        
        # Ensure the analyzer is loaded
        if exercise_type not in self.analyzers:
            success = self.load_analyzer(exercise_type)
            if not success:
                logger.error(f"RESET_DEBUG: Failed to load analyzer for {exercise_type}")
                return {
                    "success": False,
                    "error": {
                        "type": "COMMAND_ERROR",
                        "severity": "error",
                        "message": f"Failed to load analyzer for {exercise_type}"
                    }
                }
        
        # Reset the counter
        try:
            analyzer = self.analyzers[exercise_type]
            logger.warning(f"RESET_DEBUG: Calling reset_rep_counter on {exercise_type} analyzer")
            analyzer.reset_rep_counter()
            logger.warning(f"RESET_DEBUG: Successfully reset counter for {exercise_type}")
            return {
                "success": True,
                "message": f"Reset counter for {exercise_type}"
            }
        except Exception as e:
            logger.error(f"RESET_DEBUG: Error resetting counter for {exercise_type}: {str(e)}")
            return {
                "success": False,
                "error": {
                    "type": "COMMAND_ERROR",
                    "severity": "error",
                    "message": str(e)
                }
            }
    
    def run_server(self):
        """Run the server loop, processing input from stdin"""
        logger.info("Exercise Analyzer Server starting")
        
        # Print startup message for Node.js to confirm server is ready
        print(json.dumps({"status": "ready", "message": "Exercise Analyzer Server started"}))
        sys.stdout.flush()
        
        while True:
            try:
                # Read a line from stdin
                input_line = sys.stdin.readline().strip()
                
                # Handle special commands
                if input_line == "EXIT":
                    logger.info("Received EXIT command")
                    break
                
                # Process normal analysis request
                if input_line:
                    start_time = time.time()
                    
                    try:
                        # Parse the input data
                        data = json.loads(input_line)
                        request_id = data.get("requestId", "unknown")
                        exercise_type = data.get("exerciseType", "squat")  # Default to squat for backward compatibility
                        
                        # Check if this is a command
                        if "command" in data:
                            command = data.get("command")
                            message_type = data.get("type", "")
                            logger.info(f"Processing command: {command} (type: {message_type}) for {exercise_type}")
                            
                            if command == "reset_counter":
                                # Reset the repetition counter
                                result = self.reset_counter(exercise_type)
                                result["requestId"] = request_id
                                result["command"] = "reset_counter_ack"
                                result["type"] = "command_response"  # Add type for consistent response format
                                result["processingTime"] = time.time() - start_time
                                
                                # Send the result back to Node.js
                                print(json.dumps(result))
                                sys.stdout.flush()
                                continue
                            else:
                                logger.warning(f"Unknown command: {command}")
                                error_response = {
                                    "success": False,
                                    "requestId": request_id,
                                    "error": {
                                        "type": "COMMAND_ERROR",
                                        "severity": "error",
                                        "message": f"Unknown command: {command}"
                                    }
                                }
                                print(json.dumps(error_response))
                                sys.stdout.flush()
                                continue
                        
                        # Check for ultra-simplified format (just landmarks array)
                        if 'landmarks' in data and isinstance(data['landmarks'], list):
                            logger.debug(f"Processing ultra-simplified landmarks message")
                            
                            # Extract landmarks directly
                            landmarks_list = data.get('landmarks', [])
                            pose_landmarks = []
                            
                            # Convert from simple {x,y} format to full landmark format
                            for lm in landmarks_list:
                                pose_landmarks.append({
                                    'x': lm.get('x', 0.0),
                                    'y': lm.get('y', 0.0),
                                    'z': 0.0,  # Z coordinate not provided
                                    'visibility': 0.9  # Use default high visibility
                                })
                            
                            # Use default exercise type if not specified
                            exercise_type = data.get('exercise', 'squat')
                            
                            if len(pose_landmarks) > 0:
                                logger.debug(f"Processing ultra-simple request {request_id}: {exercise_type} with {len(pose_landmarks)} landmarks")
                        # Check for simplified format ('data' type)
                        elif 'type' in data and data['type'] == 'data':
                            message_type = 'data'
                            exercise_type = data.get('exercise', 'squat')
                            frame_id = data.get('frame', None)
                            
                            # Extract landmarks from 'points' field
                            if 'points' in data:
                                points = data.get('points', [])
                                # Convert from {x, y, v} format to full landmark format
                                pose_landmarks = []
                                for pt in points:
                                    pose_landmarks.append({
                                        'x': pt.get('x', 0.0),
                                        'y': pt.get('y', 0.0),
                                        'z': 0.0,  # Z not provided in minimal format
                                        'visibility': pt.get('v', 0.0)
                                    })
                                
                                logger.debug(f"Processing simplified data: {exercise_type} frame {frame_id} with {len(pose_landmarks)} landmarks")
                        # Check for compact format with 't' field
                        elif 't' in data:
                            message_type = data.get('t', '')
                            if message_type == 'landmarks':
                                logger.debug(f"Processing compact landmarks message")
                                # Extract relevant data for analysis
                                pose_landmarks = data.get('p', [])
                                exercise_type = data.get('e', 'squat')
                                frame_id = data.get('id', None)
                                
                                # Convert compact format [x,y,z,v] to dict format
                                if pose_landmarks and isinstance(pose_landmarks[0], list):
                                    pose_landmarks = [
                                        {'x': lm[0], 'y': lm[1], 'z': lm[2], 'visibility': lm[3]} 
                                        for lm in pose_landmarks
                                    ]
                                
                                # Log minimal info to reduce stdout pollution
                                if len(pose_landmarks) > 0:
                                    logger.debug(f"Processing compact request {request_id}: {exercise_type} with {len(pose_landmarks)} landmarks (frame {frame_id})")
                        # Check for legacy format with 'type' field
                        elif 'type' in data:
                            message_type = data.get('type', '')
                            if message_type == 'landmarks':
                                logger.debug(f"Processing legacy landmarks message (type: {message_type})")
                                # Extract relevant data for analysis
                                pose_landmarks = data.get('poseLandmarks', [])
                                exercise_type = data.get('exerciseType', 'squat')
                                frame_id = data.get('frameId', None)
                        
                        # Log minimal info to reduce stdout pollution
                        if len(pose_landmarks) > 0:
                                    logger.debug(f"Processing request {request_id}: {exercise_type} with {len(pose_landmarks)} landmarks (frame {frame_id})")
                        else:
                            # Handle older format without type field
                            pose_landmarks = data.get('poseLandmarks', [])
                            # Log minimal info to reduce stdout pollution
                            if len(pose_landmarks) > 0:
                                logger.debug(f"Processing classic request {request_id}: {exercise_type} with {len(pose_landmarks)} landmarks")
                        
                        # Analyze the pose
                        result = self.analyze_pose(exercise_type, pose_landmarks)
                        
                        # Add the request ID and processing time to the response
                        result["requestId"] = request_id
                        result["processingTime"] = time.time() - start_time
                        result["type"] = "analysis_result"  # Add consistent type field for all responses
                        
                        # Send the result back to Node.js
                        print(json.dumps(result))
                        sys.stdout.flush()
                        
                    except json.JSONDecodeError:
                        logger.error(f"Invalid JSON input: {input_line[:100]}...")
                        error_response = {
                            "success": False,
                            "requestId": "unknown",
                            "type": "error_response",  # Add consistent type for error responses
                            "error": {
                                "type": "INVALID_INPUT",
                                "severity": "error",
                                "message": "Invalid JSON input"
                            }
                        }
                        print(json.dumps(error_response))
                        sys.stdout.flush()
                        
                    except Exception as e:
                        logger.error(f"Error processing request: {str(e)}")
                        error_response = {
                            "success": False,
                            "requestId": "unknown",
                            "type": "error_response",  # Add consistent type for error responses
                            "error": {
                                "type": "ANALYSIS_ERROR",
                                "severity": "error", 
                                "message": str(e)
                            }
                        }
                        print(json.dumps(error_response))
                        sys.stdout.flush()
            
            except KeyboardInterrupt:
                logger.info("Keyboard interrupt received")
                break
                
            except Exception as e:
                logger.error(f"Server loop error: {str(e)}")
                # Continue to keep the server running
        
        logger.info("Exercise Analyzer Server shutting down")
    
    def shutdown(self, *args):
        """Handle graceful shutdown"""
        logger.info("Shutdown signal received")
        sys.exit(0)

if __name__ == "__main__":
    server = ExerciseAnalyzerServer()
    server.run_server() 