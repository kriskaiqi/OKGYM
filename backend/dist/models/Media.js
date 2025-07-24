"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Media = exports.MediaQuality = exports.MediaContext = exports.MediaType = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const Exercise_1 = require("./Exercise");
const VideoTutorial_1 = require("./VideoTutorial");
const Equipment_1 = require("./Equipment");
const WorkoutPlan_1 = require("./WorkoutPlan");
const ExerciseFormAnalysis_1 = require("./ExerciseFormAnalysis");
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "IMAGE";
    MediaType["VIDEO"] = "VIDEO";
    MediaType["AUDIO"] = "AUDIO";
    MediaType["DOCUMENT"] = "DOCUMENT";
})(MediaType || (exports.MediaType = MediaType = {}));
var MediaContext;
(function (MediaContext) {
    MediaContext["EXERCISE"] = "EXERCISE";
    MediaContext["TUTORIAL"] = "TUTORIAL";
    MediaContext["EQUIPMENT"] = "EQUIPMENT";
    MediaContext["WORKOUT"] = "WORKOUT";
    MediaContext["PROGRAM"] = "PROGRAM";
    MediaContext["USER"] = "USER";
    MediaContext["ACHIEVEMENT"] = "ACHIEVEMENT";
    MediaContext["FORM_ANALYSIS"] = "FORM_ANALYSIS";
    MediaContext["AUDIO_CUE"] = "AUDIO_CUE";
})(MediaContext || (exports.MediaContext = MediaContext = {}));
var MediaQuality;
(function (MediaQuality) {
    MediaQuality["LOW"] = "LOW";
    MediaQuality["MEDIUM"] = "MEDIUM";
    MediaQuality["HIGH"] = "HIGH";
    MediaQuality["ULTRA"] = "ULTRA";
})(MediaQuality || (exports.MediaQuality = MediaQuality = {}));
let Media = class Media {
    async deleteFile() {
        var _a;
        if (!((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.storageDetails)) {
            console.log('No storage details found for media ID:', this.id);
            return;
        }
        const { provider, bucket, path } = this.metadata.storageDetails;
        if (!bucket || !path) {
            console.warn(`Missing bucket or path for media ID: ${this.id}`);
            return;
        }
        try {
            switch (provider === null || provider === void 0 ? void 0 : provider.toLowerCase()) {
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
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
    }
    async deleteFromS3(bucket, path) {
        console.log(`S3 delete operation for bucket: ${bucket}, path: ${path}`);
    }
    async deleteFromGCS(bucket, path) {
        console.log(`GCS delete operation for bucket: ${bucket}, path: ${path}`);
    }
    async deleteFromAzure(container, blobName) {
        console.log(`Azure delete operation for container: ${container}, blob: ${blobName}`);
    }
    async deleteFromLocalFileSystem(filePath) {
        console.log(`Local file delete operation for path: ${filePath}`);
    }
};
exports.Media = Media;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Media.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: MediaType
    }),
    (0, class_validator_1.IsEnum)(MediaType),
    (0, typeorm_1.Index)("idx_media_type"),
    __metadata("design:type", String)
], Media.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: MediaContext
    }),
    (0, class_validator_1.IsEnum)(MediaContext),
    (0, typeorm_1.Index)("idx_media_context"),
    __metadata("design:type", String)
], Media.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Media.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Media.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Media.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Media.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint" }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Media.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: MediaQuality,
        default: MediaQuality.MEDIUM
    }),
    (0, class_validator_1.IsEnum)(MediaQuality),
    __metadata("design:type", String)
], Media.prototype, "quality", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], Media.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Media.prototype, "dimensions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Media.prototype, "altText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Media.prototype, "caption", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, typeorm_1.Index)("idx_media_entity_string"),
    __metadata("design:type", String)
], Media.prototype, "entityStringId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, typeorm_1.Index)("idx_media_entity_number"),
    __metadata("design:type", Number)
], Media.prototype, "entityNumericId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    (0, typeorm_1.Index)("idx_media_entity_type"),
    __metadata("design:type", String)
], Media.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], Media.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Media.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Media.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Exercise_1.Exercise, exercise => exercise.media),
    (0, typeorm_1.JoinTable)({
        name: "exercise_media",
        joinColumn: { name: "media_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "exercise_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], Media.prototype, "exercises", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => VideoTutorial_1.VideoTutorial, tutorial => tutorial.videoMedia),
    __metadata("design:type", Array)
], Media.prototype, "videoTutorials", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => VideoTutorial_1.VideoTutorial, tutorial => tutorial.thumbnailMedia),
    __metadata("design:type", Array)
], Media.prototype, "tutorialThumbnails", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Equipment_1.Equipment, equipment => equipment.image, {
        cascade: ["insert", "update"]
    }),
    __metadata("design:type", Array)
], Media.prototype, "equipmentImages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Equipment_1.Equipment, equipment => equipment.video, {
        cascade: ["insert", "update"]
    }),
    __metadata("design:type", Array)
], Media.prototype, "equipmentVideos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WorkoutPlan_1.WorkoutPlan, plan => plan.video),
    __metadata("design:type", Array)
], Media.prototype, "workoutVideos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WorkoutPlan_1.WorkoutPlan, plan => plan.thumbnail),
    __metadata("design:type", Array)
], Media.prototype, "workoutThumbnails", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ExerciseFormAnalysis_1.ExerciseFormAnalysis, analysis => analysis.video),
    __metadata("design:type", Array)
], Media.prototype, "formAnalysisVideos", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Media.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Media.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeRemove)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Media.prototype, "deleteFile", null);
exports.Media = Media = __decorate([
    (0, typeorm_1.Entity)("media"),
    (0, typeorm_1.Index)("idx_media_entity", ["entityType", "entityStringId"]),
    (0, typeorm_1.Index)("idx_media_entity_numeric", ["entityType", "entityNumericId"]),
    (0, typeorm_1.Index)("idx_media_type_context", ["context", "type"])
], Media);
//# sourceMappingURL=Media.js.map