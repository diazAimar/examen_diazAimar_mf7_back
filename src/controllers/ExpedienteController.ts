import { Request, Response } from "express";
import { Knex } from "knex";
import { db } from "../database/db";
import { sendResponse } from "../utils/sendResponse";
import { handleValidationErrors } from "../utils/handleValidationErrors";
import { formatExpedienteClave } from "../utils/formatExpedienteClave";
import {
  createExpedienteSchema,
  ICreateExpedienteSchema,
  IPersonaExpedienteSchema,
} from "../schemas/expedientes.schema";
import { idParamSchema, IIdParamSchema } from "../schemas/shared.schema";
import { now, timestampsOnUpdate } from "../database/queryHelpers";

export class ExpedienteController {
  private resolveOrCreatePersona = async (
    trx: Knex.Transaction,
    persona: IPersonaExpedienteSchema,
  ) => {
    const dniNumber = Number(persona.dni);

    const existing = await trx("personas").where("dni", dniNumber).first();

    if (existing) {
      return existing;
    }

    const [created] = await trx("personas")
      .insert({
        dni: dniNumber,
        nombre: persona.nombre,
        apellido: persona.apellido,
      })
      .returning("*");

    return created;
  };

  private getPersonasByExpedienteId = async (
    query: Knex | Knex.Transaction,
    expedienteId: number,
  ) => {
    const rows = await query("expediente_persona as ep")
      .join("personas as p", "p.id", "ep.persona_id")
      .join("tipos_vinculo as tv", "tv.id", "ep.tipo_vinculo_id")
      .where("ep.expediente_id", expedienteId)
      .select(
        "p.id",
        "p.dni",
        "p.nombre",
        "p.apellido",
        "tv.id as tipo_vinculo_id",
        "tv.descripcion as tipo_vinculo_descripcion",
      )
      .orderBy("ep.id");

    return rows.map(
      ({ tipo_vinculo_id, tipo_vinculo_descripcion, ...persona }) => ({
        ...persona,
        tipo_vinculo: {
          id: tipo_vinculo_id,
          descripcion: tipo_vinculo_descripcion,
        },
      }),
    );
  };

  private formatExpedienteResponse = (
    expediente: Record<string, unknown>,
    organismo: { id: number; nombre: string },
    personas: Awaited<
      ReturnType<ExpedienteController["getPersonasByExpedienteId"]>
    >,
  ) => {
    const { organismo_id, organismo_nombre, ...expedienteData } = expediente;

    return {
      ...expedienteData,
      clave: formatExpedienteClave(
        expedienteData.codigo_organismo as string,
        expedienteData.tipo as string,
        expedienteData.numero as number,
        expedienteData.anno as number,
      ),
      organismo: {
        id: organismo.id,
        nombre: organismo.nombre,
      },
      personas,
    };
  };

  get = async (req: Request, res: Response) => {
    try {
      const expedientes = await db("expedientes").select("*");

      return sendResponse({
        res,
        data: expedientes.map(
          ({ codigo_organismo, tipo, numero, anno, ...rest }) => ({
            ...rest,
            codigo_organismo,
            tipo,
            numero,
            anno,
            clave: formatExpedienteClave(codigo_organismo, tipo, numero, anno),
          }),
        ),
      });
    } catch (error) {
      return sendResponse({
        res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  estadisticas = async (_req: Request, res: Response) => {
    try {
      const porAnno = await db("expedientes")
        .select("anno")
        .count<{ anno: number; cantidad: number | string }[]>("id as cantidad")
        .groupBy("anno")
        .orderBy("anno", "asc");

      const porCiudad = await db("expedientes")
        .select("ciudad")
        .count<
          { ciudad: string; cantidad: number | string }[]
        >("id as cantidad")
        .groupBy("ciudad")
        .orderBy("ciudad", "asc");

      const porFuero = await db("expedientes as e")
        .join("organismos as o", "e.codigo_organismo", "o.codigo")
        .select("o.fuero as fuero")
        .count<
          { fuero: string; cantidad: number | string }[]
        >("e.id as cantidad")
        .groupBy("o.fuero")
        .orderBy("o.fuero", "asc");

      const general = await db("expedientes as e")
        .join("organismos as o", "e.codigo_organismo", "o.codigo")
        .select("e.anno as anno", "e.ciudad as ciudad", "o.fuero as fuero")
        .count<
          {
            anno: number;
            ciudad: string;
            fuero: string;
            cantidad: number | string;
          }[]
        >("e.id as cantidad")
        .groupBy("e.anno", "e.ciudad", "o.fuero")
        .orderBy([
          { column: "e.anno", order: "asc" },
          { column: "e.ciudad", order: "asc" },
          { column: "o.fuero", order: "asc" },
        ]);

      const toNumber = <T extends { cantidad: number | string }>(rows: T[]) =>
        rows.map((row) => ({ ...row, cantidad: Number(row.cantidad) }));

      return sendResponse({
        res,
        data: {
          por_anno: toNumber(porAnno),
          por_ciudad: toNumber(porCiudad),
          por_fuero: toNumber(porFuero),
          general: toNumber(general),
        },
      });
    } catch (error) {
      return sendResponse({
        res,
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

      const expediente = await db("expedientes as e")
        .where("e.id", value.id)
        .join("organismos as o", "e.codigo_organismo", "o.codigo")
        .select("e.*", "o.id as organismo_id", "o.nombre as organismo_nombre")
        .first();

      if (!expediente) {
        return sendResponse({
          res,
          status: 404,
          error: "Expediente inexistente",
        });
      }

      const personas = await this.getPersonasByExpedienteId(db, value.id);

      return sendResponse({
        res,
        data: this.formatExpedienteResponse(
          expediente,
          {
            id: expediente.organismo_id,
            nombre: expediente.organismo_nombre,
          },
          personas,
        ),
      });
    } catch (error) {
      return sendResponse({
        res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  post = async (
    req: Request<{}, {}, ICreateExpedienteSchema>,
    res: Response,
  ) => {
    try {
      const { error, value } = await createExpedienteSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return handleValidationErrors(res, error);
      }

      const organismo = await db("organismos")
        .where("id", value.organismo_id)
        .first();

      if (!organismo) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "organismo_id",
              message: "El organismo indicado no existe",
            },
          ],
        });
      }

      if (organismo.ciudad !== value.ciudad) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "ciudad",
              message:
                "La ciudad del expediente debe coincidir con la ciudad del organismo",
            },
          ],
        });
      }

      const expedienteExists = await db("expedientes")
        .where({
          codigo_organismo: organismo.codigo,
          tipo: value.tipo,
          numero: value.numero,
          anno: value.anno,
        })
        .first();

      if (expedienteExists) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "numero",
              message:
                "Ya existe un expediente con este organismo, tipo, numero y año",
            },
          ],
        });
      }

      const actorDni = Number(value.actor.dni);
      const actorInPersonas = value.personas.some(
        (persona) => Number(persona.dni) === actorDni,
      );

      if (actorInPersonas) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "actor",
              message:
                "La persona principal (ACTOR) no puede figurar tambien entre las demas personas del expediente",
            },
          ],
        });
      }

      const result = await db.transaction(async (trx) => {
        const [expediente] = await trx("expedientes")
          .insert({
            codigo_organismo: organismo.codigo,
            tipo: value.tipo,
            numero: value.numero,
            anno: value.anno,
            caratula: value.caratula,
            ciudad: value.ciudad,
          })
          .returning("*");

        const actor = await this.resolveOrCreatePersona(trx, value.actor);

        await trx("expediente_persona").insert({
          expediente_id: expediente.id,
          persona_id: actor.id,
          tipo_vinculo_id: 1,
        });

        for (const persona of value.personas) {
          const personaRecord = await this.resolveOrCreatePersona(trx, persona);

          await trx("expediente_persona").insert({
            expediente_id: expediente.id,
            persona_id: personaRecord.id,
            tipo_vinculo_id: persona.tipo_vinculo,
          });
        }

        const personas = await this.getPersonasByExpedienteId(
          trx,
          expediente.id,
        );

        return this.formatExpedienteResponse(expediente, organismo, personas);
      });

      return sendResponse({ res, data: result, status: 201 });
    } catch (error) {
      return sendResponse({
        res,
        error: `Ocurrió un error inesperado. Por favor, intente nuevamente. Error: ${error}`,
        status: 500,
      });
    }
  };

  patch = async (
    req: Request<IIdParamSchema, {}, ICreateExpedienteSchema>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;

      const { error: idError, value: idValue } = await idParamSchema.validate({
        id,
      });

      if (idError) {
        return handleValidationErrors(res, idError);
      }

      const { error, value } = await createExpedienteSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return handleValidationErrors(res, error);
      }

      const expedienteExistente = await db("expedientes")
        .where("id", idValue.id)
        .first();

      if (!expedienteExistente) {
        return sendResponse({
          res,
          status: 404,
          error: "Expediente inexistente",
        });
      }

      const organismo = await db("organismos")
        .where("id", value.organismo_id)
        .first();

      if (!organismo) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "organismo_id",
              message: "El organismo indicado no existe",
            },
          ],
        });
      }

      if (organismo.ciudad !== value.ciudad) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "ciudad",
              message:
                "La ciudad del expediente debe coincidir con la ciudad del organismo",
            },
          ],
        });
      }

      const expedienteDuplicado = await db("expedientes")
        .where({
          codigo_organismo: organismo.codigo,
          tipo: value.tipo,
          numero: value.numero,
          anno: value.anno,
        })
        .whereNot("id", idValue.id)
        .first();

      if (expedienteDuplicado) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "numero",
              message:
                "Ya existe un expediente con este organismo, tipo, numero y año",
            },
          ],
        });
      }

      const actorDni = Number(value.actor.dni);
      const actorInPersonas = value.personas.some(
        (persona) => Number(persona.dni) === actorDni,
      );

      if (actorInPersonas) {
        return sendResponse({
          res,
          status: 422,
          validationErrors: [
            {
              key: "actor",
              message:
                "La persona principal (ACTOR) no puede figurar tambien entre las demas personas del expediente",
            },
          ],
        });
      }

      const result = await db.transaction(async (trx) => {
        await trx("expedientes").where("id", idValue.id).update({
          codigo_organismo: organismo.codigo,
          tipo: value.tipo,
          numero: value.numero,
          anno: value.anno,
          caratula: value.caratula,
          ciudad: value.ciudad,
        });

        await trx("expediente_persona")
          .where("expediente_id", idValue.id)
          .del();

        const actorPersona = await this.resolveOrCreatePersona(
          trx,
          value.actor,
        );

        await trx("expediente_persona").insert({
          expediente_id: idValue.id,
          persona_id: actorPersona.id,
          tipo_vinculo_id: 1,
        });

        for (const persona of value.personas) {
          const personaRecord = await this.resolveOrCreatePersona(trx, persona);

          await trx("expediente_persona").insert({
            expediente_id: idValue.id,
            persona_id: personaRecord.id,
            tipo_vinculo_id: persona.tipo_vinculo,
          });
        }

        const expediente = await trx("expedientes")
          .where("id", idValue.id)
          .first();

        const personasResult = await this.getPersonasByExpedienteId(
          trx,
          idValue.id,
        );

        return this.formatExpedienteResponse(
          expediente,
          organismo,
          personasResult,
        );
      });

      return sendResponse({ res, data: result, status: 201 });
    } catch (error) {
      return sendResponse({
        res,
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

      const timestamp = now();
      const deleted = await db("expedientes")
        .where("id", value.id)
        .whereNull("deleted_at")
        .update({ deleted_at: timestamp, updated_at: timestamp });

      if (!deleted) {
        return sendResponse({
          res,
          error: "Expediente inexistente",
          status: 404,
        });
      }

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

      const expediente = await db("expedientes")
        .where("id", value.id)
        .whereNotNull("deleted_at")
        .first();

      if (!expediente) {
        return sendResponse({
          res,
          error: "Expediente inexistente o no eliminado",
          status: 404,
        });
      }

      const organismo = await db("organismos")
        .where("codigo", expediente.codigo_organismo)
        .first();

      if (!organismo || organismo.deleted_at !== null) {
        return sendResponse({
          res,
          status: 422,
          error:
            "No se puede restaurar el expediente porque su organismo está eliminado. Restaure primero el organismo.",
        });
      }

      const [restored] = await db("expedientes")
        .where("id", value.id)
        .update({ deleted_at: null, ...timestampsOnUpdate() })
        .returning("*");

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
