import { Router } from "express";
import { PersonaController } from "../controllers/PersonaController";

const personaController = new PersonaController();
const personasRouter = Router();

personasRouter.get("/", personaController.get);
personasRouter.get("/:id", personaController.getById);
personasRouter.post("/", personaController.post);
personasRouter.patch("/:id", personaController.patch);
personasRouter.delete("/:id", personaController.delete);
personasRouter.patch("/:id/restore", personaController.restore);

export default personasRouter;
