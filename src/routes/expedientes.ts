import { Router } from "express";
import { ExpedienteController } from "../controllers/ExpedienteController";

const expedienteController = new ExpedienteController();
const expedientesRouter = Router();

expedientesRouter.get("/", expedienteController.get);
expedientesRouter.get("/estadisticas", expedienteController.estadisticas);
expedientesRouter.post("/", expedienteController.post);
expedientesRouter.get("/:id", expedienteController.getById);
expedientesRouter.patch("/:id", expedienteController.patch);

export default expedientesRouter;
