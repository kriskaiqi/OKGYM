import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index,
    Check
} from 'typeorm';
import { Exercise } from './Exercise';

/**
 * Types of relationships between exercises
 */
export enum RelationType {
    VARIATION = "VARIATION",       // Different versions of the same exercise
    ALTERNATIVE = "ALTERNATIVE",   // Different exercises that target similar muscles/goals
    PROGRESSION = "PROGRESSION",   // More advanced version of the exercise
    REGRESSION = "REGRESSION"      // Easier version of the exercise
}

/**
 * ExerciseRelation represents relationships between exercises,
 * consolidating variations, alternatives, progressions, and regressions
 * into a single table with a type discriminator.
 * 
 * This entity allows:
 * - Creating comprehensive exercise progressions/regressions
 * - Suggesting alternative exercises for equipment limitations
 * - Identifying variations of the same basic movement
 * 
 * Relationships:
 * - ManyToOne with Exercise as baseExercise (the source exercise in the relationship)
 * - ManyToOne with Exercise as relatedExercise (the target exercise in the relationship)
 */
@Entity("exercise_relations")
@Index(["baseExercise", "relationType"])
@Index(["relatedExercise", "relationType"])
export class ExerciseRelation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /**
     * The source exercise in the relationship
     * When the base exercise is deleted, all its relations will be deleted
     */
    @ManyToOne(() => Exercise, exercise => exercise.relationsFrom, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "base_exercise_id" })
    @Index("idx_fk_exerciserelation_base")
    baseExercise: Exercise;

    /**
     * Foreign key to the base exercise
     */
    @Column("uuid")
    @Index("idx_exerciserelation_base_id")
    base_exercise_id: string;

    /**
     * The target exercise in the relationship
     * When the related exercise is deleted, all its relations will be deleted
     */
    @ManyToOne(() => Exercise, exercise => exercise.relationsTo, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "related_exercise_id" })
    @Index("idx_fk_exerciserelation_related")
    relatedExercise: Exercise;

    /**
     * Foreign key to the related exercise
     */
    @Column("uuid")
    @Index("idx_exerciserelation_related_id")
    related_exercise_id: string;

    /**
     * The type of relationship between the two exercises
     */
    @Column({
        type: "enum",
        enum: RelationType
    })
    @Index("idx_exerciserelation_type")
    relationType: RelationType;

    /**
     * Similarity score between the two exercises (0-1)
     * Higher values indicate more similarity
     */
    @Column("float", { default: 1 })
    @Check(`"similarityScore" >= 0 AND "similarityScore" <= 1`)
    similarityScore: number;

    /**
     * Optional notes about the relationship
     */
    @Column({ type: "text", nullable: true })
    notes: string;

    /**
     * Timestamp when the relation was created
     */
    @CreateDateColumn()
    createdAt: Date;

    /**
     * Timestamp when the relation was last updated
     */
    @UpdateDateColumn()
    updatedAt: Date;
} 