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
exports.ExerciseFormAnalysis = exports.FormCorrectionPoint = exports.BodyPositionState = exports.FeedbackSeverity = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Exercise_1 = require("./Exercise");
const WorkoutSession_1 = require("./WorkoutSession");
const MetricTracking_1 = require("./MetricTracking");
const Media_1 = require("./Media");
const class_validator_1 = require("class-validator");
var FeedbackSeverity;
(function (FeedbackSeverity) {
    FeedbackSeverity["INFO"] = "INFO";
    FeedbackSeverity["SUGGESTION"] = "SUGGESTION";
    FeedbackSeverity["WARNING"] = "WARNING";
    FeedbackSeverity["CRITICAL"] = "CRITICAL";
})(FeedbackSeverity || (exports.FeedbackSeverity = FeedbackSeverity = {}));
var BodyPositionState;
(function (BodyPositionState) {
    BodyPositionState["CORRECT"] = "CORRECT";
    BodyPositionState["NEEDS_ADJUSTMENT"] = "NEEDS_ADJUSTMENT";
    BodyPositionState["INCORRECT"] = "INCORRECT";
})(BodyPositionState || (exports.BodyPositionState = BodyPositionState = {}));
let FormCorrectionPoint = class FormCorrectionPoint {
};
exports.FormCorrectionPoint = FormCorrectionPoint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], FormCorrectionPoint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)("ExerciseFormAnalysis", {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "analysis_id" }),
    (0, typeorm_1.Index)("idx_fk_formcorrection_analysis"),
    __metadata("design:type", Object)
], FormCorrectionPoint.prototype, "analysis", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_formcorrection_analysis_id"),
    __metadata("design:type", String)
], FormCorrectionPoint.prototype, "analysis_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], FormCorrectionPoint.prototype, "timeOffset", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, typeorm_1.Index)("idx_formcorrection_bodypart"),
    __metadata("design:type", String)
], FormCorrectionPoint.prototype, "bodyPart", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: BodyPositionState,
        default: BodyPositionState.NEEDS_ADJUSTMENT
    }),
    (0, typeorm_1.Index)("idx_formcorrection_state"),
    __metadata("design:type", String)
], FormCorrectionPoint.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    __metadata("design:type", Number)
], FormCorrectionPoint.prototype, "detectedAngle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    __metadata("design:type", Number)
], FormCorrectionPoint.prototype, "targetAngle", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: FeedbackSeverity,
        default: FeedbackSeverity.SUGGESTION
    }),
    (0, typeorm_1.Index)("idx_formcorrection_severity"),
    __metadata("design:type", String)
], FormCorrectionPoint.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], FormCorrectionPoint.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], FormCorrectionPoint.prototype, "correctionInstruction", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Media_1.Media, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "image_media_id" }),
    (0, typeorm_1.Index)("idx_fk_formcorrection_image"),
    __metadata("design:type", Media_1.Media)
], FormCorrectionPoint.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_formcorrection_image_id"),
    __metadata("design:type", String)
], FormCorrectionPoint.prototype, "image_media_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], FormCorrectionPoint.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], FormCorrectionPoint.prototype, "createdAt", void 0);
exports.FormCorrectionPoint = FormCorrectionPoint = __decorate([
    (0, typeorm_1.Entity)("form_correction_points")
], FormCorrectionPoint);
let ExerciseFormAnalysis = class ExerciseFormAnalysis {
    constructor() {
        this.id = '';
        this.workoutSessionId = '';
    }
};
exports.ExerciseFormAnalysis = ExerciseFormAnalysis;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ExerciseFormAnalysis.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)("idx_fk_formanalysis_user"),
    __metadata("design:type", User_1.User)
], ExerciseFormAnalysis.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_formanalysis_user_id"),
    __metadata("design:type", String)
], ExerciseFormAnalysis.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, {
        nullable: false,
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "exercise_id" }),
    (0, typeorm_1.Index)("idx_fk_formanalysis_exercise"),
    __metadata("design:type", Exercise_1.Exercise)
], ExerciseFormAnalysis.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_formanalysis_exercise_id"),
    __metadata("design:type", String)
], ExerciseFormAnalysis.prototype, "exercise_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutSession_1.WorkoutSession, workoutSession => workoutSession.formAnalysis),
    (0, typeorm_1.JoinColumn)({ name: "workout_session_id", referencedColumnName: "id" }),
    __metadata("design:type", WorkoutSession_1.WorkoutSession)
], ExerciseFormAnalysis.prototype, "workoutSession", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "workout_session_id" }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ExerciseFormAnalysis.prototype, "workoutSessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, typeorm_1.Index)("idx_formanalysis_type"),
    __metadata("design:type", String)
], ExerciseFormAnalysis.prototype, "analysisType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp" }),
    (0, typeorm_1.Index)("idx_formanalysis_date"),
    __metadata("design:type", Date)
], ExerciseFormAnalysis.prototype, "performedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], ExerciseFormAnalysis.prototype, "durationSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], ExerciseFormAnalysis.prototype, "repetitionsDetected", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], ExerciseFormAnalysis.prototype, "goodFormRepetitions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Media_1.Media, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "video_media_id" }),
    (0, typeorm_1.Index)("idx_fk_formanalysis_video"),
    __metadata("design:type", Media_1.Media)
], ExerciseFormAnalysis.prototype, "video", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_formanalysis_video_id"),
    __metadata("design:type", String)
], ExerciseFormAnalysis.prototype, "video_media_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    (0, typeorm_1.Index)("idx_formanalysis_score"),
    __metadata("design:type", Number)
], ExerciseFormAnalysis.prototype, "overallScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], ExerciseFormAnalysis.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FormCorrectionPoint, (point) => point.analysis, {
        cascade: ["insert", "update", "remove"],
        eager: true
    }),
    __metadata("design:type", Array)
], ExerciseFormAnalysis.prototype, "correctionPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, typeorm_1.Index)("idx_formanalysis_viewed"),
    __metadata("design:type", Boolean)
], ExerciseFormAnalysis.prototype, "isViewed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, typeorm_1.Index)("idx_formanalysis_dismissed"),
    __metadata("design:type", Boolean)
], ExerciseFormAnalysis.prototype, "isDismissed", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => MetricTracking_1.MetricTracking, {
        nullable: true,
        cascade: true,
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "metric_tracking_id" }),
    (0, typeorm_1.Index)("idx_fk_formanalysis_metric"),
    __metadata("design:type", MetricTracking_1.MetricTracking)
], ExerciseFormAnalysis.prototype, "metricTracking", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_formanalysis_metric_id"),
    __metadata("design:type", String)
], ExerciseFormAnalysis.prototype, "metric_tracking_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], ExerciseFormAnalysis.prototype, "analysisData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], ExerciseFormAnalysis.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ExerciseFormAnalysis.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ExerciseFormAnalysis.prototype, "updatedAt", void 0);
exports.ExerciseFormAnalysis = ExerciseFormAnalysis = __decorate([
    (0, typeorm_1.Entity)("exercise_form_analysis"),
    (0, typeorm_1.Index)("idx_analysis_user_exercise", ["user_id", "exercise_id"]),
    (0, typeorm_1.Index)("idx_analysis_performance", ["performedAt", "overallScore"])
], ExerciseFormAnalysis);
//# sourceMappingURL=ExerciseFormAnalysis.js.map