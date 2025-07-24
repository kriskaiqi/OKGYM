"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../data-source");
const Exercise_1 = require("../../models/Exercise");
const logger_1 = __importDefault(require("../../utils/logger"));
async function checkExerciseEquipment() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        const relationships = await data_source_1.AppDataSource.query(`
      SELECT e.name as exercise_name, eq.name as equipment_name
      FROM exercise_equipment ee
      JOIN exercises e ON ee.exercise_id = e.id
      JOIN equipment eq ON ee.equipment_id = eq.id
      ORDER BY e.name
    `);
        logger_1.default.info(`Found ${relationships.length} exercise-equipment relationships`);
        const exerciseEquipmentMap = new Map();
        relationships.forEach((rel) => {
            var _a;
            if (!exerciseEquipmentMap.has(rel.exercise_name)) {
                exerciseEquipmentMap.set(rel.exercise_name, []);
            }
            (_a = exerciseEquipmentMap.get(rel.exercise_name)) === null || _a === void 0 ? void 0 : _a.push(rel.equipment_name);
        });
        logger_1.default.info(`Exercise to equipment mappings:`);
        for (const [exerciseName, equipmentList] of exerciseEquipmentMap.entries()) {
            logger_1.default.info(`- ${exerciseName}: ${equipmentList.join(', ')}`);
        }
        const totalExercises = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).count();
        const exercisesWithEquipment = exerciseEquipmentMap.size;
        const coveragePercentage = (exercisesWithEquipment / totalExercises) * 100;
        logger_1.default.info(`Equipment coverage: ${exercisesWithEquipment}/${totalExercises} exercises (${coveragePercentage.toFixed(2)}%)`);
        await data_source_1.AppDataSource.destroy();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error checking exercise equipment:', error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
        process.exit(1);
    }
}
checkExerciseEquipment()
    .then(() => {
    logger_1.default.info('Exercise equipment check completed successfully');
    process.exit(0);
})
    .catch(error => {
    logger_1.default.error('Failed to check exercise equipment:', error);
    process.exit(1);
});
//# sourceMappingURL=check-exercise-equipment.js.map