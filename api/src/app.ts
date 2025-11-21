// src/app.ts
import express, { Express, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mainRouter from "./routes";
import stripeWebhookRouter from "./webhooks/stripe/stripe-webhook.routes";

const app: Express = express();

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
