"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const User_1 = require("../models/User");
const logger_1 = __importDefault(require("../utils/logger"));
async function resetUsersTable() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const countBefore = await userRepository.count();
        logger_1.default.info(`Current user count: ${countBefore}`);
        await data_source_1.AppDataSource.query('TRUNCATE TABLE "users" CASCADE');
        logger_1.default.info(`Successfully deleted all users from the database with CASCADE`);
        const countAfter = await userRepository.count();
        logger_1.default.info(`User count after reset: ${countAfter}`);
        await data_source_1.AppDataSource.destroy();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error resetting users table:', error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed after error');
        }
        throw error;
    }
}
resetUsersTable()
    .then(() => {
    console.log('Users table reset completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('Failed to reset users table:', error);
    process.exit(1);
});
//# sourceMappingURL=reset-users.js.map