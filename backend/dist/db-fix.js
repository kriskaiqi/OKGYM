"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
async function fixDatabase() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("Database connected");
        try {
            console.log("Checking targetMuscleGroups column type...");
            const result = await data_source_1.AppDataSource.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'exercises' 
        AND column_name = 'targetMuscleGroups'
      `);
            const columnType = result.length > 0 ? result[0].data_type : null;
            console.log(`Current column type: ${columnType}`);
            if (columnType === "text") {
                console.log("Converting targetMuscleGroups from text to array...");
                await data_source_1.AppDataSource.query(`
          ALTER TABLE "exercises" 
          ADD COLUMN "targetMuscleGroups_array" text[] NULL
        `);
                await data_source_1.AppDataSource.query(`
          UPDATE "exercises" 
          SET "targetMuscleGroups_array" = string_to_array(replace(trim(both '[]' from "targetMuscleGroups"), '"', ''), ',')
          WHERE "targetMuscleGroups" IS NOT NULL
        `);
                await data_source_1.AppDataSource.query(`
          ALTER TABLE "exercises" DROP COLUMN "targetMuscleGroups";
          ALTER TABLE "exercises" RENAME COLUMN "targetMuscleGroups_array" TO "targetMuscleGroups";
        `);
                console.log("targetMuscleGroups converted to array type.");
            }
        }
        catch (error) {
            console.error("Error fixing targetMuscleGroups:", error);
        }
        try {
            console.log("Checking synergistMuscleGroups column type...");
            const result = await data_source_1.AppDataSource.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'exercises' 
        AND column_name = 'synergistMuscleGroups'
      `);
            const columnType = result.length > 0 ? result[0].data_type : null;
            console.log(`Current column type: ${columnType}`);
            if (columnType === "text") {
                console.log("Converting synergistMuscleGroups from text to array...");
                await data_source_1.AppDataSource.query(`
          ALTER TABLE "exercises" 
          ADD COLUMN "synergistMuscleGroups_array" text[] NULL
        `);
                await data_source_1.AppDataSource.query(`
          UPDATE "exercises" 
          SET "synergistMuscleGroups_array" = string_to_array(replace(trim(both '[]' from "synergistMuscleGroups"), '"', ''), ',')
          WHERE "synergistMuscleGroups" IS NOT NULL
        `);
                await data_source_1.AppDataSource.query(`
          ALTER TABLE "exercises" DROP COLUMN "synergistMuscleGroups";
          ALTER TABLE "exercises" RENAME COLUMN "synergistMuscleGroups_array" TO "synergistMuscleGroups";
        `);
                console.log("synergistMuscleGroups converted to array type.");
            }
        }
        catch (error) {
            console.error("Error fixing synergistMuscleGroups:", error);
        }
        try {
            console.log("Checking for exercise_category table...");
            const tableExists = await data_source_1.AppDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'exercise_category'
        );
      `);
            if (!tableExists[0].exists) {
                console.log("Creating exercise_category table...");
                await data_source_1.AppDataSource.query(`
          CREATE TABLE "exercise_category" (
            "exercise_id" uuid NOT NULL,
            "category_id" uuid NOT NULL,
            CONSTRAINT "PK_exercise_category" PRIMARY KEY ("exercise_id", "category_id")
          )
        `);
                await data_source_1.AppDataSource.query(`
          ALTER TABLE "exercise_category" 
          ADD CONSTRAINT "FK_exercise_category_exercise_id" 
          FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE
        `);
                await data_source_1.AppDataSource.query(`
          ALTER TABLE "exercise_category" 
          ADD CONSTRAINT "FK_exercise_category_category_id" 
          FOREIGN KEY ("category_id") REFERENCES "exercise_categories"("id") ON DELETE CASCADE
        `);
                await data_source_1.AppDataSource.query(`
          CREATE INDEX "IDX_exercise_category_exercise_id" ON "exercise_category" ("exercise_id")
        `);
                await data_source_1.AppDataSource.query(`
          CREATE INDEX "IDX_exercise_category_category_id" ON "exercise_category" ("category_id")
        `);
                console.log("exercise_category table created successfully.");
            }
            else {
                console.log("exercise_category table already exists.");
            }
        }
        catch (error) {
            console.error("Error creating exercise_category table:", error);
        }
        try {
            console.log("Checking for exercise_equipment table...");
            const tableExists = await data_source_1.AppDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'exercise_equipment'
        );
      `);
            if (!tableExists[0].exists) {
                console.log("Creating exercise_equipment table...");
                await data_source_1.AppDataSource.query(`
          CREATE TABLE "exercise_equipment" (
            "exercise_id" uuid NOT NULL,
            "equipment_id" uuid NOT NULL,
            CONSTRAINT "PK_exercise_equipment" PRIMARY KEY ("exercise_id", "equipment_id")
          )
        `);
                await data_source_1.AppDataSource.query(`
          ALTER TABLE "exercise_equipment" 
          ADD CONSTRAINT "FK_exercise_equipment_exercise_id" 
          FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE
        `);
                await data_source_1.AppDataSource.query(`
          ALTER TABLE "exercise_equipment" 
          ADD CONSTRAINT "FK_exercise_equipment_equipment_id" 
          FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE
        `);
                await data_source_1.AppDataSource.query(`
          CREATE INDEX "IDX_exercise_equipment_exercise_id" ON "exercise_equipment" ("exercise_id")
        `);
                await data_source_1.AppDataSource.query(`
          CREATE INDEX "IDX_exercise_equipment_equipment_id" ON "exercise_equipment" ("equipment_id")
        `);
                console.log("exercise_equipment table created successfully.");
            }
            else {
                console.log("exercise_equipment table already exists.");
            }
        }
        catch (error) {
            console.error("Error creating exercise_equipment table:", error);
        }
        console.log("Database fix completed!");
    }
    catch (error) {
        console.error("Error initializing database:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
    }
}
fixDatabase();
//# sourceMappingURL=db-fix.js.map