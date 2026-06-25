import { Knex } from "knex";

export const addAuditColumns = (table: Knex.CreateTableBuilder, knex: Knex) => {
  table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
  table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());
  table.dateTime("deleted_at").nullable();
};
