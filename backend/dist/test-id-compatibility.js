"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const idCompatibility_1 = require("./utils/idCompatibility");
console.log("Testing idToString function:");
console.log(`idToString(123) = "${(0, idCompatibility_1.idToString)(123)}"`);
console.log(`idToString("abc-123") = "${(0, idCompatibility_1.idToString)("abc-123")}"`);
console.log(`idToString(null) = "${(0, idCompatibility_1.idToString)(null)}"`);
console.log(`idToString(undefined) = "${(0, idCompatibility_1.idToString)(undefined)}"`);
console.log();
console.log("Testing idsAreEqual function:");
console.log(`idsAreEqual(123, 123) = ${(0, idCompatibility_1.idsAreEqual)(123, 123)}`);
console.log(`idsAreEqual(123, "123") = ${(0, idCompatibility_1.idsAreEqual)(123, "123")}`);
console.log(`idsAreEqual("abc", "abc") = ${(0, idCompatibility_1.idsAreEqual)("abc", "abc")}`);
console.log(`idsAreEqual(123, 456) = ${(0, idCompatibility_1.idsAreEqual)(123, 456)}`);
console.log(`idsAreEqual(123, null) = ${(0, idCompatibility_1.idsAreEqual)(123, null)}`);
console.log();
console.log("Testing isUUID function:");
console.log(`isUUID("123") = ${(0, idCompatibility_1.isUUID)("123")}`);
console.log(`isUUID(123) = ${(0, idCompatibility_1.isUUID)(123)}`);
console.log(`isUUID("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${(0, idCompatibility_1.isUUID)("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890")}`);
console.log(`isUUID(null) = ${(0, idCompatibility_1.isUUID)(null)}`);
console.log();
console.log("Testing isNumericId function:");
console.log(`isNumericId("123") = ${(0, idCompatibility_1.isNumericId)("123")}`);
console.log(`isNumericId(123) = ${(0, idCompatibility_1.isNumericId)(123)}`);
console.log(`isNumericId("abc") = ${(0, idCompatibility_1.isNumericId)("abc")}`);
console.log(`isNumericId(null) = ${(0, idCompatibility_1.isNumericId)(null)}`);
console.log();
console.log("Testing prepareIdForQuery function:");
console.log(`typeof prepareIdForQuery("123") = ${typeof (0, idCompatibility_1.prepareIdForQuery)("123")}`);
console.log(`prepareIdForQuery("123") = ${(0, idCompatibility_1.prepareIdForQuery)("123")}`);
console.log(`typeof prepareIdForQuery(123) = ${typeof (0, idCompatibility_1.prepareIdForQuery)(123)}`);
console.log(`prepareIdForQuery(123) = ${(0, idCompatibility_1.prepareIdForQuery)(123)}`);
console.log(`typeof prepareIdForQuery("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${typeof (0, idCompatibility_1.prepareIdForQuery)("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890")}`);
console.log(`prepareIdForQuery("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${(0, idCompatibility_1.prepareIdForQuery)("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890")}`);
console.log();
console.log("Testing createIdWhereCondition function:");
console.log(`createIdWhereCondition(123) = ${JSON.stringify((0, idCompatibility_1.createIdWhereCondition)(123))}`);
console.log(`createIdWhereCondition("123") = ${JSON.stringify((0, idCompatibility_1.createIdWhereCondition)("123"))}`);
console.log(`createIdWhereCondition("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890") = ${JSON.stringify((0, idCompatibility_1.createIdWhereCondition)("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"))}`);
console.log();
const numericId = 123;
const stringId = "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890";
console.log("Testing with type annotations:");
console.log(`createIdWhereCondition(numericId) = ${JSON.stringify((0, idCompatibility_1.createIdWhereCondition)(numericId))}`);
console.log(`createIdWhereCondition(stringId) = ${JSON.stringify((0, idCompatibility_1.createIdWhereCondition)(stringId))}`);
console.log();
//# sourceMappingURL=test-id-compatibility.js.map