import { User, UserRole } from '../models/User';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { AppDataSource } from '../data-source';
import { 
  Difficulty, 
  FitnessGoal, 
  Gender, 
  ActivityLevel,
  WorkoutLocation,
  ExercisePreference,
  AppTheme,
  MeasurementUnit,
  BodyArea,
  MetricValueType,
  TrendDirection,
  SessionStatus
} from '../models/shared/Enums';
import { UserPreferences } from '../models/User';
import { BodyMetric } from '../models/BodyMetric';
import { FitnessGoal as UserFitnessGoal } from '../models/FitnessGoal';
import { GoalType, GoalStatus } from '../models/FitnessGoal';
// Comment out WorkoutSession import to avoid the empty UUID issue
// import { WorkoutSession } from '../models/WorkoutSession';
import logger from '../utils/logger';
import { hash } from 'bcryptjs';

/**
 * Seed the database with sample users and their related data
 */
export async function seedUsers(): Promise<void> {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const workoutRepository = AppDataSource.getRepository(WorkoutPlan);
    const bodyMetricRepository = AppDataSource.getRepository(BodyMetric);
    const fitnessGoalRepository = AppDataSource.getRepository(UserFitnessGoal);
    // Comment out workout session repository
    // const workoutSessionRepository = AppDataSource.getRepository(WorkoutSession);
    
    // Check if we already have users
    const existingCount = await userRepository.count();
    if (existingCount > 0) {
      logger.info(`Database already has ${existingCount} users. Skipping seed.`);
      return;
    }
    
    // Get all available workouts to assign to users
    const allWorkouts = await workoutRepository.find();
    if (allWorkouts.length === 0) {
      logger.warn('No workouts found in the database. Users will be created without workout history.');
    }
    
    // Hash function for passwords
    const hashPassword = async (password: string): Promise<string> => {
      return await hash(password, 10);
    };
    
    // Create sample users - 5 users: 1 admin, 1 premium, 3 regular
    const usersData = [
      // Admin user
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@okgym.com',
        password: await hashPassword('Admin123!'),
        userRole: UserRole.ADMIN,
        isAdmin: true,
        isPremium: true,
        gender: Gender.FEMALE,
        birthYear: 1990,
        height: 172,
        mainGoal: FitnessGoal.GENERAL_FITNESS,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        fitnessLevel: Difficulty.INTERMEDIATE,
        preferences: {
          dateOfBirth: '1990-05-15'
        },
        stats: {
          weightUnit: MeasurementUnit.METRIC,
          currentWeight: 65,
          startingWeight: 65,
          weightHistory: [
            {
              date: new Date(),
              weight: 65
            }
          ]
        }
      },
      // Premium user
      {
        firstName: 'Premium',
        lastName: 'User',
        email: 'premium@example.com',
        password: await hashPassword('Password123!'),
        userRole: UserRole.USER,
        isAdmin: false,
        isPremium: true,
        gender: Gender.MALE,
        birthYear: 1988,
        height: 180,
        mainGoal: FitnessGoal.STRENGTH_GAIN,
        activityLevel: ActivityLevel.VERY_ACTIVE,
        fitnessLevel: Difficulty.ADVANCED,
        preferences: {
          dateOfBirth: '1988-08-12'
        },
        stats: {
          weightUnit: MeasurementUnit.METRIC,
          currentWeight: 78,
          startingWeight: 75,
          weightHistory: [
            {
              date: new Date(),
              weight: 78
            }
          ]
        }
      },
      // Regular user 1
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: await hashPassword('Password123!'),
        userRole: UserRole.USER,
        isAdmin: false,
        isPremium: false,
        gender: Gender.MALE,
        birthYear: 1992,
        height: 175,
        mainGoal: FitnessGoal.HYPERTROPHY,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        fitnessLevel: Difficulty.INTERMEDIATE,
        preferences: {
          dateOfBirth: '1992-03-25'
        },
        stats: {
          weightUnit: MeasurementUnit.METRIC,
          currentWeight: 70,
          startingWeight: 72,
          weightHistory: [
            {
              date: new Date(),
              weight: 70
            }
          ]
        }
      },
      // Regular user 2
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: await hashPassword('Password123!'),
        userRole: UserRole.USER,
        isAdmin: false,
        isPremium: false,
        gender: Gender.FEMALE,
        birthYear: 1995,
        height: 165,
        mainGoal: FitnessGoal.FAT_LOSS,
        activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
        fitnessLevel: Difficulty.BEGINNER,
        preferences: {
          dateOfBirth: '1995-11-18'
        },
        stats: {
          weightUnit: MeasurementUnit.METRIC,
          currentWeight: 62,
          startingWeight: 68,
          weightHistory: [
            {
              date: new Date(),
              weight: 62
            }
          ]
        }
      },
      // Regular user 3
      {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex@example.com',
        password: await hashPassword('Password123!'),
        userRole: UserRole.USER,
        isAdmin: false,
        isPremium: false,
        gender: Gender.OTHER,
        birthYear: 1997,
        height: 170,
        mainGoal: FitnessGoal.ENDURANCE,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        fitnessLevel: Difficulty.INTERMEDIATE,
        preferences: {
          dateOfBirth: '1997-06-30'
        },
        stats: {
          weightUnit: MeasurementUnit.METRIC,
          currentWeight: 68,
          startingWeight: 68,
          weightHistory: [
            {
              date: new Date(),
              weight: 68
            }
          ]
        }
      }
    ];
    
    // Save users and related data
    for (const userData of usersData) {
      // Create and save the user
      const user = new User();
      Object.assign(user, userData);
      const savedUser = await userRepository.save(user);
      logger.info(`Created user: ${savedUser.firstName} ${savedUser.lastName} (${savedUser.email})`);
      
      // Add body metrics
      if (userData.stats?.currentWeight) {
        const bodyMetric = new BodyMetric();
        bodyMetric.user = savedUser;
        bodyMetric.bodyArea = BodyArea.FULL_BODY;
        bodyMetric.valueType = MetricValueType.WEIGHT;
        bodyMetric.value = userData.stats.currentWeight;
        bodyMetric.unit = MeasurementUnit.KILOGRAM;
        bodyMetric.measurementDate = new Date();
        bodyMetric.metadata = {
          notes: 'Initial weight record'
        };
        bodyMetric.targetValue = userData.stats.currentWeight;
        // Set trend based on goal
        if (userData.mainGoal === FitnessGoal.FAT_LOSS || userData.mainGoal === FitnessGoal.WEIGHT_LOSS) {
          bodyMetric.desiredTrend = TrendDirection.DECREASING;
        } else if (userData.mainGoal === FitnessGoal.MUSCLE_BUILDING || userData.mainGoal === FitnessGoal.HYPERTROPHY || userData.mainGoal === FitnessGoal.STRENGTH_GAIN) {
          bodyMetric.desiredTrend = TrendDirection.INCREASING;
        } else {
          bodyMetric.desiredTrend = TrendDirection.STABLE;
        }
        bodyMetric.source = 'manual';
        await bodyMetricRepository.save(bodyMetric);
      }
      
      // Add fitness goals
      const fitnessGoal = new UserFitnessGoal();
      fitnessGoal.user = savedUser;
      fitnessGoal.title = `${userData.mainGoal} Goal`;
      
      // Set goal type based on main goal
      if (userData.mainGoal === FitnessGoal.FAT_LOSS || userData.mainGoal === FitnessGoal.WEIGHT_LOSS) {
        fitnessGoal.type = GoalType.WEIGHT_LOSS;
        fitnessGoal.target = userData.stats?.currentWeight ? userData.stats.currentWeight - 5 : 0;
      } else if (userData.mainGoal === FitnessGoal.MUSCLE_BUILDING || userData.mainGoal === FitnessGoal.HYPERTROPHY) {
        fitnessGoal.type = GoalType.MUSCLE_GAIN;
        fitnessGoal.target = userData.stats?.currentWeight ? userData.stats.currentWeight + 5 : 0;
      } else if (userData.mainGoal === FitnessGoal.STRENGTH_GAIN) {
        fitnessGoal.type = GoalType.STRENGTH;
        fitnessGoal.target = 0; // Strength doesn't have a weight target
      } else if (userData.mainGoal === FitnessGoal.ENDURANCE) {
        fitnessGoal.type = GoalType.ENDURANCE;
        fitnessGoal.target = 0; // Endurance doesn't have a weight target
      } else {
        fitnessGoal.type = GoalType.CUSTOM;
        fitnessGoal.target = 0;
      }
      
      fitnessGoal.current = userData.stats?.currentWeight || 0;
      fitnessGoal.unit = MeasurementUnit.KILOGRAM;
      fitnessGoal.startDate = new Date();
      fitnessGoal.deadline = new Date();
      fitnessGoal.deadline.setMonth(fitnessGoal.deadline.getMonth() + 3); // 3 months from now
      fitnessGoal.status = GoalStatus.ACTIVE;
      fitnessGoal.description = `Achieve ${fitnessGoal.type} goal in the next 3 months`;
      fitnessGoal.user_id = savedUser.id;
      fitnessGoal.progress = fitnessGoal.calculateProgress();
      await fitnessGoalRepository.save(fitnessGoal);
      
      // Skip adding workout history information to avoid UUID issues
      logger.info(`Successfully created user ${savedUser.email} with basic profile data`);
    }
    
    logger.info(`Successfully seeded ${usersData.length} users with related data`);
  } catch (error) {
    logger.error('Error seeding users:', error);
    // Continue after error to ensure other seeds can run
    logger.error('Error seeding users (continuing):', { message: error.message });
  }
} 