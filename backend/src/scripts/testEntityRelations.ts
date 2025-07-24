import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { WorkoutSession } from "../models/WorkoutSession";
import { MetricTracking } from "../models/MetricTracking";

/**
 * Test script to validate entity relationships
 */
async function testEntityRelations() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log("Database connection initialized");
    
    // Validate WorkoutSession entity
    const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession);
    const session = await workoutSessionRepo.findOne({
      where: {},
      relations: {
        metrics: true
      }
    });
    
    console.log("WorkoutSession entity validated");
    
    // Validate MetricTracking entity
    const metricRepo = AppDataSource.getRepository(MetricTracking);
    const metric = await metricRepo.findOne({
      where: {},
      relations: {
        workoutSession: true
      }
    });
    
    console.log("MetricTracking entity validated");
    
    console.log("Entity relations test completed successfully");
  } catch (error) {
    console.error("Entity relation test failed:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  }
}

// Run the test
testEntityRelations().catch(error => {
  console.error("Failed to run test:", error);
  process.exit(1);
}); 