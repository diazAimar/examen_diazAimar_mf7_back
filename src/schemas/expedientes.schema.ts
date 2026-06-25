import Joi from "joi";
import { CIUDADES_ORGANISMO, CiudadOrganismo } from "./organismos.schema";

const TIPOS_EXPEDIENTE = ["EXP", "LEG"] as const;

export type TipoExpediente = (typeof TIPOS_EXPEDIENTE)[number];

const dniSchema = Joi.string()
  .pattern(/^\d{7,8}$/)
  .required()
  .messages({
    "any.required": "El DNI de la persona es requerido",
    "string.base":
      "El DNI de la persona debe ser un numero entero positivo (sin puntos)",
    "string.empty": "El DNI de la persona es requerido",
    "string.pattern.base":
      "El DNI de la persona debe tener entre 7 y 8 digitos (sin puntos)",
  });

const personaSchema = Joi.object({
  dni: dniSchema,
  nombre: Joi.string().required().messages({
    "any.required": "El nombre de la persona es requerido",
    "string.empty": "El nombre de la persona es requerido",
  }),
  apellido: Joi.string().required().messages({
    "any.required": "El apellido de la persona es requerido",
    "string.empty": "El apellido de la persona es requerido",
  }),
});

export interface IPersonaExpedienteSchema {
  dni: string;
  nombre: string;
  apellido: string;
}

export interface IPersonaVinculadaSchema extends IPersonaExpedienteSchema {
  tipo_vinculo: number;
}

export interface ICreateExpedienteSchema {
  organismo_id: number;
  tipo: TipoExpediente;
  numero: number;
  anno: number;
  caratula: string;
  ciudad: CiudadOrganismo;
  actor: IPersonaExpedienteSchema;
  personas: IPersonaVinculadaSchema[];
}

export const createExpedienteSchema = Joi.object<ICreateExpedienteSchema>({
  organismo_id: Joi.number().integer().positive().required().messages({
    "any.required": "El organismo es requerido",
    "number.base": "El organismo debe ser un ID numerico",
    "number.integer": "El organismo debe ser un ID numerico",
    "number.positive": "El organismo debe ser un ID numerico",
  }),
  tipo: Joi.string()
    .valid(...TIPOS_EXPEDIENTE)
    .required()
    .messages({
      "any.required": "El tipo de expediente es requerido",
      "string.empty": "El tipo de expediente es requerido",
      "any.only": "El tipo de expediente debe ser EXP o LEG",
    }),
  numero: Joi.number().integer().positive().required().messages({
    "any.required": "El numero del expediente es requerido",
    "number.base":
      "El numero del expediente debe ser un numero entero positivo",
    "number.integer":
      "El numero del expediente debe ser un numero entero positivo",
    "number.positive":
      "El numero del expediente debe ser un numero entero positivo",
  }),
  anno: Joi.number().integer().min(1900).max(2100).required().messages({
    "any.required": "El año del expediente es requerido",
    "number.base": "El año del expediente debe ser un numero entero",
    "number.integer": "El año del expediente debe ser un numero entero",
    "number.min": "El año del expediente debe ser mayor o igual a 1900",
    "number.max": "El año del expediente debe ser menor o igual a 2100",
  }),
  caratula: Joi.string().required().messages({
    "any.required": "La caratula del expediente es requerida",
    "string.empty": "La caratula del expediente es requerida",
  }),
  ciudad: Joi.string()
    .valid(...CIUDADES_ORGANISMO)
    .required()
    .messages({
      "any.required": "La ciudad del expediente es requerida",
      "string.empty": "La ciudad del expediente es requerida",
      "any.only":
        "La ciudad del expediente debe ser Neuquén, Zapala o Junín de los Andes",
    }),
  actor: personaSchema.required().messages({
    "any.required": "La persona principal (actor) es requerida",
  }),
  personas: Joi.array()
    .items(
      personaSchema.keys({
        tipo_vinculo: Joi.number().integer().required().messages({
          "any.required": "El tipo de vinculo es requerido",
          "number.base": "El tipo de vinculo debe ser un ID numerico",
          "any.only":
            "El tipo de vinculo debe ser 2 (DEMANDADO), 3 (CONDENADO) o 4 (VICTIMA)",
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      "any.required":
        "Debe incluir al menos una persona con vinculo DEMANDADO, CONDENADO o VICTIMA",
      "array.min":
        "Debe incluir al menos una persona con vinculo DEMANDADO, CONDENADO o VICTIMA",
    }),
});
