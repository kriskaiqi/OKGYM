"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeWorkoutSessionNullable1757123456789 = void 0;
class MakeWorkoutSessionNullable1757123456789 {
    constructor() {
        this.name = 'MakeWorkoutSessionNullable1757123456789';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "achievement" DROP CONSTRAINT IF EXISTS "FK_achievement_workout_session"`);
        await queryRunner.query(`ALTER TABLE "achievement" ALTER COLUMN "workout_session_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "achievement" ADD CONSTRAINT "FK_achievement_workout_session" 
            FOREIGN KEY ("workout_session_id") REFERENCES "workout_sessions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        console.log("The workout_session_id column in the achievement table is now nullable.");
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "achievement" DROP CONSTRAINT IF EXISTS "FK_achievement_workout_session"`);
        await queryRunner.query(`ALTER TABLE "achievement" ALTER COLUMN "workout_session_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "achievement" ADD CONSTRAINT "FK_achievement_workout_session" 
            FOREIGN KEY ("workout_session_id") REFERENCES "workout_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        console.log("The workout_session_id column in the achievement table is no longer nullable.");
    }
}
exports.MakeWorkoutSessionNullable1757123456789 = MakeWorkoutSessionNullable1757123456789;
//# sourceMappingURL=1757123456789-MakeWorkoutSessionNullable.js.map