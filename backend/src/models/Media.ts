import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    BeforeRemove,
    OneToMany,
    ManyToMany,
    JoinTable
} from "typeorm";
import { IsUrl, IsEnum, Min, Max, IsString, IsNumber, IsOptional, IsBoolean, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Exercise } from "./Exercise";
import { VideoTutorial } from "./VideoTutorial";
import { Equipment } from "./Equipment";
import { WorkoutPlan } from "./WorkoutPlan";
import { ExerciseFormAnalysis } from "./ExerciseFormAnalysis";
import { User } from "./User";

/**
 * Media types supported in the application
 * NOTE: This should be moved to shared/Enums.ts in a future update for consistency
 */
export enum MediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT"
}

/**
 * Media usage contexts
 * NOTE: This should be moved to shared/Enums.ts in a future update for consistency
 */
export enum MediaContext {
    EXERCISE = "EXERCISE",
    TUTORIAL = "TUTORIAL",
    EQUIPMENT = "EQUIPMENT",
    WORKOUT = "WORKOUT",
    PROGRAM = "PROGRAM",
    USER = "USER",
    ACHIEVEMENT = "ACHIEVEMENT",
    FORM_ANALYSIS = "FORM_ANALYSIS",
    AUDIO_CUE = "AUDIO_CUE"
}

/**
 * Media quality/resolution options
 * NOTE: This should be moved to shared/Enums.ts in a future update for consistency
 */
export enum MediaQuality {
    LOW = "LOW",           // Thumbnail/preview quality
    MEDIUM = "MEDIUM",     // Standard web quality
    HIGH = "HIGH",         // HD quality
    ULTRA = "ULTRA"       // 4K/Original quality
}

/**
 * Entity to centralize media management across the application
 * 
 * Relationships:
 * - ManyToMany with Exercise (exercises that use this media)
 * - OneToMany with VideoTutorial (tutorials using this media)
 * - OneToMany with Equipment (equipment using this media)
 * - OneToMany with WorkoutPlan (workout plans using this media)
 * - OneToMany with ExerciseFormAnalysis (form analyses using this media)
 */
@Entity("media")
@Index("idx_media_entity", ["entityType", "entityStringId"])
@Index("idx_media_entity_numeric", ["entityType", "entityNumericId"])
@Index("idx_media_type_context", ["context", "type"])
export class Media {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: MediaType
    })
    @IsEnum(MediaType)
    @Index("idx_media_type")
    type: MediaType;

    @Column({
        type: "enum",
        enum: MediaContext
    })
    @IsEnum(MediaContext)
    @Index("idx_media_context")
    context: MediaContext;

    @Column({ length: 255 })
    @IsUrl()
    @IsString()
    url: string;

    @Column({ length: 255, nullable: true })
    @IsUrl()
    @IsString()
    @IsOptional()
    thumbnailUrl: string;

    @Column({ length: 255 })
    @IsString()
    filename: string;

    @Column({ length: 100 })
    @IsString()
    mimeType: string;

    @Column({ type: "bigint" })
    @IsNumber()
    @Min(0)
    size: number;

    @Column({
        type: "enum",
        enum: MediaQuality,
        default: MediaQuality.MEDIUM
    })
    @IsEnum(MediaQuality)
    quality: MediaQuality;

    @Column({ type: "float", nullable: true })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration: number;

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => Object)
    @IsOptional()
    dimensions: {
        width: number;
        height: number;
        aspectRatio?: number;
    };

    @Column({ type: "text", nullable: true })
    @IsString()
    @IsOptional()
    altText: string;

    @Column({ type: "text", nullable: true })
    @IsString()
    @IsOptional()
    caption: string;

    @Column({ length: 50, nullable: true })
    @IsString()
    @IsOptional()
    @Index("idx_media_entity_string")
    entityStringId: string;

    @Column({ type: "bigint", nullable: true })
    @IsNumber()
    @IsOptional()
    @Index("idx_media_entity_number")
    entityNumericId: number;

    @Column({ length: 50 })
    @IsString()
    @Index("idx_media_entity_type")
    entityType: string;

    @Column({ type: "integer", default: 0 })
    @IsNumber()
    displayOrder: number;

    @Column({ type: "boolean", default: false })
    @IsBoolean()
    isPrimary: boolean;

    @Column("jsonb", { nullable: true })
    @ValidateNested()
    @Type(() => Object)
    @IsOptional()
    metadata: {
        encoding?: string;
        bitrate?: number;
        codec?: string;
        fps?: number;
        colorSpace?: string;
        tags?: string[];
        location?: {
            latitude: number;
            longitude: number;
        };
        copyright?: string;
        source?: string;
        processingStatus?: string;
        variants?: Array<{
            quality: MediaQuality;
            url: string;
            size: number;
        }>;
        storageDetails?: {
            bucket?: string;
            path?: string;
            provider?: string;
        };
    };

    /**
     * Exercises that use this media
     */
    @ManyToMany(() => Exercise, exercise => exercise.media)
    @JoinTable({
        name: "exercise_media",
        joinColumn: { name: "media_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "exercise_id", referencedColumnName: "id" }
    })
    exercises: Exercise[];

    /**
     * Video tutorials that use this media as the main video
     */
    @OneToMany(() => VideoTutorial, tutorial => tutorial.videoMedia)
    videoTutorials: VideoTutorial[];

    /**
     * Video tutorials that use this media as the thumbnail
     */
    @OneToMany(() => VideoTutorial, tutorial => tutorial.thumbnailMedia)
    tutorialThumbnails: VideoTutorial[];

    /**
     * Equipment that uses this media as the image
     * When media is deleted, the equipment's image reference will be set to null
     */
    @OneToMany(() => Equipment, equipment => equipment.image, {
        cascade: ["insert", "update"]
    })
    equipmentImages: Equipment[];

    /**
     * Equipment that uses this media as the video
     * When media is deleted, the equipment's video reference will be set to null
     */
    @OneToMany(() => Equipment, equipment => equipment.video, {
        cascade: ["insert", "update"]
    })
    equipmentVideos: Equipment[];

    /**
     * Workout plans that use this media as the video
     */
    @OneToMany(() => WorkoutPlan, plan => plan.video)
    workoutVideos: WorkoutPlan[];

    /**
     * Workout plans that use this media as the thumbnail
     */
    @OneToMany(() => WorkoutPlan, plan => plan.thumbnail)
    workoutThumbnails: WorkoutPlan[];

    /**
     * Form analyses that use this media as video
     */
    @OneToMany(() => ExerciseFormAnalysis, analysis => analysis.video)
    formAnalysisVideos: ExerciseFormAnalysis[];

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @BeforeRemove()
    async deleteFile() {
        if (!this.metadata?.storageDetails) {
            console.log('No storage details found for media ID:', this.id);
            return;
        }
        
        const { provider, bucket, path } = this.metadata.storageDetails;
        
        if (!bucket || !path) {
            console.warn(`Missing bucket or path for media ID: ${this.id}`);
            return;
        }
        
        try {
            switch (provider?.toLowerCase()) {
                case 's3':
                case 'aws':
                    await this.deleteFromS3(bucket, path);
                    break;
                case 'gcs':
                case 'google':
                    await this.deleteFromGCS(bucket, path);
                    break;
                case 'azure':
                    await this.deleteFromAzure(bucket, path);
                    break;
                case 'local':
                    await this.deleteFromLocalFileSystem(path);
                    break;
                default:
                    console.warn(`Unsupported storage provider: ${provider} for media ID: ${this.id}`);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            // We don't want to block entity deletion if file cleanup fails
            // But we should log it for monitoring
        }
    }
    
    private async deleteFromS3(bucket: string, path: string): Promise<void> {
        // Placeholder for AWS S3 implementation
        // In a real implementation, you would use the AWS SDK
        /*
        const AWS = require('aws-sdk');
        const s3 = new AWS.S3();
        await s3.deleteObject({
            Bucket: bucket,
            Key: path
        }).promise();
        */
        console.log(`S3 delete operation for bucket: ${bucket}, path: ${path}`);
    }
    
    private async deleteFromGCS(bucket: string, path: string): Promise<void> {
        // Placeholder for Google Cloud Storage implementation
        // In a real implementation, you would use the GCS SDK
        /*
        const { Storage } = require('@google-cloud/storage');
        const storage = new Storage();
        await storage.bucket(bucket).file(path).delete();
        */
        console.log(`GCS delete operation for bucket: ${bucket}, path: ${path}`);
    }
    
    private async deleteFromAzure(container: string, blobName: string): Promise<void> {
        // Placeholder for Azure Blob Storage implementation
        // In a real implementation, you would use the Azure SDK
        /*
        const { BlobServiceClient } = require('@azure/storage-blob');
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(container);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();
        */
        console.log(`Azure delete operation for container: ${container}, blob: ${blobName}`);
    }
    
    private async deleteFromLocalFileSystem(filePath: string): Promise<void> {
        // Placeholder for local filesystem implementation
        // In a real implementation, you would use fs module
        /*
        const fs = require('fs');
        const { promisify } = require('util');
        const unlinkAsync = promisify(fs.unlink);
        
        if (fs.existsSync(filePath)) {
            await unlinkAsync(filePath);
        }
        */
        console.log(`Local file delete operation for path: ${filePath}`);
    }
}

/**
 * Interface for creating new media
 */
export interface MediaData {
    type: MediaType;
    context: MediaContext;
    url: string;
    thumbnailUrl?: string;
    filename: string;
    mimeType: string;
    size: number;
    quality?: MediaQuality;
    duration?: number;
    dimensions?: {
        width: number;
        height: number;
        aspectRatio?: number;
    };
    altText?: string;
    caption?: string;
    entityStringId?: string;
    entityNumericId?: number;
    entityType: string;
    displayOrder?: number;
    isPrimary?: boolean;
    metadata?: {
        encoding?: string;
        bitrate?: number;
        codec?: string;
        fps?: number;
        colorSpace?: string;
        tags?: string[];
        location?: {
            latitude: number;
            longitude: number;
        };
        copyright?: string;
        source?: string;
        variants?: Array<{
            quality: MediaQuality;
            url: string;
            size: number;
        }>;
        storageDetails?: {
            bucket?: string;
            path?: string;
            provider?: string;
        };
    };
} 