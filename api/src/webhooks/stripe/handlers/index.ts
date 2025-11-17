// src/webhooks/stripe/handlers/index.ts
import { Stripe } from "stripe";
import { handlePaymentIntentSucceeded } from "./payment-intent.handler";

/**
 * Router de eventos do Stripe
 * Direciona cada tipo de evento para seu handler específico
 */
export const handleStripeEvent = async (event: Stripe.Event): Promise<void> => {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case "payment_intent.payment_failed":
      console.log(`⚠️  Pagamento falhou: ${event.data.object.id}`);
      // Aqui você pode implementar lógica adicional se necessário
      break;

    case "charge.refunded":
      console.log(`💸 Reembolso realizado: ${event.data.object.id}`);
      // Aqui você pode atualizar o status da venda para "refunded"
      break;

    default:
      console.log(`ℹ️  Evento não tratado: ${event.type}`);
  }
};
