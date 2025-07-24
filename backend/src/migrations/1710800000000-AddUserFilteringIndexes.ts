import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to add indexes for optimizing user filtering queries
 */
export class AddUserFilteringIndexes1710800000000 implements MigrationInterface {
    name = 'AddUserFilteringIndexes1710800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add index for role filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_role" ON "users" ("role")
        `);

        // Add index for status filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_status" ON "users" ("status")
        `);

        // Add index for name search (first and last name)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_first_name" ON "users" ("first_name")
        `);
        
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_last_name" ON "users" ("last_name")
        `);

        // Add index for gender filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_gender" ON "users" ("gender")
        `);

        // Add index for activity level filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_activity_level" ON "users" ("activity_level")
        `);

        // Add index for fitness level filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_fitness_level" ON "users" ("fitness_level")
        `);

        // Add GIN index for JSONB preferences (if using PostgreSQL)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_preferences" ON "users" USING GIN ("preferences")
        `);

        // Add index for created_at for default sorting
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_created_at" ON "users" ("created_at")
        `);

        // Log migration completion
        console.log('Migration AddUserFilteringIndexes1710800000000 completed successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all created indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_role"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_first_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_last_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_gender"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_activity_level"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_fitness_level"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_preferences"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_created_at"`);

        // Log rollback completion
        console.log('Migration AddUserFilteringIndexes1710800000000 rolled back successfully');
    }
} 