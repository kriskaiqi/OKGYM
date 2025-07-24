"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJoinTablesAndFixColumnTypes1711122000000 = void 0;
class CreateJoinTablesAndFixColumnTypes1711122000000 {
    async up(queryRunner) {
        const columnType = await this.getColumnType(queryRunner, 'exercises', 'targetMuscleGroups');
        if (columnType === 'text') {
            await queryRunner.query(`
                ALTER TABLE "exercises" 
                ADD COLUMN "targetMuscleGroups_array" text[] NULL
            `);
            await queryRunner.query(`
                UPDATE "exercises" 
                SET "targetMuscleGroups_array" = string_to_array(replace(trim(both '[]' from "targetMuscleGroups"), '"', ''), ',')
                WHERE "targetMuscleGroups" IS NOT NULL
            `);
            await queryRunner.query(`
                ALTER TABLE "exercises" DROP COLUMN "targetMuscleGroups";
                ALTER TABLE "exercises" RENAME COLUMN "targetMuscleGroups_array" TO "targetMuscleGroups";
            `);
        }
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
        const exerciseCategoryTableExists = await this.tableExists(queryRunner, 'exercise_category');
        if (!exerciseCategoryTableExists) {
            await queryRunner.query(`
                CREATE TABLE "exercise_category" (
                    "exercise_id" uuid NOT NULL,
                    "category_id" uuid NOT NULL,
                    CONSTRAINT "PK_exercise_category" PRIMARY KEY ("exercise_id", "category_id")
                )
            `);
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
            await queryRunner.query(`
                CREATE INDEX "IDX_exercise_category_exercise_id" ON "exercise_category" ("exercise_id")
            `);
            await queryRunner.query(`
                CREATE INDEX "IDX_exercise_category_category_id" ON "exercise_category" ("category_id")
            `);
        }
        const exerciseEquipmentTableExists = await this.tableExists(queryRunner, 'exercise_equipment');
        if (!exerciseEquipmentTableExists) {
            await queryRunner.query(`
                CREATE TABLE "exercise_equipment" (
                    "exercise_id" uuid NOT NULL,
                    "equipment_id" uuid NOT NULL,
                    CONSTRAINT "PK_exercise_equipment" PRIMARY KEY ("exercise_id", "equipment_id")
                )
            `);
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
            await queryRunner.query(`
                CREATE INDEX "IDX_exercise_equipment_exercise_id" ON "exercise_equipment" ("exercise_id")
            `);
            await queryRunner.query(`
                CREATE INDEX "IDX_exercise_equipment_equipment_id" ON "exercise_equipment" ("equipment_id")
            `);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "exercise_category"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "exercise_equipment"`);
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
    async tableExists(queryRunner, tableName) {
        const result = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${tableName}'
            );
        `);
        return result[0].exists;
    }
    async getColumnType(queryRunner, tableName, columnName) {
        const result = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = '${tableName}' 
            AND column_name = '${columnName}'
        `);
        return result.length > 0 ? result[0].data_type : null;
    }
}
exports.CreateJoinTablesAndFixColumnTypes1711122000000 = CreateJoinTablesAndFixColumnTypes1711122000000;
//# sourceMappingURL=CreateJoinTablesAndFixColumnTypes.js.map