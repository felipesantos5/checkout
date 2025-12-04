// src/services/stripe.service.ts
import Stripe from "stripe";

// Validamos a chave secreta na inicialização
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY não está definida no .env");
}

// Instanciamos o cliente Stripe UMA VEZ
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

export const getAccountBalance = async (stripeAccountId: string) => {
  if (!stripeAccountId) {
    throw new Error("Usuário não possui uma conta Stripe conectada.");
  }

  // Isso faz a chamada "As That Account"
  const balance = await stripe.balance.retrieve({
    stripeAccount: stripeAccountId,
  });

  return balance;
};
