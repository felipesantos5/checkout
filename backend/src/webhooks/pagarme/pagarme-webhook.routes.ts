// src/webhooks/pagarme/pagarme-webhook.routes.ts
import { Router } from "express";
import { handlePagarMeWebhook } from "./pagarme-webhook.controller";

const router = Router();

/**
 * Rota para receber webhooks da Pagar.me
 * POST /webhooks/pagarme
 */
router.post("/", handlePagarMeWebhook);

export default router;
