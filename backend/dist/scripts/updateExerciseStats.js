"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const seedExercises_1 = require("../seed/seedExercises");
const logger_1 = __importDefault(require("../utils/logger"));
async function main() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            logger_1.default.info('Initializing database connection...');
            await data_source_1.AppDataSource.initialize();
        }
        logger_1.default.info('Starting exercise stats update process...');
        await (0, seedExercises_1.updateExerciseStats)();
        logger_1.default.info('Exercise stats update completed successfully!');
        await data_source_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        logger_1.default.error('Failed to update exercise stats:', error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
        process.exit(1);
    }
}
main();
//# sourceMappingURL=updateExerciseStats.js.map