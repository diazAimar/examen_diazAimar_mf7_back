import type { Knex } from "knex";

const TOTAL = 300;
const BATCH = 50;

const APELLIDOS = [
  "García", "López", "Rodríguez", "Fernández", "Martínez", "Sánchez", "González",
  "Pérez", "Romero", "Díaz", "Torres", "Ruiz", "Álvarez", "Gómez", "Herrera",
  "Molina", "Castro", "Vega", "Ríos", "Méndez", "Silva", "Acosta", "Benítez",
  "Cabrera", "Domínguez", "Espinoza", "Flores", "Ibáñez", "Juárez", "Klein",
];

const ASUNTOS = [
  "Alimentos", "Daños y Perjuicios", "Despido", "Tenencia", "Divorcio",
  "Ejecución de Sentencia", "Cobro de Pesos", "Accidente Laboral", "Amparo",
  "Incumplimiento Contractual", "Sucesión", "Adopción", "Medida Cautelar",
  "Revisión Contractual", "Desalojo", "Reconocimiento de Hijos",
];

const EMPRESAS = [
  "Banco Patagonia", "Municipalidad de Neuquén", "Cooperativa del Sur",
  "Construcciones Norte SA", "Empresa Andina SRL", "Transportes del Valle",
  "OSDE", "YPF", "Camuzzi Gas", "Supermercados del Plata", "Clínica del Sol",
  "Seguros Río Negro", "Editorial Patagonia", "Inmobiliaria Centenario",
  "Frigorífico Neuquén",
];

const ORGANISMOS = [
  { codigo: "JNQEJ", ciudad: "Neuquén" },
  { codigo: "JNQCI", ciudad: "Neuquén" },
  { codigo: "JNQLA", ciudad: "Neuquén" },
  { codigo: "JNQFA", ciudad: "Neuquén" },
  { codigo: "JZAEJ", ciudad: "Zapala" },
  { codigo: "JZACI", ciudad: "Zapala" },
  { codigo: "JZALA", ciudad: "Zapala" },
  { codigo: "JZAFA", ciudad: "Zapala" },
  { codigo: "JJUEJ", ciudad: "Junín de los Andes" },
  { codigo: "JJUCI", ciudad: "Junín de los Andes" },
  { codigo: "JJULA", ciudad: "Junín de los Andes" },
  { codigo: "JJUFA", ciudad: "Junín de los Andes" },
];

const ANNOS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const pick = <T,>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

function caratula(
  tipo: "EXP" | "LEG",
  actor: string,
  demandado: string,
  asunto: string,
): string {
  if (tipo === "LEG") {
    const leg = [
      `Sucesión de ${actor}`,
      `Adopción de ${actor}`,
      `${asunto} de ${actor}`,
      `Legajo ${asunto} — ${actor}`,
    ];
    return pick(leg);
  }

  const exp = [
    `${actor} c/ ${demandado} s/ ${asunto}`,
    `${pick(EMPRESAS)} c/ ${actor} s/ ${asunto}`,
    `${actor} c/ ${pick(EMPRESAS)} s/ ${asunto}`,
    `${actor} c/ ${demandado} y otros s/ ${asunto}`,
    `${actor}, ${pick(APELLIDOS)} c/ ${demandado} s/ ${asunto}`,
    `Incidente — ${actor} c/ ${demandado} s/ ${asunto}`,
  ];
  return pick(exp);
}

export async function seed(knex: Knex): Promise<void> {
  const expedientes = [
    { id: 1, codigo_organismo: "JNQFA", tipo: "EXP", numero: 101, anno: 2024, caratula: "García c/ López s/ Alimentos", ciudad: "Neuquén" },
    { id: 2, codigo_organismo: "JNQCI", tipo: "LEG", numero: 45, anno: 2023, caratula: "Sucesión de Fernández", ciudad: "Neuquén" },
    { id: 3, codigo_organismo: "JZACI", tipo: "EXP", numero: 78, anno: 2024, caratula: "Rodríguez c/ Martínez s/ Daños y Perjuicios", ciudad: "Zapala" },
    { id: 4, codigo_organismo: "JJUEJ", tipo: "EXP", numero: 12, anno: 2025, caratula: "Banco Patagonia c/ Sánchez s/ Ejecución de Sentencia", ciudad: "Junín de los Andes" },
    { id: 5, codigo_organismo: "JNQLA", tipo: "EXP", numero: 200, anno: 2022, caratula: "González c/ Empresa Norte s/ Despido", ciudad: "Neuquén" },
    { id: 6, codigo_organismo: "JZAFA", tipo: "LEG", numero: 33, anno: 2023, caratula: "Adopción de Pérez", ciudad: "Zapala" },
    { id: 7, codigo_organismo: "JJUCI", tipo: "EXP", numero: 56, anno: 2024, caratula: "Romero c/ Municipalidad s/ Amparo", ciudad: "Junín de los Andes" },
    { id: 8, codigo_organismo: "JNQEJ", tipo: "EXP", numero: 89, anno: 2025, caratula: "Cooperativa c/ Díaz s/ Cobro de Pesos", ciudad: "Neuquén" },
    { id: 9, codigo_organismo: "JZALA", tipo: "EXP", numero: 15, anno: 2022, caratula: "Torres c/ Construcciones Sur s/ Accidente Laboral", ciudad: "Zapala" },
    { id: 10, codigo_organismo: "JJUFA", tipo: "EXP", numero: 7, anno: 2025, caratula: "Ruiz c/ Ruiz s/ Tenencia", ciudad: "Junín de los Andes" },
    { id: 11, codigo_organismo: "JNQCI", tipo: "EXP", numero: 120, anno: 2025, caratula: "López c/ García s/ Incumplimiento Contractual", ciudad: "Neuquén" },
    { id: 12, codigo_organismo: "JZACI", tipo: "LEG", numero: 22, anno: 2022, caratula: "Sucesión de Martínez", ciudad: "Zapala" },
  ];

  const usedKeys = new Set(
    expedientes.map((e) => `${e.codigo_organismo}-${e.tipo}-${e.numero}-${e.anno}`),
  );

  for (let id = 13; id <= TOTAL; id++) {
    const org = pick(ORGANISMOS);
    const tipo: "EXP" | "LEG" = Math.random() < 0.75 ? "EXP" : "LEG";
    const anno = pick(ANNOS);
    let numero = randInt(1, 9999);

    let key = `${org.codigo}-${tipo}-${numero}-${anno}`;
    while (usedKeys.has(key)) {
      numero += 1;
      key = `${org.codigo}-${tipo}-${numero}-${anno}`;
    }
    usedKeys.add(key);

    const actor = pick(APELLIDOS);
    const demandado = pick(APELLIDOS);
    const asunto = pick(ASUNTOS);

    expedientes.push({
      id,
      codigo_organismo: org.codigo,
      tipo,
      numero,
      anno,
      caratula: caratula(tipo, actor, demandado, asunto),
      ciudad: org.ciudad,
    });
  }

  for (let i = 0; i < expedientes.length; i += BATCH) {
    await knex("expedientes").insert(expedientes.slice(i, i + BATCH));
  }
}
