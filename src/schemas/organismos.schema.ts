import Joi from "joi";
import { IIdParamSchema } from "./shared.schema";

export const CIUDADES_ORGANISMO = [
  "Neuquén",
  "Zapala",
  "Junín de los Andes",
] as const;
const FUEROS_ORGANISMO = ["Ejecutivos", "Civil", "Laboral", "Familia"] as const;

export type CiudadOrganismo = (typeof CIUDADES_ORGANISMO)[number];
export type FueroOrganismo = (typeof FUEROS_ORGANISMO)[number];

export const CIUDAD_CODIGO: Record<CiudadOrganismo, string> = {
  Neuquén: "NQ",
  Zapala: "ZA",
  "Junín de los Andes": "JU",
};

export interface ICreateOrganismoSchema {
  nombre: string;
  caratula: string;
  ciudad: CiudadOrganismo;
  fuero: FueroOrganismo;
}

export interface IUpdateOrganismoSchema {
  id: number;
  nombre: string;
  caratula: string;
  ciudad: CiudadOrganismo;
  fuero: FueroOrganismo;
}

export const idParamSchema = Joi.object<IIdParamSchema>({
  id: Joi.number().integer().positive().required().messages({
    "any.required": "El id de la persona es requerido",
    "number.base": "El id de la persona debe ser un numero entero positivo",
    "number.integer": "El id de la persona debe ser un numero entero positivo",
    "number.positive": "El id de la persona debe ser un numero entero positivo",
  }),
});

export const createOrganismoSchema = Joi.object<ICreateOrganismoSchema>({
  nombre: Joi.string().required().messages({
    "any.required": "El nombre del organismo es requerido",
    "string.empty": "El nombre del organismo es requerido",
  }),
  caratula: Joi.string().required().messages({
    "any.required": "La caratula del organismo es requerido",
    "string.empty": "La caratula del organismo es requerido",
  }),
  ciudad: Joi.string()
    .valid(...CIUDADES_ORGANISMO)
    .required()
    .messages({
      "any.required": "La ciudad del organismo es requerido",
      "string.empty": "La ciudad del organismo es requerido",
      "any.only":
        "La ciudad del organismo debe ser Neuquén, Zapala o Junín de los Andes",
    }),
  fuero: Joi.string()
    .valid(...FUEROS_ORGANISMO)
    .required()
    .messages({
      "any.required": "El fuero del organismo es requerido",
      "string.empty": "El fuero del organismo es requerido",
      "any.only":
        "El fuero del organismo debe ser Ejecutivos, Civil, Laboral o Familia",
    }),
});

export const updateOrganismoSchema = Joi.object<IUpdateOrganismoSchema>({
  id: Joi.number().integer().positive().required().messages({
    "any.required": "El id del organismo es requerido",
    "number.base": "El id del organismo debe ser un numero entero positivo",
    "number.integer": "El id del organismo debe ser un numero entero positivo",
    "number.positive": "El id del organismo debe ser un numero entero positivo",
  }),
  nombre: Joi.string().optional().messages({
    "string.empty": "El nombre del organismo es requerido",
  }),
  caratula: Joi.string().optional().messages({
    "string.empty": "La caratula del organismo es requerido",
  }),
  ciudad: Joi.string()
    .valid(...CIUDADES_ORGANISMO)
    .optional()
    .messages({
      "any.only":
        "La ciudad del organismo debe ser Neuquén, Zapala o Junín de los Andes",
    }),
  fuero: Joi.string()
    .valid(...FUEROS_ORGANISMO)
    .optional()
    .messages({
      "any.only":
        "El fuero del organismo debe ser Ejecutivos, Civil, Laboral o Familia",
    }),
});
