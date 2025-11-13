import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Importe o componente de formulário que criamos
import { CheckoutForm } from "../components/checkout/CheckoutForm";

// 1. Carregue o Stripe FORA do render do componente.
// Use sua Chave Publicável (Publishable Key)
const stripePromise = loadStripe("pk_test_SUA_CHAVE_PUBLICAVEL_AQUI");

/**
 * Esta é a página de checkout principal.
 * Ela serve como o "container" que carrega o Stripe
 * e fornece o contexto "Elements" para seus filhos.
 */
const CheckoutPage: React.FC = () => {
  // Esta página não tem mais lógica de handleSubmit ou hooks.
  // Todo o HTML e funções do formulário estão no <CheckoutForm />.

  return (
    // Container principal com fundo cinza
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Container do formulário mobile-first */}
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-xl p-6">
        {/* 2. O 'Elements' provider deve envolver o componente
             que contém o formulário e chama os hooks do Stripe. */}
        <Elements stripe={stripePromise}>
          {/* 3. O CheckoutForm é o FILHO que vai usar 
               useStripe() e useElements() */}
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

export default CheckoutPage;
