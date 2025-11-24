// src/pages/CheckoutPage.tsx
import React, { useMemo, lazy, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { OfferData } from "./CheckoutSlugPage";

// Lazy load do CheckoutForm para reduzir bundle inicial
const CheckoutForm = lazy(() => import("../components/checkout/CheckoutForm").then(mod => ({ default: mod.CheckoutForm })));

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  throw new Error("VITE_STRIPE_PUBLISHABLE_KEY não está definida no .env");
}

interface CheckoutPageProps {
  offerData: OfferData;
}

// Loader para Stripe Elements
const StripeLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="loading-skeleton w-16 h-16 mx-auto mb-4 rounded-full" />
      <p className="text-gray-600">Carregando checkout seguro...</p>
    </div>
  </div>
);

const CheckoutPage: React.FC<CheckoutPageProps> = ({ offerData }) => {
  // Lazy load do Stripe apenas quando necessário
  const stripePromise = useMemo(() => {
    const accountId = offerData.ownerId?.stripeAccountId;

    if (!accountId) {
      console.error("Stripe Account ID não encontrado na oferta.");
      return null;
    }

    // loadStripe já faz lazy loading do script internamente
    return loadStripe(stripeKey, {
      stripeAccount: accountId,
    });
  }, [offerData.ownerId?.stripeAccountId]);

  // Se não tiver stripePromise (por falta de ID), não renderiza o Elements para evitar crash
  if (!stripePromise) {
    return <div className="p-4 text-red-500">Erro de configuração: Conta Stripe não vinculada.</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <Suspense fallback={<StripeLoader />}>
        <CheckoutForm offerData={offerData} />
      </Suspense>
    </Elements>
  );
};

export default CheckoutPage;
