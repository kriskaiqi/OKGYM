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
exports.WorkoutRating = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const WorkoutPlan_1 = require("./WorkoutPlan");
const WorkoutSession_1 = require("./WorkoutSession");
const Feedback_1 = require("./Feedback");
const Enums_1 = require("./shared/Enums");
const class_validator_1 = require("class-validator");
let WorkoutRating = class WorkoutRating {
    constructor() {
        this.id = '';
        this.workoutSessionId = '';
    }
};
exports.WorkoutRating = WorkoutRating;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkoutRating.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)("idx_fk_workoutrating_user"),
    __metadata("design:type", User_1.User)
], WorkoutRating.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_workoutrating_user_id"),
    __metadata("design:type", String)
], WorkoutRating.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutPlan_1.WorkoutPlan, {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "workout_plan_id" }),
    (0, typeorm_1.Index)("idx_fk_workoutrating_workout"),
    __metadata("design:type", WorkoutPlan_1.WorkoutPlan)
], WorkoutRating.prototype, "workoutPlan", void 0);
__decorate([
    (0, typeorm_1.Column)("integer"),
    (0, typeorm_1.Index)("idx_workoutrating_workout_id"),
    __metadata("design:type", Number)
], WorkoutRating.prototype, "workout_plan_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutSession_1.WorkoutSession, workoutSession => workoutSession.ratings),
    (0, typeorm_1.JoinColumn)({ name: "workout_session_id", referencedColumnName: "id" }),
    __metadata("design:type", WorkoutSession_1.WorkoutSession)
], WorkoutRating.prototype, "workoutSession", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "workout_session_id" }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkoutRating.prototype, "workoutSessionId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Feedback_1.Feedback, {
        cascade: true,
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "feedback_id" }),
    (0, typeorm_1.Index)("idx_fk_workoutrating_feedback"),
    __metadata("design:type", Feedback_1.Feedback)
], WorkoutRating.prototype, "feedback", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_workoutrating_feedback_id"),
    __metadata("design:type", String)
], WorkoutRating.prototype, "feedback_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.DifficultyRating,
        default: Enums_1.DifficultyRating.JUST_RIGHT
    }),
    __metadata("design:type", String)
], WorkoutRating.prototype, "difficultyRating", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.EnjoymentRating,
        default: Enums_1.EnjoymentRating.NEUTRAL
    }),
    __metadata("design:type", String)
], WorkoutRating.prototype, "enjoymentRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutRating.prototype, "effectivenessRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutRating.prototype, "timeSuitabilityRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutRating.prototype, "equipmentSuitabilityRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutRating.prototype, "reviewText", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], WorkoutRating.prototype, "positiveAspects", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], WorkoutRating.prototype, "improvementAspects", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], WorkoutRating.prototype, "wouldRecommend", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], WorkoutRating.prototype, "isFlagged", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], WorkoutRating.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], WorkoutRating.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], WorkoutRating.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WorkoutRating.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WorkoutRating.prototype, "updatedAt", void 0);
exports.WorkoutRating = WorkoutRating = __decorate([
    (0, typeorm_1.Entity)("workout_ratings"),
    (0, typeorm_1.Unique)(["user", "workoutPlan"])
], WorkoutRating);
//# sourceMappingURL=WorkoutRating.js.map