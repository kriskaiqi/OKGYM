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
exports.WorkoutTag = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const TrainingProgram_1 = require("./TrainingProgram");
const Equipment_1 = require("./Equipment");
const Enums_1 = require("./shared/Enums");
let WorkoutTag = class WorkoutTag {
};
exports.WorkoutTag = WorkoutTag;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkoutTag.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Index)("idx_tag_name"),
    __metadata("design:type", String)
], WorkoutTag.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutTag.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.TagCategory,
        default: Enums_1.TagCategory.SPECIAL
    }),
    (0, class_validator_1.IsEnum)(Enums_1.TagCategory),
    (0, typeorm_1.Index)("idx_tag_category"),
    __metadata("design:type", String)
], WorkoutTag.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.TagScope,
        default: Enums_1.TagScope.SYSTEM
    }),
    (0, class_validator_1.IsEnum)(Enums_1.TagScope),
    (0, typeorm_1.Index)("idx_tag_scope"),
    __metadata("design:type", String)
], WorkoutTag.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutTag.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutTag.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkoutTag.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Index)("idx_tag_active"),
    __metadata("design:type", Boolean)
], WorkoutTag.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutTag.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], WorkoutTag.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkoutTag.prototype, "usageCount", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => TrainingProgram_1.TrainingProgram, program => program.tags),
    (0, typeorm_1.JoinTable)({
        name: "program_tags",
        joinColumn: { name: "tag_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "program_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], WorkoutTag.prototype, "trainingPrograms", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Equipment_1.Equipment, equipment => equipment.trainingTypes),
    (0, typeorm_1.JoinTable)({
        name: "equipment_training_types",
        joinColumn: { name: "tag_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "equipment_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], WorkoutTag.prototype, "equipment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], WorkoutTag.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], WorkoutTag.prototype, "updatedAt", void 0);
exports.WorkoutTag = WorkoutTag = __decorate([
    (0, typeorm_1.Entity)("workout_tags"),
    (0, typeorm_1.Index)("idx_tag_search", ["name", "category", "isActive"])
], WorkoutTag);
//# sourceMappingURL=WorkoutTag.js.map