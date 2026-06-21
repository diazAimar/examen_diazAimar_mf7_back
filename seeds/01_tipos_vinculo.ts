import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("expediente_persona").del();
  await knex("expedientes").del();
  await knex("personas").del();
  await knex("organismos").del();
  await knex("tipos_vinculo").del();

  await knex("tipos_vinculo").insert([
    { id: 1, descripcion: "ACTOR" },
    { id: 2, descripcion: "DEMANDADO" },
    { id: 3, descripcion: "CONDENADO" },
    { id: 4, descripcion: "VICTIMA" },
  ]);
}
