"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWorkoutSession1709800000000 = void 0;
const typeorm_1 = require("typeorm");
class UpdateWorkoutSession1709800000000 {
    async up(queryRunner) {
        await queryRunner.addColumns("workout_sessions", [
            new typeorm_1.TableColumn({
                name: "exerciseSequence",
                type: "jsonb",
                isNullable: false,
                default: '\'{"originalPlan": [], "actualSequence": []}\'::jsonb'
            }),
            new typeorm_1.TableColumn({
                name: "exerciseResults",
                type: "jsonb",
                isNullable: false,
                default: '\'[]\'::jsonb'
            }),
            new typeorm_1.TableColumn({
                name: "summary",
                type: "jsonb",
                isNullable: false,
                default: '\'{}\'::jsonb'
            })
        ]);
    }
    async down(queryRunner) {
        await queryRunner.dropColumns("workout_sessions", [
            "exerciseSequence",
            "exerciseResults",
            "summary"
        ]);
    }
}
exports.UpdateWorkoutSession1709800000000 = UpdateWorkoutSession1709800000000;
//# sourceMappingURL=1709800000000-UpdateWorkoutSession.js.map