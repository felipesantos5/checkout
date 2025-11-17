// src/components/checkout/CheckoutForm.tsx
import React, { useState, useEffect } from "react";
import { useStripe, useElements, CardNumberElement } from "@stripe/react-stripe-js";
import type { OfferData } from "../../pages/CheckoutSlugPage"; // Importe a tipagem

// Importe os componentes visuais do formulário
import { OrderSummary } from "./OrderSummary";
import { ContactInfo } from "./ContactInfo";
import { PaymentMethods } from "./PaymentMethods";
import { OrderBump } from "./OrderBump";
import { Banner } from "./Banner";
import { API_URL } from "../../config/BackendUrl";
import { useTheme } from "../../context/ThemeContext";

interface CheckoutFormProps {
  offerData: OfferData;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ offerData }) => {
  // 1. Hooks do Stripe
  const stripe = useStripe();
  const elements = useElements();
  const { button, buttonForeground } = useTheme();

  // 2. Estados de UI
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  // 3. (Refatorado) Estados de Pagamento e Total
  const [method, setMethod] = useState<"creditCard" | "pix">("creditCard");
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]); // Lista de IDs
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(offerData.mainProduct.priceInCents);

  // 4. (Refatorado) Efeito para recalcular o total
  useEffect(() => {
    // 2. O TOTAL AGORA DEPENDE DA QUANTIDADE
    let newTotal = offerData.mainProduct.priceInCents * quantity;

    selectedBumps.forEach((bumpId) => {
      const bump = offerData.orderBumps.find((b) => b._id === bumpId);
      if (bump) {
        newTotal += bump.priceInCents; // Bumps não são multiplicados pela quantidade
      }
    });

    setTotalAmount(newTotal);
  }, [selectedBumps, quantity, offerData]);

  // 5. (Refatorado) Função para (des)marcar um bump
  const handleToggleBump = (bumpId: string) => {
    setSelectedBumps(
      (prev) =>
        prev.includes(bumpId)
          ? prev.filter((id) => id !== bumpId) // Remove
          : [...prev, bumpId] // Adiciona
    );
  };

  /**
   * (Refatorado) Função principal de submissão do formulário.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    // 6. (Refatorado) Coletar dados do formulário
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const fullName = (document.getElementById("name") as HTMLInputElement).value;
    const phone = (document.getElementById("phone") as HTMLInputElement).value;
    // const country = (document.getElementById("country") as HTMLSelectElement).value;

    // 7. (Refatorado) Montar o payload para o backend
    const payload = {
      offerSlug: offerData.slug,
      selectedOrderBumps: selectedBumps,
      contactInfo: {
        email,
        name: fullName,
        phone,
        // country,
      },
    };

    try {
      if (method === "creditCard") {
        // 8. (Refatorado) Chamar o NOVO endpoint
        const res = await fetch(`${API_URL}/payments/create-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const { clientSecret, error: backendError } = await res.json();
        if (backendError) throw new Error(backendError.message);

        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) throw new Error("Componente do cartão não encontrado.");

        const cardName = (document.getElementById("card-name") as HTMLInputElement).value;

        // 9. (Refatorado) Enviar os dados de contato corretos
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardName,
              email: email,
              phone: phone,
              // address: { country: country },
            },
          },
          receipt_email: email,
        });

        if (error) throw error;
        if (paymentIntent.status === "succeeded") setPaymentSucceeded(true);
      } else if (method === "pix") {
        // TODO: A lógica do PIX também usará o endpoint 'create-intent'
        setErrorMessage("Pagamento com PIX ainda não implementado.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ocorreu um erro desconhecido.");
    }

    setLoading(false);
  };

  // 10. Tela de Sucesso
  if (paymentSucceeded) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-green-600">Pagamento Aprovado!</h2>
        <p className="mt-2 text-gray-700">Obrigado pela sua compra. Os detalhes foram enviados para o seu e-mail.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Banner imageUrl={offerData.bannerImageUrl} />

      <OrderSummary
        productName={offerData.mainProduct.name}
        productImageUrl={offerData.mainProduct.imageUrl}
        totalAmountInCents={totalAmount}
        basePriceInCents={offerData.mainProduct.priceInCents}
        currency={offerData.currency}
        quantity={quantity}
        setQuantity={setQuantity}
        originalPriceInCents={offerData.mainProduct.originalPriceInCents}
        discountPercentage={offerData.mainProduct.discountPercentage}
      />

      <ContactInfo />

      <PaymentMethods method={method} setMethod={setMethod} />

      <OrderBump bumps={offerData.orderBumps} selectedBumps={selectedBumps} onToggleBump={handleToggleBump} currency={offerData.currency} />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-8 bg-button text-button-foreground font-bold py-3 px-4 rounded-lg text-lg transition-colors disabled:opacity-50
                   hover:opacity-90 cursor-pointer"
        style={{
          backgroundColor: loading ? "#ccc" : button,
          color: buttonForeground,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Processando..." : method === "pix" ? "Gerar PIX" : "Finalizar compra"}
      </button>

      {errorMessage && <div className="text-red-500 text-sm text-center mt-4">{errorMessage}</div>}
    </form>
  );
};
