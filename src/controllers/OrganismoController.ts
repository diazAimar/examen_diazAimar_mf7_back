import { Request, Response } from "express";
import { db } from "../database/db";
import { sendResponse } from "../utils/sendResponse";
import { handleValidationErrors } from "../utils/handleValidationErrors";
import {
  CIUDAD_CODIGO,
  createOrganismoSchema,
  ICreateOrganismoSchema,
  IUpdateOrganismoSchema,
  updateOrganismoSchema,
} from "../schemas/organismos.schema";
import { idParamSchema, IIdParamSchema } from "../schemas/shared.schema";
import { now, timestampsOnUpdate } from "../database/queryHelpers";

export class OrganismoController {
  get = async (req: Request, res: Response) => {
    try {
      const organismos = await db.select("*").from("organismos");
      return sendResponse({ res: res, data: organismos });
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

      const organismo = await db
        .select("*")
        .from("organismos")
        .where("id", value.id)
        .first();

      if (!organismo) {
        return sendResponse({
          res: res,
          error: "Organismo inexistente",
          status: 404,
        });
      }

      return sendResponse({ res: res, data: organismo });
    } catch (error) {
      return sendResponse({
        res: res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  post = async (
    req: Request<{}, {}, ICreateOrganismoSchema>,
    res: Response,
  ) => {
    try {
      const { nombre, caratula, ciudad, fuero } = req.body;

      const { error, value } = await createOrganismoSchema.validate(
        {
          nombre,
          caratula,
          ciudad,
          fuero,
        },
        {
          abortEarly: false,
        },
      );

      if (error) {
        return handleValidationErrors(res, error);
      }

      const codigo =
        "J" +
        CIUDAD_CODIGO[value.ciudad] +
        value.fuero.substring(0, 2).toUpperCase();

      const codigoExists = await db("organismos")
        .where("codigo", codigo)
        .first();

      if (codigoExists) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "ciudad",
              message: "Ya existe un organismo con esta ciudad y fuero",
            },
            {
              key: "fuero",
              message: "Ya existe un organismo con esta ciudad y este fuero",
            },
          ],
        });
      }

      const [organismo] = await db("organismos")
        .insert({
          codigo,
          nombre: value.nombre,
          caratula: value.caratula,
          ciudad: value.ciudad,
          fuero: value.fuero,
        })
        .returning("*");

      return sendResponse({ res: res, data: organismo, status: 201 });
    } catch (error) {
      return sendResponse({
        res: res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  patch = async (
    req: Request<IIdParamSchema, {}, IUpdateOrganismoSchema>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const { nombre, caratula, ciudad, fuero } = req.body;

      const { error, value } = await updateOrganismoSchema.validate(
        {
          id,
          nombre,
          caratula,
          ciudad,
          fuero,
        },
        {
          abortEarly: false,
        },
      );

      if (error) {
        return handleValidationErrors(res, error);
      }

      const newCodigo =
        "J" +
        CIUDAD_CODIGO[value.ciudad] +
        value.fuero.substring(0, 2).toUpperCase();

      const codigoExists = await db("organismos")
        .where("codigo", newCodigo)
        .where("id", "<>", value.id)
        .whereNull("deleted_at")
        .first();

      if (codigoExists) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "codigo",
              message: "Ya existe un organismo con este código",
            },
          ],
        });
      }

      const existing = await db("organismos")
        .where("id", id)
        .whereNull("deleted_at")
        .first();

      if (!existing) {
        return sendResponse({
          res: res,
          error: "Organismo inexistente",
          status: 404,
        });
      }

      const oldCodigo = existing.codigo;

      const [organismo] = await db.transaction(async (trx) => {
        const updated = await trx("organismos")
          .where("id", id)
          .update({
            codigo: newCodigo,
            nombre: value.nombre,
            caratula: value.caratula,
            ciudad: value.ciudad,
            fuero: value.fuero,
          })
          .returning("*");

        if (oldCodigo !== newCodigo) {
          await trx("expedientes")
            .where("codigo_organismo", oldCodigo)
            .update({ codigo_organismo: newCodigo });
        }

        return updated;
      });

      return sendResponse({ res: res, data: organismo, status: 201 });
    } catch (error) {
      return sendResponse({
        res: res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  delete = async (req: Request<IIdParamSchema, {}, {}>, res: Response) => {
    try {
      const { id } = req.params;

      const { error, value } = await idParamSchema.validate({ id });

      if (error) {
        return handleValidationErrors(res, error);
      }

      const organismo = await db("organismos")
        .where("id", value.id)
        .whereNull("deleted_at")
        .first();

      if (!organismo) {
        return sendResponse({
          res,
          error: "Organismo inexistente",
          status: 404,
        });
      }

      const timestamp = now();

      await db.transaction(async (trx) => {
        await trx("organismos")
          .where("id", value.id)
          .update({ deleted_at: timestamp, updated_at: timestamp });

        await trx("expedientes")
          .where("codigo_organismo", organismo.codigo)
          .whereNull("deleted_at")
          .update({ deleted_at: timestamp, updated_at: timestamp });
      });

      return sendResponse({ res, data: null });
    } catch (error) {
      return sendResponse({
        res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  restore = async (req: Request<IIdParamSchema, {}, {}>, res: Response) => {
    try {
      const { id } = req.params;

      const { error, value } = await idParamSchema.validate({ id });

      if (error) {
        return handleValidationErrors(res, error);
      }

      const organismo = await db("organismos")
        .where("id", value.id)
        .whereNotNull("deleted_at")
        .first();

      if (!organismo) {
        return sendResponse({
          res,
          error: "Organismo inexistente o no eliminado",
          status: 404,
        });
      }

      const [restored] = await db.transaction(async (trx) => {
        const result = await trx("organismos")
          .where("id", value.id)
          .update({ deleted_at: null, ...timestampsOnUpdate() })
          .returning("*");

        await trx("expedientes")
          .where("codigo_organismo", organismo.codigo)
          .whereNotNull("deleted_at")
          .update({ deleted_at: null, ...timestampsOnUpdate() });

        return result;
      });

      return sendResponse({ res, data: restored });
    } catch (error) {
      return sendResponse({
        res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };
}
