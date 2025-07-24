import { spawn, ChildProcess } from 'child_process';
import readline from 'readline';
import path from 'path';
import logger from '../utils/logger';
import { PoseData } from './BaseExerciseAnalyzer';
import { ExerciseAnalysisResponse, ExerciseError } from '../types/exercise';

export type ExerciseType = 'squat' | 'pushup' | 'deadlift' | 'plank' | 'bicep' | 'lunge' | 'situp' | 'shoulder_press' | 'bench_press' | 'lateral_raise';

/**
 * Service that manages a persistent Python process for exercise analysis
 */
export class PythonService {
  private pythonScript: string;
  private pythonPath: string;
  private pythonProcess: ChildProcess | null = null;
  private responseListener: readline.Interface | null = null;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private lastError: Error | null = null;
  private initAttempts: number = 0;
  private maxInitAttempts: number = 3;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastAnalyzedPose: PoseData | null = null; // Store the last analyzed pose for caching
  
  // Request tracking
  private requestQueue: Map<string, {
    resolve: Function, 
    reject: Function, 
    timestamp: number,
    exerciseType: ExerciseType
  }> = new Map();
  
  // Cache for recent analysis results (separate by exercise type)
  private analysisCache: Map<ExerciseType, Map<string, {
    timestamp: number, 
    result: ExerciseAnalysisResponse
  }>> = new Map();
  
  private cacheTTL: number = 8000; // Increased from 3000ms to 8000ms (8 seconds)

  constructor() {
    // Use the new modular server script
    this.pythonScript = path.join(__dirname, 'python', 'exercise_analyzer_server.py');
    // Use the same Miniconda environment as before
    this.pythonPath = 'C:\\Users\\DELL\\miniconda3\\envs\\kaiqi\\python.exe';
    
    // Initialize cache for each exercise type
    this.analysisCache.set('squat', new Map());
    this.analysisCache.set('pushup', new Map());
    this.analysisCache.set('deadlift', new Map());
    this.analysisCache.set('plank', new Map());
    this.analysisCache.set('bicep', new Map());
  }

  /**
   * Initialize the Python process
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.isInitializing) {
      logger.info('Python service is already initializing');
      // Wait for initialization to complete
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.isInitialized || this.initAttempts >= this.maxInitAttempts) {
            clearInterval(checkInterval);
            resolve(this.isInitialized);
          }
        }, 100);
      });
    }
    
    this.isInitializing = true;
    
    if (this.initAttempts >= this.maxInitAttempts) {
      logger.error('Max initialization attempts reached');
      this.isInitializing = false;
      return false;
    }

    try {
      this.initAttempts++;
      logger.info(`Starting Python process (attempt ${this.initAttempts})`);
      
      // Start Python process with stdio pipes
      this.pythonProcess = spawn(this.pythonPath, [this.pythonScript], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Create interface for reading lines from stdout
      this.responseListener = readline.createInterface({
        input: this.pythonProcess.stdout!,
        terminal: false
      });
      
      // Process error logs separately
      this.pythonProcess.stderr!.on('data', (data) => {
        logger.warn(`Python stderr: ${data.toString().trim()}`);
      });
      
      // Listen for process errors
      this.pythonProcess.on('error', (error) => {
        logger.error('Python process error:', error);
        this.lastError = error;
        this.cleanup();
      });
      
      this.pythonProcess.on('exit', (code, signal) => {
        logger.warn(`Python process exited with code ${code} and signal ${signal}`);
        this.cleanup();
      });
      
      // Wait for startup message
      const initPromise = new Promise<boolean>((resolve) => {
        // Set timeout for initialization
        const initTimeout = setTimeout(() => {
          logger.error('Python process initialization timed out');
          resolve(false);
        }, 30000);
        
        // Setup response handler
        this.responseListener!.once('line', (line) => {
          try {
            const response = JSON.parse(line);
            if (response.status === 'ready') {
              clearTimeout(initTimeout);
              logger.info('Python service initialized successfully');
              this.startResponseListener();
              this.startHealthCheck();
              this.isInitialized = true;
              this.isInitializing = false;
              this.lastError = null;
              resolve(true);
            } else {
              logger.error('Invalid initialization response:', response);
              clearTimeout(initTimeout);
              resolve(false);
            }
          } catch (error) {
            logger.error('Error parsing initialization response:', error);
            clearTimeout(initTimeout);
            resolve(false);
          }
        });
      });
      
      return await initPromise;
    } catch (error) {
      this.lastError = error instanceof Error ? error : new Error('Unknown initialization error');
      logger.error('Failed to initialize Python service:', this.lastError);
      this.isInitializing = false;
      return false;
    }
  }
  
  /**
   * Start listening for responses from Python process
   */
  private startResponseListener() {
    if (!this.responseListener) return;
    
    this.responseListener.on('line', (line) => {
      try {
        const response = JSON.parse(line);
        const requestId = response.requestId || 'unknown';
        
        // Match response to request
        const pendingRequest = this.requestQueue.get(requestId);
        if (pendingRequest) {
          const { resolve, exerciseType } = pendingRequest;
          const processingTime = Date.now() - pendingRequest.timestamp;
          
          // Log processing time for performance monitoring
          if (exerciseType === 'bicep' || processingTime > 200) {
            logger.info(`Completed ${exerciseType} pose analysis in ${processingTime}ms: success=${response.success}, has result=${!!response.result}`);
          }
          
          // Remove requestId from result before sending
          delete response.requestId;
          
          // Cache successful results
          if (response.success && response.result) {
            this.cacheResult(exerciseType, pendingRequest.timestamp, response);
          }
          
          // Resolve the promise
          resolve(response);
          this.requestQueue.delete(requestId);
        } else {
          logger.warn(`Received response for unknown request ID: ${requestId}`);
        }
      } catch (error) {
        logger.error('Error processing Python response:', error);
      }
    });
  }
  
  /**
   * Start periodic health checks
   */
  private startHealthCheck() {
    // Clear any existing interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Check process health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      if (!this.pythonProcess || this.pythonProcess.killed) {
        logger.warn('Python process not running, attempting restart');
        this.cleanup();
        this.initialize().catch(err => {
          logger.error('Failed to restart Python process:', err);
        });
      }
      
      // Clean up abandoned requests (older than 10 seconds)
      const now = Date.now();
      for (const [requestId, request] of this.requestQueue.entries()) {
        if (now - request.timestamp > 10000) {
          logger.warn(`Abandoning stale request ${requestId}`);
          request.reject(new Error('Request timed out'));
          this.requestQueue.delete(requestId);
        }
      }
    }, 30000);
  }
  
  /**
   * Clean up resources when process terminates
   */
  private cleanup() {
    this.isInitialized = false;
    
    // Stop health check
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Reject all pending requests
    for (const [requestId, { reject }] of this.requestQueue.entries()) {
      reject(new Error('Python process terminated'));
      this.requestQueue.delete(requestId);
    }
    
    // Clean up process resources
    if (this.responseListener) {
      this.responseListener.close();
      this.responseListener = null;
    }
    
    if (this.pythonProcess) {
      try {
        this.pythonProcess.kill();
      } catch (e) {
        logger.warn('Error killing Python process:', e);
      }
      this.pythonProcess = null;
    }
  }

  /**
   * Generate a hash for pose data
   */
  private hashPoseData(poseData: PoseData): string {
    // Use reduced precision for better cache hit rate
    return JSON.stringify(poseData.poseLandmarks.map(lm => 
      [Math.round(lm.x * 20), Math.round(lm.y * 20), Math.round(lm.z * 20)]
    ));
  }

  /**
   * Get cached result if available
   */
  private getCachedResult(exerciseType: ExerciseType, poseData: PoseData): ExerciseAnalysisResponse | null {
    const exerciseCache = this.analysisCache.get(exerciseType);
    if (!exerciseCache) return null;
    
    const hash = this.hashPoseData(poseData);
    const cached = exerciseCache.get(hash);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      logger.debug(`Using cached analysis result for ${exerciseType}`);
      return cached.result;
    }
    
    return null;
  }

  /**
   * Cache a successful result
   */
  private cacheResult(exerciseType: ExerciseType, timestamp: number, result: ExerciseAnalysisResponse): void {
    // Create cache map for this exercise type if it doesn't exist
    if (!this.analysisCache.has(exerciseType)) {
      this.analysisCache.set(exerciseType, new Map());
    }
    
    const exerciseCache = this.analysisCache.get(exerciseType)!;
    
    // Use the original poseLandmarks for hashing, not the result
    // The Python script doesn't return the landmarks in its result
    const hash = this.hashPoseData({ 
      poseLandmarks: this.lastAnalyzedPose?.poseLandmarks || [],
      timestamp 
    });
    
    exerciseCache.set(hash, {
      timestamp: Date.now(),
      result
    });
    
    // Cleanup old cache entries (keep cache size reasonable)
    if (exerciseCache.size > 100) {
      const oldEntries = [...exerciseCache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 50)
        .map(entry => entry[0]);
      
      oldEntries.forEach(key => exerciseCache.delete(key));
    }
  }

  /**
   * Check if pose data is valid
   */
  private isValidPoseData(poseData: PoseData): boolean {
    return (
      poseData &&
      Array.isArray(poseData.poseLandmarks) &&
      poseData.poseLandmarks.every(lm => 
        typeof lm.x === 'number' &&
        typeof lm.y === 'number' &&
        typeof lm.z === 'number' &&
        typeof lm.visibility === 'number'
      )
    );
  }

  /**
   * Main method to analyze pose for a specific exercise
   */
  public async analyzePose(
    exerciseType: ExerciseType = 'squat',
    poseData: PoseData
  ): Promise<ExerciseAnalysisResponse> {
    if (!this.isInitialized) {
      try {
        const initialized = await this.initialize();
        if (!initialized) {
          return {
            success: false,
            error: {
              type: 'ANALYSIS_ERROR',
              severity: 'error',
              message: 'Python service failed to initialize'
            }
          };
        }
      } catch (error) {
        logger.error('Error initializing Python service:', error);
        return {
          success: false,
          error: {
            type: 'ANALYSIS_ERROR',
            severity: 'error',
            message: error instanceof Error ? error.message : 'Unknown initialization error'
          }
        };
      }
    }

    // Validate input
    if (!this.isValidPoseData(poseData)) {
      return {
        success: false,
        error: {
          type: 'INVALID_INPUT',
          severity: 'error',
          message: 'Invalid pose data'
        }
      };
    }

    // Try to get cached result first
    const cachedResult = this.getCachedResult(exerciseType, poseData);
    if (cachedResult) {
      return cachedResult;
    }

    // Analyze pose data via Python process
    const requestId = `${exerciseType}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create dedicated payload for Python to ensure consistent format
    const pythonPayload = {
      requestId,
      exerciseType,
      type: "landmarks",  // Add explicit type field to match frontend format
      poseLandmarks: poseData.poseLandmarks,
      // Include additional data that might be useful for analysis
      timestamp: poseData.timestamp,
      // Add additional metadata if available
      frameId: (poseData as any).frameId, // Use type assertion for optional fields
      isMirrored: poseData.isMirrored
    };

    // Store the pose data for use in caching later
    this.lastAnalyzedPose = { ...poseData };

    // Return a promise that will resolve with the result
    return new Promise<ExerciseAnalysisResponse>((resolve, reject) => {
      // Store promise handlers
      this.requestQueue.set(requestId, {
        resolve, 
        reject,
        timestamp: Date.now(),
        exerciseType
      });
      
      // Set request timeout - use higher timeout for bicep (first-time initialization can be slower)
      const timeoutMs = exerciseType === 'bicep' ? 10000 : 5000;
      const timeoutId = setTimeout(() => {
        if (this.requestQueue.has(requestId)) {
          this.requestQueue.delete(requestId);
          reject(new Error(`Analysis timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);
      
      try {
        // Send to Python process
        const jsonPayload = JSON.stringify(pythonPayload) + '\n';
        this.pythonProcess!.stdin!.write(jsonPayload, (err) => {
          if (err) {
            clearTimeout(timeoutId);
            this.requestQueue.delete(requestId);
            reject(err);
          }
        });
      } catch (error) {
        clearTimeout(timeoutId);
        this.requestQueue.delete(requestId);
        reject(error);
      }
    }).catch(error => {
      logger.error('Error analyzing pose:', error);
      return {
        success: false,
        error: {
          type: 'ANALYSIS_ERROR',
          severity: 'error',
          message: error instanceof Error ? error.message : 'Failed to analyze pose'
        }
      };
    });
  }

  /**
   * Reset the repetition counter for a specific exercise
   */
  public async resetRepCounter(exerciseType: ExerciseType = 'squat'): Promise<boolean> {
    logger.info(`RESET_DEBUG: PythonService - Starting resetRepCounter for ${exerciseType}`);
    
    // Initialize if needed
    if (!this.isInitialized) {
      logger.info('RESET_DEBUG: PythonService - Not initialized, initializing...');
      const initialized = await this.initialize();
      if (!initialized) {
        logger.error('RESET_DEBUG: Failed to initialize Python service when resetting counter');
        return false;
      }
      logger.info('RESET_DEBUG: PythonService - Successfully initialized');
    }

    try {
      // Ensure Python process is ready
      if (!this.pythonProcess || !this.pythonProcess.stdin || this.pythonProcess.killed) {
        logger.warn('RESET_DEBUG: Python process not ready, reinitializing before reset counter');
        await this.initialize();
        
        if (!this.isInitialized) {
          logger.error('RESET_DEBUG: Python service unavailable for counter reset');
          return false;
        }
        logger.info('RESET_DEBUG: PythonService - Successfully reinitialized Python process');
      }
      
      // Create unique request ID
      const requestId = `reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      logger.info(`RESET_DEBUG: PythonService - Created request ID: ${requestId}`);
      
      // Return a promise that will resolve with the result
      return new Promise<boolean>((resolve, reject) => {
        // Set request timeout
        const timeoutMs = 3000;
        const timeoutId = setTimeout(() => {
          logger.error(`RESET_DEBUG: Reset counter timed out after ${timeoutMs}ms`);
          reject(new Error(`Reset counter timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        
        try {
          // Prepare the reset counter command
          const payload = {
            requestId,
            command: 'reset_counter',
            exerciseType,
            type: 'command',  // Add explicit type field for consistency
            timestamp: Date.now()
          };
          
          logger.info(`RESET_DEBUG: PythonService - Sending payload: ${JSON.stringify(payload)}`);
          
          // Send to Python process
          const jsonPayload = JSON.stringify(payload) + '\n';
          this.pythonProcess!.stdin!.write(jsonPayload, (err) => {
            if (err) {
              clearTimeout(timeoutId);
              logger.error(`RESET_DEBUG: Error writing to Python process: ${err.message}`);
              reject(err);
              return;
            }
            
            // For reset commands, we don't wait for a response
            clearTimeout(timeoutId);
            logger.info(`RESET_DEBUG: Reset counter command sent for ${exerciseType}`);
            resolve(true);
          });
        } catch (error) {
          clearTimeout(timeoutId);
          logger.error(`RESET_DEBUG: Exception in resetRepCounter: ${error instanceof Error ? error.message : 'Unknown error'}`);
          reject(error);
        }
      }).catch(error => {
        logger.error(`RESET_DEBUG: Error in resetRepCounter promise: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
      });
    } catch (error) {
      logger.error(`RESET_DEBUG: Error in resetRepCounter: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
} 