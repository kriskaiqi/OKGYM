import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, ValidateNested, Min, Max, IsUUID } from "class-validator";
import { Type } from 'class-transformer';
import { Exercise } from "./Exercise";
import { WorkoutPlan } from "./WorkoutPlan";

// Import enums from the correct location
import { 
    SetType, 
    SetStructure, 
    ExerciseRole
} from './shared/Enums';

import { 
    // Validation classes
    ExerciseIntensity,
    ExerciseTempo,
    RangeOfMotion,
    ProgressionStrategy,
    SubstitutionOptions,
    
    // Constants
    PROGRESSION_CONSTANTS,
    TIME_CONSTANTS
} from './shared';
import * as ModelUtils from './shared/Utils';

/**
 * WorkoutExercise represents an exercise within a workout plan.
 * Each unique entry represents one exercise instance in a workout sequence.
 * For multiple sets of the same exercise, use the sets field.
 * 
 * Relationships:
 * - ManyToOne with WorkoutPlan (each exercise belongs to one workout plan)
 * - ManyToOne with Exercise (each workout exercise references one exercise)
 * - ManyToOne with itself for supersets (optional)
 */
@Entity("workout_exercises")
@Index("idx_workout_exercise_order", ["workoutPlan", "order"]) // For efficient ordering within a workout
export class WorkoutExercise {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    @Column("int", { default: 0 })
    @IsNumber()
    @Min(0)
    order: number;

    @Column("int", { default: 0 })
    @IsNumber()
    @Min(0)
    repetitions: number;

    @Column("int", { default: 0 })
    @IsNumber()
    @Min(0)
    duration: number;

    @Column("int", { default: 30 })
    @IsNumber()
    @Min(0)
    restTime: number;

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => ExerciseIntensity)
    intensity: ExerciseIntensity;

    @Column("text", { nullable: true })
    @IsString()
    @IsOptional()
    notes: string;

    @Column("int", { default: 1 })
    @IsNumber()
    @Min(1)
    sets: number;  // Number of sets to perform

    @Column({
        type: "enum",
        enum: SetType,
        default: SetType.NORMAL
    })
    @IsEnum(SetType)
    setType: SetType;  // Type of set organization

    @ManyToOne(() => WorkoutExercise, { nullable: true })
    @JoinColumn({ name: "superset_with_exercise_id" })
    @Index("idx_fk_workout_exercise_superset")
    supersetWith: WorkoutExercise;

    @Column({ nullable: true })
    @IsUUID()
    @IsOptional()
    superset_with_exercise_id: string;

    @Column({
        type: "enum",
        enum: SetStructure,
        default: SetStructure.REGULAR
    })
    @IsEnum(SetStructure)
    setStructure: SetStructure;  // Special set structure

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => ExerciseTempo)
    tempo: ExerciseTempo;

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => RangeOfMotion)
    rangeOfMotion: RangeOfMotion;
    
    @Column({
        type: "enum",
        enum: ExerciseRole,
        default: ExerciseRole.PRIMARY
    })
    @IsEnum(ExerciseRole)
    exerciseRole: ExerciseRole;  // Role this exercise plays in the workout
    
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => ProgressionStrategy)
    progressionStrategy: ProgressionStrategy;
    
    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => SubstitutionOptions)
    substitutionOptions: SubstitutionOptions;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    /**
     * The base exercise this workout exercise refers to
     */
    @ManyToOne(() => Exercise, exercise => exercise.workoutExercises, {
        nullable: false,
        onDelete: "RESTRICT" // Prevent deletion of exercises used in workouts
    })
    @JoinColumn({ name: "exercise_id" })
    @Index("idx_fk_workout_exercise_exercise")
    @IsNotEmpty()
    exercise: Exercise;

    @Column("uuid")
    @IsNotEmpty()
    @IsUUID()
    exercise_id: string;

    /**
     * The workout plan this exercise belongs to
     */
    @ManyToOne(() => WorkoutPlan, workoutPlan => workoutPlan.exercises, {
        nullable: false,
        onDelete: "CASCADE" // When a workout is deleted, remove its exercises
    })
    @JoinColumn({ name: "workout_plan_id" })
    @Index("idx_fk_workout_exercise_plan")
    workoutPlan: WorkoutPlan;

    @Column("uuid")
    @IsUUID()
    workout_plan_id: string;

    /**
     * Calculate total volume for this exercise
     * @returns Volume (weight * reps * sets)
     */
    calculateVolume(): number {
        const weight = this.intensity?.weight || 0;
        const reps = this.repetitions || 0;
        return ModelUtils.calculateVolumeLoad(weight, reps, this.sets);
    }

    /**
     * Calculate total time for this exercise (in seconds)
     * @returns Total time including rest
     */
    calculateTotalTime(): number {
        return ModelUtils.calculateExerciseTime(
            this.sets,
            this.repetitions,
            this.duration,
            this.restTime,
            this.tempo
        );
    }

    /**
     * Get relative intensity of this exercise
     * @returns Intensity score between 0 and 1
     */
    getRelativeIntensity(): number {
        // If RPE is provided, scale it to 0-1
        if (this.intensity?.rateOfPerceivedExertion) {
            return ModelUtils.normalize(this.intensity.rateOfPerceivedExertion, 1, 10);
        }
        
        // If percentage of 1RM is provided
        if (this.intensity?.percentOfOneRepMax) {
            return ModelUtils.normalize(this.intensity.percentOfOneRepMax, 0, 100);
        }
        
        // Determine intensity based on rep range
        if (this.repetitions <= 5) {
            return PROGRESSION_CONSTANTS.LOW_REPS_INTENSITY;
        } else if (this.repetitions <= 12) {
            return PROGRESSION_CONSTANTS.MEDIUM_REPS_INTENSITY;
        } else {
            return PROGRESSION_CONSTANTS.HIGH_REPS_INTENSITY;
        }
    }

    /**
     * Generate exercise sequence item for workout session
     * @returns Exercise sequence item for workout session
     */
    generateSessionPlanItem(): {
        exerciseId: string;
        order: number;
        targetRepetitions: number;
        targetDuration: number;
        targetSets: number;
        restTime: number;
        notes?: string;
    } {
        return {
            exerciseId: this.exercise_id,
            order: this.order,
            targetRepetitions: this.repetitions,
            targetDuration: this.duration,
            targetSets: this.sets,
            restTime: this.restTime,
            notes: this.notes
        };
    }

    /**
     * Create exercise attempt from current configuration
     * @param formScore Form quality score (0-1)
     * @param completedReps Actual completed repetitions (defaults to target)
     * @param completedDuration Actual completed duration (defaults to target)
     * @returns Exercise attempt object
     */
    createAttempt(formScore: number, completedReps?: number, completedDuration?: number): {
        timestamp: Date;
        repetitions: number;
        duration: number;
        formScore: number;
        weight?: number;
        resistance?: number;
        notes?: string;
    } {
        return {
            timestamp: new Date(),
            repetitions: completedReps !== undefined ? completedReps : this.repetitions,
            duration: completedDuration !== undefined ? completedDuration : this.duration,
            formScore: Math.max(0, Math.min(1, formScore)),
            weight: this.intensity?.weight,
            resistance: this.intensity?.resistance,
            notes: this.notes
        };
    }

    /**
     * Check if this exercise allows substitution
     * @returns Boolean indicating if substitution is allowed
     */
    allowsSubstitution(): boolean {
        return this.substitutionOptions?.allowEquipmentVariations === true || 
               this.substitutionOptions?.allowProgressions === true || 
               this.substitutionOptions?.allowRegressions === true || 
               (this.substitutionOptions?.preferredSubstitutes !== undefined && 
                this.substitutionOptions.preferredSubstitutes.length > 0);
    }

    /**
     * Get next progression for this exercise
     * @param strategy "weight", "reps", "sets", or "rest_reduction"
     * @returns Updated exercise configuration
     */
    getProgression(strategy: string = 'auto'): Partial<WorkoutExercise> {
        // Use the defined progression strategy if available, otherwise use the passed strategy
        const progressionType = this.progressionStrategy?.targetProgressionType || strategy;
        
        const progressionValues = ModelUtils.getExerciseProgression(
            progressionType,
            this.intensity?.weight,
            this.repetitions,
            this.sets,
            this.duration,
            this.restTime,
            this.progressionStrategy?.progressionRate
        );
        
        // Create the result object with properly typed properties
        const result: Partial<WorkoutExercise> = {};
        
        if (progressionValues.weight !== undefined && this.intensity) {
            result.intensity = {
                ...this.intensity,
                weight: progressionValues.weight
            };
        }
        
        if (progressionValues.repetitions !== undefined) {
            result.repetitions = progressionValues.repetitions;
        }
        
        if (progressionValues.sets !== undefined) {
            result.sets = progressionValues.sets;
        }
        
        if (progressionValues.duration !== undefined) {
            result.duration = progressionValues.duration;
        }
        
        if (progressionValues.restTime !== undefined) {
            result.restTime = progressionValues.restTime;
        }
        
        return result;
    }

    /**
     * Scale exercise difficulty
     * @param factor Scaling factor (1.0 = no change, <1.0 = easier, >1.0 = harder)
     * @returns Updated exercise configuration
     */
    scaleIntensity(factor: number): Partial<WorkoutExercise> {
        if (factor === 1.0) return {}; // No change needed
        
        const result = ModelUtils.scaleExerciseIntensity(
            this.intensity?.weight,
            this.repetitions,
            this.duration,
            this.restTime,
            factor
        );
        
        // Create the properly typed return object
        const update: Partial<WorkoutExercise> = {
            restTime: result.restTime
        };
        
        if (result.repetitions !== undefined) {
            update.repetitions = result.repetitions;
        }
        
        if (result.duration !== undefined) {
            update.duration = result.duration;
        }
        
        if (result.weight !== undefined && this.intensity) {
            update.intensity = {
                ...this.intensity,
                weight: result.weight
            };
        }
        
        return update;
    }

    /**
     * Scale exercise volume
     * @param factor Scaling factor (1.0 = no change, <1.0 = less volume, >1.0 = more volume)
     * @returns Updated exercise configuration
     */
    scaleVolume(factor: number): Partial<WorkoutExercise> {
        if (factor === 1.0) return {}; // No change needed
        
        const result = ModelUtils.scaleExerciseVolume(
            this.sets,
            this.repetitions,
            this.duration,
            factor
        );
        
        // Create the properly typed return object
        const update: Partial<WorkoutExercise> = {};
        
        if (result.sets !== undefined) {
            update.sets = result.sets;
        }
        
        if (result.repetitions !== undefined) {
            update.repetitions = result.repetitions;
        }
        
        if (result.duration !== undefined) {
            update.duration = result.duration;
        }
        
        return update;
    }

    /**
     * Generate a regression (easier version) of this exercise
     * @returns Configuration for an easier version of this exercise
     */
    generateRegression(): Partial<WorkoutExercise> {
        const result = ModelUtils.generateExerciseRegression(
            this.intensity?.weight,
            this.repetitions,
            this.duration,
            this.sets,
            this.restTime
        );
        
        // Create the properly typed return object
        const update: Partial<WorkoutExercise> = {
            restTime: result.restTime
        };
        
        if (result.sets !== undefined) {
            update.sets = result.sets;
        }
        
        if (result.repetitions !== undefined) {
            update.repetitions = result.repetitions;
        }
        
        if (result.duration !== undefined) {
            update.duration = result.duration;
        }
        
        if (result.weight !== undefined && this.intensity) {
            update.intensity = {
                ...this.intensity,
                weight: result.weight
            };
        }
        
        return update;
    }

    /**
     * Generate a progression (harder version) of this exercise
     * @returns Configuration for a harder version of this exercise
     */
    generateProgression(): Partial<WorkoutExercise> {
        const result = ModelUtils.generateExerciseProgression(
            this.intensity?.weight,
            this.repetitions,
            this.duration,
            this.sets,
            this.restTime
        );
        
        // Create the properly typed return object
        const update: Partial<WorkoutExercise> = {
            restTime: result.restTime
        };
        
        if (result.sets !== undefined) {
            update.sets = result.sets;
        }
        
        if (result.repetitions !== undefined) {
            update.repetitions = result.repetitions;
        }
        
        if (result.duration !== undefined) {
            update.duration = result.duration;
        }
        
        if (result.weight !== undefined && this.intensity) {
            update.intensity = {
                ...this.intensity,
                weight: result.weight
            };
        }
        
        return update;
    }

    /**
     * Create a clone of this exercise with specified modifications
     * @param modifications Partial properties to modify in the clone
     * @returns New WorkoutExercise object
     */
    clone(modifications: Partial<WorkoutExercise> = {}): WorkoutExercise {
        const clone = new WorkoutExercise();
        
        // Copy all primitive properties
        clone.order = this.order;
        clone.repetitions = this.repetitions;
        clone.duration = this.duration;
        clone.restTime = this.restTime;
        clone.notes = this.notes;
        clone.sets = this.sets;
        clone.setType = this.setType;
        clone.setStructure = this.setStructure;
        clone.exerciseRole = this.exerciseRole;
        clone.exercise_id = this.exercise_id;
        
        // Deep copy complex objects
        if (this.intensity) {
            clone.intensity = { ...this.intensity };
        }
        
        if (this.tempo) {
            clone.tempo = { ...this.tempo };
        }
        
        if (this.rangeOfMotion) {
            clone.rangeOfMotion = { ...this.rangeOfMotion };
        }
        
        if (this.progressionStrategy) {
            clone.progressionStrategy = { ...this.progressionStrategy };
        }
        
        if (this.substitutionOptions) {
            clone.substitutionOptions = { ...this.substitutionOptions };
            if (this.substitutionOptions.preferredSubstitutes) {
                clone.substitutionOptions.preferredSubstitutes = [...this.substitutionOptions.preferredSubstitutes];
            }
        }
        
        // Apply modifications
        Object.assign(clone, modifications);
        
        return clone;
    }

    /**
     * Create a modified version of this exercise for a different equipment
     * @param newExerciseId ID of the substitute exercise
     * @returns New WorkoutExercise with adjusted configuration
     */
    createSubstitution(newExerciseId: string): WorkoutExercise {
        // Create a clone with the new exercise ID
        return this.clone({
            exercise_id: newExerciseId,
            // Reset any exercise-specific configurations that shouldn't transfer
            rangeOfMotion: undefined
        });
    }

    /**
     * Create a superset pair with another exercise
     * @param otherExercise The exercise to superset with
     * @returns Array containing this exercise and a clone of the other exercise
     */
    createSuperset(otherExercise: WorkoutExercise): [WorkoutExercise, WorkoutExercise] {
        // Set this exercise as the primary in the superset
        this.setType = SetType.SUPER;
        
        // Create a clone of the other exercise and mark it as part of the superset
        const secondaryExercise = otherExercise.clone({
            setType: SetType.SUPER,
            order: this.order + 0.1, // Use decimal to maintain order but keep exercises together
            restTime: this.restTime // Use the same rest time for both exercises
        });
        
        return [this, secondaryExercise];
    }

    /**
     * Create drop set variations of this exercise
     * @param dropCount Number of drop sets (usually 1-3)
     * @param intensityReduction Factor to reduce intensity with each drop (default: 0.8)
     * @returns Array of exercises including the original and drop sets
     */
    createDropSet(dropCount: number = 1, intensityReduction: number = 0.8): WorkoutExercise[] {
        // Set the main exercise as a drop set type
        this.setStructure = SetStructure.DROP_SET;
        
        const exercises: WorkoutExercise[] = [this];
        
        // Get drop set configurations from utility function
        const dropSets = ModelUtils.calculateDropSets(
            this.intensity?.weight,
            this.repetitions,
            this.restTime,
            dropCount,
            intensityReduction
        );
        
        // Create each drop set
        dropSets.forEach((dropConfig, index) => {
            const dropSet = this.clone({
                order: this.order + ((index + 1) * 0.1), // Use decimal to maintain order but keep exercises together
                setStructure: SetStructure.DROP_SET,
                sets: 1, // Drop sets are typically 1 set
                restTime: dropConfig.restTime,
                repetitions: dropConfig.repetitions
            });
            
            // Apply weight if provided
            if (dropConfig.weight !== undefined && dropSet.intensity) {
                dropSet.intensity.weight = dropConfig.weight;
            }
            
            exercises.push(dropSet);
        });
        
        return exercises;
    }

    /**
     * Validate exercise configuration
     * @returns Array of validation errors, empty if valid
     */
    validate(): string[] {
        const errors: string[] = [];

        // Check for basic configuration errors
        if (!this.exercise_id) {
            errors.push("Exercise ID is required");
        }

        if (this.sets <= 0) {
            errors.push("Sets must be greater than 0");
        }

        // Check for conflicts in measurement types
        const hasDuration = this.duration > 0;
        const hasReps = this.repetitions > 0;
        
        if (!hasDuration && !hasReps) {
            errors.push("Either repetitions or duration must be specified");
        }

        // Validate tempo settings if specified
        if (this.tempo) {
            const { eccentric, concentric, pause, pauseAtTop } = this.tempo;
            const totalTempo = (eccentric || 0) + (concentric || 0) + (pause || 0) + (pauseAtTop || 0);
            
            if (totalTempo > 0 && !hasReps) {
                errors.push("Tempo can only be specified for repetition-based exercises");
            }
        }

        // Validate range of motion if specified
        if (this.rangeOfMotion?.partial && !this.rangeOfMotion.partialType) {
            errors.push("When using partial range of motion, the type must be specified");
        }

        // Validate progression strategy
        if (this.progressionStrategy) {
            const { targetProgressionType, progressionRate } = this.progressionStrategy;
            
            if (targetProgressionType === 'weight' && this.intensity?.weight === undefined) {
                errors.push("Weight progression requires weight to be specified");
            }
            
            if (progressionRate !== undefined && progressionRate <= 0) {
                errors.push("Progression rate must be greater than 0");
            }
            
            if (this.progressionStrategy.deloadFrequency !== undefined && 
                this.progressionStrategy.deloadFrequency <= 0) {
                errors.push("Deload frequency must be greater than 0");
            }
        }

        return errors;
    }
} 