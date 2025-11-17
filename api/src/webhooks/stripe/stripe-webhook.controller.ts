// src/webhooks/stripe/stripe-webhook.controller.ts
import { Request, Response } from "express";
import stripe from "../../lib/stripe";
import { Stripe } from "stripe";
import { handleStripeEvent } from "./handlers";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Controller principal para todos os webhooks do Stripe
 * Este é o único endpoint que o Stripe vai chamar
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  // 1. Valida a configuração
  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET não está configurado no .env");
    return res.status(500).send("Webhook não configurado.");
  }

  const sig = req.headers["stripe-signature"] as string;
  const rawBody = req.body;

  let event: Stripe.Event;

  // 2. Verifica a assinatura do webhook (SEGURANÇA)
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Erro na verificação do Webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 3. Log do evento recebido
  console.log(`\n🎯 Webhook recebido: ${event.type} | ID: ${event.id}`);

  // 4. Processa o evento usando os handlers
  try {
    await handleStripeEvent(event);
  } catch (error) {
    console.error(`❌ Erro fatal ao processar webhook:`, error);
    // Retorna 500 para o Stripe tentar novamente
    return res.status(500).json({ error: "Falha no processamento do webhook." });
  }

  // 5. Responde 200 OK para o Stripe
  res.status(200).json({ received: true });
};
