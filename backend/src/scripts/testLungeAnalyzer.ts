import { PythonService } from '../services/PythonService';
import logger from '../utils/logger';

/**
 * Test script for the Lunge Analyzer
 * This script tests the analysis and reset functionality of the lunge analyzer
 */
async function testLungeAnalyzer() {
  // Create a Python service instance
  const pythonService = new PythonService();

  try {
    // Initialize the Python service
    logger.info('Initializing Python service...');
    const initialized = await pythonService.initialize();
    
    if (!initialized) {
      logger.error('Failed to initialize Python service');
      process.exit(1);
    }
    
    logger.info('Python service initialized successfully');

    // Create sample pose data with MediaPipe landmarks format
    const poseData = {
      poseLandmarks: Array(33).fill(0).map((_, i) => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        visibility: 0.9
      })),
      timestamp: Date.now(),
      isMirrored: false
    };
    
    // Test the lunge analyzer
    logger.info('Testing lunge analysis...');
    const analysisResult = await pythonService.analyzePose('lunge', poseData);
    
    logger.info('Lunge analysis result:');
    logger.info(JSON.stringify(analysisResult, null, 2));
    
    // Test the reset functionality
    logger.info('Testing lunge counter reset...');
    const resetResult = await pythonService.resetRepCounter('lunge');
    
    logger.info(`Reset result: ${resetResult}`);
    
    // Close the Python service
    logger.info('Test complete, shutting down...');
    process.exit(0);
  } catch (error) {
    logger.error('Error testing lunge analyzer:', error);
    process.exit(1);
  }
}

// Run the test
testLungeAnalyzer(); 