import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("tipos_vinculo").del();

  // Inserts seed entries
  await knex("tipos_vinculo").insert([
    { id: 1, descripcion: "ACTOR" },
    { id: 2, descripcion: "DEMANDADO" },
    { id: 3, descripcion: "CONDENADO" },
    { id: 4, descripcion: "VICTIMA" },
  ]);
}
