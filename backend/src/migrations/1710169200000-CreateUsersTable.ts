import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1710169200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create role enum type if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE user_role_enum AS ENUM ('user', 'admin');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isUnique: true
                    },
                    {
                        name: "password",
                        type: "varchar"
                    },
                    {
                        name: "firstName",
                        type: "varchar"
                    },
                    {
                        name: "lastName",
                        type: "varchar"
                    },
                    {
                        name: "role",
                        type: "user_role_enum",
                        default: "'user'"
                    },
                    {
                        name: "fitnessProfile",
                        type: "jsonb",
                        isNullable: true
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
        await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
    }
} 