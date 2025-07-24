"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const seedExerciseEquipment_1 = require("../seed/seedExerciseEquipment");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function main() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection established');
        }
        logger_1.default.info('Running seedExerciseEquipment function...');
        await (0, seedExerciseEquipment_1.seedExerciseEquipment)();
        logger_1.default.info('Successfully completed exercise equipment seeding');
        await data_source_1.AppDataSource.destroy();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error running seedExerciseEquipment function:', error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
        process.exit(1);
    }
}
main()
    .then(() => {
    process.exit(0);
})
    .catch(error => {
    logger_1.default.error('Unhandled error in main process:', error);
    process.exit(1);
});
//# sourceMappingURL=run-exercise-equipment-seed.js.map