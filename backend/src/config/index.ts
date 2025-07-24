import dotenv from 'dotenv';
import { cacheConfig } from './cache.config';

// Load environment variables
dotenv.config();

/**
 * Application configuration
 */
export const config = {
  /**
   * Server configuration
   */
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api'
  },
  
  /**
   * Database configuration
   */
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'okgym',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true'
  },
  
  /**
   * JWT authentication configuration
   */
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: process.env.JWT_EXPIRATION || '1d',
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10)
  },
  
  /**
   * Redis configuration
   */
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  
  /**
   * Cache configuration
   */
  cache: cacheConfig,
  
  /**
   * Logging configuration
   */
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10)
  },
  
  /**
   * Media storage configuration
   */
  storage: {
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,video/mp4').split(',')
  }
}; 