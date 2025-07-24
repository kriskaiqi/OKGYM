import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateExerciseEnums1709900000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the type column exists and is an enum
        const typeColumnExists = await queryRunner.hasColumn("exercises", "type");
        
        if (typeColumnExists) {
            // First, temporarily change the column to varchar
            await queryRunner.query(`ALTER TABLE "exercises" ALTER COLUMN "type" TYPE varchar`);

            // Update the values
            await queryRunner.query(`
                UPDATE "exercises" 
                SET "type" = CASE 
                    WHEN "type" = 'REPS_BASED' THEN 'REPS'
                    WHEN "type" = 'TIME_BASED' THEN 'TIME'
                    ELSE "type"
                END
            `);

            // Drop the old enum type if it exists
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."exercises_type_enum" CASCADE`);

            // Create new enum type
            await queryRunner.query(`CREATE TYPE "public"."exercises_type_enum" AS ENUM('REPS', 'TIME')`);

            // Convert column back to enum
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ALTER COLUMN "type" TYPE "exercises_type_enum" 
                USING "type"::"exercises_type_enum"
            `);

            // Set default value
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ALTER COLUMN "type" SET DEFAULT 'REPS'
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const typeColumnExists = await queryRunner.hasColumn("exercises", "type");
        
        if (typeColumnExists) {
            // First, change to varchar
            await queryRunner.query(`ALTER TABLE "exercises" ALTER COLUMN "type" TYPE varchar`);

            // Revert the values
            await queryRunner.query(`
                UPDATE "exercises" 
                SET "type" = CASE 
                    WHEN "type" = 'REPS' THEN 'REPS_BASED'
                    WHEN "type" = 'TIME' THEN 'TIME_BASED'
                    ELSE "type"
                END
            `);

            // Drop the new enum type
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."exercises_type_enum" CASCADE`);

            // Create old enum type
            await queryRunner.query(`CREATE TYPE "public"."exercises_type_enum" AS ENUM('REPS_BASED', 'TIME_BASED')`);

            // Convert column back to enum
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ALTER COLUMN "type" TYPE "exercises_type_enum" 
                USING "type"::"exercises_type_enum"
            `);

            // Set default value
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ALTER COLUMN "type" SET DEFAULT 'REPS_BASED'
            `);
        }
    }
}