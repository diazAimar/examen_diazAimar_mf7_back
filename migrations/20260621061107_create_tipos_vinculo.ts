import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tipos_vinculo", (table) => {
    table.increments("id").primary().notNullable().unique();
    table.string("descripcion").notNullable().unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tipos_vinculo");
}
