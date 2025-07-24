import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateWorkoutSessionFixed1709800000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable("workout_sessions");
        if (!tableExists) {
            console.log("workout_sessions table does not exist, skipping migration");
            return;
        }

        // Add columns if they don't exist
        const hasExerciseSequence = await queryRunner.hasColumn("workout_sessions", "exerciseSequence");
        if (!hasExerciseSequence) {
            await queryRunner.addColumn("workout_sessions", new TableColumn({
                name: "exerciseSequence",
                type: "jsonb",
                isNullable: false,
                default: '\'{"originalPlan": [], "actualSequence": []}\'::jsonb'
            }));
        }

        const hasExerciseResults = await queryRunner.hasColumn("workout_sessions", "exerciseResults");
        if (!hasExerciseResults) {
            await queryRunner.addColumn("workout_sessions", new TableColumn({
                name: "exerciseResults",
                type: "jsonb",
                isNullable: false,
                default: '\'{}\'::jsonb'
            }));
        }

        const hasSummary = await queryRunner.hasColumn("workout_sessions", "summary");
        if (!hasSummary) {
            await queryRunner.addColumn("workout_sessions", new TableColumn({
                name: "summary",
                type: "jsonb",
                isNullable: false,
                default: '\'{}\'::jsonb'
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable("workout_sessions");
        if (!tableExists) return;

        const columns = ["exerciseSequence", "exerciseResults", "summary"];
        for (const columnName of columns) {
            const hasColumn = await queryRunner.hasColumn("workout_sessions", columnName);
            if (hasColumn) {
                await queryRunner.dropColumn("workout_sessions", columnName);
            }
        }
    }
} 