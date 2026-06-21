import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("personas", (table) => {
    table.increments("id");
    table.string("dni").notNullable().unique();
    table.string("apellido").notNullable();
    table.string("nombre").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("personas");
}
