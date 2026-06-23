import express, { Request, Response } from "express";
import cors from "cors";
import personasRouter from "./routes/personas";

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

  app.listen(port, () => {
    console.log(`App levantada en puerto ${port}`);
  });
};

bootstrap().catch((error) => {
  console.log(error);
});
