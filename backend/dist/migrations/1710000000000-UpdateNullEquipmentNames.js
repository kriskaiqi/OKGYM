"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNullEquipmentNames1710000000000 = void 0;
class UpdateNullEquipmentNames1710000000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            UPDATE equipment 
            SET name = 'Unnamed Equipment' 
            WHERE name IS NULL;
        `);
    }
    async down(queryRunner) {
    }
}
exports.UpdateNullEquipmentNames1710000000000 = UpdateNullEquipmentNames1710000000000;
//# sourceMappingURL=1710000000000-UpdateNullEquipmentNames.js.map