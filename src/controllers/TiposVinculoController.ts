import { Request, Response } from "express";
import { db } from "../database/db";
import { sendResponse } from "../utils/sendResponse";
import { handleValidationErrors } from "../utils/handleValidationErrors";
import { idParamSchema, IIdParamSchema } from "../schemas/shared.schema";

export class TiposVinculoController {
  get = async (req: Request, res: Response) => {
    try {
      const tiposVinculo = await db.select("*").from("tipos_vinculo");
      return sendResponse({ res: res, data: tiposVinculo });
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

      const tipoVinculo = await db
        .select("*")
        .from("tipos_vinculo")
        .where("id", value.id)
        .first();

      if (!tipoVinculo) {
        return sendResponse({
          res: res,
          error: "Tipo de vinculo inexistente",
          status: 404,
        });
      }

      return sendResponse({ res: res, data: tipoVinculo });
    } catch (error) {
      return sendResponse({
        res: res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };
}
