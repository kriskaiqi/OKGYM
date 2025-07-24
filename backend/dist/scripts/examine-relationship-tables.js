"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function examineRelationshipTables() {
    try {
        logger_1.default.info("Initializing database connection");
        await data_source_1.AppDataSource.initialize();
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const relatedTables = [
                'exercises',
                'equipment',
                'equipment_muscle_groups',
                'exercise_equipment',
                'exercise_category',
                'exercise_categories'
            ];
            for (const tableName of relatedTables) {
                try {
                    const checkTable = await queryRunner.query(`SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = $1
            )`, [tableName]);
                    if (checkTable[0].exists) {
                        logger_1.default.info(`----- Table ${tableName} exists -----`);
                        const columns = await queryRunner.query(`SELECT column_name, data_type, is_nullable 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = $1`, [tableName]);
                        logger_1.default.info(`Columns in ${tableName}:`);
                        columns.forEach((col) => {
                            logger_1.default.info(`  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
                        });
                        const sampleData = await queryRunner.query(`SELECT * FROM ${tableName} LIMIT 5`);
                        if (sampleData.length > 0) {
                            logger_1.default.info(`Sample data from ${tableName} (first ${sampleData.length} rows):`);
                            sampleData.forEach((row, index) => {
                                logger_1.default.info(`  Row ${index + 1}: ${JSON.stringify(row)}`);
                            });
                        }
                        else {
                            logger_1.default.info(`No data found in ${tableName}`);
                        }
                    }
                    else {
                        logger_1.default.info(`Table ${tableName} does not exist`);
                    }
                }
                catch (error) {
                    logger_1.default.warn(`Error examining table ${tableName}:`, error);
                }
                logger_1.default.info('');
            }
        }
        catch (error) {
            logger_1.default.error("Error examining relationship tables:", error);
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error("Error in examineRelationshipTables:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
        }
    }
}
examineRelationshipTables();
//# sourceMappingURL=examine-relationship-tables.js.map