"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function listTables() {
    try {
        logger_1.default.info("Initializing database connection");
        await data_source_1.AppDataSource.initialize();
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const tables = await queryRunner.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
            logger_1.default.info(`Found ${tables.length} tables in the database:`);
            tables.forEach((table) => {
                logger_1.default.info(`- ${table.table_name}`);
            });
        }
        catch (error) {
            logger_1.default.error("Error listing tables:", error);
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error("Error in listTables:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
        }
    }
}
listTables();
//# sourceMappingURL=list-tables.js.map