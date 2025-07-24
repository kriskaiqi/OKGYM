import logger from '../utils/logger';
import { User, UserDTO, UserStatus, UserStats, UserPreferences } from '../models/User';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError, ErrorType } from '../utils/errors';
import { repositories } from '../repositories';
import { SimpleTrack } from '../utils/performance';
import { 
  UserRole, 
  Gender, 
  FitnessGoal, 
  ActivityLevel, 
  Difficulty, 
  MeasurementUnit,
  BodyArea,
  MetricValueType,
  TrendDirection
} from '../models/shared/Enums';
import { cacheManager } from './CacheManager';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRepository } from '../repositories/UserRepository';
import { MetricsService } from './MetricsService';
import { SimplePerformanceTracker } from '../utils/performance';
import { BodyMetric } from '../models/BodyMetric';
import { FitnessGoal as UserFitnessGoal, GoalType, GoalStatus } from '../models/FitnessGoal';
import { AppDataSource } from '../data-source';

// Simple metrics tracking
const metricsTracker = SimplePerformanceTracker.getInstance();

/**
 * Interface for the fitness profile update
 */
interface FitnessProfileUpdateData {
  userId?: string;
  height?: number;
  weight?: number;
  fitnessLevel?: Difficulty;
  goals?: string[];
  preferredWorkoutDays?: string[];
  healthConditions?: string[];
  mainGoal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  gender?: Gender;
  birthYear?: number;
  preferences?: Record<string, any>;
}

/**
 * Interface for registration data
 */
interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender?: Gender;
  birthYear?: number;
  height?: number;
  fitnessLevel?: Difficulty;
  mainGoal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  stats?: {
    weightUnit?: MeasurementUnit;
    currentWeight?: number;
    startingWeight?: number;
    weightHistory?: Array<{date: Date, weight: number}>;
  };
  preferences?: {
    dateOfBirth?: string;
  };
  bodyMetrics?: {
    weight: number;
    bodyArea: BodyArea;
    valueType: MetricValueType;
    unit: MeasurementUnit;
    notes?: string;
    targetValue?: number;
    desiredTrend?: TrendDirection;
    source?: string;
  };
  fitnessGoals?: Array<{
    title: string;
    type: string;
    target: number;
    current: number;
    unit: MeasurementUnit;
    startDate: Date;
    deadline: Date;
    status: string;
    description?: string;
  }>;
  fitnessProfile?: FitnessProfileUpdateData;
  userRole?: UserRole;
  isAdmin?: boolean;
  isPremium?: boolean;
}

/**
 * Interface for login data
 */
interface UserLoginData {
  email: string;
  password: string;
}

/**
 * Interface for token refresh request
 */
interface TokenRefreshRequest {
  refreshToken: string;
}

/**
 * Interface for JWT payload
 */
interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Cache interface for better type safety
 */
interface CacheInterface {
  get<T>(key: string, options?: CacheOptions): Promise<T | null>;
  set(key: string, value: any, options?: CacheOptions): Promise<void>;
  delete(key: string, options?: CacheOptions): Promise<void>;
  getStats(): any;
}

/**
 * Options for cache operations
 */
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string; // Cache namespace for grouping related items
  domain?: string; // Domain for metrics tracking
}

/**
 * Auth service responsible for user authentication and authorization
 */
export class AuthService {
    private readonly tokenExpiration: string;
    private readonly refreshTokenExpiration: string;
    private readonly jwtSecret: string;
    private readonly cacheTTL: number;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly cacheManager: CacheInterface,
        private readonly metricsService: MetricsService
    ) {
        this.tokenExpiration = config.jwt?.expiresIn || '1h';
        this.refreshTokenExpiration = config.jwt?.refreshExpiresIn || '7d';
        this.jwtSecret = config.jwt?.secret || 'developmentsecret';
        this.cacheTTL = typeof config.cache?.ttl === 'object' 
            ? config.cache.ttl.user || 3600 
            : config.cache?.ttl || 3600; // 1 hour default
    }

    /**
     * Initialize admin user if it doesn't exist
     * NOTE: This method is now deprecated as we use the seedUsers function instead
     */
    @SimpleTrack()
    async initializeAdmin(): Promise<void> {
        // This functionality has been moved to seedUsers.ts
        // We're just logging here but not creating any admin user
        logger.info('Admin user initialization skipped - using seed system instead');
        
        /* 
        // Original implementation commented out
        await metricsTracker.trackAsync('authService_initializeAdmin', 500, async () => {
            logger.info('Checking for admin user');
            
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
            const existingAdmin = await this.userRepository.findOne({ 
                where: { email: adminEmail } 
            });

            if (!existingAdmin) {
                logger.info('Creating default admin user');
                const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                
                // Create user object with admin role
                const admin = new User();
                admin.email = adminEmail;
                admin.password = hashedPassword;
                admin.firstName = 'Admin';
                admin.lastName = 'User';
                admin.userRole = UserRole.ADMIN;
                admin.isAdmin = true;
                admin.gender = Gender.OTHER;
                admin.fitnessLevel = Difficulty.INTERMEDIATE;
                admin.mainGoal = FitnessGoal.GENERAL_FITNESS;
                admin.activityLevel = ActivityLevel.MODERATELY_ACTIVE;
                
                // Save without explicitly setting ID
                await this.userRepository.save(admin);
                logger.info('Default admin user created');
            } else {
                logger.info('Admin user already exists');
            }
        });
        */
    }
    
    /**
     * Register a new user
     * 
     * @param data User registration data
     * @returns User DTO and authentication token
     */
    @SimpleTrack()
    async register(data: UserRegistrationData): Promise<{ user: UserDTO; token: string; refreshToken: string }> {
        return await metricsTracker.trackAsync('authService_register', 500, async () => {
            logger.info(`Registering user: ${data.email}`);
            
            // Check if user already exists
            const existingUser = await this.userRepository.findOne({
                where: { email: data.email }
            });

            if (existingUser) {
                throw new AppError(
                    ErrorType.CONFLICT,
                    'User already exists',
                    409
                );
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(data.password, 10);
            
            // Create user with exact same structure as in seedUsers.ts
            const user = new User();
            user.email = data.email;
            user.password = hashedPassword;
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            
            // Always set to USER role, never allow admin registration
            user.userRole = UserRole.USER;
            user.isAdmin = false;
            user.isPremium = false;
            
            // Add optional expanded fields if provided
            if (data.gender) user.gender = data.gender as Gender;
            if (data.birthYear) user.birthYear = data.birthYear;
            if (data.height) user.height = data.height;
            if (data.fitnessLevel) user.fitnessLevel = data.fitnessLevel as Difficulty;
            if (data.mainGoal) user.mainGoal = data.mainGoal as FitnessGoal;
            if (data.activityLevel) user.activityLevel = data.activityLevel as ActivityLevel;
            
            // Add stats exactly as in seedUsers.ts
            if (data.stats) {
                const userStats = new UserStats();
                userStats.weightUnit = data.stats.weightUnit as MeasurementUnit || MeasurementUnit.METRIC;
                userStats.currentWeight = data.stats.currentWeight;
                userStats.startingWeight = data.stats.startingWeight || data.stats.currentWeight;
                
                // Create weight history entries in the exact format as seed data
                if (data.stats.weightHistory && data.stats.weightHistory.length > 0) {
                    userStats.weightHistory = [];
                    for (const entry of data.stats.weightHistory) {
                        userStats.weightHistory.push({
                            date: new Date(entry.date),
                            weight: entry.weight
                        });
                    }
                } else if (data.stats.currentWeight) {
                    userStats.weightHistory = [{
                        date: new Date(),
                        weight: data.stats.currentWeight
                    }];
                }
                
                user.stats = userStats;
            }
            
            // Add preferences if provided
            if (data.preferences) {
                // Create a fresh preferences object
                const preferences = new UserPreferences();
                
                // Copy over all valid properties
                Object.assign(preferences, data.preferences);
                
                user.preferences = preferences;
            }
            
            // Save user first to get an ID
            const savedUser = await this.userRepository.save(user) as User;
            
            // Handle body metrics if provided - match exact seed format
            if (data.bodyMetrics && data.stats?.currentWeight) {
                try {
                    const bodyMetric = new BodyMetric();
                    bodyMetric.user = savedUser;
                    bodyMetric.bodyArea = data.bodyMetrics.bodyArea as BodyArea || BodyArea.FULL_BODY;
                    bodyMetric.valueType = data.bodyMetrics.valueType as MetricValueType || MetricValueType.WEIGHT;
                    bodyMetric.value = data.stats.currentWeight;
                    bodyMetric.unit = data.bodyMetrics.unit as MeasurementUnit || MeasurementUnit.KILOGRAM;
                    bodyMetric.measurementDate = new Date();
                    
                    // Handle optional properties with exact format as in seed
                    if (data.bodyMetrics.targetValue !== undefined) {
                        bodyMetric.targetValue = data.bodyMetrics.targetValue;
                    }
                    
                    if (data.bodyMetrics.desiredTrend !== undefined) {
                        bodyMetric.desiredTrend = data.bodyMetrics.desiredTrend as TrendDirection;
                    }
                    
                    bodyMetric.source = data.bodyMetrics.source || 'registration';
                    
                    // Create metadata with notes in exact format as in seed
                    bodyMetric.metadata = {
                        notes: data.bodyMetrics.notes || 'Initial weight record'
                    };
                    
                    // Save body metric
                    const bodyMetricRepository = AppDataSource.getRepository(BodyMetric);
                    await bodyMetricRepository.save(bodyMetric);
                    logger.info(`Created initial body metric for user ${savedUser.id}`);
                } catch (error) {
                    logger.error('Error creating body metric during registration', error);
                    // Continue registration process even if body metric creation fails
                }
            }
            
            // Handle fitness goals if provided - match exact seed format
            if (data.fitnessGoals && data.fitnessGoals.length > 0) {
                try {
                    const fitnessGoalRepository = AppDataSource.getRepository(UserFitnessGoal);
                    
                    for (const goalData of data.fitnessGoals) {
                        const fitnessGoal = new UserFitnessGoal();
                        fitnessGoal.user = savedUser;
                        fitnessGoal.title = goalData.title; // e.g. "HYPERTROPHY Goal"
                        
                        // Special handling for GENERAL_FITNESS Goal -> CUSTOM type
                        if (goalData.title === 'GENERAL_FITNESS Goal' && goalData.type === 'CUSTOM') {
                            fitnessGoal.type = GoalType.CUSTOM;
                        } else {
                            fitnessGoal.type = goalData.type as GoalType;
                        }
                        
                        fitnessGoal.target = goalData.target;
                        fitnessGoal.current = goalData.current;
                        fitnessGoal.unit = goalData.unit as MeasurementUnit;
                        fitnessGoal.startDate = new Date(goalData.startDate);
                        fitnessGoal.deadline = new Date(goalData.deadline);
                        fitnessGoal.status = goalData.status as GoalStatus;
                        
                        if (goalData.description) {
                            fitnessGoal.description = goalData.description; // e.g. "Achieve MUSCLE_GAIN goal in the next 3 months"
                        }
                        
                        // Explicitly set checkpoints and metadata to null
                        fitnessGoal.checkpoints = [] as any;
                        fitnessGoal.metadata = {} as any;
                        
                        // Calculate progress exactly as in the seed data
                        fitnessGoal.progress = fitnessGoal.calculateProgress();
                        
                        // Save fitness goal
                        await fitnessGoalRepository.save(fitnessGoal);
                    }
                    
                    logger.info(`Created ${data.fitnessGoals.length} fitness goals for user ${savedUser.id}`);
                } catch (error) {
                    logger.error('Error creating fitness goals during registration', error);
                    // Continue registration process even if fitness goal creation fails
                }
            }
            
            // Generate tokens
            const token = this.generateToken(savedUser);
            const refreshToken = this.generateRefreshToken();
            
            // Store refresh token
            await this.storeRefreshToken(savedUser.id, refreshToken);

            logger.info('User registered successfully', { email: data.email });

            const userDto = this.mapUserToDTO(savedUser);
            
            // Safety check - should never happen with a new user
            if (!userDto) {
                throw new AppError(
                    ErrorType.INTERNAL_ERROR,
                    'Failed to create user',
                    500
                );
            }

            return { 
                user: userDto, 
                token,
                refreshToken 
            };
        });
    }
    
    /**
     * Update user's fitness profile
     * 
     * @param userId User ID
     * @param data Fitness profile data
     * @returns Updated user DTO
     */
    @SimpleTrack()
    async updateFitnessProfile(userId: string, data: FitnessProfileUpdateData): Promise<UserDTO> {
        logger.info('Updating fitness profile for user:', { userId });
        
        return await metricsTracker.trackAsync('authService_updateFitnessProfile', 500, async () => {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            
            if (!user) {
                throw new AppError(
                    ErrorType.NOT_FOUND,
                    'User not found',
                    404
                );
            }
            
            // Update user's fitness-related fields
            if (data.mainGoal) {
                user.mainGoal = data.mainGoal;
            }
            
            if (data.fitnessLevel) {
                user.fitnessLevel = data.fitnessLevel;
            }
            
            if (data.activityLevel) {
                user.activityLevel = data.activityLevel;
            }
            
            if (data.gender) {
                user.gender = data.gender;
            }
            
            if (data.height) {
                user.height = data.height;
            }
            
            if (data.birthYear) {
                user.birthYear = data.birthYear;
            }
            
            // Handle preferences if they exist
            if (data.preferences) {
                if (!user.preferences) {
                    user.preferences = {};
                }
                user.preferences = {
                    ...user.preferences,
                    ...data.preferences
                };
            }
            
            // Save the updated user
            const updatedUser = await this.userRepository.save(user) as User;
            
            // Invalidate cache for this user
            const cacheKey = `user:${user.id}`;
            await this.cacheManager.delete(cacheKey);
            
            logger.info('Fitness profile updated successfully', { userId: user.id });
            
            const userDto = this.mapUserToDTO(updatedUser);
            
            if (!userDto) {
                throw new AppError(
                    ErrorType.INTERNAL_ERROR,
                    'Failed to update user profile',
                    500
                );
            }
            
            return userDto;
        });
    }
    
    /**
     * Login user
     * 
     * @param data Login credentials
     * @returns User DTO and authentication token
     */
    @SimpleTrack()
    async login(data: UserLoginData): Promise<{ user: UserDTO; token: string; refreshToken: string }> {
        return await metricsTracker.trackAsync('authService_login', 500, async () => {
            logger.info(`Login attempt for user: ${data.email}`);
            
            // Find user by email
            const user = await this.userRepository.findOne({
                where: { email: data.email }
            });

            if (!user) {
                throw new AppError(
                    ErrorType.AUTHENTICATION_ERROR,
                    'Invalid credentials',
                    401
                );
            }
            
            // Verify password
            const isPasswordValid = await bcrypt.compare(data.password, user.password);
            
            if (!isPasswordValid) {
                throw new AppError(
                    ErrorType.AUTHENTICATION_ERROR,
                    'Invalid credentials',
                    401
                );
            }
            
            // Generate tokens
            const token = this.generateToken(user);
            const refreshToken = this.generateRefreshToken();
            
            // Store refresh token
            await this.storeRefreshToken(user.id, refreshToken);

            const userDto = this.mapUserToDTO(user);

            if (!userDto) {
                throw new AppError(
                    ErrorType.INTERNAL_ERROR,
                    'Failed to get user data',
                    500
                );
            }

            return { 
                user: userDto, 
                token,
                refreshToken 
            };
        });
    }
    
    /**
     * Refresh user token
     * 
     * @param data Refresh token request
     * @returns New token and refresh token
     */
    @SimpleTrack()
    async refreshToken(data: TokenRefreshRequest): Promise<{ token: string; refreshToken: string }> {
        return await metricsTracker.trackAsync('authService_refreshToken', 500, async () => {
            logger.info('Token refresh requested');
            
            // Validate refresh token
            const userId = await this.isRefreshTokenValid(data.refreshToken);
            
            if (!userId) {
                throw new AppError(
                    ErrorType.INVALID_TOKEN,
                    'Invalid refresh token',
                    401
                );
            }
            
            // Get user
            const user = await this.userRepository.findOne({ where: { id: userId } });
            
            if (!user) {
                throw new AppError(
                    ErrorType.NOT_FOUND,
                    'User not found',
                    404
                );
            }
            
            // Generate new tokens
            const newToken = this.generateToken(user);
            const newRefreshToken = this.generateRefreshToken();
            
            // Store new refresh token and invalidate old one
            await this.invalidateRefreshToken(userId, data.refreshToken);
            await this.storeRefreshToken(userId, newRefreshToken);
            
            return {
                token: newToken,
                refreshToken: newRefreshToken
            };
        });
    }
    
    /**
     * Logout user by invalidating their refresh token
     * 
     * @param userId User ID
     * @param refreshToken Refresh token to invalidate
     */
    @SimpleTrack()
    async logout(userId: string, refreshToken: string): Promise<void> {
        await metricsTracker.trackAsync('authService_logout', 500, async () => {
            logger.info(`Logout for user: ${userId}`);
            await this.invalidateRefreshToken(userId, refreshToken);
        });
    }
    
    /**
     * Get user by ID
     * 
     * @param userId User ID
     * @returns User DTO or null
     */
    @SimpleTrack()
    async getUserById(userId: string): Promise<UserDTO | null> {
        return await metricsTracker.trackAsync('authService_getUserById', 500, async () => {
            logger.info(`Getting user by ID: ${userId}`);
            
            // Check cache first
            const cacheKey = `user:${userId}`;
            const cachedUser = await this.cacheManager.get<User>(cacheKey);
            
            if (cachedUser) {
                logger.debug(`User ${userId} found in cache`);
                return this.mapUserToDTO(cachedUser);
            }
            
            const user = await this.userRepository.findOne({ where: { id: userId } });
            
            if (!user) {
                return null;
            }
            
            // Store in cache
            await this.cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
            
            return this.mapUserToDTO(user);
        });
    }
    
    /**
     * Get all users (admin only)
     * 
     * @returns Array of user DTOs
     */
    @SimpleTrack()
    async getAllUsers(): Promise<UserDTO[]> {
        return await metricsTracker.trackAsync('authService_getAllUsers', 500, async () => {
            logger.info('Getting all users');
            
            // Check cache first
            const cacheKey = 'all:users';
            const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);
            
            if (cachedUsers && Array.isArray(cachedUsers)) {
                logger.debug('All users found in cache');
                return cachedUsers.map((user: User) => this.mapUserToDTO(user)).filter(Boolean) as UserDTO[];
            }
            
            const users = await this.userRepository.find();
            
            // Store in cache
            await this.cacheManager.set(cacheKey, users, { ttl: this.cacheTTL });
            
            return users.map((user: User) => this.mapUserToDTO(user)).filter(Boolean) as UserDTO[];
        });
    }
    
    /**
     * Check if refresh token is valid for user
     * 
     * @param refreshToken Refresh token
     * @returns User ID if token is valid, null otherwise
     */
    private async isRefreshTokenValid(refreshToken: string): Promise<string | null> {
        const cacheKey = `refresh_token:${refreshToken}`;
        const userId = await this.cacheManager.get<string>(cacheKey);
        return userId || null;
    }
    
    /**
     * Store refresh token for user
     * 
     * @param userId User ID
     * @param refreshToken Refresh token
     */
    private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const tokenKey = `refresh_token:${refreshToken}`;
        const userTokensKey = `user_tokens:${userId}`;
        
        try {
            // Store token to userId mapping
            await this.cacheManager.set(tokenKey, userId, { ttl: this.cacheTTL });
            
            // Add to user's token set
            const userTokens = await this.cacheManager.get<string[]>(userTokensKey) || [];
            const tokens = Array.isArray(userTokens) ? userTokens : [];
            tokens.push(refreshToken);
            await this.cacheManager.set(userTokensKey, tokens, { ttl: this.cacheTTL });
        } catch (error) {
            logger.error(`Failed to store refresh token for user: ${userId}`, error);
            throw new AppError(ErrorType.INTERNAL_ERROR, 'Failed to complete authentication', 500);
        }
    }
    
    /**
     * Invalidate a refresh token
     * 
     * @param userId User ID
     * @param refreshToken Refresh token to invalidate
     */
    private async invalidateRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const tokenKey = `refresh_token:${refreshToken}`;
        const userTokensKey = `user_tokens:${userId}`;
        
        try {
            // Remove token to userId mapping
            await this.cacheManager.delete(tokenKey);
            
            // Remove from user's token set
            const userTokens = await this.cacheManager.get<string[]>(userTokensKey) || [];
            const tokens = Array.isArray(userTokens) ? userTokens : [];
            const updatedTokens = tokens.filter((token: string) => token !== refreshToken);
            await this.cacheManager.set(userTokensKey, updatedTokens, { ttl: this.cacheTTL });
        } catch (error) {
            logger.error(`Failed to invalidate refresh token for user: ${userId}`, error);
            throw new AppError(ErrorType.INTERNAL_ERROR, 'Failed to complete logout', 500);
        }
    }

    /**
     * Generate JWT token
     * 
     * @param user User to generate token for
     * @returns JWT token
     */
    private generateToken(user: User): string {
        const payload = {
                id: user.id,
                email: user.email,
            role: user.userRole
        };
        
        // @ts-ignore - Ignore type checking for JWT sign
        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.tokenExpiration });
    }
    
    /**
     * Generate refresh token
     * 
     * @returns Refresh token
     */
    private generateRefreshToken(): string {
        return crypto.randomBytes(40).toString('hex');
    }

    /**
     * Map User entity to UserDTO
     * 
     * @param user User entity
     * @returns User DTO (without sensitive data)
     */
    private mapUserToDTO(user: User | null): UserDTO | null {
        if (!user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.userRole,
            isAdmin: user.isAdmin,
            isPremium: user.isPremium,
            gender: user.gender,
            birthYear: user.birthYear,
            height: user.height,
            mainGoal: user.mainGoal,
            activityLevel: user.activityLevel,
            fitnessLevel: user.fitnessLevel,
            preferences: user.preferences,
            stats: user.stats,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
} 