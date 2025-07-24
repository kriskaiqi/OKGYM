import { DataSource } from "typeorm";
import { config } from "../config";

async function getDependencies(queryRunner: any, tableName: string) {
    const result = await queryRunner.query(`
        SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = $1 OR ccu.table_name = $1
    `, [tableName]);
    return result;
}

async function dropConstraint(queryRunner: any, constraintName: string) {
    try {
        await queryRunner.query(`ALTER TABLE "workout_plans" DROP CONSTRAINT IF EXISTS "${constraintName}"`);
        console.log(`Dropped constraint: ${constraintName}`);
    } catch (error) {
        console.error(`Error dropping constraint ${constraintName}:`, error);
    }
}

async function fixWorkoutPlanPK() {
    const dataSource = new DataSource({
        type: "postgres",
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        synchronize: false,
        logging: true,
    });

    try {
        await dataSource.initialize();
        console.log("Data Source has been initialized!");

        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Get all dependencies
            const dependencies = await getDependencies(queryRunner, "workout_plans");
            console.log("Found dependencies:", dependencies);

            // Drop all foreign key constraints first
            for (const dep of dependencies) {
                if (dep.constraint_name !== "PK_9ae1bdd02db446a7541e2e5b161") {
                    await dropConstraint(queryRunner, dep.constraint_name);
                }
            }

            // Drop the primary key constraint
            await dropConstraint(queryRunner, "PK_9ae1bdd02db446a7541e2e5b161");

            // Add the new primary key constraint
            await queryRunner.query(`
                ALTER TABLE "workout_plans" 
                ADD CONSTRAINT "PK_workout_plans" 
                PRIMARY KEY ("id")
            `);

            // Recreate all foreign key constraints
            for (const dep of dependencies) {
                if (dep.constraint_name !== "PK_9ae1bdd02db446a7541e2e5b161") {
                    await queryRunner.query(`
                        ALTER TABLE "${dep.table_name}"
                        ADD CONSTRAINT "${dep.constraint_name}"
                        FOREIGN KEY ("${dep.column_name}")
                        REFERENCES "${dep.foreign_table_name}"("${dep.foreign_column_name}")
                        ON DELETE CASCADE
                    `);
                }
            }

            await queryRunner.commitTransaction();
            console.log("Migration completed successfully!");
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

        await dataSource.destroy();
        console.log("Data Source has been destroyed!");
    } catch (error) {
        console.error("Error during migration:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}

fixWorkoutPlanPK(); 