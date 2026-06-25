import { Request, Response } from "express";
import { Knex } from "knex";
import { db } from "../database/db";
import { sendResponse } from "../utils/sendResponse";
import { handleValidationErrors } from "../utils/handleValidationErrors";
import {
  createExpedienteSchema,
  ICreateExpedienteSchema,
  IPersonaExpedienteSchema,
} from "../schemas/expedientes.schema";
import { idParamSchema, IIdParamSchema } from "../schemas/shared.schema";

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
      return sendResponse({ res, data: expedientes });
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
}
