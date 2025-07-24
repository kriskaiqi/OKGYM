import { MigrationInterface, QueryRunner, TableIndex, TableForeignKey } from "typeorm";

export class EntityOptimizationIndexes1710507600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // ============ Add missing indexes to existing tables ============

        // --- WorkoutRating entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "workout_ratings", "idx_fk_workoutrating_user", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "workout_ratings", "idx_fk_workoutrating_workout", ["workout_plan_id"]);
        await this.createIndexIfNotExists(queryRunner, "workout_ratings", "idx_fk_workoutrating_session", ["workout_session_id"]);
        await this.createIndexIfNotExists(queryRunner, "workout_ratings", "idx_fk_workoutrating_feedback", ["feedback_id"]);

        // --- VideoTutorial entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "video_tutorials", "idx_fk_videotutorial_exercise", ["exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "video_tutorials", "idx_fk_videotutorial_author", ["author_id"]);
        await this.createIndexIfNotExists(queryRunner, "video_tutorials", "idx_fk_videotutorial_video", ["video_media_id"]);
        await this.createIndexIfNotExists(queryRunner, "video_tutorials", "idx_fk_videotutorial_thumbnail", ["thumbnail_media_id"]);

        // --- Feedback entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_fk_feedback_user", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_feedback_user_id", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_fk_feedback_exercise", ["exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_feedback_exercise_id", ["exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_fk_feedback_workout", ["workout_plan_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_feedback_workout_id", ["workout_plan_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_fk_feedback_session", ["workout_session_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_feedback_session_id", ["workout_session_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_fk_feedback_program", ["program_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_feedback_program_id", ["program_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_fk_feedback_rating", ["workout_rating_id"]);
        await this.createIndexIfNotExists(queryRunner, "feedback", "idx_feedback_rating_id", ["workout_rating_id"]);

        // --- ExerciseFormAnalysis entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_user", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_user_id", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_exercise", ["exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_exercise_id", ["exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_session", ["workout_session_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_session_id", ["workout_session_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_video", ["video_media_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_video_id", ["video_media_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_metric", ["metric_tracking_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_metric_id", ["metric_tracking_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_type", ["analysisType"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_date", ["performedAt"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_score", ["overallScore"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_viewed", ["isViewed"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_dismissed", ["isDismissed"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_analysis_user_exercise", ["user_id", "exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_form_analysis", "idx_analysis_performance", ["performedAt", "overallScore"]);

        // --- FormCorrectionPoint entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "form_correction_points", "idx_fk_formcorrection_analysis", ["analysis_id"]);
        await this.createIndexIfNotExists(queryRunner, "form_correction_points", "idx_formcorrection_analysis_id", ["analysis_id"]);
        await this.createIndexIfNotExists(queryRunner, "form_correction_points", "idx_fk_formcorrection_image", ["image_media_id"]);
        await this.createIndexIfNotExists(queryRunner, "form_correction_points", "idx_formcorrection_image_id", ["image_media_id"]);
        await this.createIndexIfNotExists(queryRunner, "form_correction_points", "idx_formcorrection_bodypart", ["bodyPart"]);
        await this.createIndexIfNotExists(queryRunner, "form_correction_points", "idx_formcorrection_state", ["state"]);
        await this.createIndexIfNotExists(queryRunner, "form_correction_points", "idx_formcorrection_severity", ["severity"]);

        // --- AudioCue entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "audio_cues", "idx_fk_audiocue_exercise", ["exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "audio_cues", "idx_audiocue_exercise_id", ["exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "audio_cues", "idx_fk_audiocue_creator", ["created_by"]);
        await this.createIndexIfNotExists(queryRunner, "audio_cues", "idx_audiocue_created_by", ["created_by"]);

        // --- ExerciseDetails entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "exercise_details", "idx_fk_exercisedetails_exercise", ["exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_details", "idx_exercisedetails_exercise_id", ["exercise_id"]);

        // --- ExerciseRelation entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "exercise_relations", "idx_fk_exerciserelation_base", ["base_exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_relations", "idx_exerciserelation_base_id", ["base_exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_relations", "idx_fk_exerciserelation_related", ["related_exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_relations", "idx_exerciserelation_related_id", ["related_exercise_id"]);
        await this.createIndexIfNotExists(queryRunner, "exercise_relations", "idx_exerciserelation_type", ["relation_type"]);

        // --- UserSchedule and ScheduleItem entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "user_schedules", "idx_fk_userschedule_user", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "user_schedules", "idx_userschedule_user_id", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "schedule_items", "idx_fk_scheduleitem_schedule", ["schedule_id"]);
        await this.createIndexIfNotExists(queryRunner, "schedule_items", "idx_scheduleitem_schedule_id", ["schedule_id"]);
        await this.createIndexIfNotExists(queryRunner, "schedule_items", "idx_fk_scheduleitem_workout", ["workout_plan_id"]);
        await this.createIndexIfNotExists(queryRunner, "schedule_items", "idx_scheduleitem_workout_id", ["workout_plan_id"]);
        await this.createIndexIfNotExists(queryRunner, "schedule_items", "idx_scheduleitem_type", ["type"]);
        await this.createIndexIfNotExists(queryRunner, "schedule_items", "idx_scheduleitem_date", ["date"]);
        await this.createIndexIfNotExists(queryRunner, "schedule_items", "idx_scheduleitem_status", ["status"]);

        // --- UserProgress entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_fk_userprogress_user", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_userprogress_user_id", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_fk_userprogress_metric", ["metric_tracking_id"]);
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_userprogress_metric_id", ["metric_tracking_id"]);
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_userprogress_exercise", ["exerciseId"]);
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_userprogress_metric_date", ["metricName", "date"]);
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_userprogress_type_user", ["type", "user_id"]);
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_userprogress_type", ["type"]);
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_userprogress_metric_name", ["metricName"]);
        await this.createIndexIfNotExists(queryRunner, "user_progress", "idx_userprogress_date", ["date"]);

        // --- FitnessGoal entity indexes ---
        await this.createIndexIfNotExists(queryRunner, "fitness_goals", "idx_fk_fitnessgoal_user", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "fitness_goals", "idx_fitnessgoal_user_id", ["user_id"]);
        await this.createIndexIfNotExists(queryRunner, "fitness_goals", "idx_fitnessgoal_type_status", ["type", "status"]);
        await this.createIndexIfNotExists(queryRunner, "fitness_goals", "idx_fitnessgoal_deadline", ["deadline"]);
        await this.createIndexIfNotExists(queryRunner, "fitness_goals", "idx_fitnessgoal_type", ["type"]);
        await this.createIndexIfNotExists(queryRunner, "fitness_goals", "idx_fitnessgoal_status", ["status"]);

        // ============ Update foreign key constraints to add cascade options ============
        
        // Note: For safety, we're not modifying existing foreign keys in this migration.
        // The entity decorators will handle cascade behavior at the application level.
        // To modify foreign keys at the database level, a more complex migration would be required
        // that drops and recreates the constraints with the desired options.
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // --- Drop all indexes in reverse order ---
        
        // FitnessGoal indexes
        await this.dropIndexIfExists(queryRunner, "fitness_goals", "idx_fitnessgoal_status");
        await this.dropIndexIfExists(queryRunner, "fitness_goals", "idx_fitnessgoal_type");
        await this.dropIndexIfExists(queryRunner, "fitness_goals", "idx_fitnessgoal_deadline");
        await this.dropIndexIfExists(queryRunner, "fitness_goals", "idx_fitnessgoal_type_status");
        await this.dropIndexIfExists(queryRunner, "fitness_goals", "idx_fitnessgoal_user_id");
        await this.dropIndexIfExists(queryRunner, "fitness_goals", "idx_fk_fitnessgoal_user");

        // UserProgress indexes
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_userprogress_date");
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_userprogress_metric_name");
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_userprogress_type");
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_userprogress_type_user");
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_userprogress_metric_date");
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_userprogress_exercise");
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_userprogress_metric_id");
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_fk_userprogress_metric");
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_userprogress_user_id");
        await this.dropIndexIfExists(queryRunner, "user_progress", "idx_fk_userprogress_user");

        // UserSchedule and ScheduleItem indexes
        await this.dropIndexIfExists(queryRunner, "schedule_items", "idx_scheduleitem_status");
        await this.dropIndexIfExists(queryRunner, "schedule_items", "idx_scheduleitem_date");
        await this.dropIndexIfExists(queryRunner, "schedule_items", "idx_scheduleitem_type");
        await this.dropIndexIfExists(queryRunner, "schedule_items", "idx_scheduleitem_workout_id");
        await this.dropIndexIfExists(queryRunner, "schedule_items", "idx_fk_scheduleitem_workout");
        await this.dropIndexIfExists(queryRunner, "schedule_items", "idx_scheduleitem_schedule_id");
        await this.dropIndexIfExists(queryRunner, "schedule_items", "idx_fk_scheduleitem_schedule");
        await this.dropIndexIfExists(queryRunner, "user_schedules", "idx_userschedule_user_id");
        await this.dropIndexIfExists(queryRunner, "user_schedules", "idx_fk_userschedule_user");

        // ExerciseRelation indexes
        await this.dropIndexIfExists(queryRunner, "exercise_relations", "idx_exerciserelation_type");
        await this.dropIndexIfExists(queryRunner, "exercise_relations", "idx_exerciserelation_related_id");
        await this.dropIndexIfExists(queryRunner, "exercise_relations", "idx_fk_exerciserelation_related");
        await this.dropIndexIfExists(queryRunner, "exercise_relations", "idx_exerciserelation_base_id");
        await this.dropIndexIfExists(queryRunner, "exercise_relations", "idx_fk_exerciserelation_base");

        // ExerciseDetails indexes
        await this.dropIndexIfExists(queryRunner, "exercise_details", "idx_exercisedetails_exercise_id");
        await this.dropIndexIfExists(queryRunner, "exercise_details", "idx_fk_exercisedetails_exercise");

        // AudioCue indexes
        await this.dropIndexIfExists(queryRunner, "audio_cues", "idx_audiocue_created_by");
        await this.dropIndexIfExists(queryRunner, "audio_cues", "idx_fk_audiocue_creator");
        await this.dropIndexIfExists(queryRunner, "audio_cues", "idx_audiocue_exercise_id");
        await this.dropIndexIfExists(queryRunner, "audio_cues", "idx_fk_audiocue_exercise");

        // FormCorrectionPoint indexes
        await this.dropIndexIfExists(queryRunner, "form_correction_points", "idx_formcorrection_severity");
        await this.dropIndexIfExists(queryRunner, "form_correction_points", "idx_formcorrection_state");
        await this.dropIndexIfExists(queryRunner, "form_correction_points", "idx_formcorrection_bodypart");
        await this.dropIndexIfExists(queryRunner, "form_correction_points", "idx_formcorrection_image_id");
        await this.dropIndexIfExists(queryRunner, "form_correction_points", "idx_fk_formcorrection_image");
        await this.dropIndexIfExists(queryRunner, "form_correction_points", "idx_formcorrection_analysis_id");
        await this.dropIndexIfExists(queryRunner, "form_correction_points", "idx_fk_formcorrection_analysis");

        // ExerciseFormAnalysis indexes
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_analysis_performance");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_analysis_user_exercise");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_dismissed");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_viewed");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_score");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_date");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_type");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_metric_id");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_metric");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_video_id");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_video");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_session_id");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_session");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_exercise_id");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_exercise");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_formanalysis_user_id");
        await this.dropIndexIfExists(queryRunner, "exercise_form_analysis", "idx_fk_formanalysis_user");

        // Feedback indexes
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_feedback_rating_id");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_fk_feedback_rating");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_feedback_program_id");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_fk_feedback_program");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_feedback_session_id");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_fk_feedback_session");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_feedback_workout_id");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_fk_feedback_workout");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_feedback_exercise_id");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_fk_feedback_exercise");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_feedback_user_id");
        await this.dropIndexIfExists(queryRunner, "feedback", "idx_fk_feedback_user");

        // VideoTutorial indexes
        await this.dropIndexIfExists(queryRunner, "video_tutorials", "idx_fk_videotutorial_thumbnail");
        await this.dropIndexIfExists(queryRunner, "video_tutorials", "idx_videotutorial_thumbnail_id");
        await this.dropIndexIfExists(queryRunner, "video_tutorials", "idx_fk_videotutorial_video");
        await this.dropIndexIfExists(queryRunner, "video_tutorials", "idx_videotutorial_video_id");
        await this.dropIndexIfExists(queryRunner, "video_tutorials", "idx_fk_videotutorial_author");
        await this.dropIndexIfExists(queryRunner, "video_tutorials", "idx_videotutorial_author_id");
        await this.dropIndexIfExists(queryRunner, "video_tutorials", "idx_fk_videotutorial_exercise");
        await this.dropIndexIfExists(queryRunner, "video_tutorials", "idx_videotutorial_exercise_id");

        // WorkoutRating indexes
        await this.dropIndexIfExists(queryRunner, "workout_ratings", "idx_fk_workoutrating_feedback");
        await this.dropIndexIfExists(queryRunner, "workout_ratings", "idx_fk_workoutrating_session");
        await this.dropIndexIfExists(queryRunner, "workout_ratings", "idx_fk_workoutrating_workout");
        await this.dropIndexIfExists(queryRunner, "workout_ratings", "idx_fk_workoutrating_user");
    }

    /**
     * Helper method to create an index if it doesn't already exist
     */
    private async createIndexIfNotExists(
        queryRunner: QueryRunner,
        tableName: string,
        indexName: string,
        columnNames: string[]
    ): Promise<void> {
        try {
            // Check if index already exists
            const tableExists = await queryRunner.hasTable(tableName);
            if (!tableExists) {
                console.log(`Skipping index creation: Table ${tableName} does not exist`);
                return;
            }

            const table = await queryRunner.getTable(tableName);
            const indexExists = table?.indices.some(i => i.name === indexName);
            if (indexExists) {
                console.log(`Index ${indexName} already exists on table ${tableName}`);
                return;
            }

            // Create the index
            await queryRunner.createIndex(
                tableName,
                new TableIndex({
                    name: indexName,
                    columnNames: columnNames
                })
            );
            console.log(`Created index ${indexName} on table ${tableName}`);
        } catch (error) {
            console.error(`Error creating index ${indexName} on table ${tableName}:`, error);
        }
    }

    /**
     * Helper method to drop an index if it exists
     */
    private async dropIndexIfExists(
        queryRunner: QueryRunner,
        tableName: string,
        indexName: string
    ): Promise<void> {
        try {
            // Check if table exists
            const tableExists = await queryRunner.hasTable(tableName);
            if (!tableExists) {
                console.log(`Skipping index removal: Table ${tableName} does not exist`);
                return;
            }

            // Check if index exists
            const table = await queryRunner.getTable(tableName);
            const indexExists = table?.indices.some(i => i.name === indexName);
            if (!indexExists) {
                console.log(`Index ${indexName} does not exist on table ${tableName}`);
                return;
            }

            // Drop the index
            await queryRunner.dropIndex(tableName, indexName);
            console.log(`Dropped index ${indexName} from table ${tableName}`);
        } catch (error) {
            console.error(`Error dropping index ${indexName} from table ${tableName}:`, error);
        }
    }
} 