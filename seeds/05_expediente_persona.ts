import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("expediente_persona").insert([
    // JNQFA EXP 101/2024 — García c/ López s/ Alimentos
    { expediente_id: 1, persona_id: 1, tipo_vinculo_id: 1 },
    { expediente_id: 1, persona_id: 2, tipo_vinculo_id: 2 },

    // JNQCI LEG 45/2023 — Sucesión de Fernández
    { expediente_id: 2, persona_id: 4, tipo_vinculo_id: 1 },
    { expediente_id: 2, persona_id: 5, tipo_vinculo_id: 2 },

    // JZACI EXP 78/2024 — Rodríguez c/ Martínez
    { expediente_id: 3, persona_id: 3, tipo_vinculo_id: 1 },
    { expediente_id: 3, persona_id: 5, tipo_vinculo_id: 2 },
    { expediente_id: 3, persona_id: 6, tipo_vinculo_id: 4 },

    // JJUEJ EXP 12/2025 — Ejecución de Sentencia
    { expediente_id: 4, persona_id: 7, tipo_vinculo_id: 1 },
    { expediente_id: 4, persona_id: 6, tipo_vinculo_id: 3 },

    // JNQLA EXP 200/2022 — Despido
    { expediente_id: 5, persona_id: 7, tipo_vinculo_id: 1 },
    { expediente_id: 5, persona_id: 1, tipo_vinculo_id: 2 },

    // JZAFA LEG 33/2023 — Adopción
    { expediente_id: 6, persona_id: 8, tipo_vinculo_id: 1 },
    { expediente_id: 6, persona_id: 10, tipo_vinculo_id: 4 },

    // JJUCI EXP 56/2024 — Amparo
    { expediente_id: 7, persona_id: 9, tipo_vinculo_id: 1 },
    { expediente_id: 7, persona_id: 11, tipo_vinculo_id: 2 },

    // JNQEJ EXP 89/2025 — Cobro de Pesos
    { expediente_id: 8, persona_id: 10, tipo_vinculo_id: 1 },
    { expediente_id: 8, persona_id: 3, tipo_vinculo_id: 3 },

    // JZALA EXP 15/2022 — Accidente Laboral
    { expediente_id: 9, persona_id: 11, tipo_vinculo_id: 1 },
    { expediente_id: 9, persona_id: 12, tipo_vinculo_id: 4 },

    // JJUFA EXP 7/2025 — Tenencia
    { expediente_id: 10, persona_id: 12, tipo_vinculo_id: 1 },
    { expediente_id: 10, persona_id: 8, tipo_vinculo_id: 2 },

    // JNQCI EXP 120/2025 — Incumplimiento (López en otro expediente como ACTOR)
    { expediente_id: 11, persona_id: 2, tipo_vinculo_id: 1 },
    { expediente_id: 11, persona_id: 1, tipo_vinculo_id: 2 },

    // JZACI LEG 22/2022 — Sucesión de Martínez
    { expediente_id: 12, persona_id: 5, tipo_vinculo_id: 1 },
    { expediente_id: 12, persona_id: 3, tipo_vinculo_id: 2 },
  ]);
}
