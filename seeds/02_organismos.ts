import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("organismos").insert([
    {
      codigo: "JNQEJ",
      nombre: "Juzgado de Ejecución Neuquén",
      caratula: "Juzgado de Ejecución Neuquén",
      ciudad: "Neuquén",
      fuero: "Ejecutivos",
    },
    {
      codigo: "JNQCI",
      nombre: "Juzgado Civil Neuquén",
      caratula: "Juzgado Civil Neuquén",
      ciudad: "Neuquén",
      fuero: "Civil",
    },
    {
      codigo: "JNQLA",
      nombre: "Juzgado Laboral Neuquén",
      caratula: "Juzgado Laboral Neuquén",
      ciudad: "Neuquén",
      fuero: "Laboral",
    },
    {
      codigo: "JNQFA",
      nombre: "Juzgado de Familia Neuquén",
      caratula: "Juzgado de Familia Neuquén",
      ciudad: "Neuquén",
      fuero: "Familia",
    },
    {
      codigo: "JZAEJ",
      nombre: "Juzgado de Ejecución Zapala",
      caratula: "Juzgado de Ejecución Zapala",
      ciudad: "Zapala",
      fuero: "Ejecutivos",
    },
    {
      codigo: "JZACI",
      nombre: "Juzgado Civil Zapala",
      caratula: "Juzgado Civil Zapala",
      ciudad: "Zapala",
      fuero: "Civil",
    },
    {
      codigo: "JZALA",
      nombre: "Juzgado Laboral Zapala",
      caratula: "Juzgado Laboral Zapala",
      ciudad: "Zapala",
      fuero: "Laboral",
    },
    {
      codigo: "JZAFA",
      nombre: "Juzgado de Familia Zapala",
      caratula: "Juzgado de Familia Zapala",
      ciudad: "Zapala",
      fuero: "Familia",
    },
    {
      codigo: "JJUEJ",
      nombre: "Juzgado de Ejecución Junín de los Andes",
      caratula: "Juzgado de Ejecución Junín de los Andes",
      ciudad: "Junín de los Andes",
      fuero: "Ejecutivos",
    },
    {
      codigo: "JJUCI",
      nombre: "Juzgado Civil Junín de los Andes",
      caratula: "Juzgado Civil Junín de los Andes",
      ciudad: "Junín de los Andes",
      fuero: "Civil",
    },
    {
      codigo: "JJULA",
      nombre: "Juzgado Laboral Junín de los Andes",
      caratula: "Juzgado Laboral Junín de los Andes",
      ciudad: "Junín de los Andes",
      fuero: "Laboral",
    },
    {
      codigo: "JJUFA",
      nombre: "Juzgado de Familia Junín de los Andes",
      caratula: "Juzgado de Familia Junín de los Andes",
      ciudad: "Junín de los Andes",
      fuero: "Familia",
    },
  ]);
}
