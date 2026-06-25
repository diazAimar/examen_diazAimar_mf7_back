import { Router } from "express";
import { OrganismoController } from "../controllers/OrganismoController";

const organismoController = new OrganismoController();
const organismosRouter = Router();

organismosRouter.get("/", organismoController.get);
organismosRouter.get("/:id", organismoController.getById);
organismosRouter.post("/", organismoController.post);
organismosRouter.patch("/:id", organismoController.patch);
organismosRouter.delete("/:id", organismoController.delete);
organismosRouter.patch("/:id/restore", organismoController.restore);

export default organismosRouter;
