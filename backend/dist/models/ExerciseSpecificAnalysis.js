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
exports.ExerciseSpecificAnalysis = exports.ExerciseAnalysisType = void 0;
const typeorm_1 = require("typeorm");
const ExerciseFormAnalysis_1 = require("./ExerciseFormAnalysis");
var ExerciseAnalysisType;
(function (ExerciseAnalysisType) {
    ExerciseAnalysisType["SQUAT"] = "SQUAT";
    ExerciseAnalysisType["PLANK"] = "PLANK";
    ExerciseAnalysisType["LUNGE"] = "LUNGE";
    ExerciseAnalysisType["BICEP_CURL"] = "BICEP_CURL";
})(ExerciseAnalysisType || (exports.ExerciseAnalysisType = ExerciseAnalysisType = {}));
let ExerciseSpecificAnalysis = class ExerciseSpecificAnalysis {
};
exports.ExerciseSpecificAnalysis = ExerciseSpecificAnalysis;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ExerciseSpecificAnalysis.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ExerciseFormAnalysis_1.ExerciseFormAnalysis, {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "analysis_id" }),
    (0, typeorm_1.Index)("idx_fk_specificanalysis_parent"),
    __metadata("design:type", ExerciseFormAnalysis_1.ExerciseFormAnalysis)
], ExerciseSpecificAnalysis.prototype, "analysis", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_specificanalysis_analysis_id"),
    __metadata("design:type", String)
], ExerciseSpecificAnalysis.prototype, "analysis_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ExerciseAnalysisType,
        nullable: false
    }),
    (0, typeorm_1.Index)("idx_specificanalysis_exercise_type"),
    __metadata("design:type", String)
], ExerciseSpecificAnalysis.prototype, "exerciseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], ExerciseSpecificAnalysis.prototype, "analysisData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], ExerciseSpecificAnalysis.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ExerciseSpecificAnalysis.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ExerciseSpecificAnalysis.prototype, "updatedAt", void 0);
exports.ExerciseSpecificAnalysis = ExerciseSpecificAnalysis = __decorate([
    (0, typeorm_1.Entity)("exercise_specific_analysis"),
    (0, typeorm_1.Index)("idx_specific_analysis_type", ["exerciseType"])
], ExerciseSpecificAnalysis);
//# sourceMappingURL=ExerciseSpecificAnalysis.js.map