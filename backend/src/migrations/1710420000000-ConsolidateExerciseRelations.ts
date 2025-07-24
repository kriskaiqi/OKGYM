import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class ConsolidateExerciseRelations1710420000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the new exercise_relations table
        await queryRunner.createTable(
            new Table({
                name: "exercise_relations",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid"
                    },
                    {
                        name: "base_exercise_id",
                        type: "uuid"
                    },
                    {
                        name: "related_exercise_id",
                        type: "uuid"
                    },
                    {
                        name: "relation_type",
                        type: "enum",
                        enum: ["VARIATION", "ALTERNATIVE", "PROGRESSION", "REGRESSION"]
                    },
                    {
                        name: "similarity_score",
                        type: "float",
                        default: 1
                    },
                    {
                        name: "notes",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()"
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ["base_exercise_id"],
                        referencedTableName: "exercises",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE"
                    },
                    {
                        columnNames: ["related_exercise_id"],
                        referencedTableName: "exercises",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE"
                    }
                ]
            }),
            true
        );

        // Create indexes
        await queryRunner.createIndex(
            "exercise_relations",
            new TableIndex({
                name: "idx_exercise_relations_base",
                columnNames: ["base_exercise_id", "relation_type"]
            })
        );

        await queryRunner.createIndex(
            "exercise_relations",
            new TableIndex({
                name: "idx_exercise_relations_related",
                columnNames: ["related_exercise_id", "relation_type"]
            })
        );

        // Migrate data from old tables
        const tables = [
            { name: "exercise_variations", type: "VARIATION" },
            { name: "exercise_alternatives", type: "ALTERNATIVE" },
            { name: "exercise_progressions", type: "PROGRESSION" },
            { name: "exercise_regressions", type: "REGRESSION" }
        ];

        for (const table of tables) {
            // Check if the table exists before migrating
            const tableExists = await queryRunner.hasTable(table.name);
            if (tableExists) {
                // Get all relationships from the old table
                const relations = await queryRunner.query(
                    `SELECT * FROM ${table.name}`
                );

                // Insert into new table
                for (const relation of relations) {
                    await queryRunner.query(
                        `INSERT INTO exercise_relations 
                        (base_exercise_id, related_exercise_id, relation_type) 
                        VALUES ($1, $2, $3)`,
                        [
                            relation.exercise_id || relation.base_exercise_id,
                            relation.variation_id || relation.alternative_id || relation.progression_id || relation.regression_id,
                            table.type
                        ]
                    );
                }

                // Drop the old table
                await queryRunner.dropTable(table.name);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Create the old tables
        const tables = [
            { 
                name: "exercise_variations",
                baseColumn: "exercise_id",
                relatedColumn: "variation_id"
            },
            {
                name: "exercise_alternatives",
                baseColumn: "exercise_id",
                relatedColumn: "alternative_id"
            },
            {
                name: "exercise_progressions",
                baseColumn: "base_exercise_id",
                relatedColumn: "progression_id"
            },
            {
                name: "exercise_regressions",
                baseColumn: "base_exercise_id",
                relatedColumn: "regression_id"
            }
        ];

        for (const table of tables) {
            await queryRunner.createTable(
                new Table({
                    name: table.name,
                    columns: [
                        {
                            name: table.baseColumn,
                            type: "uuid"
                        },
                        {
                            name: table.relatedColumn,
                            type: "uuid"
                        }
                    ],
                    foreignKeys: [
                        {
                            columnNames: [table.baseColumn],
                            referencedTableName: "exercises",
                            referencedColumnNames: ["id"],
                            onDelete: "CASCADE"
                        },
                        {
                            columnNames: [table.relatedColumn],
                            referencedTableName: "exercises",
                            referencedColumnNames: ["id"],
                            onDelete: "CASCADE"
                        }
                    ]
                }),
                true
            );

            // Migrate data back from exercise_relations
            await queryRunner.query(
                `INSERT INTO ${table.name} (${table.baseColumn}, ${table.relatedColumn})
                SELECT base_exercise_id, related_exercise_id 
                FROM exercise_relations 
                WHERE relation_type = $1`,
                [table.name.split('_')[1].toUpperCase().slice(0, -1)]
            );
        }

        // Drop the new table
        await queryRunner.dropTable("exercise_relations");
    }
} 