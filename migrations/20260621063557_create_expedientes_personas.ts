import type { Knex } from "knex";
import { addAuditColumns } from "../src/utils/addAuditColumns";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("expediente_persona", (table) => {
    table.increments("id").primary().notNullable().unique();
    table
      .integer("expediente_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("expedientes")
      .onDelete("CASCADE");
    table
      .integer("persona_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("personas")
      .onDelete("CASCADE");
    table
      .integer("tipo_vinculo_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("tipos_vinculo");
    table.unique(["expediente_id", "persona_id", "tipo_vinculo_id"]);
    addAuditColumns(table, knex);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("expediente_persona");
}
