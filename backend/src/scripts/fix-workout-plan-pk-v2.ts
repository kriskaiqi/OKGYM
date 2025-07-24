import { DataSource } from "typeorm";
import { config } from "../config";

async function dropDependenciesAndFixPK() {
    const dataSource = new DataSource({
        type: "postgres",
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        synchronize: false,
        logging: true,
    });

    try {
        await dataSource.initialize();
        console.log("Data Source has been initialized!");

        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Drop all foreign key constraints that reference workout_plans
            const foreignKeys = [
                "FK_4ff3d6decef9c86d4595c1b3d17", // workout_muscle_group
                "FK_660a6f1caa217394917e0fdbc9f", // workout_tag_map
                "FK_29f483750d03ee1107b194747b8", // workout_equipment
                "FK_d7cfe2372e71da68eddcf4940ee", // workout_exercises
                "FK_33f1914ff039ec0238614be11bb", // program_workouts
                "FK_646428048d14160b7c46a26e395", // workout_ratings
                "FK_a71b9ae696c15d64903b2b1208a", // feedback
                "FK_e70048237bc2ae2e6a26a05a8cc", // workout_sessions
                "FK_8ba33e627ff715180a435746efe", // schedule_items
                "FK_d28e74863a5c1ca498bec616bb1", // workout_plan_combinations
                "FK_c2513a6ac1855d5a4f4b91ba867", // workout_plan_combinations
                "FK_65d2bde6934a97a8c4511127307", // program_workout_plans
                "FK_14bbf3ee9a984d5807efe92d2ce", // user_favorite_workouts
                "FK_58d543d0fe20b8e0e1b5af6fe99", // user_workout_history
                "FK_f72b9e86daa69d2672184f76b1d"  // workout_audio_cues
            ];

            console.log("Dropping foreign key constraints...");
            for (const fk of foreignKeys) {
                await queryRunner.query(`ALTER TABLE "workout_plans" DROP CONSTRAINT IF EXISTS "${fk}"`);
                console.log(`Dropped constraint: ${fk}`);
            }

            // Drop all indexes except the primary key
            const indexes = [
                "idx_workout_name",
                "idx_workout_description",
                "idx_workout_difficulty",
                "idx_workout_estimatedDuration",
                "idx_workout_isCustom",
                "idx_workout_category",
                "idx_workout_estimatedCaloriesBurn",
                "idx_workout_video_media_id",
                "idx_workout_thumbnail_media_id",
                "idx_workout_creator",
                "idx_workout_creator_id",
                "IDX_19391f44e4e399c4bb8c7e97b4",
                "idx_workout_createdAt",
                "idx_workout_updatedAt",
                "IDX_workout_creator_custom",
                "IDX_workout_difficulty_category",
                "idx_workout_filter",
                "idx_workout_newest",
                "idx_workout_popularity",
                "idx_workout_rating",
                "idx_workout_search"
            ];

            console.log("\nDropping indexes...");
            for (const idx of indexes) {
                await queryRunner.query(`DROP INDEX IF EXISTS "${idx}"`);
                console.log(`Dropped index: ${idx}`);
            }

            // Drop the primary key constraint
            console.log("\nDropping primary key constraint...");
            await queryRunner.query(`ALTER TABLE "workout_plans" DROP CONSTRAINT "PK_9ae1bdd02db446a7541e2e5b161"`);
            console.log("Dropped primary key constraint");

            // Add the new primary key constraint
            console.log("\nAdding new primary key constraint...");
            await queryRunner.query(`
                ALTER TABLE "workout_plans" 
                ADD CONSTRAINT "PK_workout_plans" 
                PRIMARY KEY ("id")
            `);
            console.log("Added new primary key constraint");

            // Recreate all indexes
            console.log("\nRecreating indexes...");
            await queryRunner.query(`
                CREATE INDEX "idx_workout_name" ON "workout_plans" ("name");
                CREATE INDEX "idx_workout_description" ON "workout_plans" ("description");
                CREATE INDEX "idx_workout_difficulty" ON "workout_plans" ("difficulty");
                CREATE INDEX "idx_workout_estimatedDuration" ON "workout_plans" ("estimatedDuration");
                CREATE INDEX "idx_workout_isCustom" ON "workout_plans" ("isCustom");
                CREATE INDEX "idx_workout_category" ON "workout_plans" ("workoutCategory");
                CREATE INDEX "idx_workout_estimatedCaloriesBurn" ON "workout_plans" ("estimatedCaloriesBurn");
                CREATE INDEX "idx_workout_video_media_id" ON "workout_plans" ("video_media_id");
                CREATE INDEX "idx_workout_thumbnail_media_id" ON "workout_plans" ("thumbnail_media_id");
                CREATE INDEX "idx_workout_creator" ON "workout_plans" ("creator_id");
                CREATE INDEX "idx_workout_creator_id" ON "workout_plans" ("creator_id");
                CREATE INDEX "IDX_19391f44e4e399c4bb8c7e97b4" ON "workout_plans" ("metrics");
                CREATE INDEX "idx_workout_createdAt" ON "workout_plans" ("createdAt");
                CREATE INDEX "idx_workout_updatedAt" ON "workout_plans" ("updatedAt");
                CREATE INDEX "IDX_workout_creator_custom" ON "workout_plans" ("creator_id", "isCustom");
                CREATE INDEX "IDX_workout_difficulty_category" ON "workout_plans" ("difficulty", "workoutCategory");
                CREATE INDEX "idx_workout_filter" ON "workout_plans" ("difficulty", "workoutCategory", "estimatedDuration");
                CREATE INDEX "idx_workout_newest" ON "workout_plans" ("createdAt", "workoutCategory");
                CREATE INDEX "idx_workout_popularity" ON "workout_plans" ("popularity", "workoutCategory");
                CREATE INDEX "idx_workout_rating" ON "workout_plans" ("rating", "ratingCount");
                CREATE INDEX "idx_workout_search" ON "workout_plans" ("name", "workoutCategory", "difficulty")
            `);
            console.log("Recreated all indexes");

            // Recreate all foreign key constraints
            console.log("\nRecreating foreign key constraints...");
            await queryRunner.query(`
                ALTER TABLE "workout_muscle_group" ADD CONSTRAINT "FK_4ff3d6decef9c86d4595c1b3d17" FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "workout_tag_map" ADD CONSTRAINT "FK_660a6f1caa217394917e0fdbc9f" FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "workout_equipment" ADD CONSTRAINT "FK_29f483750d03ee1107b194747b8" FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "workout_exercises" ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "program_workouts" ADD CONSTRAINT "FK_33f1914ff039ec0238614be11bb" FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "workout_ratings" ADD CONSTRAINT "FK_646428048d14160b7c46a26e395" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "feedback" ADD CONSTRAINT "FK_a71b9ae696c15d64903b2b1208a" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "workout_sessions" ADD CONSTRAINT "FK_e70048237bc2ae2e6a26a05a8cc" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "schedule_items" ADD CONSTRAINT "FK_8ba33e627ff715180a435746efe" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "workout_plan_combinations" ADD CONSTRAINT "FK_d28e74863a5c1ca498bec616bb1" FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "workout_plan_combinations" ADD CONSTRAINT "FK_c2513a6ac1855d5a4f4b91ba867" FOREIGN KEY ("related_workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "program_workout_plans" ADD CONSTRAINT "FK_65d2bde6934a97a8c4511127307" FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "user_favorite_workouts" ADD CONSTRAINT "FK_14bbf3ee9a984d5807efe92d2ce" FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "user_workout_history" ADD CONSTRAINT "FK_58d543d0fe20b8e0e1b5af6fe99" FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE;
                ALTER TABLE "workout_audio_cues" ADD CONSTRAINT "FK_f72b9e86daa69d2672184f76b1d" FOREIGN KEY ("workout_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE
            `);
            console.log("Recreated all foreign key constraints");

            await queryRunner.commitTransaction();
            console.log("\nMigration completed successfully!");
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

        await dataSource.destroy();
        console.log("Data Source has been destroyed!");
    } catch (error) {
        console.error("Error during migration:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}

dropDependenciesAndFixPK(); 