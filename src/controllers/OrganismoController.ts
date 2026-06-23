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

      const codigo =
        "J" +
        CIUDAD_CODIGO[value.ciudad] +
        value.fuero.substring(0, 2).toUpperCase();
      console.log(value);
      const codigoExists = await db("organismos")
        .where("codigo", codigo)
        .where("id", "<>", value.id)
        .first();

      console.log(codigo, codigoExists);

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

      const organismo = await db("organismos")
        .where("id", id)
        .update({
          nombre: value.nombre,
          caratula: value.caratula,
          ciudad: value.ciudad,
          fuero: value.fuero,
        })
        .returning("*");

      if (!organismo) {
        return sendResponse({
          res: res,
          error: "Organismo inexistente",
          status: 404,
        });
      }

      return sendResponse({ res: res, data: organismo, status: 201 });
    } catch (error) {
      return sendResponse({
        res: res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };
}
