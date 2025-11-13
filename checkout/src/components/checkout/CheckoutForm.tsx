import React, { useState } from "react";
import { useStripe, useElements, CardNumberElement } from "@stripe/react-stripe-js";

// Importe os componentes visuais do formulário
import { OrderSummary } from "./OrderSummary";
import { ContactInfo } from "./ContactInfo";
import { PaymentMethods } from "./PaymentMethods";
import { OrderBump } from "./OrderBump";
import { Banner } from "./Banner";

/**
 * Este componente contém toda a lógica do formulário,
 * os hooks do Stripe e a função de submissão.
 */
export const CheckoutForm: React.FC = () => {
  // 1. Hooks do Stripe (funcionam pois estão dentro de <Elements>)
  const stripe = useStripe();
  const elements = useElements();

  // 2. Estados de UI para feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Função principal de submissão do formulário.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede o reload da página

    // 3. Valida se o Stripe e Elements foram carregados
    if (!stripe || !elements) {
      console.warn("Stripe.js ainda não carregou.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // 4. Chamar seu backend para criar um PaymentIntent
    //    Isso é uma etapa de segurança crucial.
    // !! SIMULAÇÃO DA CHAMADA DE BACKEND !!
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 4905, currency: "brl" }), // Valor em centavos
    });
    const { clientSecret, error: backendError } = await response.json();

    if (backendError) {
      setErrorMessage(backendError.message);
      setLoading(false);
      return;
    }

    // 5. Pegar o elemento do cartão (precisamos do CardNumberElement)
    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setErrorMessage("Componente do cartão não encontrado.");
      setLoading(false);
      return;
    }

    // 6. Pegar o nome do formulário (exemplo)
    const cardName = (document.getElementById("card-name") as HTMLInputElement).value;

    // 7. Confirmar o pagamento no frontend com o clientSecret
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: cardName,
          // Você pode adicionar email, telefone, etc., daqui
        },
      },
    });

    setLoading(false);

    // 8. Tratar o resultado
    if (error) {
      // Mostrar erro para o usuário (ex: "Seu cartão foi recusado.")
      setErrorMessage(error.message || "Ocorreu um erro desconhecido.");
    } else {
      // Pagamento bem-sucedido!
      if (paymentIntent.status === "succeeded") {
        console.log("Pagamento realizado com sucesso!", paymentIntent);
        // Redirecionar para a página de obrigado
        // window.location.href = '/obrigado';
      }
    }
  };

  // 9. O HTML (JSX) do formulário
  return (
    <form onSubmit={handleSubmit}>
      {/* Componentes visuais do formulário */}
      <Banner />
      <OrderSummary />
      <ContactInfo />
      <PaymentMethods />
      <OrderBump />

      {/* Botão de Finalização */}
      <button
        type="submit"
        disabled={!stripe || loading} // Desabilitar enquanto carrega/processa
        className="w-full mt-8 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Processando..." : "Finalizar compra"}
      </button>

      {/* Exibição de Erros */}
      {errorMessage && <div className="text-red-500 text-sm text-center mt-4">{errorMessage}</div>}
    </form>
  );
};
