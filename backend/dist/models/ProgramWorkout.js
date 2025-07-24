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
exports.ProgramWorkout = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const TrainingProgram_1 = require("./TrainingProgram");
const WorkoutPlan_1 = require("./WorkoutPlan");
const Enums_1 = require("./shared/Enums");
let ProgramWorkout = class ProgramWorkout {
};
exports.ProgramWorkout = ProgramWorkout;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProgramWorkout.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TrainingProgram_1.TrainingProgram, program => program.programWorkouts, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "program_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", TrainingProgram_1.TrainingProgram)
], ProgramWorkout.prototype, "program", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutPlan_1.WorkoutPlan, workout => workout.programWorkouts, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "workout_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", WorkoutPlan_1.WorkoutPlan)
], ProgramWorkout.prototype, "workout", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProgramWorkout.prototype, "week", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.DayOfWeek
    }),
    (0, class_validator_1.IsEnum)(Enums_1.DayOfWeek),
    __metadata("design:type", String)
], ProgramWorkout.prototype, "day", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProgramWorkout.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], ProgramWorkout.prototype, "isOptional", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], ProgramWorkout.prototype, "isDeload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProgramWorkout.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProgramWorkout.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProgramWorkout.prototype, "updatedAt", void 0);
exports.ProgramWorkout = ProgramWorkout = __decorate([
    (0, typeorm_1.Entity)("program_workouts"),
    (0, typeorm_1.Index)(["program", "week", "day"]),
    (0, typeorm_1.Index)(["workout", "program"])
], ProgramWorkout);
//# sourceMappingURL=ProgramWorkout.js.map