/**
 * Test ID Compatibility Functions
 * 
 * This file tests the ID compatibility utility functions without database operations
 */

import { 
  WorkoutPlanId, 
  idToString, 
  idsAreEqual, 
  isUUID, 
  isNumericId, 
  prepareIdForQuery,
  createIdWhereCondition
} from "./utils/idCompatibility";

// Test idToString function
console.log("Testing idToString function:");
console.log(`idToString(123) = "${idToString(123)}"`);
console.log(`idToString("abc-123") = "${idToString("abc-123")}"`);
console.log(`idToString(null) = "${idToString(null)}"`);
console.log(`idToString(undefined) = "${idToString(undefined)}"`);
console.log();

// Test idsAreEqual function
console.log("Testing idsAreEqual function:");
console.log(`idsAreEqual(123, 123) = ${idsAreEqual(123, 123)}`);
console.log(`idsAreEqual(123, "123") = ${idsAreEqual(123, "123")}`);
console.log(`idsAreEqual("abc", "abc") = ${idsAreEqual("abc", "abc")}`);
console.log(`idsAreEqual(123, 456) = ${idsAreEqual(123, 456)}`);
console.log(`idsAreEqual(123, null) = ${idsAreEqual(123, null)}`);
console.log();

// Test isUUID function
console.log("Testing isUUID function:");
console.log(`isUUID("123") = ${isUUID("123")}`);
console.log(`isUUID(123) = ${isUUID(123)}`);
console.log(`isUUID("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${isUUID("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890")}`);
console.log(`isUUID(null) = ${isUUID(null)}`);
console.log();

// Test isNumericId function
console.log("Testing isNumericId function:");
console.log(`isNumericId("123") = ${isNumericId("123")}`);
console.log(`isNumericId(123) = ${isNumericId(123)}`);
console.log(`isNumericId("abc") = ${isNumericId("abc")}`);
console.log(`isNumericId(null) = ${isNumericId(null)}`);
console.log();

// Test prepareIdForQuery function
console.log("Testing prepareIdForQuery function:");
console.log(`typeof prepareIdForQuery("123") = ${typeof prepareIdForQuery("123")}`);
console.log(`prepareIdForQuery("123") = ${prepareIdForQuery("123")}`);
console.log(`typeof prepareIdForQuery(123) = ${typeof prepareIdForQuery(123)}`);
console.log(`prepareIdForQuery(123) = ${prepareIdForQuery(123)}`);
console.log(`typeof prepareIdForQuery("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${typeof prepareIdForQuery("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890")}`);
console.log(`prepareIdForQuery("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${prepareIdForQuery("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890")}`);
console.log();

// Test createIdWhereCondition function
console.log("Testing createIdWhereCondition function:");
console.log(`createIdWhereCondition(123) = ${JSON.stringify(createIdWhereCondition(123))}`);
console.log(`createIdWhereCondition("123") = ${JSON.stringify(createIdWhereCondition("123"))}`);
console.log(`createIdWhereCondition("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${JSON.stringify(createIdWhereCondition("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"))}`);
console.log();

// Test with type annotations
const numericId: WorkoutPlanId = 123;
const stringId: WorkoutPlanId = "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890";

console.log("Testing with type annotations:");
console.log(`createIdWhereCondition(numericId) = ${JSON.stringify(createIdWhereCondition(numericId))}`);
console.log(`createIdWhereCondition(stringId) = ${JSON.stringify(createIdWhereCondition(stringId))}`);
console.log(); 