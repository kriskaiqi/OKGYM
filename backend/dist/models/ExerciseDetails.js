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
exports.ExerciseDetails = void 0;
const typeorm_1 = require("typeorm");
const Exercise_1 = require("./Exercise");
let ExerciseDetails = class ExerciseDetails {
};
exports.ExerciseDetails = ExerciseDetails;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ExerciseDetails.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], ExerciseDetails.prototype, "formAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], ExerciseDetails.prototype, "repData", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { nullable: true }),
    __metadata("design:type", Number)
], ExerciseDetails.prototype, "confidenceScore", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], ExerciseDetails.prototype, "rawData", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp", { nullable: true }),
    __metadata("design:type", Date)
], ExerciseDetails.prototype, "analyzedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, exercise => exercise.details, {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "exercise_id" }),
    (0, typeorm_1.Index)("idx_fk_exercisedetails_exercise"),
    __metadata("design:type", Exercise_1.Exercise)
], ExerciseDetails.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_exercisedetails_exercise_id"),
    __metadata("design:type", String)
], ExerciseDetails.prototype, "exercise_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExerciseDetails.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ExerciseDetails.prototype, "updated_at", void 0);
exports.ExerciseDetails = ExerciseDetails = __decorate([
    (0, typeorm_1.Entity)("exercise_details")
], ExerciseDetails);
//# sourceMappingURL=ExerciseDetails.js.map