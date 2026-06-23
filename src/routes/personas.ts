import { Router } from "express";
import { PersonaController } from "../controllers/PersonaController";

const personaController = new PersonaController();
const personasRouter = Router();

personasRouter.get("/", personaController.get);
personasRouter.get("/:dni", personaController.getByDni);
personasRouter.post("/", personaController.post);
personasRouter.patch("/:id", personaController.patch);

export default personasRouter;
