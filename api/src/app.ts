// src/app.ts
import express, { Express, Request, Response } from "express";
import cors from "cors";
import "dotenv/config"; // Garante que o .env seja lido
import mainRouter from "./routes"; // Nosso roteador principal
import stripeWebhookRouter from "./webhooks/stripe/stripe-webhook.routes";

const app: Express = express();

// Middleware de CORS
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//   })
// );

app.use(cors({ origin: "*" }));

app.use("/api/webhooks/stripe", stripeWebhookRouter);

// Middleware para parsear JSON
app.use(express.json());

// Rota de "health check"
app.get("/health", (req: Request, res: Response) => {
  res.status(200).send("API is running!");
});

// Monta o roteador principal na rota /api
app.use("/api", mainRouter);

export default app;
