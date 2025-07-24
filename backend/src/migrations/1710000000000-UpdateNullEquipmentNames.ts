import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNullEquipmentNames1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE equipment 
            SET name = 'Unnamed Equipment' 
            WHERE name IS NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration needed as we don't want to revert names back to NULL
    }
} 