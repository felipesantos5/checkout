import { Router } from "express";
import express from "express";
import * as stripeWebhookController from "./stripe-webhook.controller";

const router = Router();

/**
 * Rota de webhook do Stripe
 * POST /webhooks/stripe
 *
 * IMPORTANTE: Esta rota DEVE usar express.raw() para receber o body como Buffer
 * Isso é necessário para verificar a assinatura do webhook
 */
router.post("/", express.raw({ type: "application/json" }), stripeWebhookController.handleStripeWebhook);

export default router;
