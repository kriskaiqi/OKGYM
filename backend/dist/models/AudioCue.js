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
exports.AudioCue = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const User_1 = require("./User");
const Exercise_1 = require("./Exercise");
const WorkoutPlan_1 = require("./WorkoutPlan");
const Enums_1 = require("./shared/Enums");
let AudioCue = class AudioCue {
};
exports.AudioCue = AudioCue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AudioCue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AudioCue.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.AudioCueType
    }),
    (0, class_validator_1.IsEnum)(Enums_1.AudioCueType),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AudioCue.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.AudioCueTrigger
    }),
    (0, class_validator_1.IsEnum)(Enums_1.AudioCueTrigger),
    __metadata("design:type", String)
], AudioCue.prototype, "trigger", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], AudioCue.prototype, "script", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], AudioCue.prototype, "audioUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    __metadata("design:type", Number)
], AudioCue.prototype, "durationSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    __metadata("design:type", Number)
], AudioCue.prototype, "triggerTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], AudioCue.prototype, "triggerRepetition", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], AudioCue.prototype, "triggerEvent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 80 }),
    __metadata("design:type", Number)
], AudioCue.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: "neutral" }),
    __metadata("design:type", String)
], AudioCue.prototype, "voiceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: "English" }),
    __metadata("design:type", String)
], AudioCue.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], AudioCue.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], AudioCue.prototype, "includeVibration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 5 }),
    __metadata("design:type", Number)
], AudioCue.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "exercise_id" }),
    (0, typeorm_1.Index)("idx_fk_audiocue_exercise"),
    __metadata("design:type", Exercise_1.Exercise)
], AudioCue.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_audiocue_exercise_id"),
    __metadata("design:type", String)
], AudioCue.prototype, "exercise_id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => WorkoutPlan_1.WorkoutPlan, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinTable)({
        name: "workout_audio_cues",
        joinColumn: { name: "cue_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workout_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], AudioCue.prototype, "workoutPlans", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "created_by" }),
    (0, typeorm_1.Index)("idx_fk_audiocue_creator"),
    __metadata("design:type", User_1.User)
], AudioCue.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_audiocue_created_by"),
    __metadata("design:type", String)
], AudioCue.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], AudioCue.prototype, "isSystemDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], AudioCue.prototype, "isPremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], AudioCue.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], AudioCue.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], AudioCue.prototype, "updatedAt", void 0);
exports.AudioCue = AudioCue = __decorate([
    (0, typeorm_1.Entity)("audio_cues")
], AudioCue);
//# sourceMappingURL=AudioCue.js.map