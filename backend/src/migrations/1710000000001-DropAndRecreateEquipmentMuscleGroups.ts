import { MigrationInterface, QueryRunner } from "typeorm";

export class DropAndRecreateEquipmentMuscleGroups1710000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing table
        await queryRunner.query(`DROP TABLE IF EXISTS "equipment_muscle_groups"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration needed as TypeORM will recreate the table with proper schema
    }
} 