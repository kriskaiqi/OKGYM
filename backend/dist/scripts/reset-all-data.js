"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function resetAllData() {
    try {
        logger_1.default.info("Initializing database connection");
        await data_source_1.AppDataSource.initialize();
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            await queryRunner.startTransaction();
            logger_1.default.info("Disabling foreign key constraints");
            await queryRunner.query(`SET CONSTRAINTS ALL DEFERRED`);
            const tablesResult = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name != 'migrations'
        ORDER BY table_name
      `);
            const tables = tablesResult.map((result) => result.table_name);
            logger_1.default.info(`Found ${tables.length} tables to truncate`);
            if (tables.length > 0) {
                const truncateQuery = `TRUNCATE TABLE ${tables.join(', ')} CASCADE`;
                logger_1.default.info(`Executing truncate query: ${truncateQuery}`);
                await queryRunner.query(truncateQuery);
                logger_1.default.info("All tables truncated successfully");
            }
            logger_1.default.info("Re-enabling foreign key constraints");
            await queryRunner.query(`SET CONSTRAINTS ALL IMMEDIATE`);
            await queryRunner.commitTransaction();
            logger_1.default.info("Database reset completed successfully");
        }
        catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            logger_1.default.error("Failed to reset database:", error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error("Error in resetAllData:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
        }
    }
}
resetAllData();
//# sourceMappingURL=reset-all-data.js.map