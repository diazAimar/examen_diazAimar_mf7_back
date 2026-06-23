import { Request, Response } from "express";
import { db } from "../database/db";
import { sendResponse } from "../utils/sendResponse";
import { handleValidationErrors } from "../utils/handleValidationErrors";
import {
  createPersonaSchema,
  dniParamSchema,
  ICreatePersonaSchema,
  IDniParamSchema,
  IUpdatePersonaSchema,
  updatePersonaSchema,
} from "../schemas/personas.schema";
import { IIdParamSchema } from "../schemas/shared.schema";

export class PersonaController {
  get = async (req: Request, res: Response) => {
    try {
      const personas = await db.select("*").from("personas");
      return sendResponse({ res: res, data: personas });
    } catch (error) {
      return sendResponse({
        res: res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  getByDni = async (req: Request<IDniParamSchema, {}, {}>, res: Response) => {
    try {
      const { dni } = req.params;

      const { error, value } = await dniParamSchema.validate({
        dni,
      });

      if (error) {
        return handleValidationErrors(res, error);
      }

      const persona = await db
        .select("*")
        .from("personas")
        .where("dni", Number(value.dni))
        .first();

      if (!persona) {
        return sendResponse({
          res: res,
          error: "Persona inexistente",
          status: 404,
        });
      }

      return sendResponse({ res: res, data: persona });
    } catch (error) {
      return sendResponse({
        res: res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  post = async (req: Request<{}, {}, ICreatePersonaSchema>, res: Response) => {
    try {
      const { dni, nombre, apellido } = req.body;

      const { error, value } = await createPersonaSchema.validate(
        {
          dni,
          nombre,
          apellido,
        },
        {
          abortEarly: false,
        },
      );

      if (error) {
        return handleValidationErrors(res, error);
      }

      const dniNumber = Number(value.dni);

      const dniExists = await db("personas").where("dni", dniNumber).first();

      if (dniExists) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            { key: "dni", message: "Ya existe una persona con este DNI" },
          ],
        });
      }

      const [persona] = await db("personas")
        .insert({
          dni: dniNumber,
          nombre: value.nombre,
          apellido: value.apellido,
        })
        .returning("*");

      return sendResponse({ res: res, data: persona, status: 201 });
    } catch (error) {
      return sendResponse({
        res: res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  patch = async (
    req: Request<IIdParamSchema, {}, IUpdatePersonaSchema>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const { dni, nombre, apellido } = req.body;

      const { error, value } = await updatePersonaSchema.validate(
        {
          id,
          dni,
          nombre,
          apellido,
        },
        {
          abortEarly: false,
        },
      );

      if (error) {
        return handleValidationErrors(res, error);
      }

      const dniNumber = Number(value.dni);

      const dniExists = await db("personas").where("dni", dniNumber).first();

      if (dniExists) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            { key: "dni", message: "Ya existe una persona con este DNI" },
          ],
        });
      }

      const persona = await db("personas")
        .where("id", id)
        .update({
          dni: dniNumber,
          nombre: value.nombre,
          apellido: value.apellido,
        })
        .returning("*");

      if (!persona) {
        return sendResponse({
          res: res,
          error: "Persona inexistente",
          status: 404,
        });
      }

      return sendResponse({ res: res, data: persona, status: 201 });
    } catch (error) {
      return sendResponse({
        res: res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };
}
