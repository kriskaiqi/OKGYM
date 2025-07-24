import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJoinTablesAndFixColumnTypes1711122000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if targetMuscleGroups is a text column and convert to array
        const columnType = await this.getColumnType(queryRunner, 'exercises', 'targetMuscleGroups');
        if (columnType === 'text') {
            // First create a temporary column with the right type
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ADD COLUMN "targetMuscleGroups_array" text[] NULL
            `);
            
            // Convert existing data - splits comma separated values into array
            await queryRunner.query(`
                UPDATE "exercises" 
                SET "targetMuscleGroups_array" = string_to_array(replace(trim(both '[]' from "targetMuscleGroups"), '"', ''), ',')
                WHERE "targetMuscleGroups" IS NOT NULL
            `);
            
            // Drop old column and rename new column
            await queryRunner.query(`
                ALTER TABLE "exercises" DROP COLUMN "targetMuscleGroups";
                ALTER TABLE "exercises" RENAME COLUMN "targetMuscleGroups_array" TO "targetMuscleGroups";
            `);
        }
        
        // Same for synergistMuscleGroups if needed
        const synergistColumnType = await this.getColumnType(queryRunner, 'exercises', 'synergistMuscleGroups');
        if (synergistColumnType === 'text') {
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ADD COLUMN "synergistMuscleGroups_array" text[] NULL
            `);
            
            await queryRunner.query(`
                UPDATE "exercises" 
                SET "synergistMuscleGroups_array" = string_to_array(replace(trim(both '[]' from "synergistMuscleGroups"), '"', ''), ',')
                WHERE "synergistMuscleGroups" IS NOT NULL
            `);
            
            await queryRunner.query(`
                ALTER TABLE "exercises" DROP COLUMN "synergistMuscleGroups";
                ALTER TABLE "exercises" RENAME COLUMN "synergistMuscleGroups_array" TO "synergistMuscleGroups";
            `);
        }
        
        // Create exercise_category join table if it doesn't exist
        const exerciseCategoryTableExists = await this.tableExists(queryRunner, 'exercise_category');
        if (!exerciseCategoryTableExists) {
            await queryRunner.query(`
                CREATE TABLE "exercise_category" (
                    "exercise_id" uuid NOT NULL,
                    "category_id" uuid NOT NULL,
                    CONSTRAINT "PK_exercise_category" PRIMARY KEY ("exercise_id", "category_id")
                )
            `);
            
            // Add foreign key constraints
            await queryRunner.query(`
                ALTER TABLE "exercise_category" 
                ADD CONSTRAINT "FK_exercise_category_exercise_id" 
                FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE
            `);
            
            await queryRunner.query(`
                ALTER TABLE "exercise_category" 
                ADD CONSTRAINT "FK_exercise_category_category_id" 
                FOREIGN KEY ("category_id") REFERENCES "exercise_categories"("id") ON DELETE CASCADE
            `);
            
            // Create index for better performance
            await queryRunner.query(`
                CREATE INDEX "IDX_exercise_category_exercise_id" ON "exercise_category" ("exercise_id")
            `);
            
            await queryRunner.query(`
                CREATE INDEX "IDX_exercise_category_category_id" ON "exercise_category" ("category_id")
            `);
        }
        
        // Create exercise_equipment join table if it doesn't exist
        const exerciseEquipmentTableExists = await this.tableExists(queryRunner, 'exercise_equipment');
        if (!exerciseEquipmentTableExists) {
            await queryRunner.query(`
                CREATE TABLE "exercise_equipment" (
                    "exercise_id" uuid NOT NULL,
                    "equipment_id" uuid NOT NULL,
                    CONSTRAINT "PK_exercise_equipment" PRIMARY KEY ("exercise_id", "equipment_id")
                )
            `);
            
            // Add foreign key constraints
            await queryRunner.query(`
                ALTER TABLE "exercise_equipment" 
                ADD CONSTRAINT "FK_exercise_equipment_exercise_id" 
                FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE
            `);
            
            await queryRunner.query(`
                ALTER TABLE "exercise_equipment" 
                ADD CONSTRAINT "FK_exercise_equipment_equipment_id" 
                FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE
            `);
            
            // Create index for better performance
            await queryRunner.query(`
                CREATE INDEX "IDX_exercise_equipment_exercise_id" ON "exercise_equipment" ("exercise_id")
            `);
            
            await queryRunner.query(`
                CREATE INDEX "IDX_exercise_equipment_equipment_id" ON "exercise_equipment" ("equipment_id")
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the changes made in the up method
        
        // Drop join tables
        await queryRunner.query(`DROP TABLE IF EXISTS "exercise_category"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "exercise_equipment"`);
        
        // Convert array columns back to text if needed
        const columnType = await this.getColumnType(queryRunner, 'exercises', 'targetMuscleGroups');
        if (columnType === 'ARRAY') {
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ADD COLUMN "targetMuscleGroups_text" text NULL
            `);
            
            await queryRunner.query(`
                UPDATE "exercises" 
                SET "targetMuscleGroups_text" = array_to_string("targetMuscleGroups", ',')
                WHERE "targetMuscleGroups" IS NOT NULL
            `);
            
            await queryRunner.query(`
                ALTER TABLE "exercises" DROP COLUMN "targetMuscleGroups";
                ALTER TABLE "exercises" RENAME COLUMN "targetMuscleGroups_text" TO "targetMuscleGroups";
            `);
        }
        
        // Do the same for synergistMuscleGroups
        const synergistColumnType = await this.getColumnType(queryRunner, 'exercises', 'synergistMuscleGroups');
        if (synergistColumnType === 'ARRAY') {
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ADD COLUMN "synergistMuscleGroups_text" text NULL
            `);
            
            await queryRunner.query(`
                UPDATE "exercises" 
                SET "synergistMuscleGroups_text" = array_to_string("synergistMuscleGroups", ',')
                WHERE "synergistMuscleGroups" IS NOT NULL
            `);
            
            await queryRunner.query(`
                ALTER TABLE "exercises" DROP COLUMN "synergistMuscleGroups";
                ALTER TABLE "exercises" RENAME COLUMN "synergistMuscleGroups_text" TO "synergistMuscleGroups";
            `);
        }
    }
    
    // Helper to check if table exists
    private async tableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
        const result = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${tableName}'
            );
        `);
        return result[0].exists;
    }
    
    // Helper to get column type
    private async getColumnType(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<string> {
        const result = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = '${tableName}' 
            AND column_name = '${columnName}'
        `);
        return result.length > 0 ? result[0].data_type : null;
    }
} 