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
exports.TrainingProgram = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const User_1 = require("./User");
const ProgramWorkout_1 = require("./ProgramWorkout");
const WorkoutPlan_1 = require("./WorkoutPlan");
const WorkoutTag_1 = require("./WorkoutTag");
const Equipment_1 = require("./Equipment");
const ExerciseCategory_1 = require("./ExerciseCategory");
const Enums_1 = require("./shared/Enums");
class ProgramPrerequisites {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Object)
], ProgramPrerequisites.prototype, "minStrengthLevels", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProgramPrerequisites.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProgramPrerequisites.prototype, "timeAvailability", void 0);
class WeeklyBreakdown {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WeeklyBreakdown.prototype, "focus", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WeeklyBreakdown.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], WeeklyBreakdown.prototype, "intensity", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Enums_1.FitnessGoal, { each: true }),
    __metadata("design:type", Array)
], WeeklyBreakdown.prototype, "goals", void 0);
class ProgramMetadata {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProgramMetadata.prototype, "prerequisites", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProgramMetadata.prototype, "expectedResults", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Enums_1.FitnessGoal, { each: true }),
    __metadata("design:type", Array)
], ProgramMetadata.prototype, "fitnessGoals", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProgramMetadata.prototype, "idealFor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProgramMetadata.prototype, "notRecommendedFor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProgramMetadata.prototype, "estimatedCalorieBurn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProgramMetadata.prototype, "intensity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProgramMetadata.prototype, "timeCommitmentPerWeek", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProgramMetadata.prototype, "flexibility", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Object)
], ProgramMetadata.prototype, "weeklyBreakdown", void 0);
class ProgressionStrategy {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProgressionStrategy.prototype, "autoAdjust", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProgressionStrategy.prototype, "deloadFrequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.ProgressionType),
    __metadata("design:type", String)
], ProgressionStrategy.prototype, "progressionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ProgressionStrategy.prototype, "adaptationRules", void 0);
let TrainingProgram = class TrainingProgram {
    calculateCompletionRate() {
        if (this.enrollmentCount === 0)
            return 0;
        return this.completionCount / this.enrollmentCount;
    }
    calculateTotalDuration() {
        return this.durationWeeks * this.workoutsPerWeek * this.estimatedMinutesPerWorkout;
    }
    isSuitableForLevel(level) {
        const levels = [Enums_1.Difficulty.BEGINNER, Enums_1.Difficulty.INTERMEDIATE, Enums_1.Difficulty.ADVANCED, Enums_1.Difficulty.ELITE];
        const programIndex = levels.indexOf(this.difficulty);
        const userIndex = levels.indexOf(level);
        if (programIndex === 0)
            return true;
        return userIndex >= programIndex - 1;
    }
};
exports.TrainingProgram = TrainingProgram;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)("idx_program_name"),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TrainingProgram.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TrainingProgram.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.Difficulty,
        default: Enums_1.Difficulty.BEGINNER
    }),
    (0, class_validator_1.IsEnum)(Enums_1.Difficulty),
    (0, typeorm_1.Index)("idx_program_difficulty"),
    __metadata("design:type", String)
], TrainingProgram.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.WorkoutCategory,
        default: Enums_1.WorkoutCategory.FULL_BODY
    }),
    (0, class_validator_1.IsEnum)(Enums_1.WorkoutCategory),
    (0, typeorm_1.Index)("idx_program_category"),
    __metadata("design:type", String)
], TrainingProgram.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "durationWeeks", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "workoutsPerWeek", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "estimatedMinutesPerWorkout", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrainingProgram.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => WorkoutTag_1.WorkoutTag),
    (0, typeorm_1.JoinTable)({
        name: "program_tags",
        joinColumn: { name: "program_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], TrainingProgram.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Index)("idx_program_published"),
    __metadata("design:type", Boolean)
], TrainingProgram.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "enrollmentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "completionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "ratingCount", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "successRate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.ProgressionType,
        default: Enums_1.ProgressionType.LINEAR,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(Enums_1.ProgressionType),
    __metadata("design:type", String)
], TrainingProgram.prototype, "programStructure", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.SplitType,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(Enums_1.SplitType),
    __metadata("design:type", String)
], TrainingProgram.prototype, "splitType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "creator_id" }),
    (0, typeorm_1.Index)("idx_fk_program_creator"),
    __metadata("design:type", User_1.User)
], TrainingProgram.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TrainingProgram.prototype, "creator_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramWorkout_1.ProgramWorkout, programWorkout => programWorkout.program, {
        cascade: true,
        eager: true
    }),
    __metadata("design:type", Array)
], TrainingProgram.prototype, "programWorkouts", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => WorkoutPlan_1.WorkoutPlan),
    (0, typeorm_1.JoinTable)({
        name: "program_workout_plans",
        joinColumn: { name: "program_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workout_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], TrainingProgram.prototype, "workoutPlans", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Equipment_1.Equipment),
    (0, typeorm_1.JoinTable)({
        name: "program_equipment",
        joinColumn: { name: "program_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "equipment_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], TrainingProgram.prototype, "requiredEquipment", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => ExerciseCategory_1.ExerciseCategory),
    (0, typeorm_1.JoinTable)({
        name: "program_muscle_groups",
        joinColumn: { name: "program_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "category_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], TrainingProgram.prototype, "targetMuscleGroups", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ProgramMetadata),
    __metadata("design:type", ProgramMetadata)
], TrainingProgram.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ProgressionStrategy),
    __metadata("design:type", ProgressionStrategy)
], TrainingProgram.prototype, "progressionStrategy", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ProgramPrerequisites),
    __metadata("design:type", ProgramPrerequisites)
], TrainingProgram.prototype, "prerequisites", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TrainingProgram.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TrainingProgram.prototype, "updatedAt", void 0);
exports.TrainingProgram = TrainingProgram = __decorate([
    (0, typeorm_1.Entity)("training_programs"),
    (0, typeorm_1.Index)("idx_program_search", ["name", "category", "difficulty"])
], TrainingProgram);
//# sourceMappingURL=TrainingProgram.js.map