"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddExerciseFormAnalysisModels1654321098765 = void 0;
class AddExerciseFormAnalysisModels1654321098765 {
    constructor() {
        this.name = 'AddExerciseFormAnalysisModels1654321098765';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "exercise_form_analysis" 
            ADD COLUMN IF NOT EXISTS "analysisData" jsonb
        `);
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "exercise_specific_analysis" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "analysis_id" uuid NOT NULL,
                "exerciseType" character varying NOT NULL,
                "analysis" jsonb,
                "metadata" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_exercise_specific_analysis" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exerciseanalysistype') THEN
                    CREATE TYPE "exerciseanalysistype" AS ENUM('SQUAT', 'PLANK', 'LUNGE', 'BICEP_CURL');
                END IF;
            END
            $$;
        `);
        await queryRunner.query(`
            ALTER TABLE "exercise_specific_analysis" 
            ALTER COLUMN "exerciseType" TYPE "exerciseanalysistype" USING "exerciseType"::"exerciseanalysistype"
        `);
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ai_model_configuration" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "exerciseType" "exerciseanalysistype" NOT NULL,
                "modelType" character varying NOT NULL,
                "modelParameters" jsonb NOT NULL,
                "analysisRules" jsonb NOT NULL,
                "metadata" jsonb,
                "isActive" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ai_model_configuration" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'aimodeltype') THEN
                    CREATE TYPE "aimodeltype" AS ENUM('SKLEARN', 'DEEP_LEARNING');
                END IF;
            END
            $$;
        `);
        await queryRunner.query(`
            ALTER TABLE "ai_model_configuration" 
            ALTER COLUMN "modelType" TYPE "aimodeltype" USING "modelType"::"aimodeltype"
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_specific_analysis_type" ON "exercise_specific_analysis" ("exerciseType");
            CREATE INDEX IF NOT EXISTS "idx_fk_specificanalysis_parent" ON "exercise_specific_analysis" ("analysis_id");
            CREATE INDEX IF NOT EXISTS "idx_specificanalysis_analysis_id" ON "exercise_specific_analysis" ("analysis_id");
            CREATE INDEX IF NOT EXISTS "idx_specificanalysis_exercise_type" ON "exercise_specific_analysis" ("exerciseType");
            
            CREATE INDEX IF NOT EXISTS "idx_model_config_type" ON "ai_model_configuration" ("exerciseType", "modelType");
            CREATE INDEX IF NOT EXISTS "idx_model_config_exercise_type" ON "ai_model_configuration" ("exerciseType");
            CREATE INDEX IF NOT EXISTS "idx_model_config_model_type" ON "ai_model_configuration" ("modelType");
            CREATE INDEX IF NOT EXISTS "idx_model_config_active" ON "ai_model_configuration" ("isActive");
        `);
        await queryRunner.query(`
            ALTER TABLE "exercise_specific_analysis"
            ADD CONSTRAINT "FK_exercise_specific_analysis_exercise_form_analysis"
            FOREIGN KEY ("analysis_id") REFERENCES "exercise_form_analysis"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "exercise_specific_analysis" 
            DROP CONSTRAINT IF EXISTS "FK_exercise_specific_analysis_exercise_form_analysis"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_specific_analysis_type";
            DROP INDEX IF EXISTS "idx_fk_specificanalysis_parent";
            DROP INDEX IF EXISTS "idx_specificanalysis_analysis_id";
            DROP INDEX IF EXISTS "idx_specificanalysis_exercise_type";
            
            DROP INDEX IF EXISTS "idx_model_config_type";
            DROP INDEX IF EXISTS "idx_model_config_exercise_type";
            DROP INDEX IF EXISTS "idx_model_config_model_type";
            DROP INDEX IF EXISTS "idx_model_config_active";
        `);
        await queryRunner.query(`DROP TABLE IF EXISTS "exercise_specific_analysis"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ai_model_configuration"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "exerciseanalysistype"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "aimodeltype"`);
        await queryRunner.query(`
            ALTER TABLE "exercise_form_analysis" 
            DROP COLUMN IF EXISTS "analysisData"
        `);
    }
}
exports.AddExerciseFormAnalysisModels1654321098765 = AddExerciseFormAnalysisModels1654321098765;
//# sourceMappingURL=1654321098765-AddExerciseFormAnalysisModels.js.map