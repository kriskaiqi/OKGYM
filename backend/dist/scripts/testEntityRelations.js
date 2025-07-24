"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../data-source");
const WorkoutSession_1 = require("../models/WorkoutSession");
const MetricTracking_1 = require("../models/MetricTracking");
async function testEntityRelations() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("Database connection initialized");
        const workoutSessionRepo = data_source_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSession);
        const session = await workoutSessionRepo.findOne({
            where: {},
            relations: {
                metrics: true
            }
        });
        console.log("WorkoutSession entity validated");
        const metricRepo = data_source_1.AppDataSource.getRepository(MetricTracking_1.MetricTracking);
        const metric = await metricRepo.findOne({
            where: {},
            relations: {
                workoutSession: true
            }
        });
        console.log("MetricTracking entity validated");
        console.log("Entity relations test completed successfully");
    }
    catch (error) {
        console.error("Entity relation test failed:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log("Database connection closed");
        }
    }
}
testEntityRelations().catch(error => {
    console.error("Failed to run test:", error);
    process.exit(1);
});
//# sourceMappingURL=testEntityRelations.js.map