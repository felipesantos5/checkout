// src/pages/CheckoutPage.tsx
import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "../components/checkout/CheckoutForm";
import type { OfferData } from "./CheckoutSlugPage";

// 1. Remova os imports do 'polished'
// import { parseToRgb, getContrast } from "polished";

// Leitura da Chave do .env
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  throw new Error("VITE_STRIPE_PUBLISHABLE_KEY não está definida no .env");
}
// 2. Mova o loadStripe para DENTRO do componente
// const stripePromise = loadStripe(stripeKey);

interface CheckoutPageProps {
  offerData: OfferData;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ offerData }) => {
  // 3. Inicialize o stripePromise AQUI DENTRO, usando o ID da conta
  // (Isso corrige o erro "resource_missing" que você teve antes)
  const stripePromise = loadStripe(stripeKey, {
    stripeAccount: offerData.ownerId.stripeAccountId,
  });

  // 4. Remova TODA a lógica de conversão de cores
  // const primaryRgb = ...
  // const buttonRgb = ...
  // const primaryColorString = ...
  // const buttonColorString = ...
  // const buttonTextColor = ...
  // const themeStyles = { ... }

  return (
    // 5. Remova o `style={themeStyles}` e o <style> tag
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-xl p-6">
        <Elements stripe={stripePromise}>
          <CheckoutForm offerData={offerData} />
        </Elements>
      </div>
    </div>
  );
};

export default CheckoutPage;
