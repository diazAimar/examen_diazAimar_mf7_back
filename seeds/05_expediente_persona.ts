import type { Knex } from "knex";

const TOTAL_EXPEDIENTES = 300;
const TOTAL_PERSONAS = 200;
const BATCH = 50;

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

export async function seed(knex: Knex): Promise<void> {
  const vinculos = [
    { expediente_id: 1, persona_id: 1, tipo_vinculo_id: 1 },
    { expediente_id: 1, persona_id: 2, tipo_vinculo_id: 2 },
    { expediente_id: 2, persona_id: 4, tipo_vinculo_id: 1 },
    { expediente_id: 2, persona_id: 5, tipo_vinculo_id: 2 },
    { expediente_id: 3, persona_id: 3, tipo_vinculo_id: 1 },
    { expediente_id: 3, persona_id: 5, tipo_vinculo_id: 2 },
    { expediente_id: 3, persona_id: 6, tipo_vinculo_id: 4 },
    { expediente_id: 4, persona_id: 7, tipo_vinculo_id: 1 },
    { expediente_id: 4, persona_id: 6, tipo_vinculo_id: 3 },
    { expediente_id: 5, persona_id: 7, tipo_vinculo_id: 1 },
    { expediente_id: 5, persona_id: 1, tipo_vinculo_id: 2 },
    { expediente_id: 6, persona_id: 8, tipo_vinculo_id: 1 },
    { expediente_id: 6, persona_id: 10, tipo_vinculo_id: 4 },
    { expediente_id: 7, persona_id: 9, tipo_vinculo_id: 1 },
    { expediente_id: 7, persona_id: 11, tipo_vinculo_id: 2 },
    { expediente_id: 8, persona_id: 10, tipo_vinculo_id: 1 },
    { expediente_id: 8, persona_id: 3, tipo_vinculo_id: 3 },
    { expediente_id: 9, persona_id: 11, tipo_vinculo_id: 1 },
    { expediente_id: 9, persona_id: 12, tipo_vinculo_id: 4 },
    { expediente_id: 10, persona_id: 12, tipo_vinculo_id: 1 },
    { expediente_id: 10, persona_id: 8, tipo_vinculo_id: 2 },
    { expediente_id: 11, persona_id: 2, tipo_vinculo_id: 1 },
    { expediente_id: 11, persona_id: 1, tipo_vinculo_id: 2 },
    { expediente_id: 12, persona_id: 5, tipo_vinculo_id: 1 },
    { expediente_id: 12, persona_id: 3, tipo_vinculo_id: 2 },
  ];

  const usedKeys = new Set(
    vinculos.map((v) => `${v.expediente_id}-${v.persona_id}-${v.tipo_vinculo_id}`),
  );

  const tiposSecundarios = [2, 2, 2, 3, 4];

  for (let expedienteId = 13; expedienteId <= TOTAL_EXPEDIENTES; expedienteId++) {
    const actorId = randInt(1, TOTAL_PERSONAS);
    usedKeys.add(`${expedienteId}-${actorId}-1`);
    vinculos.push({
      expediente_id: expedienteId,
      persona_id: actorId,
      tipo_vinculo_id: 1,
    });

    const extraCount = randInt(0, 3);
    const usedPersonas = new Set([actorId]);

    for (let j = 0; j < extraCount; j++) {
      let personaId = randInt(1, TOTAL_PERSONAS);
      let tries = 0;
      while (usedPersonas.has(personaId) && tries < 20) {
        personaId = randInt(1, TOTAL_PERSONAS);
        tries += 1;
      }
      if (usedPersonas.has(personaId)) continue;

      const tipoVinculo = tiposSecundarios[randInt(0, tiposSecundarios.length - 1)];
      const key = `${expedienteId}-${personaId}-${tipoVinculo}`;
      if (usedKeys.has(key)) continue;

      usedKeys.add(key);
      usedPersonas.add(personaId);
      vinculos.push({
        expediente_id: expedienteId,
        persona_id: personaId,
        tipo_vinculo_id: tipoVinculo,
      });
    }
  }

  for (let i = 0; i < vinculos.length; i += BATCH) {
    await knex("expediente_persona").insert(vinculos.slice(i, i + BATCH));
  }
}
