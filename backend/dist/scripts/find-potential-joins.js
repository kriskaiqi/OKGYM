"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function findPotentialJoinTables() {
    try {
        console.log("Database connection established.");
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            console.log("Database connection established.");
        }
        const exerciseJoinTablesQuery = `
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_name LIKE '%exercise%'
        AND table_name != 'exercises'
        AND table_name != 'exercise_details'
        AND table_name != 'exercise_form_analysis'
        AND table_name != 'exercise_specific_analysis'
    `;
        const potentialJoinTables = await data_source_1.AppDataSource.query(exerciseJoinTablesQuery);
        console.log("Potential join tables for exercises:", potentialJoinTables.map(t => t.table_name));
        for (const tableRow of potentialJoinTables) {
            const tableName = tableRow.table_name;
            const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
      `;
            const columns = await data_source_1.AppDataSource.query(columnsQuery, [tableName]);
            console.log(`\nTable: ${tableName}`);
            console.log("Columns:", columns.map(c => `${c.column_name} (${c.data_type})`));
            const foreignKeysQuery = `
        SELECT
            kcu.column_name,
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
          AND tc.table_schema = 'public'
          AND tc.table_name = $1
      `;
            const foreignKeys = await data_source_1.AppDataSource.query(foreignKeysQuery, [tableName]);
            if (foreignKeys.length > 0) {
                console.log("Foreign keys:");
                for (const fk of foreignKeys) {
                    console.log(`  ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
                }
                const exerciseFk = foreignKeys.find(fk => fk.foreign_table_name === 'exercises');
                if (exerciseFk) {
                    const otherFks = foreignKeys.filter(fk => fk.foreign_table_name !== 'exercises');
                    if (otherFks.length > 0) {
                        console.log(`\n✅ ${tableName} appears to be a join table between exercises and:`, otherFks.map(fk => fk.foreign_table_name).join(', '));
                        try {
                            const sampleDataQuery = `SELECT * FROM "${tableName}" LIMIT 5`;
                            const sampleData = await data_source_1.AppDataSource.query(sampleDataQuery);
                            console.log("Sample data:", JSON.stringify(sampleData, null, 2));
                        }
                        catch (error) {
                            console.log("Could not fetch sample data:", error.message);
                        }
                    }
                }
            }
            else {
                console.log("No foreign keys found.");
            }
        }
        console.log("\nChecking for embedded relationships in exercises table...");
        const exerciseColumnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'exercises'
    `;
        const exerciseColumns = await data_source_1.AppDataSource.query(exerciseColumnsQuery);
        const jsonColumns = exerciseColumns.filter(col => col.data_type === 'json' || col.data_type === 'jsonb');
        if (jsonColumns.length > 0) {
            console.log("JSON columns that might contain relationships:", jsonColumns.map(c => `${c.column_name} (${c.data_type})`));
            for (const jsonCol of jsonColumns) {
                try {
                    const sampleQuery = `
            SELECT id, "${jsonCol.column_name}" 
            FROM exercises 
            WHERE "${jsonCol.column_name}" IS NOT NULL 
            LIMIT 5
          `;
                    const samples = await data_source_1.AppDataSource.query(sampleQuery);
                    console.log(`\nSample data for ${jsonCol.column_name}:`, JSON.stringify(samples, null, 2));
                }
                catch (error) {
                    console.log(`Error getting sample for ${jsonCol.column_name}:`, error.message);
                }
            }
        }
        console.log("\nTest completed successfully.");
    }
    catch (error) {
        console.error("Error during database check:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log("Database connection closed.");
        }
    }
}
findPotentialJoinTables();
//# sourceMappingURL=find-potential-joins.js.map