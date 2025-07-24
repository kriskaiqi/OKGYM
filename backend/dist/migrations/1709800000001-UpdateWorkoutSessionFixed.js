"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWorkoutSessionFixed1709800000001 = void 0;
const typeorm_1 = require("typeorm");
class UpdateWorkoutSessionFixed1709800000001 {
    async up(queryRunner) {
        const tableExists = await queryRunner.hasTable("workout_sessions");
        if (!tableExists) {
            console.log("workout_sessions table does not exist, skipping migration");
            return;
        }
        const hasExerciseSequence = await queryRunner.hasColumn("workout_sessions", "exerciseSequence");
        if (!hasExerciseSequence) {
            await queryRunner.addColumn("workout_sessions", new typeorm_1.TableColumn({
                name: "exerciseSequence",
                type: "jsonb",
                isNullable: false,
                default: '\'{"originalPlan": [], "actualSequence": []}\'::jsonb'
            }));
        }
        const hasExerciseResults = await queryRunner.hasColumn("workout_sessions", "exerciseResults");
        if (!hasExerciseResults) {
            await queryRunner.addColumn("workout_sessions", new typeorm_1.TableColumn({
                name: "exerciseResults",
                type: "jsonb",
                isNullable: false,
                default: '\'{}\'::jsonb'
            }));
        }
        const hasSummary = await queryRunner.hasColumn("workout_sessions", "summary");
        if (!hasSummary) {
            await queryRunner.addColumn("workout_sessions", new typeorm_1.TableColumn({
                name: "summary",
                type: "jsonb",
                isNullable: false,
                default: '\'{}\'::jsonb'
            }));
        }
    }
    async down(queryRunner) {
        const tableExists = await queryRunner.hasTable("workout_sessions");
        if (!tableExists)
            return;
        const columns = ["exerciseSequence", "exerciseResults", "summary"];
        for (const columnName of columns) {
            const hasColumn = await queryRunner.hasColumn("workout_sessions", columnName);
            if (hasColumn) {
                await queryRunner.dropColumn("workout_sessions", columnName);
            }
        }
    }
}
exports.UpdateWorkoutSessionFixed1709800000001 = UpdateWorkoutSessionFixed1709800000001;
//# sourceMappingURL=1709800000001-UpdateWorkoutSessionFixed.js.map