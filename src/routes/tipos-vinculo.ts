import { Router } from "express";
import { TiposVinculoController } from "../controllers/TiposVinculoController";

const tiposVinculoController = new TiposVinculoController();
const tiposVinculoRouter = Router();

tiposVinculoRouter.get("/", tiposVinculoController.get);
tiposVinculoRouter.get("/:id", tiposVinculoController.getById);

export default tiposVinculoRouter;
