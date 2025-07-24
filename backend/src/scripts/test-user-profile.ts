import { AppDataSource } from '../data-source';
import { services } from '../services';
import logger from '../utils/logger';
import { User } from '../models/User';
import { RelationshipLoader } from '../utils/RelationshipLoader';

/**
 * Script to test user profile functionality
 * Run with: npx ts-node src/scripts/test-user-profile.ts [userId]
 */
async function testUserProfile() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection initialized');
    
    // Get user ID from command line args or find the first user
    let userId = process.argv[2];
    
    if (!userId) {
      logger.info('No user ID provided, finding first user in database...');
      const userRepo = AppDataSource.getRepository(User);
      const firstUser = await userRepo.findOne({ where: {} });
      
      if (!firstUser) {
        logger.error('No users found in database');
        process.exit(1);
      }
      
      userId = firstUser.id;
      logger.info(`Using first user found: ${userId}`);
    }
    
    // Test 1: Direct relationship loading
    logger.info('Test 1: Testing direct relationship loading...');
    
    const fitnessGoals = await RelationshipLoader.loadUserFitnessGoals(userId);
    logger.info(`Loaded ${fitnessGoals.length} fitness goals`);
    
    const bodyMetrics = await RelationshipLoader.loadUserBodyMetrics(userId);
    logger.info(`Loaded ${bodyMetrics.length} body metrics`);
    
    const favoriteWorkouts = await RelationshipLoader.loadUserFavoriteWorkouts(userId);
    logger.info(`Loaded ${favoriteWorkouts.length} favorite workouts`);
    
    // Test 2: Complete profile loading
    logger.info('Test 2: Testing complete profile loading...');
    
    const profile = await services.user.getUserProfile(userId);
    logger.info('User profile retrieved successfully:');
    console.log(JSON.stringify({
      user: {
        id: profile.user.id,
        email: profile.user.email,
        firstName: profile.user.firstName,
        lastName: profile.user.lastName
      },
      stats: profile.stats,
      relationships: {
        fitnessGoals: profile.fitnessGoals?.length || 0,
        bodyMetrics: profile.bodyMetrics?.length || 0,
        favoriteWorkouts: profile.favoriteWorkouts?.length || 0,
        recentActivities: profile.recentActivities?.length || 0,
        achievements: profile.achievements?.length || 0
      }
    }, null, 2));
    
    logger.info('User profile tests completed successfully');
  } catch (error) {
    logger.error('Error testing user profile', error);
  } finally {
    // Close connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
  }
}

// Run the test function
testUserProfile(); 