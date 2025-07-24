"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const seedAudioCues_1 = require("../seed/seedAudioCues");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedAudioOnly() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        await (0, seedAudioCues_1.seedAudioCues)();
        logger_1.default.info('Audio cues seeded successfully');
    }
    catch (error) {
        logger_1.default.error('Error seeding audio cues:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed');
        }
        process.exit(0);
    }
}
//# sourceMappingURL=seed-audio.js.map