import cors from "cors";
import "dotenv/config";
import express from "express";
import { probarConexion } from "./config/database.js";
import {
  manejarErrores, rutaNoEncontrada,
} from "./middlewares/error.middleware.js";
import { citaRouter } from "./routes/cita.routes.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const FRONTEND_ORIGIN = (
  process.env.FRONTEND_URL ?? "http://localhost:5173"
).replace(/\/+$/, "");

app.use(cors({
  origin: FRONTEND_ORIGIN,
}));
app.use(express.json());

app.get("/api/salud", (_req, res) => {
  res.json({ mensaje: "API de Veterinaria funcionando" });
});

app.use("/api/citas", citaRouter);
app.use(rutaNoEncontrada);
app.use(manejarErrores);

async function iniciarServidor(): Promise<void> {
  await probarConexion();
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

iniciarServidor().catch((error) => {
  console.error("No fue posible iniciar el servidor:", error);
  process.exit(1);
});