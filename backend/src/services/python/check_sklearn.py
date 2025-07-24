import os
import sys
import pickle
import importlib
from pathlib import Path
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('SklearnCheck')

def get_static_file_url(path: str) -> str:
    """Get path to static files from the core directory"""
    # Find model in current directory first, then try core directory
    current_path = Path(__file__).parent / "model" / Path(path).name
    if current_path.exists():
        logger.info(f"Found model file at: {str(current_path)}")
        return str(current_path)
    
    # Look in core directory structure if not found locally
    core_path = Path(__file__).parent.parent.parent.parent.parent / "core" / "bicep_model" / "model" / Path(path).name
    
    # Log whether the file exists
    if core_path.exists():
        logger.info(f"Found model file at: {str(core_path)}")
    else:
        logger.warning(f"Model file not found at: {str(core_path)}")
        
    return str(core_path)

def main():
    """Check scikit-learn version and model loading"""
    try:
        # Check scikit-learn version
        import sklearn
        logger.info(f"scikit-learn version: {sklearn.__version__}")
        
        # Create helpful output
        logger.info(f"Python version: {sys.version}")
        
        # Try to import KNeighborsClassifier
        from sklearn.neighbors import KNeighborsClassifier
        logger.info("Successfully imported KNeighborsClassifier")
        
        # Try loading the model files
        logger.info("Attempting to load ML model files")
        ml_model_path = get_static_file_url("KNN_model.pkl")
        input_scaler_path = get_static_file_url("input_scaler.pkl")
        
        logger.info(f"Model path: {ml_model_path}")
        logger.info(f"Scaler path: {input_scaler_path}")
        
        # Check if files exist
        model_exists = os.path.exists(ml_model_path)
        scaler_exists = os.path.exists(input_scaler_path)
        
        logger.info(f"Model file exists: {model_exists}")
        logger.info(f"Scaler file exists: {scaler_exists}")
        
        if not model_exists or not scaler_exists:
            logger.warning("Model files not found")
            return
            
        # Try loading the model
        logger.info("Loading KNN model")
        with open(ml_model_path, "rb") as f:
            try:
                model = pickle.load(f)
                logger.info("KNN model loaded successfully")
                logger.info(f"Model type: {type(model)}")
            except Exception as model_err:
                logger.error(f"Error loading KNN model: {model_err}")
                logger.error(traceback.format_exc())
                return

        # Try loading the scaler
        logger.info("Loading input scaler")
        with open(input_scaler_path, "rb") as f2:
            try:
                input_scaler = pickle.load(f2)
                logger.info("Input scaler loaded successfully")
                logger.info(f"Scaler type: {type(input_scaler)}")
            except Exception as scaler_err:
                logger.error(f"Error loading input scaler: {scaler_err}")
                logger.error(traceback.format_exc())
                return
                
        logger.info("Successfully loaded ML model and scaler")
        
    except Exception as e:
        logger.error(f"Error in scikit-learn check: {e}")
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    main() 