"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const WorkoutPlanRepository_1 = require("./repositories/WorkoutPlanRepository");
const data_source_1 = require("./data-source");
const logger_1 = __importDefault(require("./utils/logger"));
async function testRepository() {
    var _a, _b;
    console.log("Starting repository test");
    logger_1.default.info("Starting repository test");
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("Data source initialized");
        logger_1.default.info("Data source initialized");
    }
    catch (error) {
        console.error(`Data source initialization error: ${error.message}`);
        logger_1.default.error(`Data source initialization error: ${error.message}`);
        return;
    }
    const workoutPlanRepo = new WorkoutPlanRepository_1.WorkoutPlanRepository();
    try {
        console.log("Testing getWithFullDetails with numeric ID 1");
        logger_1.default.info("Testing getWithFullDetails with numeric ID 1");
        const workoutPlan = await workoutPlanRepo.getWithFullDetails(1);
        if (workoutPlan) {
            console.log(`Successfully found workout plan with numeric ID: ${workoutPlan.id}`);
            console.log(`Workout name: ${workoutPlan.name}`);
            console.log(`Exercise count: ${((_a = workoutPlan.exercises) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
            logger_1.default.info(`Successfully found workout plan with numeric ID: ${workoutPlan.id}`);
            logger_1.default.info(`Workout name: ${workoutPlan.name}`);
            logger_1.default.info(`Exercise count: ${((_b = workoutPlan.exercises) === null || _b === void 0 ? void 0 : _b.length) || 0}`);
        }
        else {
            console.log("No workout plan found with ID 1");
            logger_1.default.warn("No workout plan found with ID 1");
        }
        console.log("Testing getWithFullDetails with numeric ID 2");
        logger_1.default.info("Testing getWithFullDetails with numeric ID 2");
        const workoutPlan2 = await workoutPlanRepo.getWithFullDetails(2);
        if (workoutPlan2) {
            console.log(`Successfully found workout plan with numeric ID: ${workoutPlan2.id}`);
            console.log(`Workout name: ${workoutPlan2.name}`);
            logger_1.default.info(`Successfully found workout plan with numeric ID: ${workoutPlan2.id}`);
            logger_1.default.info(`Workout name: ${workoutPlan2.name}`);
        }
        else {
            console.log("No workout plan found with ID 2");
            logger_1.default.warn("No workout plan found with ID 2");
        }
    }
    catch (error) {
        console.error(`Error while testing repository: ${error.message}`);
        console.error(error);
        logger_1.default.error(`Error while testing repository: ${error.message}`);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
        console.log("Test completed and connection closed");
        logger_1.default.info("Test completed and connection closed");
    }
}
testRepository().catch(error => {
    console.error(`Unhandled error in test: ${error.message}`);
    console.error(error);
    logger_1.default.error(`Unhandled error in test: ${error.message}`);
});
//# sourceMappingURL=test-repository.js.map