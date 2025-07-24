"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../data-source");
const Equipment_1 = require("../../models/Equipment");
const logger_1 = __importDefault(require("../../utils/logger"));
async function countEquipment() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        const equipmentRepository = data_source_1.AppDataSource.getRepository(Equipment_1.Equipment);
        const count = await equipmentRepository.count();
        logger_1.default.info(`Total equipment items in database: ${count}`);
        if (count > 0) {
            const equipment = await equipmentRepository.find({ select: ['id', 'name', 'category'] });
            logger_1.default.info('Equipment items:');
            equipment.forEach(item => {
                logger_1.default.info(`- ${item.name} (${item.category})`);
            });
        }
        const junctionCount = await data_source_1.AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_equipment"
    `);
        logger_1.default.info(`Total exercise-equipment relationships: ${junctionCount[0].count}`);
        await data_source_1.AppDataSource.destroy();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error counting equipment:', error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
        process.exit(1);
    }
}
countEquipment()
    .then(() => {
    logger_1.default.info('Equipment count check completed successfully');
    process.exit(0);
})
    .catch(error => {
    logger_1.default.error('Failed to check equipment count:', error);
    process.exit(1);
});
//# sourceMappingURL=equipment-count.js.map