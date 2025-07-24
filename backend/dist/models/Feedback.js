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
exports.Feedback = exports.FeedbackSentiment = exports.RatingCategory = exports.FeedbackType = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const User_1 = require("./User");
const Exercise_1 = require("./Exercise");
const WorkoutPlan_1 = require("./WorkoutPlan");
const WorkoutSession_1 = require("./WorkoutSession");
const TrainingProgram_1 = require("./TrainingProgram");
const WorkoutRating_1 = require("./WorkoutRating");
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["WORKOUT_RATING"] = "WORKOUT_RATING";
    FeedbackType["EXERCISE_FORM"] = "EXERCISE_FORM";
    FeedbackType["PROGRAM_REVIEW"] = "PROGRAM_REVIEW";
    FeedbackType["EQUIPMENT_REVIEW"] = "EQUIPMENT_REVIEW";
    FeedbackType["TUTORIAL_FEEDBACK"] = "TUTORIAL_FEEDBACK";
    FeedbackType["ACHIEVEMENT_FEEDBACK"] = "ACHIEVEMENT_FEEDBACK";
    FeedbackType["USER_SUGGESTION"] = "USER_SUGGESTION";
    FeedbackType["BUG_REPORT"] = "BUG_REPORT";
    FeedbackType["FEATURE_REQUEST"] = "FEATURE_REQUEST";
})(FeedbackType || (exports.FeedbackType = FeedbackType = {}));
var RatingCategory;
(function (RatingCategory) {
    RatingCategory["DIFFICULTY"] = "DIFFICULTY";
    RatingCategory["ENJOYMENT"] = "ENJOYMENT";
    RatingCategory["EFFECTIVENESS"] = "EFFECTIVENESS";
    RatingCategory["ACCURACY"] = "ACCURACY";
    RatingCategory["QUALITY"] = "QUALITY";
    RatingCategory["VALUE"] = "VALUE";
    RatingCategory["USABILITY"] = "USABILITY";
})(RatingCategory || (exports.RatingCategory = RatingCategory = {}));
var FeedbackSentiment;
(function (FeedbackSentiment) {
    FeedbackSentiment["VERY_NEGATIVE"] = "VERY_NEGATIVE";
    FeedbackSentiment["NEGATIVE"] = "NEGATIVE";
    FeedbackSentiment["NEUTRAL"] = "NEUTRAL";
    FeedbackSentiment["POSITIVE"] = "POSITIVE";
    FeedbackSentiment["VERY_POSITIVE"] = "VERY_POSITIVE";
})(FeedbackSentiment || (exports.FeedbackSentiment = FeedbackSentiment = {}));
let Feedback = class Feedback {
    constructor() {
        this.id = '';
        this.workoutSessionId = '';
    }
};
exports.Feedback = Feedback;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], Feedback.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    (0, typeorm_1.Index)("idx_fk_feedback_user"),
    __metadata("design:type", User_1.User)
], Feedback.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "userId" }),
    (0, typeorm_1.Index)("idx_feedback_user_id"),
    __metadata("design:type", String)
], Feedback.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: FeedbackType
    }),
    (0, class_validator_1.IsEnum)(FeedbackType),
    (0, typeorm_1.Index)("idx_feedback_type"),
    __metadata("design:type", String)
], Feedback.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: RatingCategory,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(RatingCategory),
    (0, class_validator_1.IsOptional)(),
    (0, typeorm_1.Index)("idx_feedback_category"),
    __metadata("design:type", String)
], Feedback.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], Feedback.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Feedback.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: FeedbackSentiment,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(FeedbackSentiment),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Feedback.prototype, "sentiment", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, typeorm_1.Index)("idx_feedback_entity_id"),
    __metadata("design:type", String)
], Feedback.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, typeorm_1.Index)("idx_feedback_entity_type"),
    __metadata("design:type", String)
], Feedback.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "exerciseId" }),
    (0, typeorm_1.Index)("idx_fk_feedback_exercise"),
    __metadata("design:type", Exercise_1.Exercise)
], Feedback.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "exerciseId" }),
    (0, typeorm_1.Index)("idx_feedback_exercise_id"),
    __metadata("design:type", String)
], Feedback.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutPlan_1.WorkoutPlan, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "workoutPlanId" }),
    (0, typeorm_1.Index)("idx_fk_feedback_workout"),
    __metadata("design:type", WorkoutPlan_1.WorkoutPlan)
], Feedback.prototype, "workoutPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "workoutPlanId" }),
    (0, typeorm_1.Index)("idx_feedback_workout_id"),
    __metadata("design:type", Number)
], Feedback.prototype, "workoutPlanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutSession_1.WorkoutSession, workoutSession => workoutSession.feedback),
    (0, typeorm_1.JoinColumn)({ name: "workoutSessionId", referencedColumnName: "id" }),
    __metadata("design:type", WorkoutSession_1.WorkoutSession)
], Feedback.prototype, "workoutSession", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "workoutSessionId" }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], Feedback.prototype, "workoutSessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TrainingProgram_1.TrainingProgram, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "programId" }),
    (0, typeorm_1.Index)("idx_fk_feedback_program"),
    __metadata("design:type", TrainingProgram_1.TrainingProgram)
], Feedback.prototype, "program", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "programId" }),
    (0, typeorm_1.Index)("idx_feedback_program_id"),
    __metadata("design:type", Number)
], Feedback.prototype, "programId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => WorkoutRating_1.WorkoutRating, rating => rating.feedback, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "workoutRatingId" }),
    (0, typeorm_1.Index)("idx_fk_feedback_rating"),
    __metadata("design:type", WorkoutRating_1.WorkoutRating)
], Feedback.prototype, "workoutRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "workoutRatingId" }),
    (0, typeorm_1.Index)("idx_feedback_rating_id"),
    __metadata("design:type", String)
], Feedback.prototype, "workoutRatingId", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], Feedback.prototype, "positiveAspects", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], Feedback.prototype, "improvementAreas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Feedback.prototype, "wouldRecommend", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Feedback.prototype, "needsReview", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Feedback.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    (0, typeorm_1.Index)("idx_feedback_visibility"),
    __metadata("design:type", Boolean)
], Feedback.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], Feedback.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Feedback.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Feedback.prototype, "updatedAt", void 0);
exports.Feedback = Feedback = __decorate([
    (0, typeorm_1.Entity)("feedback"),
    (0, typeorm_1.Unique)(["user", "type", "entityId", "category"]),
    (0, typeorm_1.Index)("idx_feedback_type_entity", ["type", "entityType", "entityId"]),
    (0, typeorm_1.Index)("idx_feedback_user_type", ["user", "type", "isPublic"]),
    (0, typeorm_1.Check)(`"rating" >= 1 AND "rating" <= 5`)
], Feedback);
//# sourceMappingURL=Feedback.js.map