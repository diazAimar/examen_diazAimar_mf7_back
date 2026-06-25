import { Request, Response } from "express";
import { db } from "../database/db";
import { sendResponse } from "../utils/sendResponse";
import { handleValidationErrors } from "../utils/handleValidationErrors";
import { formatExpedienteClave } from "../utils/formatExpedienteClave";
import {
  createPersonaSchema,
  ICreatePersonaSchema,
  IUpdatePersonaSchema,
  updatePersonaSchema,
} from "../schemas/personas.schema";
import { idParamSchema, IIdParamSchema } from "../schemas/shared.schema";

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

  getById = async (req: Request<IIdParamSchema, {}, {}>, res: Response) => {
    try {
      const { id } = req.params;

      const { error, value } = await idParamSchema.validate({
        id,
      });

      if (error) {
        return handleValidationErrors(res, error);
      }

      const persona = await db
        .select("*")
        .from("personas")
        .where("id", Number(value.id))
        .first();

      if (!persona) {
        return sendResponse({
          res: res,
          error: "Persona inexistente",
          status: 404,
        });
      }

      const expedientesRows = await db("expediente_persona as ep")
        .join("expedientes as e", "e.id", "ep.expediente_id")
        .join("organismos as o", "e.codigo_organismo", "o.codigo")
        .join("tipos_vinculo as tv", "tv.id", "ep.tipo_vinculo_id")
        .where("ep.persona_id", Number(value.id))
        .select(
          "e.id",
          "e.codigo_organismo",
          "e.tipo",
          "e.numero",
          "e.anno",
          "e.caratula",
          "e.ciudad",
          "o.id as organismo_id",
          "o.nombre as organismo_nombre",
          "o.fuero as organismo_fuero",
          "tv.id as tipo_vinculo_id",
          "tv.descripcion as tipo_vinculo_descripcion",
        )
        .orderBy("e.id");

      const expedientes = expedientesRows.map(
        ({
          organismo_id,
          organismo_nombre,
          organismo_fuero,
          tipo_vinculo_id,
          tipo_vinculo_descripcion,
          ...expediente
        }) => ({
          ...expediente,
          clave: formatExpedienteClave(
            expediente.codigo_organismo,
            expediente.tipo,
            expediente.numero,
            expediente.anno,
          ),
          organismo: {
            id: organismo_id,
            nombre: organismo_nombre,
            fuero: organismo_fuero,
          },
          tipo_vinculo: {
            id: tipo_vinculo_id,
            descripcion: tipo_vinculo_descripcion,
          },
        }),
      );

      return sendResponse({ res: res, data: { ...persona, expedientes } });
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
