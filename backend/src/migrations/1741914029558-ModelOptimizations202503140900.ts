
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Entity optimizations migration
 * - Adds new indexes for improved query performance
 * - Adds join table indexes for many-to-many relationships
 * - Optimizes common query patterns
 */
export class ModelOptimizations202503140900 implements MigrationInterface {
    name = 'ModelOptimizations2025031409001741914029558';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if tables exist before creating indexes
        const equipmentTableExists = await this.tableExists(queryRunner, "equipment");
        const exerciseTableExists = await this.tableExists(queryRunner, "exercises");
        const workoutPlanTableExists = await this.tableExists(queryRunner, "workout_plans");
        
        // Equipment entity indexes
        if (equipmentTableExists) {
            console.log("Creating indexes for equipment table...");
            
            // Equipment entity indexes for enum columns
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_equipment_difficulty" ON "equipment" ("difficulty")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_equipment_cost_tier" ON "equipment" ("costTier")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_equipment_space_required" ON "equipment" ("spaceRequired")`);
            
            // Equipment entity indexes for foreign key columns
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_equipment_image_id" ON "equipment" ("image_id")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_equipment_video_id" ON "equipment" ("video_id")`);
            
            // Equipment entity indexes for additional searchable columns
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_equipment_price" ON "equipment" ("estimatedPrice")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_equipment_manufacturer" ON "equipment" ("manufacturer")`);
        } else {
            console.log("Equipment table does not exist, skipping indexes");
        }
        
        // Create indexes on Equipment join tables
        await this.createJoinTableIndexes(queryRunner, "equipment_muscle_groups", "equipment_id", "category_id", "equipment_muscle");
        await this.createJoinTableIndexes(queryRunner, "equipment_training_types", "equipment_id", "tag_id", "equipment_training");
        
        // Create indexes on Exercise join tables
        await this.createJoinTableIndexes(queryRunner, "exercise_equipment", "exercise_id", "equipment_id", "exercise_equipment");
        await this.createJoinTableIndexes(queryRunner, "exercise_media", "exercise_id", "media_id", "exercise_media");
        await this.createJoinTableIndexes(queryRunner, "exercise_categories_mapping", "exercise_id", "category_id", "exercise_category");
        
        // Create indexes on WorkoutPlan join tables
        await this.createJoinTableIndexes(queryRunner, "workout_muscle_groups", "workout_id", "category_id", "workout_muscle");
        await this.createJoinTableIndexes(queryRunner, "workout_tags_mapping", "workout_id", "tag_id", "workout_tags");
        await this.createJoinTableIndexes(queryRunner, "workout_equipment", "workout_id", "equipment_id", "workout_equipment");
        await this.createJoinTableIndexes(queryRunner, "workout_plan_combinations", "workout_id", "related_workout_id", "workout_related");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if tables exist before dropping indexes
        const equipmentTableExists = await this.tableExists(queryRunner, "equipment");
        const exerciseTableExists = await this.tableExists(queryRunner, "exercises");
        const workoutPlanTableExists = await this.tableExists(queryRunner, "workout_plans");
        
        // Drop Equipment column indexes
        if (equipmentTableExists) {
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_difficulty"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_cost_tier"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_space_required"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_image_id"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_video_id"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_price"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_manufacturer"`);
        }
        
        // Drop join table indexes
        await this.dropJoinTableIndexes(queryRunner, "equipment_muscle_groups", "equipment_muscle");
        await this.dropJoinTableIndexes(queryRunner, "equipment_training_types", "equipment_training");
        await this.dropJoinTableIndexes(queryRunner, "exercise_equipment", "exercise_equipment");
        await this.dropJoinTableIndexes(queryRunner, "exercise_media", "exercise_media");
        await this.dropJoinTableIndexes(queryRunner, "exercise_categories_mapping", "exercise_category");
        await this.dropJoinTableIndexes(queryRunner, "workout_muscle_groups", "workout_muscle");
        await this.dropJoinTableIndexes(queryRunner, "workout_tags_mapping", "workout_tags");
        await this.dropJoinTableIndexes(queryRunner, "workout_equipment", "workout_equipment");
        await this.dropJoinTableIndexes(queryRunner, "workout_plan_combinations", "workout_related");
    }
    
    /**
     * Check if a table exists in the database
     */
    private async tableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
        try {
            const result = await queryRunner.query(
                `SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                )`,
                [tableName]
            );
            return result[0].exists;
        } catch (error) {
            console.error(`Error checking if table ${tableName} exists:`, error);
            return false;
        }
    }
    
    /**
     * Create indexes for a join table
     */
    private async createJoinTableIndexes(
        queryRunner: QueryRunner, 
        tableName: string, 
        leftColumn: string, 
        rightColumn: string,
        indexPrefix: string
    ): Promise<void> {
        const tableExists = await this.tableExists(queryRunner, tableName);
        if (tableExists) {
            console.log(`Creating indexes for ${tableName} join table...`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_${indexPrefix}_join_left" ON "${tableName}" ("${leftColumn}")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_${indexPrefix}_join_right" ON "${tableName}" ("${rightColumn}")`);
        } else {
            console.log(`Join table ${tableName} does not exist, skipping indexes`);
        }
    }
    
    /**
     * Drop indexes for a join table
     */
    private async dropJoinTableIndexes(
        queryRunner: QueryRunner, 
        tableName: string,
        indexPrefix: string
    ): Promise<void> {
        const tableExists = await this.tableExists(queryRunner, tableName);
        if (tableExists) {
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_${indexPrefix}_join_left"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_${indexPrefix}_join_right"`);
        }
    }
}
