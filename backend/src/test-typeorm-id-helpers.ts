/**
 * Test TypeORM ID Helpers
 * 
 * This file tests the TypeORM ID helper functions without database operations
 */

import { 
  createIdCondition,
  createIdsInCondition,
  createIdNotCondition,
  createRelationIdCondition,
  applyIdCondition
} from './utils/typeorm-id-helpers';

// Test createIdCondition
console.log("Testing createIdCondition:");
console.log(`createIdCondition(123) = ${JSON.stringify(createIdCondition(123))}`);
console.log(`createIdCondition("123") = ${JSON.stringify(createIdCondition("123"))}`);
console.log(`createIdCondition("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${JSON.stringify(createIdCondition("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"))}`);
console.log(`createIdCondition(123, "planId") = ${JSON.stringify(createIdCondition(123, "planId"))}`);
console.log();

// Test createIdsInCondition
console.log("Testing createIdsInCondition:");
console.log(`createIdsInCondition([1, 2, 3]) = ${JSON.stringify(createIdsInCondition([1, 2, 3]), null, 2)}`);
console.log(`createIdsInCondition(["1", "2", "3"]) = ${JSON.stringify(createIdsInCondition(["1", "2", "3"]), null, 2)}`);
console.log(`createIdsInCondition([1, "2", "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"]) = ${JSON.stringify(createIdsInCondition([1, "2", "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"]), null, 2)}`);
console.log();

// Test createIdNotCondition
console.log("Testing createIdNotCondition:");
console.log(`createIdNotCondition(123) = ${JSON.stringify(createIdNotCondition(123))}`);
console.log(`createIdNotCondition("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${JSON.stringify(createIdNotCondition("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"))}`);
console.log();

// Test createRelationIdCondition
console.log("Testing createRelationIdCondition:");
console.log(`createRelationIdCondition("workoutPlan", 123) = ${JSON.stringify(createRelationIdCondition("workoutPlan", 123))}`);
console.log(`createRelationIdCondition("exercise", "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${JSON.stringify(createRelationIdCondition("exercise", "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"))}`);
console.log();

// Test applyIdCondition
console.log("Testing applyIdCondition:");
const existingCondition = { isActive: true, difficulty: "INTERMEDIATE" };
console.log(`Original condition: ${JSON.stringify(existingCondition)}`);
console.log(`After applyIdCondition: ${JSON.stringify(applyIdCondition(existingCondition, "id", 123))}`);
console.log(`After applyIdCondition with UUID: ${JSON.stringify(applyIdCondition(existingCondition, "creatorId", "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"))}`);
console.log(); 