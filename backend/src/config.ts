import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration
 * Reads values from environment variables or falls back to defaults
 */
export const config = {
    // Server settings
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // JWT settings
    jwt: {
        secret: process.env.JWT_SECRET || 'default-development-secret-do-not-use-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    
    // Database settings
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'okgym',
        logging: process.env.DB_LOGGING === 'true'
    },
    
    // Cache settings
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true' || true,
        defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10), // 1 hour
        ttl: {
            user: parseInt(process.env.CACHE_USER_TTL || '3600', 10), // 1 hour
            workout: parseInt(process.env.CACHE_WORKOUT_TTL || '3600', 10), // 1 hour
            exercise: parseInt(process.env.CACHE_EXERCISE_TTL || '7200', 10), // 2 hours
            program: parseInt(process.env.CACHE_PROGRAM_TTL || '7200', 10)  // 2 hours
        }
    },
    
    // Logger settings
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        enableConsole: process.env.LOG_CONSOLE !== 'false',
        enableFile: process.env.LOG_FILE === 'true',
        fileDirectory: process.env.LOG_FILE_DIR || './logs'
    },

    // API settings
    api: {
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10) // 100 requests
        },
        cors: {
            allowedOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
            allowedMethods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE').split(',')
        }
    },

    // Email settings
    email: {
        enabled: process.env.EMAIL_ENABLED === 'true' || false,
        from: process.env.EMAIL_FROM || 'noreply@okgym.com',
        smtpHost: process.env.EMAIL_SMTP_HOST || 'smtp.example.com',
        smtpPort: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
        smtpUser: process.env.EMAIL_SMTP_USER || '',
        smtpPass: process.env.EMAIL_SMTP_PASS || ''
    },

    // Storage settings
    storage: {
        type: process.env.STORAGE_TYPE || 'local', // 'local', 's3', etc.
        localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
        s3: {
            bucket: process.env.S3_BUCKET || '',
            region: process.env.S3_REGION || 'us-east-1',
            accessKey: process.env.S3_ACCESS_KEY || '',
            secretKey: process.env.S3_SECRET_KEY || ''
        }
    }
}; 