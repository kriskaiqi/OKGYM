"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUsersTable1710169200000 = void 0;
const typeorm_1 = require("typeorm");
class CreateUsersTable1710169200000 {
    async up(queryRunner) {
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE user_role_enum AS ENUM ('user', 'admin');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await queryRunner.createTable(new typeorm_1.Table({
            name: "users",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "email",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "password",
                    type: "varchar"
                },
                {
                    name: "firstName",
                    type: "varchar"
                },
                {
                    name: "lastName",
                    type: "varchar"
                },
                {
                    name: "role",
                    type: "user_role_enum",
                    default: "'user'"
                },
                {
                    name: "fitnessProfile",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable("users");
        await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
    }
}
exports.CreateUsersTable1710169200000 = CreateUsersTable1710169200000;
//# sourceMappingURL=1710169200000-CreateUsersTable.js.map