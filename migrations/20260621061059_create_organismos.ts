import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("organismos", (table) => {
    table.string("codigo").primary();
    table.string("nombre").notNullable();
    table.string("caratula").notNullable();
    table.string("ciudad").notNullable();
    table.string("fuero").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("organismos");
}
