"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAchievement = exports.Achievement = exports.AchievementReward = exports.AchievementProgress = exports.AchievementCriteriaType = exports.AchievementTier = exports.AchievementCategory = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const User_1 = require("./User");
const WorkoutSession_1 = require("./WorkoutSession");
const Exercise_1 = require("./Exercise");
const ModelUtils = __importStar(require("./shared/Utils"));
var AchievementCategory;
(function (AchievementCategory) {
    AchievementCategory["MILESTONE"] = "MILESTONE";
    AchievementCategory["PERFORMANCE"] = "PERFORMANCE";
    AchievementCategory["CONSISTENCY"] = "CONSISTENCY";
    AchievementCategory["EXPLORER"] = "EXPLORER";
    AchievementCategory["IMPROVEMENT"] = "IMPROVEMENT";
    AchievementCategory["CHALLENGE"] = "CHALLENGE";
    AchievementCategory["SOCIAL"] = "SOCIAL";
    AchievementCategory["SPECIAL"] = "SPECIAL";
})(AchievementCategory || (exports.AchievementCategory = AchievementCategory = {}));
var AchievementTier;
(function (AchievementTier) {
    AchievementTier["BRONZE"] = "BRONZE";
    AchievementTier["SILVER"] = "SILVER";
    AchievementTier["GOLD"] = "GOLD";
    AchievementTier["PLATINUM"] = "PLATINUM";
    AchievementTier["DIAMOND"] = "DIAMOND";
    AchievementTier["MASTER"] = "MASTER";
})(AchievementTier || (exports.AchievementTier = AchievementTier = {}));
var AchievementCriteriaType;
(function (AchievementCriteriaType) {
    AchievementCriteriaType["COUNT"] = "COUNT";
    AchievementCriteriaType["STREAK"] = "STREAK";
    AchievementCriteriaType["THRESHOLD"] = "THRESHOLD";
    AchievementCriteriaType["PERCENTAGE"] = "PERCENTAGE";
    AchievementCriteriaType["COMPLETION"] = "COMPLETION";
    AchievementCriteriaType["MULTI_CRITERIA"] = "MULTI_CRITERIA";
})(AchievementCriteriaType || (exports.AchievementCriteriaType = AchievementCriteriaType = {}));
class AchievementProgress {
}
exports.AchievementProgress = AchievementProgress;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AchievementProgress.prototype, "current", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AchievementProgress.prototype, "required", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AchievementProgress.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AchievementProgress.prototype, "lastIncremented", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], AchievementProgress.prototype, "startDate", void 0);
class AchievementReward {
}
exports.AchievementReward = AchievementReward;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AchievementReward.prototype, "points", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AchievementReward.prototype, "badge", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AchievementReward.prototype, "unlockFeature", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AchievementReward.prototype, "featureId", void 0);
let Achievement = class Achievement {
    constructor() {
        this.id = '';
        this.workoutSessionId = '';
    }
    calculateCompletionPercentage() {
        if (!this.progress)
            return 0;
        const { current, required } = this.progress;
        if (required === 0)
            return 100;
        return ModelUtils.normalize((current / required) * 100, 0, 100);
    }
    updateProgress(amount) {
        if (!this.progress) {
            this.progress = {
                current: 0,
                required: 100,
            };
        }
        if (this.isUnlocked)
            return false;
        const wasIncomplete = this.progress.current < this.progress.required;
        this.progress.current = Math.min(this.progress.current + amount, this.progress.required);
        this.progress.lastIncremented = Date.now();
        const isNowComplete = this.progress.current >= this.progress.required;
        if (wasIncomplete && isNowComplete) {
            this.isUnlocked = true;
            this.unlockedAt = new Date();
            return true;
        }
        return false;
    }
};
exports.Achievement = Achievement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], Achievement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Achievement.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Achievement.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AchievementCategory
    }),
    (0, class_validator_1.IsEnum)(AchievementCategory),
    __metadata("design:type", String)
], Achievement.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AchievementTier
    }),
    (0, class_validator_1.IsEnum)(AchievementTier),
    __metadata("design:type", String)
], Achievement.prototype, "tier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Achievement.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Achievement.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AchievementCriteriaType
    }),
    (0, class_validator_1.IsEnum)(AchievementCriteriaType),
    __metadata("design:type", String)
], Achievement.prototype, "criteriaType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Achievement.prototype, "criteriaDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AchievementProgress),
    __metadata("design:type", AchievementProgress)
], Achievement.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Achievement.prototype, "progressRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Achievement.prototype, "progressionFormula", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Achievement),
    (0, typeorm_1.JoinTable)({
        name: "achievement_prerequisites",
        joinColumn: { name: "achievement_id" },
        inverseJoinColumn: { name: "prerequisite_id" }
    }),
    __metadata("design:type", Array)
], Achievement.prototype, "prerequisites", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AchievementReward),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AchievementReward)
], Achievement.prototype, "rewards", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", User_1.User)
], Achievement.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "exercise_id" }),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Exercise_1.Exercise)
], Achievement.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutSession_1.WorkoutSession, workoutSession => workoutSession.achievements, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "workout_session_id", referencedColumnName: "id" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", WorkoutSession_1.WorkoutSession)
], Achievement.prototype, "workoutSession", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "workout_session_id" }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], Achievement.prototype, "workoutSessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Achievement.prototype, "isTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Achievement.prototype, "isSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Achievement.prototype, "isUnlocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp with time zone", nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], Achievement.prototype, "unlockedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Achievement.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp with time zone", nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], Achievement.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Achievement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Achievement.prototype, "updatedAt", void 0);
exports.Achievement = Achievement = __decorate([
    (0, typeorm_1.Entity)("achievement")
], Achievement);
let UserAchievement = class UserAchievement {
};
exports.UserAchievement = UserAchievement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], UserAchievement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "user_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserAchievement.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "achievement_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserAchievement.prototype, "achievementId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], UserAchievement.prototype, "earnedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserAchievement.prototype, "isViewed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    __metadata("design:type", Number)
], UserAchievement.prototype, "triggerValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], UserAchievement.prototype, "relatedEntityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], UserAchievement.prototype, "metadata", void 0);
exports.UserAchievement = UserAchievement = __decorate([
    (0, typeorm_1.Entity)("user_achievements")
], UserAchievement);
//# sourceMappingURL=Achievement.js.map