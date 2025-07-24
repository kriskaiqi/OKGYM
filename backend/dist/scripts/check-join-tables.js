"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function findJoinTables() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Database connection established.');
        console.log('\nSearching for potential exercise-category join tables:');
        const joinTables = await data_source_1.AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name LIKE '%exercise%category%' OR table_name LIKE '%category%exercise%')
    `);
        if (joinTables.length > 0) {
            console.log('Found potential join tables:');
            joinTables.forEach((table) => {
                console.log(`- ${table.table_name}`);
            });
            if (joinTables.length > 0) {
                const tableName = joinTables[0].table_name;
                console.log(`\nSchema for table ${tableName}:`);
                const columns = await data_source_1.AppDataSource.query(`SELECT column_name, data_type 
           FROM information_schema.columns 
           WHERE table_name = $1`, [tableName]);
                columns.forEach((column) => {
                    console.log(`- ${column.column_name} (${column.data_type})`);
                });
            }
        }
        else {
            console.log('No direct join tables found with "exercise" and "category" in the name.');
        }
        console.log('\nChecking exercise_relations table:');
        try {
            const relationsColumns = await data_source_1.AppDataSource.query(`SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_name = 'exercise_relations'`);
            console.log('Columns in exercise_relations:');
            relationsColumns.forEach((column) => {
                console.log(`- ${column.column_name} (${column.data_type})`);
            });
            console.log('\nSample data from exercise_relations:');
            const sampleData = await data_source_1.AppDataSource.query(`SELECT * FROM exercise_relations LIMIT 5`);
            console.log(JSON.stringify(sampleData, null, 2));
        }
        catch (error) {
            console.error('Error checking exercise_relations:', error.message);
        }
        console.log('\nChecking exercises table for relationship columns:');
        const exerciseColumns = await data_source_1.AppDataSource.query(`SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'exercises' 
         AND (column_name LIKE '%category%' OR column_name LIKE '%relation%')`);
        if (exerciseColumns.length > 0) {
            console.log('Found relevant columns in exercises table:');
            exerciseColumns.forEach((column) => {
                console.log(`- ${column.column_name} (${column.data_type})`);
            });
        }
        else {
            console.log('No category-related columns found in exercises table.');
        }
        console.log('\nChecking for foreign keys:');
        const foreignKeys = await data_source_1.AppDataSource.query(`
      SELECT
          tc.table_schema, 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ((tc.table_name = 'exercises' AND ccu.table_name = 'exercise_categories') 
          OR (tc.table_name = 'exercise_categories' AND ccu.table_name = 'exercises')
          OR (tc.table_name LIKE '%exercise%category%'))
    `);
        if (foreignKeys.length > 0) {
            console.log('Found relevant foreign keys:');
            foreignKeys.forEach((fk) => {
                console.log(`- ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            });
        }
        else {
            console.log('No direct foreign keys found connecting exercises and categories.');
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
findJoinTables().catch(console.error);
//# sourceMappingURL=check-join-tables.js.map