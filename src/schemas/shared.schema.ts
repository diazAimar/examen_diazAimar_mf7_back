import Joi from "joi";

export interface IIdParamSchema {
  id: number;
}

export const idParamSchema = Joi.object<IIdParamSchema>({
  id: Joi.number().integer().positive().required().messages({
    "any.required": "El id de la persona es requerido",
    "number.base": "El id de la persona debe ser un numero entero positivo",
    "number.integer": "El id de la persona debe ser un numero entero positivo",
    "number.positive": "El id de la persona debe ser un numero entero positivo",
  }),
});
