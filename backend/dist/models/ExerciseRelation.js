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
exports.ExerciseRelation = exports.RelationType = void 0;
const typeorm_1 = require("typeorm");
const Exercise_1 = require("./Exercise");
var RelationType;
(function (RelationType) {
    RelationType["VARIATION"] = "VARIATION";
    RelationType["ALTERNATIVE"] = "ALTERNATIVE";
    RelationType["PROGRESSION"] = "PROGRESSION";
    RelationType["REGRESSION"] = "REGRESSION";
})(RelationType || (exports.RelationType = RelationType = {}));
let ExerciseRelation = class ExerciseRelation {
};
exports.ExerciseRelation = ExerciseRelation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ExerciseRelation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, exercise => exercise.relationsFrom, {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "base_exercise_id" }),
    (0, typeorm_1.Index)("idx_fk_exerciserelation_base"),
    __metadata("design:type", Exercise_1.Exercise)
], ExerciseRelation.prototype, "baseExercise", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_exerciserelation_base_id"),
    __metadata("design:type", String)
], ExerciseRelation.prototype, "base_exercise_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, exercise => exercise.relationsTo, {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "related_exercise_id" }),
    (0, typeorm_1.Index)("idx_fk_exerciserelation_related"),
    __metadata("design:type", Exercise_1.Exercise)
], ExerciseRelation.prototype, "relatedExercise", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_exerciserelation_related_id"),
    __metadata("design:type", String)
], ExerciseRelation.prototype, "related_exercise_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: RelationType
    }),
    (0, typeorm_1.Index)("idx_exerciserelation_type"),
    __metadata("design:type", String)
], ExerciseRelation.prototype, "relationType", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { default: 1 }),
    (0, typeorm_1.Check)(`"similarityScore" >= 0 AND "similarityScore" <= 1`),
    __metadata("design:type", Number)
], ExerciseRelation.prototype, "similarityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ExerciseRelation.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExerciseRelation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ExerciseRelation.prototype, "updatedAt", void 0);
exports.ExerciseRelation = ExerciseRelation = __decorate([
    (0, typeorm_1.Entity)("exercise_relations"),
    (0, typeorm_1.Index)(["baseExercise", "relationType"]),
    (0, typeorm_1.Index)(["relatedExercise", "relationType"])
], ExerciseRelation);
//# sourceMappingURL=ExerciseRelation.js.map