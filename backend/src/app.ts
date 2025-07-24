import "reflect-metadata";
// Make sure to import all entity models first
import "./models/index";

// @ts-ignore to avoid TypeScript errors
const express = require("express");
import cors from "cors";
import bodyParser from "body-parser";
import { AppDataSource, testDatabaseConnection } from "./data-source"; // Import the test function
import { AuthService } from "./services/authService"; // Fix casing
import logger from "./utils/logger";
import cookieParser from "cookie-parser";
import { UserRepository } from "./repositories/UserRepository";
import { cacheManager } from './services/CacheManager';
import { MetricsService } from './services/MetricsService';
import { User } from "./models/User";
import { DatabaseSeeder } from './services/DatabaseSeeder';
import { initializeRelationships } from './utils/initRelationships';
import { runSeeds } from './seed';
import dashboardRoutes from './routes/dashboardRoutes';
import path from 'path';
import squatAnalysisRoutes, { initializeWebSocket } from './routes/squatAnalysisRoutes';
import bicepAnalysisRoutes, { initializeBicepWebSocket } from './routes/bicepAnalysisRoutes';
import { lungeAnalysisRouter } from './routes/lungeAnalysisRoutes';
import { plankAnalysisRouter } from './routes/plankAnalysisRoutes';
import { situpAnalysisRouter } from './routes/situpAnalysisRoutes';
import { shoulderPressAnalysisRouter } from './routes/shoulderPressAnalysisRoutes';
import { benchPressAnalysisRouter } from './routes/benchPressAnalysisRoutes';
import { pushupAnalysisRouter } from './routes/pushupAnalysisRoutes';
import http from 'http';
import mediaRoutes from './routes/mediaRoutes';
import { lateralRaiseAnalysisRouter } from './routes/lateralRaiseAnalysisRoutes';
import achievementRoutes from './routes/achievementRoutes';

// TypeScript type definitions
type ExpressRequest = import('express').Request;
type ExpressResponse = import('express').Response;
type ExpressNextFunction = import('express').NextFunction;

// Import routes
//import exerciseRoutes from "./routes/exercise.routes";
import workoutRoutes from "./routes/workoutRoutes";
//import workoutSessionRoutes from "./routes/workout-session.routes";
import { authRoutes } from './routes/auth.routes';
import userRoutes from './routes/userRoutes';
import { systemRoutes } from './routes/system.routes';
import exerciseRoutes from './routes/exerciseRoutes';
import workoutSessionRoutes from './routes/workoutSessionRoutes';
import metricRoutes from './routes/metricRoutes';
import { testRoutes } from './routes/testRoutes';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://192.168.100.11:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  credentials: true // Allow cookies
}));

// Limit body size
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// Header size limit middleware
app.use((req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
  const headerSize = JSON.stringify(req.headers).length;
  if (headerSize > 16384) { // 16KB limit (increased from 8KB)
    return res.status(431).json({ 
      error: 'Request Header Fields Too Large',
      message: 'The request headers are too large to process'
    });
  }
  next();
  return;
});

// Simple request timing middleware
app.use((req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
  // Skip for health checks to avoid noise in logs
  if (req.path === '/health' || req.path === '/favicon.ico') {
    return next();
  }
  
  const start = Date.now();
  
  // Function to log request duration
  const logRequest = () => {
    const duration = Date.now() - start;
    const logLevel = duration > 500 ? 'warn' : 'debug';
    
    logger[logLevel](`${req.method} ${req.path} completed`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  };
  
  // Log once the response is finished
  res.on('finish', logRequest);
  
  next();
});

// Health check endpoint
app.get("/health", (_: ExpressRequest, res: ExpressResponse) => {
  // Check cache health
  const cacheStats = cacheManager.getStats();
  
  res.json({
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cache: {
      status: 'available',
      stats: cacheStats
    }
  });
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req: ExpressRequest, res: ExpressResponse) => {
    res.status(204).end(); // No content
});

// Serve static files from their respective directories
// 1. Serve /static/* from backend/public/static/
app.use('/static', express.static(path.join(__dirname, '../public/static')));
logger.info(`Static files served from: ${path.join(__dirname, '../public/static')}`);

// 2. Serve equipment images from images/equipment (not in static folder)
app.use('/images/equipment', express.static(path.join(__dirname, '../public/images/equipment')));
logger.info(`Equipment images served from: ${path.join(__dirname, '../public/images/equipment')}`);

// 3. Serve workout images from static/workouts/images folder
app.use('/static/workouts/images', express.static(path.join(__dirname, '../public/static/workouts/images')));
logger.info(`Workout images served from: ${path.join(__dirname, '../public/static/workouts/images')}`);

// API routes
//app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/system", systemRoutes);
app.use('/api', exerciseRoutes);
app.use('/api/workout-sessions', workoutSessionRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api', testRoutes);
app.use('/api', squatAnalysisRoutes);
app.use('/api', bicepAnalysisRoutes);
app.use('/api', lungeAnalysisRouter);
app.use('/api', plankAnalysisRouter);
app.use('/api', situpAnalysisRouter);
app.use('/api', shoulderPressAnalysisRouter);
app.use('/api', benchPressAnalysisRouter);
app.use('/api', pushupAnalysisRouter);
app.use('/api', lateralRaiseAnalysisRouter);
app.use('/api/achievements', achievementRoutes);
logger.info('Exercise analysis routes registered: squat, bicep, lunge, plank, situp, shoulder_press, bench_press, pushup, lateral_raise');
logger.info('Plank route paths:', Object.keys(plankAnalysisRouter.stack.map((r: any) => r.route?.path)).filter(Boolean));
app.use('/api/media', mediaRoutes);

// Error handling middleware
app.use((err: any, req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    console.error("Error:", err);
    console.error("Stack trace:", err.stack);
    console.error("Request path:", req.path);
    console.error("Request method:", req.method);
    console.error("Request body:", req.body);
    console.error("Request params:", req.params);
    console.error("Request query:", req.query);
    
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down server...');
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', err);
    process.exit(1);
  }
});

// Initialize the data source and start the server
const startServer = async () => {
  try {
    // First test the database connection
    const connectionSuccessful = await testDatabaseConnection();
    if (!connectionSuccessful) {
      logger.error("Database connection test failed. Check your database settings.");
      process.exit(1);
    }
    
    // Initialize database connection with retry mechanism
    if (!AppDataSource.isInitialized) {
      let retries = 5;
      while (retries > 0) {
        try {
          await AppDataSource.initialize();
          logger.info('Database connection established successfully');
          
          // Verify connection is working with a simple query
          await AppDataSource.query('SELECT 1 as connection_test');
          logger.info('Database query test successful');
          
          // Setup relationships and cache
          logger.info('Initializing relationships and caches...');
          await initializeRelationships();
          
          // Initialize WebSocket server
          try {
            // NOTE: These WebSocket servers are currently not used by the frontend,
            // which has been migrated to use HTTP APIs. They are kept for backward compatibility
            // and could be removed in the future.
            initializeWebSocket(server);
            initializeBicepWebSocket(server);
            logger.info(`WebSocket servers initialized: squat at ws://localhost:${PORT}/analysis, bicep at ws://localhost:${PORT}/bicep-analysis`);
            
            // Pre-initialize the exercise analyzers to prevent cold-start issues
            setTimeout(() => {
              try {
                logger.info('Pre-initializing exercise analyzers to improve first-request performance');
                const { ExerciseAnalyzerFactory } = require('./services/ExerciseAnalyzerFactory');
                
                // Pre-warm the exercise analyzers
                const factory = ExerciseAnalyzerFactory.getInstance();
                const squatAnalyzer = factory.getAnalyzer('squat');
                const bicepAnalyzer = factory.getAnalyzer('bicep');
                const lungeAnalyzer = factory.getAnalyzer('lunge');
                const plankAnalyzer = factory.getAnalyzer('plank');
                
                // Initialize all analyzers
                Promise.all([
                  squatAnalyzer.initialize(),
                  bicepAnalyzer.initialize(),
                  lungeAnalyzer.initialize(),
                  plankAnalyzer.initialize()
                ]).then(() => {
                  logger.info('Successfully pre-initialized all exercise analyzers');
                }).catch(err => {
                  logger.warn('Non-critical error during pre-initialization of exercise analyzers:', err);
                });
              } catch (error) {
                logger.warn('Non-critical error during pre-initialization of exercise analyzers:', error);
              }
            }, 1000); // Delay by 1 second to allow server to start properly
          } catch (wsError) {
            logger.error('Error initializing WebSocket server:', wsError);
          }
          
          // Start the server using the HTTP server
          server.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            
            if (process.env.SEED_DB === 'true') {
              runSeeds().catch(err => {
                logger.error('Error running seeds:', err);
              });
            }
          });
          
          // Initialize admin user after database connection is established
          const userRepositoryInstance = new UserRepository();
          
          // Create a metrics service instance
          const metricsService = new MetricsService();
          
          const authService = new AuthService(userRepositoryInstance, cacheManager, metricsService);

          // Run our custom seeds for workout plans if not already done in server start
          if (process.env.SEED_DB !== 'true') {
            try {
              // Run seeds with the existing connection
              logger.info('Running custom seeds...');
              await runSeeds();
              logger.info('Custom seed data initialized successfully');
            } catch (seedError) {
              // Log the error but don't exit - continue application startup
              logger.warn('Error seeding data (non-fatal):', {
                message: seedError instanceof Error ? seedError.message : 'Unknown error',
                stack: seedError instanceof Error ? seedError.stack : undefined
              });
            }
          }

          // Initialize relationships system if not already done
          // (this is safe to call multiple times)
          initializeRelationships();
          
          // Note: We already started the server earlier in this function - no need to call listen() again
          break;
        } catch (dbError) {
          retries--;
          logger.error(`Database connection failed (${retries} retries left):`, {
            error: dbError instanceof Error ? {
              message: dbError.message,
              name: dbError.name,
              stack: dbError.stack
            } : dbError
          });
          
          if (retries === 0) {
            logger.error('All database connection attempts failed. Exiting application.');
            process.exit(1);
          }
          
          // Wait before retrying
          logger.info(`Waiting 5 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  } catch (err) {
    logger.error("Error setting up application:", {
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      details: JSON.stringify(err, null, 2)
    });
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;