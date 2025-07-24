import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateInitialTables1709657000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create exercises table
        await queryRunner.createTable(
            new Table({
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
            }),
            true
        );

        // Create exercise_details table
        await queryRunner.createTable(
            new Table({
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
            }),
            true
        );

        // Create workout_plans table
        await queryRunner.createTable(
            new Table({
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
            }),
            true
        );

        // Create workout_exercises table
        await queryRunner.createTable(
            new Table({
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
            }),
            true
        );

        // Add foreign key constraints
        await queryRunner.createForeignKey(
            "exercise_details",
            new TableForeignKey({
                columnNames: ["exercise_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "exercises",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "workout_exercises",
            new TableForeignKey({
                columnNames: ["workout_plan_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "workout_plans",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "workout_exercises",
            new TableForeignKey({
                columnNames: ["exercise_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "exercises",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.dropTable("workout_exercises");
        await queryRunner.dropTable("workout_plans");
        await queryRunner.dropTable("exercise_details");
        await queryRunner.dropTable("exercises");
    }
} 