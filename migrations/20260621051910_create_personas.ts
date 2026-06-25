import { Knex } from "knex";
import { addAuditColumns } from "../src/utils/addAuditColumns";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("personas", (table) => {
    table.increments("id").primary().notNullable().unique();
    table.integer("dni").notNullable().unique();
    table.string("apellido").notNullable();
    table.string("nombre").notNullable();
    addAuditColumns(table, knex);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("personas");
}
