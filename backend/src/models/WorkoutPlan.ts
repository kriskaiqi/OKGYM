import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    ManyToOne,
    JoinColumn,
    Index
} from "typeorm";
import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, Max, IsBoolean, IsDate, IsUUID } from "class-validator";
import { Type } from 'class-transformer';
import { WorkoutExercise } from "./WorkoutExercise";
import { User } from "./User";
import { TrainingProgram } from "./TrainingProgram";
import { WorkoutTag } from "./WorkoutTag";
import { ExerciseCategory } from "./ExerciseCategory";
import { ProgramWorkout } from "./ProgramWorkout";
import { Equipment } from "./Equipment";
import { Media } from "./Media";
import { WorkoutSession } from "./WorkoutSession";

// Import shared enums and validation classes
import { 
    Difficulty,        // Replaces any local difficulty/level enums
    WorkoutCategory,   // Used for categorization 
    FitnessGoal,       // Replaces WorkoutGoal enum
    ProgressionType,   // Used for progression strategies
    MeasurementType,   // For measurement types
    SplitType          // Used for workout structuring
} from './shared/Enums';
import { 
    NumericalRange,    // For ranges like intensity
    WorkoutMetadata,   // For metadata structure
    WorkoutMetrics,    // For metrics tracking
    CachedMetrics,     // For cache validation
    WorkoutStructure,  // For workout structure
    ProgressionModel,  // For progression strategies
    ExerciseConfig     // For exercise configuration
} from './shared/Validation';
import * as ModelUtils from './shared/Utils';
import { TIME_CONSTANTS, PROGRESSION_CONSTANTS, CALCULATION_CONSTANTS } from './shared/Constants';
import { WorkoutPlanData, WorkoutPlanFilters } from './shared/Interfaces';

/**
 * WorkoutPlan represents a template for a workout.
 * It contains a sequence of exercises with their configurations.
 * 
 * Relationships:
 * - OneToMany with WorkoutExercise (each workout has many exercises)
 * - ManyToOne with User (creator of the workout)
 * - ManyToMany with ExerciseCategory (muscle groups targeted)
 * - ManyToMany with Equipment (equipment needed)
 * - ManyToMany with WorkoutTag (tags for categorization)
 * - ManyToMany with TrainingProgram (programs that include this workout)
 * - ManyToMany with itself (related workouts)
 * - ManyToOne with Media (video and thumbnail)
 * - OneToMany with WorkoutSession (sessions associated with this workout)
 */
@Entity("workout_plans")
@Index("idx_workout_search", ["name", "workoutCategory", "difficulty"])
@Index("idx_workout_rating", ["rating", "ratingCount"])
@Index("idx_workout_popularity", ["popularity", "workoutCategory"])
@Index("idx_workout_newest", ["createdAt", "workoutCategory"])
@Index("idx_workout_filter", ["difficulty", "workoutCategory", "estimatedDuration"])
@Index("IDX_workout_difficulty_category", ["difficulty", "workoutCategory"])
@Index("IDX_workout_creator_custom", ["creator_id", "isCustom"])
@Index("idx_workout_tags_join", { synchronize: false }) // Disable automatic sync for the tags index
@Index("idx_workout_equipment_join", { synchronize: false }) // Disable automatic sync for the equipment index
@Index("idx_workout_exercises_join", { synchronize: false }) // Disable automatic sync for the exercises index
@Index("idx_workout_programWorkouts_join", { synchronize: false }) // Disable automatic sync for the programWorkouts index
@Index("idx_workout_relatedWorkouts_join", { synchronize: false }) // Disable automatic sync for the relatedWorkouts index
@Index("idx_workout_trainingPrograms_join", { synchronize: false }) // Disable automatic sync for the trainingPrograms index
@Index("idx_workout_metadata_join", { synchronize: false }) // Disable automatic sync for the metadata index
@Index("idx_workout_structure_join", { synchronize: false }) // Disable automatic sync for the workoutStructure index
@Index("idx_workout_progression_join", { synchronize: false }) // Disable automatic sync for the progressionModel index
@Index("idx_workout_favoritedBy_join", { synchronize: false }) // Disable automatic sync for the favoritedBy index
@Index("idx_workout_workoutHistoryOf_join", { synchronize: false }) // Disable automatic sync for the workoutHistoryOf index
export class WorkoutPlan {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    @Column({ length: 100 })
    @IsString()
    @IsNotEmpty()
    @Index("idx_workout_name")
    name: string = '';

    @Column({ type: 'text' })
    @IsString()
    @IsNotEmpty()
    @Index("idx_workout_description")
    description: string = '';

    @Column({
        type: "enum",
        enum: Difficulty,
        default: Difficulty.BEGINNER
    })
    @IsEnum(Difficulty)
    @Index("idx_workout_difficulty")
    difficulty: Difficulty = Difficulty.BEGINNER;

    /**
     * Target muscle groups for this workout
     */
    @ManyToMany(() => ExerciseCategory, { 
        eager: true
    })
    @JoinTable({
        name: "workout_muscle_group",
        joinColumn: { name: "workout_id" },
        inverseJoinColumn: { name: "category_id" }
    })
    targetMuscleGroups: ExerciseCategory[];

    @Column("int")
    @IsNumber()
    @Min(5)
    @Max(180)
    @Index("idx_workout_estimatedDuration")
    estimatedDuration: number;

    @Column({ default: false })
    @IsBoolean()
    @Index("idx_workout_isCustom")
    isCustom: boolean;

    @Column("float", { default: 0 })
    @IsNumber()
    @Min(0)
    @Max(5)
    // Index defined at the entity level as composite index with ratingCount
    rating: number;

    @Column("int", { default: 0 })
    @IsNumber()
    @Min(0)
    // Index defined at the entity level as composite index with rating
    ratingCount: number;

    @Column({ default: 0 })
    @IsNumber()
    @Min(0)
    // Index defined at the entity level as composite index with workoutCategory
    popularity: number;

    @Column({
        type: "enum",
        enum: WorkoutCategory,
        default: WorkoutCategory.FULL_BODY
    })
    @IsEnum(WorkoutCategory)
    @Index("idx_workout_category")
    workoutCategory: WorkoutCategory = WorkoutCategory.FULL_BODY;

    /**
     * Tags describing workout focus (HIIT, Endurance, etc.)
     */
    @ManyToMany(() => WorkoutTag, { 
        eager: true
    })
    @JoinTable({
        name: "workout_tag_map",
        joinColumn: { name: "workout_id" },
        inverseJoinColumn: { name: "tag_id" }
    })
    tags: WorkoutTag[];

    @Column({ default: 0 })
    @IsNumber()
    @Min(0)
    @Index("idx_workout_estimatedCaloriesBurn")
    estimatedCaloriesBurn: number;

    /**
     * Video demonstration of the workout
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    video: Media;

    @Column({ nullable: true })
    @Index("idx_workout_video_media_id")
    video_media_id: string;

    /**
     * Thumbnail image for the workout
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    thumbnail: Media;

    @Column({ nullable: true })
    @Index("idx_workout_thumbnail_media_id")
    thumbnail_media_id: string;

    /**
     * Equipment needed for this workout
     */
    @ManyToMany(() => Equipment, { 
        eager: true
    })
    @JoinTable({
        name: "workout_equipment",
        joinColumn: { name: "workout_id" },
        inverseJoinColumn: { name: "equipment_id" }
    })
    equipmentNeeded: Equipment[];

    /**
     * Exercises included in this workout
     * Eager loaded because exercises are essential to the workout
     * Cascade enabled to allow creating/updating exercises with the workout
     */
    @OneToMany(() => WorkoutExercise, workoutExercise => workoutExercise.workoutPlan, {
        cascade: true,
        eager: true
    })
    exercises: WorkoutExercise[];

    /**
     * Links to program workouts that include this workout
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    programWorkouts: ProgramWorkout[];

    /**
     * Creator of the workout plan
     * Bidirectional relationship with User.createdWorkouts
     */
    @ManyToOne(() => User, user => user.createdWorkouts, { 
        onDelete: "SET NULL",
        nullable: true
    })
    @JoinColumn({ name: "creator_id" })
    @Index("idx_workout_creator")
    creator: User;

    @Column({ nullable: true })
    @Index("idx_workout_creator_id")
    creator_id: string;

    /**
     * Related workouts that can be combined with this one
     */
    @ManyToMany(() => WorkoutPlan, { 
        nullable: true,
        onDelete: "SET NULL"
    })
    @JoinTable({
        name: "workout_plan_combinations",
        joinColumn: { name: "workout_id" },
        inverseJoinColumn: { name: "related_workout_id" }
    })
    relatedWorkouts: WorkoutPlan[];

    /**
     * Training programs that include this workout
     * Property maintained without TypeORM relationship decorator to prevent circular dependency
     */
    trainingPrograms: TrainingProgram[];

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => WorkoutMetadata)
    metadata: WorkoutMetadata = new WorkoutMetadata();

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => WorkoutStructure)
    workoutStructure: WorkoutStructure = new WorkoutStructure();

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => ProgressionModel)
    progressionModel: ProgressionModel = new ProgressionModel();

    @Column("jsonb", { 
        default: {
            volumeLoad: 0,
            density: 0,
            intensity: 0,
            totalTime: 0,
            lastCalculated: new Date(),
            totalRestTime: 0,
            estimatedCalories: 0
        }
    })
    @ValidateNested()
    @Type(() => WorkoutMetrics)
    @Index()
    metrics: WorkoutMetrics;

    @CreateDateColumn()
    @Index("idx_workout_createdAt")
    createdAt: Date;

    @UpdateDateColumn()
    @Index("idx_workout_updatedAt")
    updatedAt: Date;

    /**
     * Users who have marked this workout as a favorite
     * Inverse side of User.favoriteWorkouts
     */
    @ManyToMany(() => User, user => user.favoriteWorkouts)
    favoritedBy: User[];

    /**
     * Users who have this workout in their history
     * Inverse side of User.workoutHistory
     */
    @ManyToMany(() => User, user => user.workoutHistory)
    workoutHistoryOf: User[];

    @OneToMany(() => WorkoutSession, session => session.workoutPlan)
    sessions: WorkoutSession[];

    /**
     * Update metrics cache with standardized method
     * @param metrics Object with updated metric values
     * @returns Updated metrics object
     */
    private updateMetricsCache(metrics: Partial<WorkoutMetrics>): WorkoutMetrics {
        // Create a deep copy of the existing metrics
        const updatedMetrics = ModelUtils.deepCopy(this.metrics);
        
        // Update with new values
        Object.assign(updatedMetrics, metrics);
        
        // Ensure the timestamp is updated
        updatedMetrics.lastCalculated = new Date();
        
        // Set standard cache timeout
        updatedMetrics.cacheTimeoutMinutes = TIME_CONSTANTS.DEFAULT_CACHE_TIMEOUT_MINUTES;
        
        return updatedMetrics;
    }

    /**
     * Calculate the intensity score of the workout
     * @returns number between 0 and 1
     */
    calculateIntensity(): number {
        // Check if cached value is recent using the shared utility
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.intensity > 0) {
            return this.metrics.intensity;
        }

        const intensity = ModelUtils.calculateWorkoutIntensity(
            this.difficulty,
            this.workoutCategory,
            this.workoutStructure,
            this.equipmentNeeded?.length || 0,
            this.exercises
        );

        // Update cache using standardized method
        this.metrics = this.updateMetricsCache({ intensity });

        return intensity;
    }

    /**
     * Calculate estimated completion time in minutes
     * @returns number
     */
    calculateEstimatedTime(): number {
        // Check if cached value is recent using the shared utility
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.totalTime > 0) {
            return this.metrics.totalTime;
        }

        const totalTime = ModelUtils.calculateWorkoutTime(
            this.estimatedDuration,
            this.metadata?.warmupIncluded || false,
            this.metadata?.cooldownIncluded || false,
            this.exercises,
            this.workoutStructure
        );

        // Update cache using standardized method
        this.metrics = this.updateMetricsCache({
            totalTime,
            totalRestTime: totalTime - this.estimatedDuration
        });

        return totalTime;
    }

    /**
     * Get primary muscle groups targeted in this workout
     * @returns string[]
     */
    getPrimaryMuscleGroups(): string[] {
        const muscleGroups = new Set<string>();
        this.exercises?.forEach(exercise => {
            exercise.exercise.form.muscles.primary.forEach(muscle => {
                muscleGroups.add(muscle);
            });
        });
        return Array.from(muscleGroups);
    }

    /**
     * Check if the workout is balanced (works opposing muscle groups)
     * @returns boolean
     */
    isBalanced(): boolean {
        const muscleGroups = this.getPrimaryMuscleGroups();
        const opposingPairs = [
            ['chest', 'back'],
            ['quadriceps', 'hamstrings'],
            ['biceps', 'triceps'],
            ['anterior deltoid', 'posterior deltoid']
        ];

        return opposingPairs.some(([muscle1, muscle2]) => 
            muscleGroups.includes(muscle1) && muscleGroups.includes(muscle2)
        );
    }

    /**
     * Calculate the next progression values based on the progression model
     * @returns Object containing the next progression values
     */
    calculateNextProgression(): {
        intensityMultiplier: number;
        volumeMultiplier: number;
        deload: boolean;
    } {
        if (!this.progressionModel?.progressionType) {
            return { intensityMultiplier: 1, volumeMultiplier: 1, deload: false };
        }

        const currentWeek = Math.floor((Date.now() - this.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const deloadFrequency = this.progressionModel.deloadFrequency || 4;
        const isDeloadWeek = deloadFrequency > 0 && currentWeek % deloadFrequency === 0;

        if (isDeloadWeek) {
            return { intensityMultiplier: 0.6, volumeMultiplier: 0.7, deload: true };
        }

        const weekProgress = this.progressionModel.weeklyProgression?.[currentWeek];
        if (weekProgress) {
            return { 
                intensityMultiplier: weekProgress.intensityMultiplier,
                volumeMultiplier: weekProgress.volumeMultiplier,
                deload: false
            };
        }

        // Default progression based on type
        switch (this.progressionModel.progressionType) {
            case ProgressionType.LINEAR:
                return {
                    intensityMultiplier: 1 + (currentWeek * 0.05),
                    volumeMultiplier: 1 + (currentWeek * 0.025),
                    deload: false
                };
            case ProgressionType.UNDULATING:
                return {
                    intensityMultiplier: 1 + (Math.sin(currentWeek * Math.PI / 2) * 0.15),
                    volumeMultiplier: 1 + (Math.cos(currentWeek * Math.PI / 2) * 0.15),
                    deload: false
                };
            case ProgressionType.WAVE:
                const waveWeek = currentWeek % 3;
                return {
                    intensityMultiplier: 1 + (waveWeek * 0.1),
                    volumeMultiplier: 1 - (waveWeek * 0.05),
                    deload: false
                };
            default:
                return { intensityMultiplier: 1, volumeMultiplier: 1, deload: false };
        }
    }

    /**
     * Generate a variation of this workout with modified parameters
     * @param options Variation options
     * @returns Modified workout parameters
     */
    generateVariation(options: {
        intensityChange?: number;
        volumeChange?: number;
        timeConstraint?: number;
        excludeEquipment?: string[];
    }): Partial<WorkoutPlanData> {
        const variation: Partial<WorkoutPlanData> = {
            name: `${this.name} (Variation)`,
            description: this.description,
            difficulty: this.difficulty,
            workoutCategory: this.workoutCategory,
            estimatedDuration: this.estimatedDuration,
            workoutStructure: { ...this.workoutStructure },
            metadata: { ...this.metadata }
        };

        // Adjust for intensity change
        if (options.intensityChange) {
            if (options.intensityChange > 0 && this.difficulty !== Difficulty.ADVANCED) {
                variation.difficulty = Object.values(Difficulty)[
                    Object.values(Difficulty).indexOf(this.difficulty) + 1
                ] as Difficulty;
            } else if (options.intensityChange < 0 && this.difficulty !== Difficulty.BEGINNER) {
                variation.difficulty = Object.values(Difficulty)[
                    Object.values(Difficulty).indexOf(this.difficulty) - 1
                ] as Difficulty;
            }
        }

        // Adjust for volume change
        if (options.volumeChange && variation.workoutStructure) {
            variation.workoutStructure.totalSets = Math.max(
                1,
                Math.round((this.workoutStructure?.totalSets || 1) * (1 + options.volumeChange))
            );
        }

        // Adjust for time constraint
        if (options.timeConstraint) {
            const timeRatio = options.timeConstraint / this.estimatedDuration;
            variation.estimatedDuration = options.timeConstraint;
            if (variation.workoutStructure) {
                variation.workoutStructure.restBetweenExercises = 
                    Math.max(30, Math.round((this.workoutStructure?.restBetweenExercises || 60) * timeRatio));
                variation.workoutStructure.restBetweenSets = 
                    Math.max(30, Math.round((this.workoutStructure?.restBetweenSets || 60) * timeRatio));
            }
        }

        // Filter out excluded equipment
        if (options.excludeEquipment && this.equipmentNeeded) {
            variation.equipmentIds = this.equipmentNeeded
                .filter(eq => !options.excludeEquipment?.includes(String(eq.id)))
                .map(eq => String(eq.id));
        }

        return variation;
    }

    /**
     * Calculate the volume load of the workout
     * @returns Total volume load (weight * reps * sets)
     */
    calculateVolumeLoad(): number {
        // Check if cached value is recent using the shared utility
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.volumeLoad > 0) {
            return this.metrics.volumeLoad;
        }

        const volumeLoad = this.exercises.reduce((total, exercise) => {
            // Access the intensity object for weight and use repetitions for reps
            const weight = exercise.intensity?.weight || 0;
            const reps = exercise.repetitions || 0;
            const sets = exercise.sets || 0;
            return total + ModelUtils.calculateVolumeLoad(weight, reps, sets);
        }, 0);

        // Update cache using standardized method
        this.metrics = this.updateMetricsCache({ volumeLoad });

        return volumeLoad;
    }

    /**
     * Calculate density score (volume per minute)
     * @returns Workout density score
     */
    calculateDensity(): number {
        // Check if cached value is recent using the shared utility
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.density > 0) {
            return this.metrics.density;
        }

        const totalTime = this.calculateEstimatedTime();
        if (totalTime <= 0) return 0;

        const volumeLoad = this.calculateVolumeLoad();
        const density = ModelUtils.calculateDensity(volumeLoad, totalTime);

        // Update cache using standardized method
        this.metrics = this.updateMetricsCache({
            density,
            volumeLoad,
            totalTime
        });

        return density;
    }

    /**
     * Get total work time (excluding rest) in seconds
     * @returns Total work time in seconds
     */
    getTotalWorkTime(): number {
        if (!this.exercises || this.exercises.length === 0) return 0;
        
        return this.exercises.reduce((total, exercise) => {
            // Calculate work time per set
            let workTimePerSet = 0;
            
            if (exercise.duration > 0) {
                // If it's a timed exercise, use the duration
                workTimePerSet = exercise.duration;
            } else if (exercise.repetitions > 0) {
                // For rep-based exercises, estimate based on rep count (avg 3 seconds per rep)
                workTimePerSet = exercise.repetitions * 3;
            } else {
                // Default work time per set if no other info available
                workTimePerSet = 30; 
            }
            
            // Multiply by sets and add to total
            return total + (workTimePerSet * exercise.sets);
        }, 0);
    }

    /**
     * Get total rest time in seconds
     * @returns Total rest time in seconds
     */
    getTotalRestTime(): number {
        // Check if cached value is recent using the shared utility
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.totalRestTime) {
            return this.metrics.totalRestTime;
        }
        
        let totalRestTime = 0;
        
        // If workoutStructure defines rest times, use those
        if (this.workoutStructure) {
            const { restBetweenExercises, restBetweenSets, totalSets } = this.workoutStructure;
            
            if (restBetweenExercises) 
                totalRestTime += (this.exercises?.length - 1 || 0) * restBetweenExercises;
                
            if (restBetweenSets && totalSets) 
                totalRestTime += totalSets * restBetweenSets;
        } 
        // Otherwise calculate from individual exercise rest times
        else if (this.exercises?.length > 0) {
            // Inter-exercise rest
            // Calculate from individual exercises
            totalRestTime = this.exercises.reduce((total, exercise) => {
                return total + (exercise.restTime || 0) * (exercise.sets || 1);
            }, 0);
        }
        
        // Update cache using standardized method
        this.metrics = this.updateMetricsCache({ totalRestTime });
        
        return totalRestTime;
    }

    /**
     * Calculate the work-to-rest ratio
     * @returns Work to rest ratio
     */
    calculateWorkToRestRatio(): number {
        const totalWorkTime = this.getTotalWorkTime();
        const totalRestTime = this.getTotalRestTime();
        
        if (totalRestTime === 0) return 0; // Avoid division by zero
        
        return totalWorkTime / totalRestTime;
    }

    /**
     * Get all fitness goals this workout targets
     * @returns Array of FitnessGoal enums
     */
    getFitnessGoals(): FitnessGoal[] {
        const goals = new Set<FitnessGoal>();
        
        // Add goals from metadata
        if (this.metadata?.fitnessGoals) {
            this.metadata.fitnessGoals.forEach(goal => goals.add(goal));
        }
        
        // Infer goals from workout type
        switch(this.workoutCategory) {
            case WorkoutCategory.STRENGTH:
                goals.add(FitnessGoal.STRENGTH_GAIN);
                break;
            case WorkoutCategory.HYPERTROPHY:
                goals.add(FitnessGoal.HYPERTROPHY);
                goals.add(FitnessGoal.MUSCLE_BUILDING);
                break;
            case WorkoutCategory.ENDURANCE:
                goals.add(FitnessGoal.ENDURANCE);
                break;
            case WorkoutCategory.CARDIO:
                goals.add(FitnessGoal.ENDURANCE);
                goals.add(FitnessGoal.FAT_LOSS);
                break;
            case WorkoutCategory.HIIT:
                goals.add(FitnessGoal.FAT_LOSS);
                goals.add(FitnessGoal.ENDURANCE);
                break;
            case WorkoutCategory.FLEXIBILITY:
                goals.add(FitnessGoal.FLEXIBILITY);
                goals.add(FitnessGoal.MOBILITY);
                break;
            case WorkoutCategory.RECOVERY:
                goals.add(FitnessGoal.ACTIVE_RECOVERY);
                break;
            case WorkoutCategory.POWER:
                goals.add(FitnessGoal.POWER_DEVELOPMENT);
                break;
            case WorkoutCategory.SPORT_SPECIFIC:
                goals.add(FitnessGoal.SPORT_SPECIFIC);
                goals.add(FitnessGoal.ATHLETICISM);
                break;
            case WorkoutCategory.SKILL:
                goals.add(FitnessGoal.SKILL_DEVELOPMENT);
                break;
            default:
                goals.add(FitnessGoal.GENERAL_FITNESS);
        }
        
        return Array.from(goals);
    }

    getTrainingPrograms(): Promise<TrainingProgram[]> {
        // Return training programs that include this workout
        if (!this.programWorkouts) return Promise.resolve([]);
        
        // Extract unique programs
        const programs = [...new Set(this.programWorkouts.map(pw => pw.program))];
        return Promise.resolve(programs);
    }
} 