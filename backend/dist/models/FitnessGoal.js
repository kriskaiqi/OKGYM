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
exports.FitnessGoal = exports.GoalMetadata = exports.GoalMilestone = exports.GoalCheckpoint = exports.GoalStatus = exports.GoalType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const Enums_1 = require("./shared/Enums");
var GoalType;
(function (GoalType) {
    GoalType["WEIGHT_LOSS"] = "WEIGHT_LOSS";
    GoalType["WEIGHT_GAIN"] = "WEIGHT_GAIN";
    GoalType["STRENGTH"] = "STRENGTH";
    GoalType["ENDURANCE"] = "ENDURANCE";
    GoalType["FLEXIBILITY"] = "FLEXIBILITY";
    GoalType["MUSCLE_GAIN"] = "MUSCLE_GAIN";
    GoalType["BODY_FAT_PERCENTAGE"] = "BODY_FAT_PERCENTAGE";
    GoalType["WORKOUT_FREQUENCY"] = "WORKOUT_FREQUENCY";
    GoalType["DISTANCE"] = "DISTANCE";
    GoalType["STEP_COUNT"] = "STEP_COUNT";
    GoalType["CUSTOM"] = "CUSTOM";
})(GoalType || (exports.GoalType = GoalType = {}));
var GoalStatus;
(function (GoalStatus) {
    GoalStatus["ACTIVE"] = "ACTIVE";
    GoalStatus["COMPLETED"] = "COMPLETED";
    GoalStatus["ABANDONED"] = "ABANDONED";
    GoalStatus["PAUSED"] = "PAUSED";
})(GoalStatus || (exports.GoalStatus = GoalStatus = {}));
class GoalCheckpoint {
}
exports.GoalCheckpoint = GoalCheckpoint;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GoalCheckpoint.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], GoalCheckpoint.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GoalCheckpoint.prototype, "notes", void 0);
class GoalMilestone {
}
exports.GoalMilestone = GoalMilestone;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GoalMilestone.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GoalMilestone.prototype, "reward", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GoalMilestone.prototype, "completed", void 0);
class GoalMetadata {
}
exports.GoalMetadata = GoalMetadata;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GoalMetadata.prototype, "relatedExercises", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GoalMetadata.prototype, "relatedWorkouts", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GoalMetadata.prototype, "relatedPrograms", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GoalMilestone),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GoalMetadata.prototype, "milestones", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GoalMetadata.prototype, "reminderFrequency", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GoalMetadata.prototype, "startWeight", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GoalMetadata.prototype, "recentChanges", void 0);
let FitnessGoal = class FitnessGoal {
    calculateProgress() {
        var _a;
        if (this.target <= 0)
            return 0;
        let progress = 0;
        switch (this.type) {
            case GoalType.WEIGHT_LOSS:
                const startWeight = ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.startWeight) || this.target * 1.2;
                if (startWeight <= this.target)
                    return 100;
                progress = ((startWeight - this.current) / (startWeight - this.target)) * 100;
                break;
            case GoalType.WORKOUT_FREQUENCY:
                progress = (this.current / this.target) * 100;
                break;
            default:
                progress = (this.current / this.target) * 100;
        }
        progress = Math.max(0, Math.min(100, progress));
        this.progress = progress;
        return progress;
    }
    isCompleted() {
        if (this.progress >= 100) {
            this.status = GoalStatus.COMPLETED;
            return true;
        }
        switch (this.type) {
            case GoalType.WEIGHT_LOSS:
                if (this.current <= this.target) {
                    this.status = GoalStatus.COMPLETED;
                    return true;
                }
                break;
        }
        return false;
    }
    updateProgress(newValue) {
        const previousValue = this.current;
        this.current = newValue;
        if (previousValue !== 0) {
            const change = ((newValue - previousValue) / Math.abs(previousValue)) * 100;
            if (!this.metadata)
                this.metadata = new GoalMetadata();
            if (!this.metadata.recentChanges)
                this.metadata.recentChanges = [];
            this.metadata.recentChanges.push({
                date: new Date(),
                change: change,
                value: newValue
            });
        }
        this.calculateProgress();
        return this.isCompleted();
    }
    addCheckpoint(value, date = new Date(), notes) {
        const checkpoint = new GoalCheckpoint();
        checkpoint.value = value;
        checkpoint.date = date;
        if (notes)
            checkpoint.notes = notes;
        if (!this.checkpoints)
            this.checkpoints = [];
        this.checkpoints.push(checkpoint);
        this.checkpoints.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
};
exports.FitnessGoal = FitnessGoal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], FitnessGoal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FitnessGoal.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FitnessGoal.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: GoalType,
        default: GoalType.CUSTOM
    }),
    (0, class_validator_1.IsEnum)(GoalType),
    (0, typeorm_1.Index)("idx_fitnessgoal_type"),
    __metadata("design:type", String)
], FitnessGoal.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)("float"),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FitnessGoal.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FitnessGoal.prototype, "current", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.MeasurementUnit,
        default: Enums_1.MeasurementUnit.CUSTOM
    }),
    (0, class_validator_1.IsEnum)(Enums_1.MeasurementUnit),
    __metadata("design:type", String)
], FitnessGoal.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], FitnessGoal.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], FitnessGoal.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], FitnessGoal.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: GoalStatus,
        default: GoalStatus.ACTIVE
    }),
    (0, class_validator_1.IsEnum)(GoalStatus),
    (0, typeorm_1.Index)("idx_fitnessgoal_status"),
    __metadata("design:type", String)
], FitnessGoal.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GoalCheckpoint),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FitnessGoal.prototype, "checkpoints", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GoalMetadata),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", GoalMetadata)
], FitnessGoal.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.fitnessGoals, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)("idx_fk_fitnessgoal_user"),
    __metadata("design:type", User_1.User)
], FitnessGoal.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_fitnessgoal_user_id"),
    __metadata("design:type", String)
], FitnessGoal.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FitnessGoal.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FitnessGoal.prototype, "updatedAt", void 0);
exports.FitnessGoal = FitnessGoal = __decorate([
    (0, typeorm_1.Entity)("fitness_goals"),
    (0, typeorm_1.Index)("idx_fitnessgoal_type_status", ["type", "status"]),
    (0, typeorm_1.Index)("idx_fitnessgoal_deadline", ["deadline"])
], FitnessGoal);
//# sourceMappingURL=FitnessGoal.js.map