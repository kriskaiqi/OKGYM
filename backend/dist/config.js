"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
        secret: process.env.JWT_SECRET || 'default-development-secret-do-not-use-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'okgym',
        logging: process.env.DB_LOGGING === 'true'
    },
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true' || true,
        defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10),
        ttl: {
            user: parseInt(process.env.CACHE_USER_TTL || '3600', 10),
            workout: parseInt(process.env.CACHE_WORKOUT_TTL || '3600', 10),
            exercise: parseInt(process.env.CACHE_EXERCISE_TTL || '7200', 10),
            program: parseInt(process.env.CACHE_PROGRAM_TTL || '7200', 10)
        }
    },
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        enableConsole: process.env.LOG_CONSOLE !== 'false',
        enableFile: process.env.LOG_FILE === 'true',
        fileDirectory: process.env.LOG_FILE_DIR || './logs'
    },
    api: {
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
            max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
        },
        cors: {
            allowedOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
            allowedMethods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE').split(',')
        }
    },
    email: {
        enabled: process.env.EMAIL_ENABLED === 'true' || false,
        from: process.env.EMAIL_FROM || 'noreply@okgym.com',
        smtpHost: process.env.EMAIL_SMTP_HOST || 'smtp.example.com',
        smtpPort: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
        smtpUser: process.env.EMAIL_SMTP_USER || '',
        smtpPass: process.env.EMAIL_SMTP_PASS || ''
    },
    storage: {
        type: process.env.STORAGE_TYPE || 'local',
        localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
        s3: {
            bucket: process.env.S3_BUCKET || '',
            region: process.env.S3_REGION || 'us-east-1',
            accessKey: process.env.S3_ACCESS_KEY || '',
            secretKey: process.env.S3_SECRET_KEY || ''
        }
    }
};
//# sourceMappingURL=config.js.map