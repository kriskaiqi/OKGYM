import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";
import { User } from "./User";
import { Exercise } from "./Exercise";
import { ExerciseCategory } from "./ExerciseCategory";
import { Media } from "./Media";
import { TutorialDifficulty, VideoQuality, TutorialType } from "./shared/Enums";

/**
 * VideoTutorial represents an instructional video related to exercises
 * These can be general tutorials or exercise-specific
 */
@Entity("video_tutorials")
export class VideoTutorial {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /**
     * Title of the video tutorial
     */
    @Column({ length: 100 })
    title: string;

    /**
     * Description of what the video covers
     */
    @Column({ type: "text" })
    description: string;

    /**
     * Type of tutorial
     */
    @Column({
        type: "enum",
        enum: TutorialType,
        default: TutorialType.DEMONSTRATION
    })
    @Index()
    type: TutorialType;

    /**
     * Duration of the video in seconds
     */
    @Column({ type: "float" })
    durationSeconds: number;

    /**
     * Video quality
     */
    @Column({
        type: "enum",
        enum: VideoQuality,
        default: VideoQuality.HD
    })
    quality: VideoQuality;

    /**
     * Difficulty level of the tutorial
     */
    @Column({
        type: "enum",
        enum: TutorialDifficulty,
        default: TutorialDifficulty.BEGINNER
    })
    @Index()
    difficulty: TutorialDifficulty;

    /**
     * Primary exercise this tutorial is for
     * When the exercise is deleted, this tutorial's exercise reference will be set to null
     */
    @ManyToOne(() => Exercise, { 
        nullable: true,
        onDelete: "SET NULL" 
    })
    @JoinColumn({ name: "exercise_id" })
    @Index("idx_fk_videotutorial_exercise")
    exercise: Exercise;

    @Column("uuid", { nullable: true })
    @Index("idx_videotutorial_exercise_id")
    exercise_id: string;

    /**
     * Categories this tutorial applies to
     * When a tutorial is deleted, the association with categories will be removed
     */
    @ManyToMany(() => ExerciseCategory, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    })
    @JoinTable({
        name: "video_tutorial_categories",
        joinColumn: { name: "tutorial_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "category_id", referencedColumnName: "id" }
    })
    categories: ExerciseCategory[];

    /**
     * Creator/instructor in the video
     */
    @Column({ length: 100, nullable: true })
    instructor: string;

    /**
     * Whether this is a premium video (requires subscription)
     */
    @Column({ type: "boolean", default: false })
    isPremium: boolean;

    /**
     * Language of the tutorial
     */
    @Column({ length: 50, default: "English" })
    language: string;

    /**
     * Whether the video has closed captions
     */
    @Column({ type: "boolean", default: false })
    hasClosedCaptions: boolean;

    /**
     * Author of the video (admin or trainer)
     * When the author is deleted, the author reference will be set to null
     */
    @ManyToOne(() => User, { 
        nullable: true,
        onDelete: "SET NULL" 
    })
    @JoinColumn({ name: "author_id" })
    @Index("idx_fk_videotutorial_author")
    author: User;

    @Column("uuid", { nullable: true })
    @Index("idx_videotutorial_author_id")
    author_id: string;

    /**
     * Average rating from users (0-5)
     */
    @Column({ type: "float", default: 0 })
    averageRating: number;

    /**
     * Number of ratings
     */
    @Column({ type: "integer", default: 0 })
    ratingCount: number;

    /**
     * Number of views
     */
    @Column({ type: "integer", default: 0 })
    viewCount: number;

    /**
     * Whether this tutorial is featured
     */
    @Column({ type: "boolean", default: false })
    isFeatured: boolean;

    /**
     * Whether this tutorial is published (visible to users)
     */
    @Column({ type: "boolean", default: true })
    isPublished: boolean;

    /**
     * Timestamps at which key movements/instructions occur
     */
    @Column({ type: "jsonb", nullable: true })
    timestamps: Array<{
        time: number;
        label: string;
        description?: string;
    }>;

    /**
     * Additional data as JSON
     */
    @Column({ type: "jsonb", nullable: true })
    metadata: {
        keywords?: string[];
        equipment?: string[];
        muscleGroups?: string[];
        prerequisites?: string[];
        nextStepTutorials?: string[];
        transcriptUrl?: string;
        alternateAngles?: string[];
        downloadableResources?: Array<{
            name: string;
            description: string;
            url: string;
            type: string;
        }>;
        relatedExerciseIds?: string[];
        productionQuality?: string;
        notes?: string;
    };

    /**
     * Video media asset
     * When the media is deleted, this reference will be set to null
     */
    @ManyToOne(() => Media, {
        nullable: true,
        onDelete: "SET NULL"
    })
    @JoinColumn({ name: "video_media_id" })
    @Index("idx_fk_videotutorial_video")
    videoMedia: Media;

    @Column("uuid", { nullable: true })
    @Index("idx_videotutorial_video_id")
    video_media_id: string;

    /**
     * Thumbnail image
     * When the media is deleted, this reference will be set to null
     */
    @ManyToOne(() => Media, {
        nullable: true,
        onDelete: "SET NULL"
    })
    @JoinColumn({ name: "thumbnail_media_id" })
    @Index("idx_fk_videotutorial_thumbnail")
    thumbnailMedia: Media;

    @Column("uuid", { nullable: true })
    @Index("idx_videotutorial_thumbnail_id")
    thumbnail_media_id: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}

/**
 * Interface for creating video tutorials
 */
export interface VideoTutorialData {
    title: string;
    description: string;
    type: TutorialType;
    videoMediaId: string;
    thumbnailMediaId?: string;
    durationSeconds: number;
    quality?: VideoQuality;
    difficulty?: TutorialDifficulty;
    exerciseId?: string;
    categoryIds?: string[];
    instructor?: string;
    isPremium?: boolean;
    language?: string;
    hasClosedCaptions?: boolean;
    authorId?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    timestamps?: Array<{
        time: number;
        label: string;
        description?: string;
    }>;
    metadata?: {
        keywords?: string[];
        equipment?: string[];
        muscleGroups?: string[];
        prerequisites?: string[];
        nextStepTutorials?: string[];
        transcriptUrl?: string;
        alternateAngles?: string[];
        downloadableResources?: Array<{
            name: string;
            description: string;
            url: string;
            type: string;
        }>;
        relatedExerciseIds?: string[];
        productionQuality?: string;
        notes?: string;
    };
} 