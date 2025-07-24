import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { SquatAnalysisController } from '../controllers/SquatAnalysisController';
import { SquatAnalysisResponse } from '../types/squat';
import logger from '../utils/logger';

/**
 * IMPORTANT NOTE:
 * The frontend has been migrated to use HTTP APIs for all communication.
 * The WebSocket implementation is kept for backward compatibility but is no longer actively used.
 * Prefer using the HTTP endpoints defined at the bottom of this file:
 * - POST /api/analyze/squat - For analyzing squat frames
 * - POST /api/squat/reset - For resetting the squat counter
 */

// Define extended WebSocket type with isAlive property
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

const router = express.Router();
const squatAnalysisController = new SquatAnalysisController();

// Track clients by IP address to prevent excessive connections
const clientConnections = new Map<string, { lastConnectTime: number, count: number }>();

// Helper to cleanup stale connections
function pruneDeadConnections(wss: WebSocketServer) {
  wss.clients.forEach((client: WebSocket) => {
    const extClient = client as ExtendedWebSocket;
    if (!extClient.isAlive) {
      extClient.terminate();
      return;
    }
    
    // Reset ping state for next interval
    extClient.isAlive = false;
    // Send ping to check connection
    extClient.ping();
  });
}

// Initialize WebSocket server
export const initializeWebSocket = (server: Server) => {
  // Create bare-bones WebSocket server with absolute minimum settings
  const wss = new WebSocketServer({ 
    server,
    path: '/analysis',
    // Disable all non-essential features
    perMessageDeflate: false,
    skipUTF8Validation: true
  });

  logger.info(`WebSocket server initialized on path: /analysis at ${new Date().toISOString()}`);
  
  // Add custom properties to WebSocket for heartbeat
  wss.on('connection', function connection(ws, req) {
    const extWs = ws as ExtendedWebSocket;
    extWs.isAlive = true;
    
    const clientIp = req.socket.remoteAddress;
    
    // Decrease connection count on close to allow new connections
    extWs.on('close', () => {
      const stats = clientConnections.get(clientIp || '');
      if (stats) {
        stats.count = Math.max(0, stats.count - 1);
      }
    });
    
    // Mark client as alive when pong received
    extWs.on('pong', () => {
      extWs.isAlive = true;
    });
    
    // Add specific connection error handler
    extWs.on('error', (error) => {
      logger.error('WebSocket connection error:', error);
    });

    extWs.on('message', async (message) => {
      try {
        const messageReceiveTime = Date.now();
        let data;
        
        try {
          data = JSON.parse(message.toString());
        } catch (parseError) {
          logger.error('Failed to parse WebSocket message:', parseError);
          extWs.send(JSON.stringify({
            success: false,
            type: 'error_response',
            error: {
              type: 'PARSING_ERROR',
              severity: 'error',
              message: 'Invalid message format'
            }
          }));
          return;
        }
        
        // Handle initialization message
        if (data.type === 'init') {
          logger.info(`Client initialized: ${data.client}`);
          return extWs.send(JSON.stringify({ 
            success: true, 
            type: 'init_ack', 
            message: 'Connection established successfully' 
          }));
        }
        
        // Simple ping/pong for client heartbeat
        if (data.ping) {
          return extWs.send(JSON.stringify({ pong: true, timestamp: Date.now() }));
        }
        
        // Handle reset counter command
        if (data.command === 'reset_counter') {
          logger.info(`RESET_DEBUG: Received reset counter command via WebSocket for exercise type: ${data.exerciseType || 'squat'}`);
          
          // Ensure this is intended for squat analysis (not bicep)
          if (!data.exerciseType || data.exerciseType === 'squat') {
            try {
              logger.info('RESET_DEBUG: Calling resetRepCounter on SquatAnalysisController');
              const success = await squatAnalysisController.resetRepCounter();
              logger.info(`RESET_DEBUG: Reset counter result: ${success ? 'success' : 'failure'}`);
              
              // Send acknowledgment back to client
              const response = {
                success,
                command: 'reset_counter_ack',
                timestamp: Date.now()
              };
              logger.info(`RESET_DEBUG: Sending response: ${JSON.stringify(response)}`);
              extWs.send(JSON.stringify(response));
              
              return;
            } catch (error) {
              logger.error('RESET_DEBUG: Error resetting rep counter:', error);
              
              extWs.send(JSON.stringify({
                success: false,
                error: {
                  type: 'COMMAND_ERROR',
                  severity: 'error',
                  message: error instanceof Error ? error.message : 'Failed to reset rep counter'
                }
              }));
              
              return;
            }
          } else {
            // This is for a different exercise type, don't handle it
            logger.info(`RESET_DEBUG: Ignoring reset counter command for non-squat exercise type: ${data.exerciseType}`);
            return;
          }
        }
        
        // Check for ultra-simplified format
        if (data.landmarks && Array.isArray(data.landmarks)) {
          // Convert from minimal format to format expected by analyzer
          const expandedData = {
            poseLandmarks: data.landmarks.map((point: any) => ({
              x: point.x,
              y: point.y,
              z: 0,  // Z coordinate not provided in minimal format
              visibility: 0.9  // Use a default high visibility
            })),
            isMirrored: false,
            timestamp: Date.now(),
            frameId: 0
          };
          
          // Log minimally
          if (Math.random() < 0.01) {
            logger.info(`Received ultra-simple frame data with ${expandedData.poseLandmarks.length} landmarks`);
          }
          
          // Process data
          const analysisPromise = squatAnalysisController.analyzeFrame(expandedData);
          
          // Set a timeout to ensure we don't block the event loop
          const timeoutPromise = new Promise<SquatAnalysisResponse>((_, reject) => {
            setTimeout(() => reject(new Error("Analysis timed out")), 2000);
          });
          
          // Race the promises to ensure timely response
          Promise.race([analysisPromise, timeoutPromise])
            .then((result: SquatAnalysisResponse) => {
              const processingTime = Date.now() - messageReceiveTime;
              
              // Only log 20% of successful results
              if (Math.random() < 0.2) {
                if (result.success && result.result) {
                  logger.info(`Sending analysis result after ${processingTime}ms: stage=${result.result.stage}, score=${result.result.formScore}, reps=${result.result.repCount}`);
                } else {
                  logger.warn(`Sending error after ${processingTime}ms: ${result.error?.message || 'Unknown error'}`);
                }
              }
              
              // Add processing metrics to help diagnose performance issues
              const resultWithMetrics = {
                ...result,
                type: result.success ? 'analysis_result' : 'error_response',
                processingTime,
                serverTimestamp: Date.now()
              };
              
              // Send result back to client immediately
              if (extWs.readyState === WebSocket.OPEN) {
                extWs.send(JSON.stringify(resultWithMetrics));
              }
            })
            .catch(error => {
              // Only log the error if it's not a timeout
              if (!error.message?.includes('timed out')) {
                logger.error('WebSocket analysis error:', error);
              }
              
              if (extWs.readyState === WebSocket.OPEN) {
                extWs.send(JSON.stringify({
                  success: false,
                  error: {
                    type: 'ANALYSIS_ERROR',
                    severity: 'error',
                    message: error instanceof Error ? error.message : 'Analysis timed out or failed'
                  },
                  processingTime: Date.now() - messageReceiveTime,
                  serverTimestamp: Date.now()
                }));
              }
            });
        } else {
          logger.error('WebSocket received data without landmarks');
          if (extWs.readyState === WebSocket.OPEN) {
            extWs.send(JSON.stringify({
              success: false,
              error: {
                type: 'INVALID_INPUT',
                severity: 'error',
                message: 'Missing pose landmarks in request'
              }
            }));
          }
        }
      } catch (error) {
        logger.error('WebSocket analysis error:', error);
        if (extWs.readyState === WebSocket.OPEN) {
          extWs.send(JSON.stringify({
            success: false,
            error: {
              type: 'ANALYSIS_ERROR',
              severity: 'error',
              message: error instanceof Error ? error.message : 'Unknown error'
            }
          }));
        }
      }
    });
  });

  // Track client count to only log changes - less frequently now
  let lastClientCount = 0;
  setInterval(() => {
    const currentClientCount = wss.clients.size;
    if (currentClientCount !== lastClientCount) {
      logger.info(`WebSocket client count changed: ${lastClientCount} → ${currentClientCount}`);
      lastClientCount = currentClientCount;
    }
    
    // Prune dead connections
    pruneDeadConnections(wss);
    
    // Clean up old client stats
    const now = Date.now();
    clientConnections.forEach((stats, ip) => {
      // Remove stale entries (older than 1 minute)
      if (now - stats.lastConnectTime > 60000) {
        clientConnections.delete(ip);
      }
    });
  }, 30000);

  // Log any server errors
  wss.on('error', (error) => {
    logger.error('WebSocket server error:', error);
  });
};

/**
 * @route POST /api/analyze/squat/frame
 * @description Analyze a single frame for squat form using Python script
 * @access Public
 * @deprecated Use /api/analyze/squat instead for consistency with bicep endpoints
 */
router.post('/squat/frame', async (req: Request, res: Response) => {
  try {
    logger.warn('The /api/analyze/squat/frame endpoint is deprecated. Please use /api/analyze/squat instead.');
    const result = await squatAnalysisController.analyzeFrame(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Route error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'ANALYSIS_ERROR',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * @route POST /api/squat/reset
 * @description Reset the squat rep counter
 * @access Public
 */
router.post('/squat/reset', async (req: Request, res: Response) => {
  try {
    logger.info('HTTP API: Received reset counter request for squat');
    const success = await squatAnalysisController.resetRepCounter();
    logger.info(`HTTP API: Reset squat counter result: ${success ? 'success' : 'failure'}`);
    
    res.json({
      success,
      timestamp: Date.now(),
      message: success ? 'Squat counter reset successfully' : 'Failed to reset squat counter'
    });
  } catch (error) {
    logger.error('HTTP API: Error resetting squat rep counter:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'COMMAND_ERROR',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Failed to reset squat rep counter'
      }
    });
  }
});

/**
 * @route POST /api/analyze/squat
 * @description Analyze a single frame for squat form
 * @access Public
 */
router.post('/analyze/squat', async (req: Request, res: Response) => {
  try {
    // Convert from minimal format to format expected by analyzer
    const expandedData = {
      poseLandmarks: req.body.landmarks.map((point: any) => ({
        x: point.x,
        y: point.y,
        z: 0,  // Z coordinate not provided in minimal format
        visibility: 0.9  // Use a default high visibility
      })),
      isMirrored: false,
      timestamp: Date.now(),
      frameId: 0
    };
    
    const result = await squatAnalysisController.analyzeFrame(expandedData);
    res.json(result);
  } catch (error) {
    logger.error('Route error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'ANALYSIS_ERROR',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

export default router;