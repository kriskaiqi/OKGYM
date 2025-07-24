import { MigrationInterface, QueryRunner } from "typeorm";

export class AdditionalIndexOptimizations1741914899888 implements MigrationInterface {
    name = 'AdditionalIndexOptimizations1741914899888';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Helper function to check if a table exists
        const tableExists = async (tableName: string): Promise<boolean> => {
            try {
                const result = await queryRunner.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    )
                `, [tableName]);
                return result[0].exists;
            } catch (error) {
                console.error(`Error checking if table ${tableName} exists:`, error);
                return false;
            }
        };

        // Helper function to check if an index exists
        const indexExists = async (indexName: string): Promise<boolean> => {
            try {
                const result = await queryRunner.query(`
                    SELECT EXISTS (
                        SELECT FROM pg_indexes
                        WHERE indexname = $1
                    )
                `, [indexName]);
                return result[0].exists;
            } catch (error) {
                console.error(`Error checking if index ${indexName} exists:`, error);
                return false;
            }
        };

        // Create index on equipment.category (for enum filtering)
        if (await tableExists('equipment')) {
            if (!await indexExists('idx_equipment_category')) {
                console.log('Creating index on equipment.category');
                await queryRunner.query(`
                    CREATE INDEX "idx_equipment_category" ON "equipment" ("category")
                `);
            } else {
                console.log('Index on equipment.category already exists. Skipping.');
            }
        } else {
            console.log('Skipping index creation on equipment.category: Table does not exist');
        }

        // Create composite index on equipment.difficulty and equipment.costTier
        if (await tableExists('equipment')) {
            if (!await indexExists('idx_equipment_difficulty_costTier')) {
                console.log('Creating composite index on equipment.difficulty and equipment.costTier');
                await queryRunner.query(`
                    CREATE INDEX "idx_equipment_difficulty_costTier" ON "equipment" ("difficulty", "costTier")
                `);
            } else {
                console.log('Composite index on equipment.difficulty and equipment.costTier already exists. Skipping.');
            }
        } else {
            console.log('Skipping composite index creation: Table does not exist');
        }

        // Create index on equipment.estimatedPrice (for sorting)
        if (await tableExists('equipment')) {
            if (!await indexExists('idx_equipment_estimatedPrice')) {
                console.log('Creating index on equipment.estimatedPrice');
                await queryRunner.query(`
                    CREATE INDEX "idx_equipment_estimatedPrice" ON "equipment" ("estimatedPrice")
                `);
            } else {
                console.log('Index on equipment.estimatedPrice already exists. Skipping.');
            }
        } else {
            console.log('Skipping index creation on equipment.estimatedPrice: Table does not exist');
        }

        // Create indexes on equipment_muscle_groups for join performance
        if (await tableExists('equipment_muscle_groups')) {
            if (!await indexExists('idx_equipment_muscle_groups_equipment_id')) {
                console.log('Creating index on equipment_muscle_groups.equipment_id');
                await queryRunner.query(`
                    CREATE INDEX "idx_equipment_muscle_groups_equipment_id" ON "equipment_muscle_groups" ("equipment_id")
                `);
            } else {
                console.log('Index on equipment_muscle_groups.equipment_id already exists. Skipping.');
            }

            if (!await indexExists('idx_equipment_muscle_groups_category_id')) {
                console.log('Creating index on equipment_muscle_groups.category_id');
                await queryRunner.query(`
                    CREATE INDEX "idx_equipment_muscle_groups_category_id" ON "equipment_muscle_groups" ("category_id")
                `);
            } else {
                console.log('Index on equipment_muscle_groups.category_id already exists. Skipping.');
            }
        } else {
            console.log('Skipping index creation on equipment_muscle_groups: Table does not exist');
        }

        // Create indexes on workout_ratings boolean columns
        if (await tableExists('workout_ratings')) {
            if (!await indexExists('idx_workout_ratings_wouldRecommend')) {
                console.log('Creating index on workout_ratings.wouldRecommend');
                await queryRunner.query(`
                    CREATE INDEX "idx_workout_ratings_wouldRecommend" ON "workout_ratings" ("wouldRecommend")
                `);
            } else {
                console.log('Index on workout_ratings.wouldRecommend already exists. Skipping.');
            }

            if (!await indexExists('idx_workout_ratings_isPublic')) {
                console.log('Creating index on workout_ratings.isPublic');
                await queryRunner.query(`
                    CREATE INDEX "idx_workout_ratings_isPublic" ON "workout_ratings" ("isPublic")
                `);
            } else {
                console.log('Index on workout_ratings.isPublic already exists. Skipping.');
            }

            // Create composite index for common filter combination
            if (!await indexExists('idx_workout_ratings_recommend_public')) {
                console.log('Creating composite index on workout_ratings.wouldRecommend and workout_ratings.isPublic');
                await queryRunner.query(`
                    CREATE INDEX "idx_workout_ratings_recommend_public" ON "workout_ratings" ("wouldRecommend", "isPublic")
                `);
            } else {
                console.log('Composite index on workout_ratings already exists. Skipping.');
            }
        } else {
            console.log('Skipping index creation on workout_ratings: Table does not exist');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all created indexes in reverse order
        
        // Drop indexes on workout_ratings
        try {
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_workout_ratings_recommend_public"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_workout_ratings_isPublic"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_workout_ratings_wouldRecommend"`);
        } catch (error) {
            console.error('Error dropping workout_ratings indexes:', error);
        }
        
        // Drop indexes on equipment_muscle_groups
        try {
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_muscle_groups_category_id"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_muscle_groups_equipment_id"`);
        } catch (error) {
            console.error('Error dropping equipment_muscle_groups indexes:', error);
        }
        
        // Drop indexes on equipment
        try {
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_estimatedPrice"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_difficulty_costTier"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_category"`);
        } catch (error) {
            console.error('Error dropping equipment indexes:', error);
        }
    }
} 