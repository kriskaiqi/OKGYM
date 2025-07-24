import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeWorkoutSessionNullable1757123456789 implements MigrationInterface {
    name = 'MakeWorkoutSessionNullable1757123456789';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, remove the foreign key constraint
        await queryRunner.query(`ALTER TABLE "achievement" DROP CONSTRAINT IF EXISTS "FK_achievement_workout_session"`);
        
        // Make the workout_session_id column nullable
        await queryRunner.query(`ALTER TABLE "achievement" ALTER COLUMN "workout_session_id" DROP NOT NULL`);
        
        // Re-add the foreign key constraint with the ON DELETE SET NULL option
        await queryRunner.query(`ALTER TABLE "achievement" ADD CONSTRAINT "FK_achievement_workout_session" 
            FOREIGN KEY ("workout_session_id") REFERENCES "workout_sessions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        
        // Log that the migration has run
        console.log("The workout_session_id column in the achievement table is now nullable.");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // First, remove the foreign key constraint
        await queryRunner.query(`ALTER TABLE "achievement" DROP CONSTRAINT IF EXISTS "FK_achievement_workout_session"`);
        
        // Make the workout_session_id column NOT NULL again
        // Note: This might fail if there are records with NULL values
        await queryRunner.query(`ALTER TABLE "achievement" ALTER COLUMN "workout_session_id" SET NOT NULL`);
        
        // Re-add the foreign key constraint without the ON DELETE SET NULL option
        await queryRunner.query(`ALTER TABLE "achievement" ADD CONSTRAINT "FK_achievement_workout_session" 
            FOREIGN KEY ("workout_session_id") REFERENCES "workout_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // Log that the migration has been reverted
        console.log("The workout_session_id column in the achievement table is no longer nullable.");
    }
} 