/**
 * Test repository script
 * This file tests the WorkoutPlanRepository's getWithFullDetails method
 * to verify our compatibility layer works with numeric IDs
 */

import "reflect-metadata";
import { DataSource } from "typeorm";
import { WorkoutPlanRepository } from "./repositories/WorkoutPlanRepository";
import { WorkoutPlan } from "./models/WorkoutPlan";
import { AppDataSource } from "./data-source";
import logger from "./utils/logger";

async function testRepository() {
  console.log("Starting repository test");
  logger.info("Starting repository test");
  
  // Initialize data source
  try {
    await AppDataSource.initialize();
    console.log("Data source initialized");
    logger.info("Data source initialized");
  } catch (error) {
    console.error(`Data source initialization error: ${error.message}`);
    logger.error(`Data source initialization error: ${error.message}`);
    return;
  }
  
  const workoutPlanRepo = new WorkoutPlanRepository();
  
  try {
    // Test numeric ID (1 is a valid workout plan ID based on our DB check)
    console.log("Testing getWithFullDetails with numeric ID 1");
    logger.info("Testing getWithFullDetails with numeric ID 1");
    const workoutPlan = await workoutPlanRepo.getWithFullDetails(1);
    
    if (workoutPlan) {
      console.log(`Successfully found workout plan with numeric ID: ${workoutPlan.id}`);
      console.log(`Workout name: ${workoutPlan.name}`);
      console.log(`Exercise count: ${workoutPlan.exercises?.length || 0}`);
      logger.info(`Successfully found workout plan with numeric ID: ${workoutPlan.id}`);
      logger.info(`Workout name: ${workoutPlan.name}`);
      logger.info(`Exercise count: ${workoutPlan.exercises?.length || 0}`);
    } else {
      console.log("No workout plan found with ID 1");
      logger.warn("No workout plan found with ID 1");
    }
    
    // Test another numeric ID
    console.log("Testing getWithFullDetails with numeric ID 2");
    logger.info("Testing getWithFullDetails with numeric ID 2");
    const workoutPlan2 = await workoutPlanRepo.getWithFullDetails(2);
    
    if (workoutPlan2) {
      console.log(`Successfully found workout plan with numeric ID: ${workoutPlan2.id}`);
      console.log(`Workout name: ${workoutPlan2.name}`);
      logger.info(`Successfully found workout plan with numeric ID: ${workoutPlan2.id}`);
      logger.info(`Workout name: ${workoutPlan2.name}`);
    } else {
      console.log("No workout plan found with ID 2");
      logger.warn("No workout plan found with ID 2");
    }
  } catch (error) {
    console.error(`Error while testing repository: ${error.message}`);
    console.error(error);
    logger.error(`Error while testing repository: ${error.message}`);
  } finally {
    // Close connection
    await AppDataSource.destroy();
    console.log("Test completed and connection closed");
    logger.info("Test completed and connection closed");
  }
}

// Run the test
testRepository().catch(error => {
  console.error(`Unhandled error in test: ${error.message}`);
  console.error(error);
  logger.error(`Unhandled error in test: ${error.message}`);
}); 