import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("personas").insert([
    { id: 1, dni: "30111222", apellido: "García", nombre: "Juan" },
    { id: 2, dni: "28999888", apellido: "López", nombre: "María" },
    { id: 3, dni: "35123456", apellido: "Rodríguez", nombre: "Carlos" },
    { id: 4, dni: "27456789", apellido: "Fernández", nombre: "Ana" },
    { id: 5, dni: "33210987", apellido: "Martínez", nombre: "Pedro" },
    { id: 6, dni: "29876543", apellido: "Sánchez", nombre: "Laura" },
    { id: 7, dni: "36789012", apellido: "González", nombre: "Diego" },
    { id: 8, dni: "25654321", apellido: "Pérez", nombre: "Silvia" },
    { id: 9, dni: "34567890", apellido: "Romero", nombre: "Lucas" },
    { id: 10, dni: "31234567", apellido: "Díaz", nombre: "Valentina" },
    { id: 11, dni: "27890123", apellido: "Torres", nombre: "Martín" },
    { id: 12, dni: "33456789", apellido: "Ruiz", nombre: "Camila" },
  ]);
}
