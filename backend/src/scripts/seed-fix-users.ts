import { User, UserRole } from '../models/User';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { AppDataSource } from '../data-source';
import { 
  Difficulty, 
  FitnessGoal, 
  Gender, 
  ActivityLevel,
  MeasurementUnit,
  BodyArea,
  MetricValueType,
  TrendDirection
} from '../models/shared/Enums';
import { BodyMetric } from '../models/BodyMetric';
import { FitnessGoal as UserFitnessGoal } from '../models/FitnessGoal';
import { GoalType, GoalStatus } from '../models/FitnessGoal';
import logger from '../utils/logger';
import { hash } from 'bcryptjs';

/**
 * Fixed version of the user seeding script that skips workout session creation
 * which was causing issues with empty UUID.
 */
async function seedFixedUsers(): Promise<void> {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    const userRepository = AppDataSource.getRepository(User);
    const bodyMetricRepository = AppDataSource.getRepository(BodyMetric);
    const fitnessGoalRepository = AppDataSource.getRepository(UserFitnessGoal);
    
    // Check if we already have users
    const existingCount = await userRepository.count();
    if (existingCount > 0) {
      logger.info(`Database already has ${existingCount} users. Skipping seed.`);
      await AppDataSource.destroy();
      return;
    }
    
    // Hash function for passwords
    const hashPassword = async (password: string): Promise<string> => {
      return await hash(password, 10);
    };
    
    // Create sample users - just the admin user for simplicity
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
      
      logger.info(`Successfully created user ${savedUser.email} with basic profile data`);
    }
    
    logger.info(`Successfully seeded ${usersData.length} users with related data`);
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
  } catch (error) {
    logger.error('Error seeding users:', error);
    // Ensure connection is closed even if there's an error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed after error');
    }
  }
}

// Execute the function
seedFixedUsers()
  .then(() => {
    console.log('Fixed user seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed users:', error);
    process.exit(1);
  }); 