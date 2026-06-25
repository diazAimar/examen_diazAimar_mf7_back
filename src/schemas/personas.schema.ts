import Joi from "joi";

export interface ICreatePersonaSchema {
  dni: number;
  nombre: string;
  apellido: string;
}

export interface IUpdatePersonaSchema {
  id: number;
  dni?: number;
  nombre?: string;
  apellido?: string;
}

export const createPersonaSchema = Joi.object<ICreatePersonaSchema>({
  dni: Joi.number().integer().positive().required().messages({
    "any.required": "El DNI de la persona es requerido",
    "number.base":
      "El DNI de la persona debe ser un numero entero positivo (sin puntos)",
    "number.integer":
      "El DNI de la persona debe ser un numero entero positivo (sin puntos)",
    "number.positive":
      "El DNI de la persona debe tener entre 7 y 8 digitos (sin puntos)",
  }),
  nombre: Joi.string().required().messages({
    "any.required": "El nombre de la persona es requerido",
    "string.empty": "El nombre de la persona es requerido",
  }),
  apellido: Joi.string().required().messages({
    "any.required": "El apellido de la persona es requerido",
    "string.empty": "El apellido de la persona es requerido",
  }),
});

export const updatePersonaSchema = Joi.object<IUpdatePersonaSchema>({
  id: Joi.number().integer().positive().required().messages({
    "any.required": "El id de la persona es requerido",
    "number.base": "El id de la persona debe ser un numero entero positivo",
    "number.integer": "El id de la persona debe ser un numero entero positivo",
    "number.positive": "El id de la persona debe ser un numero entero positivo",
  }),
  dni: Joi.number().integer().positive().optional().messages({
    "number.base":
      "El DNI de la persona debe ser un numero entero positivo (sin puntos)",
    "number.integer":
      "El DNI de la persona debe ser un numero entero positivo (sin puntos)",
    "number.positive":
      "El DNI de la persona debe tener entre 7 y 8 digitos (sin puntos)",
  }),
  nombre: Joi.string().optional().messages({
    "string.empty": "El nombre de la persona es requerido",
  }),
  apellido: Joi.string().optional().messages({
    "string.empty": "El apellido de la persona es requerido",
  }),
});
