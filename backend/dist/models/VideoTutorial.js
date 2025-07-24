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
exports.VideoTutorial = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Exercise_1 = require("./Exercise");
const ExerciseCategory_1 = require("./ExerciseCategory");
const Media_1 = require("./Media");
const Enums_1 = require("./shared/Enums");
let VideoTutorial = class VideoTutorial {
};
exports.VideoTutorial = VideoTutorial;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], VideoTutorial.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], VideoTutorial.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], VideoTutorial.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.TutorialType,
        default: Enums_1.TutorialType.DEMONSTRATION
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], VideoTutorial.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], VideoTutorial.prototype, "durationSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.VideoQuality,
        default: Enums_1.VideoQuality.HD
    }),
    __metadata("design:type", String)
], VideoTutorial.prototype, "quality", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.TutorialDifficulty,
        default: Enums_1.TutorialDifficulty.BEGINNER
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], VideoTutorial.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "exercise_id" }),
    (0, typeorm_1.Index)("idx_fk_videotutorial_exercise"),
    __metadata("design:type", Exercise_1.Exercise)
], VideoTutorial.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_videotutorial_exercise_id"),
    __metadata("design:type", String)
], VideoTutorial.prototype, "exercise_id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => ExerciseCategory_1.ExerciseCategory, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinTable)({
        name: "video_tutorial_categories",
        joinColumn: { name: "tutorial_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "category_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], VideoTutorial.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], VideoTutorial.prototype, "instructor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], VideoTutorial.prototype, "isPremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: "English" }),
    __metadata("design:type", String)
], VideoTutorial.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], VideoTutorial.prototype, "hasClosedCaptions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "author_id" }),
    (0, typeorm_1.Index)("idx_fk_videotutorial_author"),
    __metadata("design:type", User_1.User)
], VideoTutorial.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_videotutorial_author_id"),
    __metadata("design:type", String)
], VideoTutorial.prototype, "author_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", default: 0 }),
    __metadata("design:type", Number)
], VideoTutorial.prototype, "averageRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 0 }),
    __metadata("design:type", Number)
], VideoTutorial.prototype, "ratingCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 0 }),
    __metadata("design:type", Number)
], VideoTutorial.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], VideoTutorial.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], VideoTutorial.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Array)
], VideoTutorial.prototype, "timestamps", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], VideoTutorial.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Media_1.Media, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "video_media_id" }),
    (0, typeorm_1.Index)("idx_fk_videotutorial_video"),
    __metadata("design:type", Media_1.Media)
], VideoTutorial.prototype, "videoMedia", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_videotutorial_video_id"),
    __metadata("design:type", String)
], VideoTutorial.prototype, "video_media_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Media_1.Media, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "thumbnail_media_id" }),
    (0, typeorm_1.Index)("idx_fk_videotutorial_thumbnail"),
    __metadata("design:type", Media_1.Media)
], VideoTutorial.prototype, "thumbnailMedia", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_videotutorial_thumbnail_id"),
    __metadata("design:type", String)
], VideoTutorial.prototype, "thumbnail_media_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], VideoTutorial.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], VideoTutorial.prototype, "updatedAt", void 0);
exports.VideoTutorial = VideoTutorial = __decorate([
    (0, typeorm_1.Entity)("video_tutorials")
], VideoTutorial);
//# sourceMappingURL=VideoTutorial.js.map