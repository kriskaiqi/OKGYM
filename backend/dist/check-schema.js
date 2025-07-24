"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const logger_1 = __importDefault(require("./utils/logger"));
async function checkSchema() {
    try {
        await data_source_1.AppDataSource.initialize();
        logger_1.default.info('Database connected successfully');
        const result = await data_source_1.AppDataSource.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'workout_plans'
      ORDER BY ordinal_position;
    `);
        console.log(JSON.stringify(result, null, 2));
        const workoutPlanMetadata = data_source_1.AppDataSource.getMetadata('workout_plans');
        logger_1.default.info(`Entity name: ${workoutPlanMetadata.name}`);
        logger_1.default.info(`Table name: ${workoutPlanMetadata.tableName}`);
        logger_1.default.info('Columns:');
        workoutPlanMetadata.columns.forEach(column => {
            logger_1.default.info(`- ${column.propertyName}: ${column.type} (${column.isPrimary ? 'PK' : 'not PK'})`);
        });
        await data_source_1.AppDataSource.destroy();
    }
    catch (error) {
        logger_1.default.error('Error checking schema:', error);
    }
}
checkSchema();
//# sourceMappingURL=check-schema.js.map