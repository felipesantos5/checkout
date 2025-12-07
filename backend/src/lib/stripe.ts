// src/lib/stripe.ts
import Stripe from "stripe";
import "dotenv/config";

// 1. Valide a chave secreta
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY não está definida no .env. Esta é a chave da SUA plataforma.");
}

// 2. Configure a instância do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover", // Use a versão mais recente da API
  typescript: true,
});

// 3. Exporte a instância configurada
export default stripe;
