import type { Knex } from "knex";

const TOTAL = 200;
const BATCH = 50;

const NOMBRES = [
  "Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "Diego", "Silvia",
  "Lucas", "Valentina", "Martín", "Camila", "Federico", "Lucía", "Gabriel",
  "Sofía", "Nicolás", "Florencia", "Matías", "Paula", "Agustín", "Carolina",
  "Emilio", "Daniela", "Tomás", "Verónica", "Sebastián", "Mariana", "Ignacio",
  "Cecilia",
];

const APELLIDOS = [
  "García", "López", "Rodríguez", "Fernández", "Martínez", "Sánchez", "González",
  "Pérez", "Romero", "Díaz", "Torres", "Ruiz", "Álvarez", "Gómez", "Herrera",
  "Molina", "Castro", "Vega", "Ríos", "Méndez", "Silva", "Acosta", "Benítez",
  "Cabrera", "Domínguez", "Espinoza", "Flores", "Ibáñez", "Juárez", "Klein",
];

const pick = <T,>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export async function seed(knex: Knex): Promise<void> {
  const personas = [
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
  ];

  const usedDnis = new Set(personas.map((p) => p.dni));

  for (let id = 13; id <= TOTAL; id++) {
    let dni = 10_000_000 + Math.floor(Math.random() * 35_000_000);
    while (usedDnis.has(String(dni))) dni += 1;
    usedDnis.add(String(dni));

    personas.push({
      id,
      dni: String(dni),
      apellido: pick(APELLIDOS),
      nombre: pick(NOMBRES),
    });
  }

  for (let i = 0; i < personas.length; i += BATCH) {
    await knex("personas").insert(personas.slice(i, i + BATCH));
  }
}
