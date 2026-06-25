import express, { Request, Response } from "express";
import cors from "cors";
import personasRouter from "./routes/personas";
import organismosRouter from "./routes/organismos";
import tiposVinculoRouter from "./routes/tipos-vinculo";
import expedientesRouter from "./routes/expedientes";

const bootstrap = async () => {
  const app = express();
  const port = 8000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: "http://localhost:5173",
    }),
  );

  app.use("/api/personas/", personasRouter);
  app.use("/api/organismos/", organismosRouter);
  app.use("/api/tipos-vinculo/", tiposVinculoRouter);
  app.use("/api/expedientes/", expedientesRouter);

  app.listen(port, () => {
    console.log(`App levantada en puerto ${port}`);
  });
};

bootstrap().catch((error) => {
  console.log(error);
});
