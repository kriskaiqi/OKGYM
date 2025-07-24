"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInitialTables1709657000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateInitialTables1709657000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "exercises",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "name",
                    type: "varchar",
                },
                {
                    name: "type",
                    type: "varchar",
                },
                {
                    name: "defaultDuration",
                    type: "integer",
                },
                {
                    name: "description",
                    type: "text",
                },
                {
                    name: "difficulty",
                    type: "varchar",
                },
                {
                    name: "metadata",
                    type: "jsonb",
                    isNullable: true,
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
            ],
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
            name: "exercise_details",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "exercise_id",
                    type: "uuid",
                },
                {
                    name: "key",
                    type: "varchar",
                },
                {
                    name: "value",
                    type: "jsonb",
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
            ],
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
            name: "workout_plans",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "name",
                    type: "varchar",
                },
                {
                    name: "description",
                    type: "text",
                },
                {
                    name: "difficulty",
                    type: "varchar",
                },
                {
                    name: "metadata",
                    type: "jsonb",
                    isNullable: true,
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
            ],
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
            name: "workout_exercises",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "workout_plan_id",
                    type: "uuid",
                },
                {
                    name: "exercise_id",
                    type: "uuid",
                },
                {
                    name: "set_index",
                    type: "integer",
                },
                {
                    name: "duration",
                    type: "integer",
                },
                {
                    name: "order",
                    type: "integer",
                },
                {
                    name: "settings",
                    type: "jsonb",
                    isNullable: true,
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
            ],
        }), true);
        await queryRunner.createForeignKey("exercise_details", new typeorm_1.TableForeignKey({
            columnNames: ["exercise_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "exercises",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey("workout_exercises", new typeorm_1.TableForeignKey({
            columnNames: ["workout_plan_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "workout_plans",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey("workout_exercises", new typeorm_1.TableForeignKey({
            columnNames: ["exercise_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "exercises",
            onDelete: "CASCADE",
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("workout_exercises");
        await queryRunner.dropTable("workout_plans");
        await queryRunner.dropTable("exercise_details");
        await queryRunner.dropTable("exercises");
    }
}
exports.CreateInitialTables1709657000000 = CreateInitialTables1709657000000;
//# sourceMappingURL=1709657000000-CreateInitialTables.js.map