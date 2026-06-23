import { Router } from "express";
import { OrganismoController } from "../controllers/OrganismoController";

const organismoController = new OrganismoController();
const organismosRouter = Router();

organismosRouter.get("/", organismoController.get);
organismosRouter.get("/:id", organismoController.getById);
organismosRouter.post("/", organismoController.post);
organismosRouter.patch("/:id", organismoController.patch);

export default organismosRouter;
