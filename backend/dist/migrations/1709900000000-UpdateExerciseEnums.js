"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExerciseEnums1709900000000 = void 0;
class UpdateExerciseEnums1709900000000 {
    async up(queryRunner) {
        const typeColumnExists = await queryRunner.hasColumn("exercises", "type");
        if (typeColumnExists) {
            await queryRunner.query(`ALTER TABLE "exercises" ALTER COLUMN "type" TYPE varchar`);
            await queryRunner.query(`
                UPDATE "exercises" 
                SET "type" = CASE 
                    WHEN "type" = 'REPS_BASED' THEN 'REPS'
                    WHEN "type" = 'TIME_BASED' THEN 'TIME'
                    ELSE "type"
                END
            `);
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."exercises_type_enum" CASCADE`);
            await queryRunner.query(`CREATE TYPE "public"."exercises_type_enum" AS ENUM('REPS', 'TIME')`);
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ALTER COLUMN "type" TYPE "exercises_type_enum" 
                USING "type"::"exercises_type_enum"
            `);
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ALTER COLUMN "type" SET DEFAULT 'REPS'
            `);
        }
    }
    async down(queryRunner) {
        const typeColumnExists = await queryRunner.hasColumn("exercises", "type");
        if (typeColumnExists) {
            await queryRunner.query(`ALTER TABLE "exercises" ALTER COLUMN "type" TYPE varchar`);
            await queryRunner.query(`
                UPDATE "exercises" 
                SET "type" = CASE 
                    WHEN "type" = 'REPS' THEN 'REPS_BASED'
                    WHEN "type" = 'TIME' THEN 'TIME_BASED'
                    ELSE "type"
                END
            `);
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."exercises_type_enum" CASCADE`);
            await queryRunner.query(`CREATE TYPE "public"."exercises_type_enum" AS ENUM('REPS_BASED', 'TIME_BASED')`);
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ALTER COLUMN "type" TYPE "exercises_type_enum" 
                USING "type"::"exercises_type_enum"
            `);
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ALTER COLUMN "type" SET DEFAULT 'REPS_BASED'
            `);
        }
    }
}
exports.UpdateExerciseEnums1709900000000 = UpdateExerciseEnums1709900000000;
//# sourceMappingURL=1709900000000-UpdateExerciseEnums.js.map