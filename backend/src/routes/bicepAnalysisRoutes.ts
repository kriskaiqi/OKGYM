import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { BicepAnalysisController } from '../controllers/BicepAnalysisController';
import { BicepAnalysisResponse } from '../types/bicep';
import logger from '../utils/logger';

/**
 * IMPORTANT NOTE:
 * The frontend has been migrated to use HTTP APIs for all communication.
 * The WebSocket implementation is kept for backward compatibility but is no longer actively used.
 * Prefer using the HTTP endpoints defined at the bottom of this file:
 * - POST /api/analyze/bicep - For analyzing bicep frames
 * - POST /api/bicep/reset - For resetting the bicep counter
 */

// Define extended WebSocket type with isAlive property
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

const router = express.Router();
const bicepAnalysisController = new BicepAnalysisController();

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
export const initializeBicepWebSocket = (server: Server) => {
  // Create bare-bones WebSocket server with absolute minimum settings
  const wss = new WebSocketServer({ 
    server,
    path: '/bicep-analysis',
    // Disable all non-essential features
    perMessageDeflate: false,
    skipUTF8Validation: true
  });

  logger.info(`Bicep WebSocket server initialized on path: /bicep-analysis at ${new Date().toISOString()}`);
  
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
      logger.error('Bicep WebSocket connection error:', error);
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
          logger.info(`Bicep client initialized: ${data.client}`);
          return extWs.send(JSON.stringify({ 
            success: true, 
            type: 'init_ack', 
            message: 'Bicep connection established successfully' 
          }));
        }
        
        // Simple ping/pong for client heartbeat
        if (data.ping) {
          return extWs.send(JSON.stringify({ pong: true, timestamp: Date.now() }));
        }
        
        // Handle reset counter command
        if (data.command === 'reset_counter') {
          logger.info(`RESET_DEBUG: Received reset counter command via WebSocket for exercise type: ${data.exerciseType || 'bicep'}`);
          
          // Ensure this is intended for bicep analysis
          if (!data.exerciseType || data.exerciseType === 'bicep') {
            try {
              logger.info('RESET_DEBUG: Calling resetRepCounter on BicepAnalysisController');
              const success = await bicepAnalysisController.resetRepCounter();
              logger.info(`RESET_DEBUG: Reset bicep counter result: ${success ? 'success' : 'failure'}`);
              
              // Send acknowledgment back to client
              const response = {
                success,
                command: 'reset_counter_ack',
                timestamp: Date.now()
              };
              logger.info(`RESET_DEBUG: Sending bicep response: ${JSON.stringify(response)}`);
              extWs.send(JSON.stringify(response));
              
              return;
            } catch (error) {
              logger.error('RESET_DEBUG: Error resetting bicep rep counter:', error);
              
              extWs.send(JSON.stringify({
                success: false,
                error: {
                  type: 'COMMAND_ERROR',
                  severity: 'error',
                  message: error instanceof Error ? error.message : 'Failed to reset bicep rep counter'
                }
              }));
              
              return;
            }
          } else {
            // This is for a different exercise type, don't handle it
            logger.info(`RESET_DEBUG: Ignoring reset counter command for non-bicep exercise type: ${data.exerciseType}`);
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
            logger.info(`Received ultra-simple bicep frame data with ${expandedData.poseLandmarks.length} landmarks`);
          }
          
          // Process data
          const analysisPromise = bicepAnalysisController.analyzeFrame(expandedData);
          
          // Set a timeout to ensure we don't block the event loop
          const timeoutPromise = new Promise<BicepAnalysisResponse>((_, reject) => {
            setTimeout(() => reject(new Error("Bicep analysis timed out")), 2000);
          });
          
          // Race the promises to ensure timely response
          Promise.race([analysisPromise, timeoutPromise])
            .then((result: BicepAnalysisResponse) => {
              const processingTime = Date.now() - messageReceiveTime;
              
              // Only log 20% of successful results
              if (Math.random() < 0.2) {
                if (result.success && result.result) {
                  logger.info(`Sending bicep analysis result after ${processingTime}ms: stage=${result.result.stage}, score=${result.result.formScore}, reps=${result.result.repCount}`);
                } else {
                  logger.warn(`Sending bicep error after ${processingTime}ms: ${result.error?.message || 'Unknown error'}`);
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
                logger.error('WebSocket bicep analysis error:', error);
              }
              
              if (extWs.readyState === WebSocket.OPEN) {
                extWs.send(JSON.stringify({
                  success: false,
                  error: {
                    type: 'ANALYSIS_ERROR',
                    severity: 'error',
                    message: error instanceof Error ? error.message : 'Bicep analysis timed out or failed'
                  },
                  processingTime: Date.now() - messageReceiveTime,
                  serverTimestamp: Date.now()
                }));
              }
            });
        } else {
          logger.error('Bicep WebSocket received data without landmarks');
          if (extWs.readyState === WebSocket.OPEN) {
            extWs.send(JSON.stringify({
              success: false,
              error: {
                type: 'INVALID_INPUT',
                severity: 'error',
                message: 'Missing pose landmarks in bicep request'
              }
            }));
          }
        }
      } catch (error) {
        logger.error('WebSocket bicep analysis error:', error);
        if (extWs.readyState === WebSocket.OPEN) {
          extWs.send(JSON.stringify({
            success: false,
            error: {
              type: 'ANALYSIS_ERROR',
              severity: 'error',
              message: error instanceof Error ? error.message : 'Unknown bicep analysis error'
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
      logger.info(`Bicep WebSocket client count changed: ${lastClientCount} → ${currentClientCount}`);
      lastClientCount = currentClientCount;
    }
    
    // Prune dead connections
    pruneDeadConnections(wss);
    
    // Clean up old client stats
    const now = Date.now();
    clientConnections.forEach((stats, ip) => {
      // Remove client stats after 5 minutes of inactivity
      if (now - stats.lastConnectTime > 300000) {
        clientConnections.delete(ip);
      }
    });
  }, 30000);

  return wss;
};

// REST API endpoints (complementary to WebSocket)
// Removing this duplicate endpoint since we already have '/analyze/bicep'
// router.post('/bicep', async (req: Request, res: Response) => { ... });

/**
 * @route POST /api/bicep/reset
 * @description Reset the bicep rep counter
 * @access Public
 */
router.post('/bicep/reset', async (req: Request, res: Response) => {
  try {
    logger.info('HTTP API: Received reset counter request for bicep');
    const success = await bicepAnalysisController.resetRepCounter();
    logger.info(`HTTP API: Reset bicep counter result: ${success ? 'success' : 'failure'}`);
    
    res.json({
      success,
      timestamp: Date.now(),
      message: success ? 'Bicep counter reset successfully' : 'Failed to reset bicep counter'
    });
  } catch (error) {
    logger.error('HTTP API: Error resetting bicep rep counter:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'COMMAND_ERROR',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Failed to reset bicep rep counter'
      }
    });
  }
});

/**
 * @route POST /api/analyze/bicep
 * @description Analyze a single frame for bicep curl form
 * @access Public
 */
router.post('/analyze/bicep', async (req: Request, res: Response) => {
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
    
    const result = await bicepAnalysisController.analyzeFrame(expandedData);
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