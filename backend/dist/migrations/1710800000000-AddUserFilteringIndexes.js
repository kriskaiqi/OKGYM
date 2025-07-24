"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserFilteringIndexes1710800000000 = void 0;
class AddUserFilteringIndexes1710800000000 {
    constructor() {
        this.name = 'AddUserFilteringIndexes1710800000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_role" ON "users" ("role")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_status" ON "users" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_first_name" ON "users" ("first_name")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_last_name" ON "users" ("last_name")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_gender" ON "users" ("gender")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_activity_level" ON "users" ("activity_level")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_fitness_level" ON "users" ("fitness_level")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_preferences" ON "users" USING GIN ("preferences")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_user_created_at" ON "users" ("created_at")
        `);
        console.log('Migration AddUserFilteringIndexes1710800000000 completed successfully');
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_role"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_first_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_last_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_gender"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_activity_level"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_fitness_level"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_preferences"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_created_at"`);
        console.log('Migration AddUserFilteringIndexes1710800000000 rolled back successfully');
    }
}
exports.AddUserFilteringIndexes1710800000000 = AddUserFilteringIndexes1710800000000;
//# sourceMappingURL=1710800000000-AddUserFilteringIndexes.js.map