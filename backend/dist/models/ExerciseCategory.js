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
exports.ExerciseCategory = exports.CategoryType = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const Equipment_1 = require("./Equipment");
var CategoryType;
(function (CategoryType) {
    CategoryType["MUSCLE_GROUP"] = "MUSCLE_GROUP";
    CategoryType["MOVEMENT_PATTERN"] = "MOVEMENT_PATTERN";
    CategoryType["EQUIPMENT"] = "EQUIPMENT";
    CategoryType["EXPERIENCE_LEVEL"] = "EXPERIENCE_LEVEL";
    CategoryType["GOAL"] = "GOAL";
    CategoryType["BODY_PART"] = "BODY_PART";
    CategoryType["SPECIAL"] = "SPECIAL";
})(CategoryType || (exports.CategoryType = CategoryType = {}));
let ExerciseCategory = class ExerciseCategory {
    constructor() {
        this.childCategories = [];
    }
};
exports.ExerciseCategory = ExerciseCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ExerciseCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Index)("idx_category_name"),
    __metadata("design:type", String)
], ExerciseCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseCategory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: CategoryType,
        default: CategoryType.MUSCLE_GROUP
    }),
    (0, class_validator_1.IsEnum)(CategoryType),
    (0, typeorm_1.Index)("idx_category_type"),
    __metadata("design:type", String)
], ExerciseCategory.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseCategory.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseCategory.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseCategory.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseCategory.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Index)("idx_category_active"),
    __metadata("design:type", Boolean)
], ExerciseCategory.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Object)
], ExerciseCategory.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Equipment_1.Equipment, equipment => equipment.muscleGroupsTargeted),
    __metadata("design:type", Array)
], ExerciseCategory.prototype, "equipment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ExerciseCategory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ExerciseCategory.prototype, "updatedAt", void 0);
exports.ExerciseCategory = ExerciseCategory = __decorate([
    (0, typeorm_1.Entity)("exercise_categories"),
    (0, typeorm_1.Index)("idx_category_search", ["name", "type", "isActive"])
], ExerciseCategory);
//# sourceMappingURL=ExerciseCategory.js.map