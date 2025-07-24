"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropAndRecreateEquipmentMuscleGroups1710000000001 = void 0;
class DropAndRecreateEquipmentMuscleGroups1710000000001 {
    async up(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "equipment_muscle_groups"`);
    }
    async down(queryRunner) {
    }
}
exports.DropAndRecreateEquipmentMuscleGroups1710000000001 = DropAndRecreateEquipmentMuscleGroups1710000000001;
//# sourceMappingURL=1710000000001-DropAndRecreateEquipmentMuscleGroups.js.map