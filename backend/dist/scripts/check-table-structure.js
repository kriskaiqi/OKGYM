"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function checkTableStructure() {
    console.log('Checking structure of workout_sessions table...');
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Database connection established.');
        const tableInfo = await data_source_1.AppDataSource.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'workout_sessions'
      ORDER BY ordinal_position
    `);
        console.log('\nColumns in workout_sessions table:');
        tableInfo.forEach((column) => {
            console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
        });
        const countResult = await data_source_1.AppDataSource.query('SELECT COUNT(*) FROM workout_sessions');
        console.log(`\nTotal records in workout_sessions table: ${countResult[0].count}`);
        if (parseInt(countResult[0].count) > 0) {
            const sampleData = await data_source_1.AppDataSource.query('SELECT * FROM workout_sessions LIMIT 1');
            console.log('\nSample data (first row):');
            console.log(sampleData[0]);
        }
        console.log('\nCheck completed successfully.');
    }
    catch (error) {
        console.error('Error during check:', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log('Database connection closed.');
        }
    }
}
checkTableStructure().catch(console.error);
//# sourceMappingURL=check-table-structure.js.map