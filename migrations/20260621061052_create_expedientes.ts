import { Knex } from "knex";
import { addAuditColumns } from "../src/utils/addAuditColumns";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("expedientes", (table) => {
    table.increments("id").primary().notNullable().unique();
    table.string("codigo_organismo").notNullable();
    table
      .foreign("codigo_organismo")
      .references("codigo")
      .inTable("organismos");
    table.string("tipo").notNullable();
    table.integer("numero").notNullable();
    table.integer("anno").notNullable();
    table.string("caratula").notNullable();
    table.string("ciudad").notNullable();
    table.unique(["codigo_organismo", "tipo", "numero", "anno"]);
    addAuditColumns(table, knex);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("expedientes");
}
