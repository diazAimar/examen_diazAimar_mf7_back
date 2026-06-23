import knex from "knex";

export const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./db.sqlite3",
  },
  useNullAsDefault: true,
});
