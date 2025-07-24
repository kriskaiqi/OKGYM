import { AppDataSource } from '../../data-source';
import { Equipment } from '../../models/Equipment';
import logger from '../../utils/logger';

async function countEquipment(): Promise<void> {
  try {
    // Initialize the data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    // Get equipment count
    const equipmentRepository = AppDataSource.getRepository(Equipment);
    const count = await equipmentRepository.count();
    logger.info(`Total equipment items in database: ${count}`);

    if (count > 0) {
      // Get all equipment names to verify what's available
      const equipment = await equipmentRepository.find({ select: ['id', 'name', 'category'] });
      logger.info('Equipment items:');
      equipment.forEach(item => {
        logger.info(`- ${item.name} (${item.category})`);
      });
    }

    // Also check exercise_equipment junction table
    const junctionCount = await AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_equipment"
    `);
    logger.info(`Total exercise-equipment relationships: ${junctionCount[0].count}`);

    // Shutdown connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error counting equipment:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the function
countEquipment()
  .then(() => {
    logger.info('Equipment count check completed successfully');
    process.exit(0);
  })
  .catch(error => {
    logger.error('Failed to check equipment count:', error);
    process.exit(1);
  }); 