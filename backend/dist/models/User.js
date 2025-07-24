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
exports.User = exports.UserStats = exports.WeightHistoryEntry = exports.PersonalRecord = exports.UserPreferences = exports.NotificationPreferences = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["TRAINER"] = "TRAINER";
    UserRole["CONTENT_CREATOR"] = "CONTENT_CREATOR";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["PENDING"] = "PENDING";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["DELETED"] = "DELETED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const WorkoutSession_1 = require("./WorkoutSession");
const Achievement_1 = require("./Achievement");
const FitnessGoal_1 = require("./FitnessGoal");
const BodyMetric_1 = require("./BodyMetric");
const Notification_1 = require("./Notification");
const WorkoutPlan_1 = require("./WorkoutPlan");
const UserProgress_1 = require("./UserProgress");
const UserActivity_1 = require("./UserActivity");
const Enums_1 = require("./shared/Enums");
const ProgramEnrollment_1 = require("./ProgramEnrollment");
class NotificationPreferences {
    constructor() {
        this.pushEnabled = true;
        this.emailEnabled = true;
        this.smsEnabled = true;
        this.workoutReminders = true;
        this.progressUpdates = true;
        this.achievementAlerts = true;
        this.friendActivity = true;
        this.systemAnnouncements = true;
    }
}
exports.NotificationPreferences = NotificationPreferences;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "pushEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "emailEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "smsEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "workoutReminders", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "progressUpdates", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "achievementAlerts", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "friendActivity", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "systemAnnouncements", void 0);
class UserPreferences {
}
exports.UserPreferences = UserPreferences;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.WorkoutLocation),
    __metadata("design:type", String)
], UserPreferences.prototype, "workoutLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Enums_1.ExercisePreference, { each: true }),
    __metadata("design:type", Array)
], UserPreferences.prototype, "preferredExerciseTypes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferences.prototype, "dislikedExercises", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferences.prototype, "favoriteExercises", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], UserPreferences.prototype, "workoutDuration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], UserPreferences.prototype, "restTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], UserPreferences.prototype, "workoutFrequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferences.prototype, "availableEquipment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferences.prototype, "preferredEquipment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferences.prototype, "bodyDiscomfort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferences.prototype, "healthConditions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.MeasurementUnit),
    __metadata("design:type", String)
], UserPreferences.prototype, "measurementUnit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.AppTheme),
    __metadata("design:type", String)
], UserPreferences.prototype, "theme", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationPreferences),
    __metadata("design:type", NotificationPreferences)
], UserPreferences.prototype, "notifications", void 0);
class PersonalRecord {
    constructor() {
        this.maxReps = 0;
        this.maxWeight = 0;
        this.bestFormScore = 0;
        this.date = new Date();
    }
}
exports.PersonalRecord = PersonalRecord;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PersonalRecord.prototype, "maxReps", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PersonalRecord.prototype, "maxWeight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], PersonalRecord.prototype, "bestFormScore", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PersonalRecord.prototype, "date", void 0);
class WeightHistoryEntry {
    constructor() {
        this.date = new Date();
        this.weight = 0;
    }
}
exports.WeightHistoryEntry = WeightHistoryEntry;
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], WeightHistoryEntry.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WeightHistoryEntry.prototype, "weight", void 0);
class UserStats {
    constructor() {
        this.weightUnit = Enums_1.MeasurementUnit.METRIC;
    }
}
exports.UserStats = UserStats;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserStats.prototype, "startingWeight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserStats.prototype, "currentWeight", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.MeasurementUnit),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserStats.prototype, "weightUnit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WeightHistoryEntry),
    __metadata("design:type", Array)
], UserStats.prototype, "weightHistory", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UserStats.prototype, "lastWorkoutDate", void 0);
let User = class User {
    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.password = '';
        this.userRole = UserRole.USER;
        this.isAdmin = false;
        this.isPremium = false;
        this.preferences = new UserPreferences();
        this.stats = new UserStats();
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    calculateAge() {
        if (!this.birthYear)
            return null;
        return new Date().getFullYear() - this.birthYear;
    }
    calculateBMI(weight) {
        var _a;
        const userWeight = weight || (((_a = this.stats) === null || _a === void 0 ? void 0 : _a.currentWeight) || null);
        if (!userWeight || !this.height)
            return null;
        const heightInMeters = this.height / 100;
        return userWeight / (heightInMeters * heightInMeters);
    }
    updateLastWorkoutDate(workoutDate = new Date()) {
        if (!this.stats) {
            this.stats = new UserStats();
        }
        this.stats.lastWorkoutDate = workoutDate;
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER
    }),
    (0, class_validator_1.IsEnum)(UserRole),
    __metadata("design:type", String)
], User.prototype, "userRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], User.prototype, "isAdmin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], User.prototype, "isPremium", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.Gender,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(Enums_1.Gender),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    (0, class_validator_1.Max)(new Date().getFullYear()),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], User.prototype, "birthYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(250),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], User.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.FitnessGoal,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(Enums_1.FitnessGoal),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "mainGoal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.ActivityLevel,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(Enums_1.ActivityLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "activityLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.Difficulty,
        default: Enums_1.Difficulty.BEGINNER,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(Enums_1.Difficulty),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "fitnessLevel", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserPreferences),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UserPreferences)
], User.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserStats),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UserStats)
], User.prototype, "stats", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => WorkoutPlan_1.WorkoutPlan, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinTable)({
        name: "user_favorite_workouts",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workout_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], User.prototype, "favoriteWorkouts", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => WorkoutPlan_1.WorkoutPlan, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinTable)({
        name: "user_workout_history",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workout_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], User.prototype, "workoutHistory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WorkoutSession_1.WorkoutSession, session => session.user),
    __metadata("design:type", Array)
], User.prototype, "sessions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Achievement_1.Achievement, achievement => achievement.user, {
        onDelete: "CASCADE"
    }),
    __metadata("design:type", Array)
], User.prototype, "achievements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FitnessGoal_1.FitnessGoal, goal => goal.user, {
        onDelete: "CASCADE"
    }),
    __metadata("design:type", Array)
], User.prototype, "fitnessGoals", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => BodyMetric_1.BodyMetric, metric => metric.user, {
        onDelete: "CASCADE"
    }),
    __metadata("design:type", Array)
], User.prototype, "bodyMetrics", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Notification_1.Notification, notification => notification.user, {
        onDelete: "CASCADE"
    }),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WorkoutPlan_1.WorkoutPlan, workoutPlan => workoutPlan.creator, {
        onDelete: "SET NULL"
    }),
    __metadata("design:type", Array)
], User.prototype, "createdWorkouts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramEnrollment_1.ProgramEnrollment, enrollment => enrollment.user),
    __metadata("design:type", Array)
], User.prototype, "programEnrollments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserProgress_1.UserProgress, progress => progress.user),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], User.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserActivity_1.UserActivity, activity => activity.user),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], User.prototype, "activity", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)("users"),
    (0, typeorm_1.Index)("idx_user_email_admin_premium", ['email', 'isAdmin', 'isPremium']),
    (0, typeorm_1.Index)("idx_user_fitness_goal_activity", ['fitnessLevel', 'mainGoal', 'activityLevel']),
    (0, typeorm_1.Index)(['email'], { unique: true })
], User);
//# sourceMappingURL=User.js.map