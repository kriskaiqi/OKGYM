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
exports.ProgramEnrollment = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const User_1 = require("./User");
const TrainingProgram_1 = require("./TrainingProgram");
const Enums_1 = require("./shared/Enums");
let ProgramEnrollment = class ProgramEnrollment {
};
exports.ProgramEnrollment = ProgramEnrollment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProgramEnrollment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.programEnrollments, {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", User_1.User)
], ProgramEnrollment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)("idx_fk_enrollment_user"),
    __metadata("design:type", String)
], ProgramEnrollment.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TrainingProgram_1.TrainingProgram, program => program.enrollments, {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "program_id" }),
    __metadata("design:type", TrainingProgram_1.TrainingProgram)
], ProgramEnrollment.prototype, "program", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)("idx_fk_enrollment_program"),
    __metadata("design:type", Number)
], ProgramEnrollment.prototype, "program_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.EnrollmentStatus,
        default: Enums_1.EnrollmentStatus.ACTIVE
    }),
    (0, class_validator_1.IsEnum)(Enums_1.EnrollmentStatus),
    __metadata("design:type", String)
], ProgramEnrollment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ProgramEnrollment.prototype, "currentWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProgramEnrollment.prototype, "completedWorkouts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ProgramEnrollment.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], ProgramEnrollment.prototype, "completionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ProgramEnrollment.prototype, "userRating", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProgramEnrollment.prototype, "userFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { default: {} }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Object)
], ProgramEnrollment.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProgramEnrollment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProgramEnrollment.prototype, "updatedAt", void 0);
exports.ProgramEnrollment = ProgramEnrollment = __decorate([
    (0, typeorm_1.Entity)("program_enrollments"),
    (0, typeorm_1.Index)("idx_enrollment_user_program", ["user_id", "program_id"], { unique: true }),
    (0, typeorm_1.Index)("idx_enrollment_status", ["status"])
], ProgramEnrollment);
//# sourceMappingURL=ProgramEnrollment.js.map