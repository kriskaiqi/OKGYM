"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
async function verifyPrimaryKeyChange() {
    const dataSource = new typeorm_1.DataSource({
        type: "postgres",
        host: config_1.config.database.host,
        port: config_1.config.database.port,
        username: config_1.config.database.username,
        password: config_1.config.database.password,
        database: config_1.config.database.database,
        synchronize: false,
        logging: true,
    });
    try {
        await dataSource.initialize();
        console.log("Data Source has been initialized!");
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const pkResult = await queryRunner.query(`
                SELECT 
                    tc.constraint_name, 
                    tc.table_name
                FROM 
                    information_schema.table_constraints tc
                WHERE 
                    tc.table_name = 'workout_plans' 
                    AND tc.constraint_type = 'PRIMARY KEY';
            `);
            console.log("Primary Key Constraint for workout_plans:");
            console.log(JSON.stringify(pkResult, null, 2));
            const fkResult = await queryRunner.query(`
                SELECT
                    tc.constraint_name,
                    tc.table_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name,
                    rc.delete_rule
                FROM 
                    information_schema.table_constraints AS tc
                JOIN 
                    information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                JOIN 
                    information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                JOIN
                    information_schema.referential_constraints AS rc
                    ON rc.constraint_name = tc.constraint_name
                WHERE 
                    tc.constraint_type = 'FOREIGN KEY'
                    AND ccu.table_name = 'workout_plans';
            `);
            console.log("\nForeign Key Constraints referencing workout_plans:");
            console.log(JSON.stringify(fkResult, null, 2));
        }
        finally {
            await queryRunner.release();
        }
        await dataSource.destroy();
        console.log("\nData Source has been destroyed!");
    }
    catch (error) {
        console.error("Error:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}
verifyPrimaryKeyChange();
//# sourceMappingURL=verify-pk-change.js.map