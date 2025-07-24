"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function checkTables() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Database connection established.');
        const tables = await data_source_1.AppDataSource.query(`SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`);
        console.log('Tables in database:');
        tables.forEach((table) => {
            console.log(`- ${table.table_name}`);
        });
        console.log('\nExercise-related tables:');
        const exerciseTables = tables.filter((table) => table.table_name.includes('exercise'));
        exerciseTables.forEach((table) => {
            console.log(`- ${table.table_name}`);
        });
        if (exerciseTables.length > 0) {
            const tableName = exerciseTables[0].table_name;
            console.log(`\nSchema for table ${tableName}:`);
            const columns = await data_source_1.AppDataSource.query(`SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_name = $1`, [tableName]);
            columns.forEach((column) => {
                console.log(`- ${column.column_name} (${column.data_type})`);
            });
        }
        console.log('\nTest completed successfully.');
    }
    catch (error) {
        console.error('Error during test:', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log('Database connection closed.');
        }
    }
}
checkTables().catch(console.error);
//# sourceMappingURL=check-table-names.js.map