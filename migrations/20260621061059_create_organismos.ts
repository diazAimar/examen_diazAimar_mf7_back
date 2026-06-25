import { Knex } from "knex";
import { addAuditColumns } from "../src/utils/addAuditColumns";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("organismos", (table) => {
    table.increments("id").primary().notNullable().unique();
    table.string("codigo").notNullable().unique();
    table.string("nombre").notNullable();
    table.string("caratula").notNullable();
    table.string("ciudad").notNullable();
    table.string("fuero").notNullable();
    addAuditColumns(table, knex);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("organismos");
}
