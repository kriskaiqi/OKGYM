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
exports.MediaResponseDTO = exports.ExerciseRelationResponseDTO = exports.ExerciseRelationDTO = exports.EquipmentResponseDTO = exports.EquipmentDTO = exports.CategoryResponseDTO = exports.CategoryDTO = exports.ExerciseResponseDTO = exports.ExecutionStepDTO = exports.ExerciseDTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const Enums_1 = require("../models/shared/Enums");
const Validation_1 = require("../models/shared/Validation");
const ExerciseRelation_1 = require("../models/ExerciseRelation");
class ExerciseDTO {
}
exports.ExerciseDTO = ExerciseDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseDTO.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.ExerciseType),
    __metadata("design:type", String)
], ExerciseDTO.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.Difficulty),
    __metadata("design:type", String)
], ExerciseDTO.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Validation_1.MuscleGroup),
    __metadata("design:type", Validation_1.MuscleGroup)
], ExerciseDTO.prototype, "muscleGroups", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.MovementPattern),
    __metadata("design:type", String)
], ExerciseDTO.prototype, "movementPattern", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], ExerciseDTO.prototype, "categoryIds", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], ExerciseDTO.prototype, "equipmentIds", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], ExerciseDTO.prototype, "mediaIds", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseDTO.prototype, "instructions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ExecutionStepDTO),
    __metadata("design:type", Array)
], ExerciseDTO.prototype, "executionSteps", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseDTO.prototype, "safetyTips", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExerciseDTO.prototype, "defaultDuration", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExerciseDTO.prototype, "defaultReps", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExerciseDTO.prototype, "defaultSets", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.MeasurementType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseDTO.prototype, "primaryMeasurement", void 0);
class ExecutionStepDTO {
}
exports.ExecutionStepDTO = ExecutionStepDTO;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExecutionStepDTO.prototype, "stepNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExecutionStepDTO.prototype, "instruction", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(4),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExecutionStepDTO.prototype, "mediaId", void 0);
class ExerciseResponseDTO {
}
exports.ExerciseResponseDTO = ExerciseResponseDTO;
class CategoryDTO {
}
exports.CategoryDTO = CategoryDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CategoryDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CategoryDTO.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CategoryDTO.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CategoryDTO.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CategoryDTO.prototype, "displayOrder", void 0);
class CategoryResponseDTO {
}
exports.CategoryResponseDTO = CategoryResponseDTO;
class EquipmentDTO {
}
exports.EquipmentDTO = EquipmentDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EquipmentDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EquipmentDTO.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EquipmentDTO.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], EquipmentDTO.prototype, "isRequired", void 0);
class EquipmentResponseDTO {
}
exports.EquipmentResponseDTO = EquipmentResponseDTO;
class ExerciseRelationDTO {
}
exports.ExerciseRelationDTO = ExerciseRelationDTO;
__decorate([
    (0, class_validator_1.IsUUID)(4),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseRelationDTO.prototype, "sourceExerciseId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(4),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseRelationDTO.prototype, "targetExerciseId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ExerciseRelation_1.RelationType),
    __metadata("design:type", String)
], ExerciseRelationDTO.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseRelationDTO.prototype, "description", void 0);
class ExerciseRelationResponseDTO {
}
exports.ExerciseRelationResponseDTO = ExerciseRelationResponseDTO;
class MediaResponseDTO {
}
exports.MediaResponseDTO = MediaResponseDTO;
//# sourceMappingURL=ExerciseDTO.js.map