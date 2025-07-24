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
exports.Equipment = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const ExerciseCategory_1 = require("./ExerciseCategory");
const WorkoutPlan_1 = require("./WorkoutPlan");
const WorkoutTag_1 = require("./WorkoutTag");
const TrainingProgram_1 = require("./TrainingProgram");
const Media_1 = require("./Media");
const Enums_1 = require("./shared/Enums");
let Equipment = class Equipment {
};
exports.Equipment = Equipment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], Equipment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "Unnamed Equipment" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Index)("idx_equipment_name"),
    __metadata("design:type", String)
], Equipment.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Equipment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.EquipmentCategory,
        default: Enums_1.EquipmentCategory.ACCESSORIES
    }),
    (0, class_validator_1.IsEnum)(Enums_1.EquipmentCategory),
    (0, typeorm_1.Index)("idx_equipment_category"),
    __metadata("design:type", String)
], Equipment.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.Difficulty,
        default: Enums_1.Difficulty.BEGINNER
    }),
    (0, class_validator_1.IsEnum)(Enums_1.Difficulty),
    (0, typeorm_1.Index)("idx_equipment_difficulty"),
    __metadata("design:type", String)
], Equipment.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.CostTier,
        default: Enums_1.CostTier.MID_RANGE
    }),
    (0, class_validator_1.IsEnum)(Enums_1.CostTier),
    (0, typeorm_1.Index)("idx_equipment_cost_tier"),
    __metadata("design:type", String)
], Equipment.prototype, "costTier", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.SpaceRequirement,
        default: Enums_1.SpaceRequirement.SMALL
    }),
    (0, class_validator_1.IsEnum)(Enums_1.SpaceRequirement),
    (0, typeorm_1.Index)("idx_equipment_space_required"),
    __metadata("design:type", String)
], Equipment.prototype, "spaceRequired", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => ExerciseCategory_1.ExerciseCategory, category => category.equipment, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinTable)({
        name: "equipment_muscle_groups",
        joinColumn: { name: "equipment_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "category_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], Equipment.prototype, "muscleGroupsTargeted", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => WorkoutTag_1.WorkoutTag, tag => tag.equipment, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinTable)({
        name: "equipment_training_types",
        joinColumn: { name: "equipment_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], Equipment.prototype, "trainingTypes", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => WorkoutPlan_1.WorkoutPlan, workoutPlan => workoutPlan.equipmentNeeded, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    }),
    __metadata("design:type", Array)
], Equipment.prototype, "workouts", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => TrainingProgram_1.TrainingProgram, program => program.requiredEquipment, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE"
    }),
    __metadata("design:type", Array)
], Equipment.prototype, "programs", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Media_1.Media, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "image_id" }),
    (0, typeorm_1.Index)("idx_fk_equipment_image"),
    __metadata("design:type", Media_1.Media)
], Equipment.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_equipment_image_id"),
    __metadata("design:type", String)
], Equipment.prototype, "image_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Media_1.Media, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinColumn)({ name: "video_id" }),
    (0, typeorm_1.Index)("idx_fk_equipment_video"),
    __metadata("design:type", Media_1.Media)
], Equipment.prototype, "video", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_equipment_video_id"),
    __metadata("design:type", String)
], Equipment.prototype, "video_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Equipment.prototype, "purchaseUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, typeorm_1.Index)("idx_equipment_price"),
    __metadata("design:type", Number)
], Equipment.prototype, "estimatedPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, typeorm_1.Index)("idx_equipment_manufacturer"),
    __metadata("design:type", String)
], Equipment.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Equipment.prototype, "specifications", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Equipment.prototype, "alternatives", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Equipment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Equipment.prototype, "updatedAt", void 0);
exports.Equipment = Equipment = __decorate([
    (0, typeorm_1.Entity)("equipment"),
    (0, typeorm_1.Index)("idx_equipment_search", ["name", "category"])
], Equipment);
//# sourceMappingURL=Equipment.js.map