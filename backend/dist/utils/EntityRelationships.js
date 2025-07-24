"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityRelationships = void 0;
exports.EntityRelationships = {
    Exercise: {
        categories: {
            joinTable: 'exercise_category',
            entityIdField: 'exercise_id',
            relationIdField: 'category_id',
            relatedEntity: 'ExerciseCategory'
        },
        equipmentOptions: {
            joinTable: 'exercise_equipment',
            entityIdField: 'exercise_id',
            relationIdField: 'equipment_id',
            relatedEntity: 'Equipment'
        },
        media: {
            joinTable: 'exercise_media',
            entityIdField: 'exercise_id',
            relationIdField: 'media_id',
            relatedEntity: 'Media'
        },
        relationsFrom: {
            joinTable: 'exercise_relations',
            entityIdField: 'base_exercise_id',
            relationIdField: 'id',
            relatedEntity: 'ExerciseRelation'
        },
        relationsTo: {
            joinTable: 'exercise_relations',
            entityIdField: 'related_exercise_id',
            relationIdField: 'id',
            relatedEntity: 'ExerciseRelation'
        }
    },
    WorkoutPlan: {
        targetMuscleGroups: {
            joinTable: 'workout_muscle_group',
            entityIdField: 'workout_id',
            relationIdField: 'category_id',
            relatedEntity: 'ExerciseCategory'
        },
        tags: {
            joinTable: 'workout_tag_map',
            entityIdField: 'workout_id',
            relationIdField: 'tag_id',
            relatedEntity: 'WorkoutTag'
        },
        equipmentNeeded: {
            joinTable: 'workout_equipment',
            entityIdField: 'workout_id',
            relationIdField: 'equipment_id',
            relatedEntity: 'Equipment'
        },
        exercises: {
            joinTable: 'workout_exercise',
            entityIdField: 'workout_id',
            relationIdField: 'id',
            relatedEntity: 'WorkoutExercise'
        }
    },
    User: {
        workoutSessions: {
            joinTable: 'workout_sessions',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'WorkoutSession'
        },
        bodyMetrics: {
            joinTable: 'body_metrics',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'BodyMetric'
        },
        achievements: {
            joinTable: 'achievement',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'Achievement'
        },
        fitnessGoals: {
            joinTable: 'fitness_goals',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'FitnessGoal'
        },
        favoriteWorkouts: {
            joinTable: 'user_favorite_workouts',
            entityIdField: 'user_id',
            relationIdField: 'workout_id',
            relatedEntity: 'WorkoutPlan'
        },
        workoutHistory: {
            joinTable: 'user_workout_history',
            entityIdField: 'user_id',
            relationIdField: 'workout_id',
            relatedEntity: 'WorkoutPlan'
        },
        programEnrollments: {
            joinTable: 'program_enrollments',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'ProgramEnrollment'
        },
        progress: {
            joinTable: 'user_progress',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'UserProgress'
        },
        activity: {
            joinTable: 'user_activities',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'UserActivity'
        },
        metrics: {
            joinTable: 'metric_tracking',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'MetricTracking'
        },
        notifications: {
            joinTable: 'notification',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'Notification'
        },
        equipment: {
            joinTable: 'user_equipment',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'UserEquipment'
        }
    },
    WorkoutSession: {
        user: {
            joinTable: 'workout_sessions',
            entityIdField: 'user_id',
            relationIdField: 'id',
            relatedEntity: 'User'
        },
        workoutPlan: {
            joinTable: 'workout_sessions',
            entityIdField: 'id',
            relationIdField: 'workout_plan_id',
            relatedEntity: 'WorkoutPlan'
        },
        metrics: {
            joinTable: 'metric_tracking',
            entityIdField: 'workout_session_id',
            relationIdField: 'id',
            relatedEntity: 'MetricTracking'
        },
        feedback: {
            joinTable: 'feedback',
            entityIdField: 'workout_session_id',
            relationIdField: 'id',
            relatedEntity: 'Feedback'
        },
        ratings: {
            joinTable: 'workout_rating',
            entityIdField: 'workout_session_id',
            relationIdField: 'id',
            relatedEntity: 'WorkoutRating'
        },
        formAnalysis: {
            joinTable: 'exercise_form_analysis',
            entityIdField: 'workout_session_id',
            relationIdField: 'id',
            relatedEntity: 'ExerciseFormAnalysis'
        },
        achievements: {
            joinTable: 'achievement',
            entityIdField: 'workout_session_id',
            relationIdField: 'id',
            relatedEntity: 'Achievement'
        }
    }
};
//# sourceMappingURL=EntityRelationships.js.map