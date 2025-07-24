import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWorkoutPlanPrimaryKey1709250000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop all foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "workout_exercises" DROP CONSTRAINT IF EXISTS "FK_workout_exercises_workout_plan";
            ALTER TABLE "workout_sessions" DROP CONSTRAINT IF EXISTS "FK_workout_sessions_workout_plan";
            ALTER TABLE "workout_ratings" DROP CONSTRAINT IF EXISTS "FK_workout_ratings_workout_plan";
            ALTER TABLE "program_workouts" DROP CONSTRAINT IF EXISTS "FK_program_workouts_workout_plan";
            ALTER TABLE "schedule_items" DROP CONSTRAINT IF EXISTS "FK_schedule_items_workout_plan";
            ALTER TABLE "user_favorite_workouts" DROP CONSTRAINT IF EXISTS "FK_user_favorite_workouts_workout_id";
            ALTER TABLE "user_workout_history" DROP CONSTRAINT IF EXISTS "FK_user_workout_history_workout_id";
            ALTER TABLE "workout_plan_combinations" DROP CONSTRAINT IF EXISTS "FK_workout_plan_combinations_workout_id";
            ALTER TABLE "workout_plan_combinations" DROP CONSTRAINT IF EXISTS "FK_workout_plan_combinations_related_workout_id";
            ALTER TABLE "program_workout_plans" DROP CONSTRAINT IF EXISTS "FK_program_workout_plans_workout_id";
        `);

        // Drop the primary key constraint
        await queryRunner.query(`
            ALTER TABLE "workout_plans" DROP CONSTRAINT "PK_9ae1bdd02db446a7541e2e5b161";
        `);

        // Add the new primary key constraint
        await queryRunner.query(`
            ALTER TABLE "workout_plans" ADD CONSTRAINT "PK_workout_plans" PRIMARY KEY ("id");
        `);

        // Recreate all foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "workout_exercises" ADD CONSTRAINT "FK_workout_exercises_workout_plan" 
                FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "workout_sessions" ADD CONSTRAINT "FK_workout_sessions_workout_plan" 
                FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "workout_ratings" ADD CONSTRAINT "FK_workout_ratings_workout_plan" 
                FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "program_workouts" ADD CONSTRAINT "FK_program_workouts_workout_plan" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "schedule_items" ADD CONSTRAINT "FK_schedule_items_workout_plan" 
                FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE SET NULL;
            
            ALTER TABLE "user_favorite_workouts" ADD CONSTRAINT "FK_user_favorite_workouts_workout_id" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "user_workout_history" ADD CONSTRAINT "FK_user_workout_history_workout_id" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "workout_plan_combinations" ADD CONSTRAINT "FK_workout_plan_combinations_workout_id" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "workout_plan_combinations" ADD CONSTRAINT "FK_workout_plan_combinations_related_workout_id" 
                FOREIGN KEY ("related_workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "program_workout_plans" ADD CONSTRAINT "FK_program_workout_plans_workout_id" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "workout_exercises" DROP CONSTRAINT IF EXISTS "FK_workout_exercises_workout_plan";
            ALTER TABLE "workout_sessions" DROP CONSTRAINT IF EXISTS "FK_workout_sessions_workout_plan";
            ALTER TABLE "workout_ratings" DROP CONSTRAINT IF EXISTS "FK_workout_ratings_workout_plan";
            ALTER TABLE "program_workouts" DROP CONSTRAINT IF EXISTS "FK_program_workouts_workout_plan";
            ALTER TABLE "schedule_items" DROP CONSTRAINT IF EXISTS "FK_schedule_items_workout_plan";
            ALTER TABLE "user_favorite_workouts" DROP CONSTRAINT IF EXISTS "FK_user_favorite_workouts_workout_id";
            ALTER TABLE "user_workout_history" DROP CONSTRAINT IF EXISTS "FK_user_workout_history_workout_id";
            ALTER TABLE "workout_plan_combinations" DROP CONSTRAINT IF EXISTS "FK_workout_plan_combinations_workout_id";
            ALTER TABLE "workout_plan_combinations" DROP CONSTRAINT IF EXISTS "FK_workout_plan_combinations_related_workout_id";
            ALTER TABLE "program_workout_plans" DROP CONSTRAINT IF EXISTS "FK_program_workout_plans_workout_id";
        `);

        // Drop the new primary key constraint
        await queryRunner.query(`
            ALTER TABLE "workout_plans" DROP CONSTRAINT "PK_workout_plans";
        `);

        // Recreate the original primary key constraint
        await queryRunner.query(`
            ALTER TABLE "workout_plans" ADD CONSTRAINT "PK_9ae1bdd02db446a7541e2e5b161" PRIMARY KEY ("id");
        `);

        // Recreate all foreign key constraints with original names
        await queryRunner.query(`
            ALTER TABLE "workout_exercises" ADD CONSTRAINT "FK_workout_exercises_workout_plan" 
                FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "workout_sessions" ADD CONSTRAINT "FK_workout_sessions_workout_plan" 
                FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "workout_ratings" ADD CONSTRAINT "FK_workout_ratings_workout_plan" 
                FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "program_workouts" ADD CONSTRAINT "FK_program_workouts_workout_plan" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "schedule_items" ADD CONSTRAINT "FK_schedule_items_workout_plan" 
                FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE SET NULL;
            
            ALTER TABLE "user_favorite_workouts" ADD CONSTRAINT "FK_user_favorite_workouts_workout_id" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "user_workout_history" ADD CONSTRAINT "FK_user_workout_history_workout_id" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "workout_plan_combinations" ADD CONSTRAINT "FK_workout_plan_combinations_workout_id" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "workout_plan_combinations" ADD CONSTRAINT "FK_workout_plan_combinations_related_workout_id" 
                FOREIGN KEY ("related_workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
            
            ALTER TABLE "program_workout_plans" ADD CONSTRAINT "FK_program_workout_plans_workout_id" 
                FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
        `);
    }
} 