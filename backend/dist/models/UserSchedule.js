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
exports.ScheduleItem = exports.UserSchedule = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const WorkoutPlan_1 = require("./WorkoutPlan");
const Enums_1 = require("./shared/Enums");
let UserSchedule = class UserSchedule {
};
exports.UserSchedule = UserSchedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)("idx_fk_userschedule_user"),
    __metadata("design:type", User_1.User)
], UserSchedule.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_userschedule_user_id"),
    __metadata("design:type", String)
], UserSchedule.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar"),
    __metadata("design:type", String)
], UserSchedule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], UserSchedule.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserSchedule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], UserSchedule.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], UserSchedule.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.RecurrencePattern,
        default: Enums_1.RecurrencePattern.WEEKLY
    }),
    __metadata("design:type", String)
], UserSchedule.prototype, "recurrencePattern", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserSchedule.prototype, "recurrenceRules", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserSchedule.prototype, "preferredTimes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ScheduleItem, item => item.schedule, {
        cascade: ["insert", "update", "remove"],
        onDelete: "CASCADE"
    }),
    __metadata("design:type", Array)
], UserSchedule.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserSchedule.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserSchedule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserSchedule.prototype, "updatedAt", void 0);
exports.UserSchedule = UserSchedule = __decorate([
    (0, typeorm_1.Entity)("user_schedules")
], UserSchedule);
let ScheduleItem = class ScheduleItem {
};
exports.ScheduleItem = ScheduleItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScheduleItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UserSchedule, schedule => schedule.items, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "schedule_id" }),
    (0, typeorm_1.Index)("idx_fk_scheduleitem_schedule"),
    __metadata("design:type", UserSchedule)
], ScheduleItem.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_scheduleitem_schedule_id"),
    __metadata("design:type", String)
], ScheduleItem.prototype, "schedule_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.ScheduleItemType,
        default: Enums_1.ScheduleItemType.WORKOUT
    }),
    (0, typeorm_1.Index)("idx_scheduleitem_type"),
    __metadata("design:type", String)
], ScheduleItem.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar"),
    __metadata("design:type", String)
], ScheduleItem.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], ScheduleItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    (0, typeorm_1.Index)("idx_scheduleitem_date"),
    __metadata("design:type", Date)
], ScheduleItem.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)("time"),
    __metadata("design:type", String)
], ScheduleItem.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 60 }),
    __metadata("design:type", Number)
], ScheduleItem.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutPlan_1.WorkoutPlan, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "workout_plan_id" }),
    (0, typeorm_1.Index)("idx_fk_scheduleitem_workout"),
    __metadata("design:type", WorkoutPlan_1.WorkoutPlan)
], ScheduleItem.prototype, "workoutPlan", void 0);
__decorate([
    (0, typeorm_1.Column)("integer", { nullable: true }),
    (0, typeorm_1.Index)("idx_scheduleitem_workout_id"),
    __metadata("design:type", Number)
], ScheduleItem.prototype, "workout_plan_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.ScheduleItemStatus,
        default: Enums_1.ScheduleItemStatus.UPCOMING
    }),
    (0, typeorm_1.Index)("idx_scheduleitem_status"),
    __metadata("design:type", String)
], ScheduleItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ScheduleItem.prototype, "workoutSessionId", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], ScheduleItem.prototype, "adjustments", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], ScheduleItem.prototype, "completion", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Array)
], ScheduleItem.prototype, "reminders", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScheduleItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ScheduleItem.prototype, "updatedAt", void 0);
exports.ScheduleItem = ScheduleItem = __decorate([
    (0, typeorm_1.Entity)("schedule_items")
], ScheduleItem);
//# sourceMappingURL=UserSchedule.js.map