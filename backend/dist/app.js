"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("./models/index");
const express = require("express");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const data_source_1 = require("./data-source");
const authService_1 = require("./services/authService");
const logger_1 = __importDefault(require("./utils/logger"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const UserRepository_1 = require("./repositories/UserRepository");
const CacheManager_1 = require("./services/CacheManager");
const MetricsService_1 = require("./services/MetricsService");
const initRelationships_1 = require("./utils/initRelationships");
const seed_1 = require("./seed");
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const path_1 = __importDefault(require("path"));
const workoutRoutes_1 = __importDefault(require("./routes/workoutRoutes"));
const auth_routes_1 = require("./routes/auth.routes");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const system_routes_1 = require("./routes/system.routes");
const exerciseRoutes_1 = __importDefault(require("./routes/exerciseRoutes"));
const workoutSessionRoutes_1 = __importDefault(require("./routes/workoutSessionRoutes"));
const metricRoutes_1 = __importDefault(require("./routes/metricRoutes"));
const testRoutes_1 = require("./routes/testRoutes");
const app = express();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://192.168.100.11:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(body_parser_1.default.json({ limit: '5mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '5mb', extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > 16384) {
        return res.status(431).json({
            error: 'Request Header Fields Too Large',
            message: 'The request headers are too large to process'
        });
    }
    next();
    return;
});
app.use((req, res, next) => {
    if (req.path === '/health' || req.path === '/favicon.ico') {
        return next();
    }
    const start = Date.now();
    const logRequest = () => {
        const duration = Date.now() - start;
        const logLevel = duration > 500 ? 'warn' : 'debug';
        logger_1.default[logLevel](`${req.method} ${req.path} completed`, {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    };
    res.on('finish', logRequest);
    next();
});
app.get("/health", (_, res) => {
    const cacheStats = CacheManager_1.cacheManager.getStats();
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
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});
app.use('/static', express.static(path_1.default.join(__dirname, '../public')));
logger_1.default.info(`Static files will be served from: ${path_1.default.join(__dirname, '../public')}`);
app.use("/api/workouts", workoutRoutes_1.default);
app.use("/api/auth", auth_routes_1.authRoutes);
app.use("/api/dashboard", dashboardRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/system", system_routes_1.systemRoutes);
app.use('/api', exerciseRoutes_1.default);
app.use('/api/workout-sessions', workoutSessionRoutes_1.default);
app.use('/api/metrics', metricRoutes_1.default);
app.use('/api', testRoutes_1.testRoutes);
app.use((err, req, res, next) => {
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
process.on('SIGINT', async () => {
    logger_1.default.info('Shutting down server...');
    try {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed');
        }
        process.exit(0);
    }
    catch (err) {
        logger_1.default.error('Error during shutdown', err);
        process.exit(1);
    }
});
const startServer = async () => {
    try {
        const connectionSuccessful = await (0, data_source_1.testDatabaseConnection)();
        if (!connectionSuccessful) {
            logger_1.default.error("Database connection test failed. Check your database settings.");
            process.exit(1);
        }
        if (!data_source_1.AppDataSource.isInitialized) {
            let retries = 5;
            while (retries > 0) {
                try {
                    await data_source_1.AppDataSource.initialize();
                    logger_1.default.info('Database connection established successfully');
                    await data_source_1.AppDataSource.query('SELECT 1 as connection_test');
                    logger_1.default.info('Database query test successful');
                    break;
                }
                catch (dbError) {
                    retries--;
                    logger_1.default.error(`Database connection failed (${retries} retries left):`, {
                        error: dbError instanceof Error ? {
                            message: dbError.message,
                            name: dbError.name,
                            stack: dbError.stack
                        } : dbError
                    });
                    if (retries === 0) {
                        logger_1.default.error('All database connection attempts failed. Exiting application.');
                        process.exit(1);
                    }
                    logger_1.default.info(`Waiting 5 seconds before retry...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
        const userRepositoryInstance = new UserRepository_1.UserRepository();
        const metricsService = new MetricsService_1.MetricsService();
        const authService = new authService_1.AuthService(userRepositoryInstance, CacheManager_1.cacheManager, metricsService);
        try {
            logger_1.default.info('Running custom seeds...');
            await (0, seed_1.runSeeds)();
            logger_1.default.info('Custom seed data initialized successfully');
        }
        catch (seedError) {
            logger_1.default.warn('Error seeding data (non-fatal):', {
                message: seedError instanceof Error ? seedError.message : 'Unknown error',
                stack: seedError instanceof Error ? seedError.stack : undefined
            });
        }
        (0, initRelationships_1.initializeRelationships)();
        app.listen(PORT, () => {
            logger_1.default.info(`Server running on port ${PORT}`);
            logger_1.default.info(`Health check available at http://localhost:${PORT}/health`);
        });
    }
    catch (err) {
        logger_1.default.error("Error setting up application:", {
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
            details: JSON.stringify(err, null, 2)
        });
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map