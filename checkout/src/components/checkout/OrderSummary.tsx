// src/components/checkout/OrderSummary.tsx
import React, { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ShoppingCart } from "lucide-react";

// Props que ele receberá do CheckoutForm
interface OrderSummaryProps {
  productName: string;
  productImageUrl?: string;
  currency: string;
  totalAmountInCents: number; // O total GERAL (com bumps)
  basePriceInCents: number; // O preço do produto principal
  quantity: number; // A quantidade atual
  setQuantity: (qty: number) => void; // Função para mudar a quantidade
}

// Helper de formatação
const formatCurrency = (amountInCents: number, currency: string) => {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  productName,
  productImageUrl,
  currency,
  totalAmountInCents,
  basePriceInCents,
  quantity,
  setQuantity,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calcula o subtotal e o total dos bumps
  const subtotal = basePriceInCents * quantity;
  const bumpsTotal = totalAmountInCents - subtotal;

  // Lógica de parcelamento (simulada)
  const installmentValue = totalAmountInCents / 6 / 100;
  const totalText = `6x de ${installmentValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}*`;
  const totalSmallText = `OU ${formatCurrency(totalAmountInCents, currency)} À VISTA`;

  // Funções do input de quantidade
  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className="w-full bg-gray-50 rounded-lg shadow">
      {/* --- Trigger (Header) --- */}
      <Collapsible.Trigger className="w-full p-4 flex justify-between items-center cursor-pointer">
        <div className="flex items-center">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <span className="text-md font-semibold text-primary ml-2">{isOpen ? "Ocultar resumo do pedido" : "Resumo do pedido"}</span>
          <ChevronDown className={`h-5 w-5 text-primary ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>

        {/* Total (mostra apenas quando fechado) */}
        {!isOpen && (
          <div className="text-right">
            <span className="text-md font-bold text-gray-900">{totalText}</span>
            <p className="text-xs text-gray-500">{totalSmallText}</p>
          </div>
        )}
      </Collapsible.Trigger>

      {/* --- Content (Body) --- */}
      <Collapsible.Content className="p-4 border-t border-gray-200">
        {/* Item Principal */}
        <div className="flex items-center">
          {productImageUrl && <img src={productImageUrl} alt={productName} className="w-20 h-20 rounded-md object-cover border" />}
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-medium text-gray-800">{productName}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-bold text-gray-900">{formatCurrency(basePriceInCents, currency)}</span>

              {/* Input de Quantidade */}
              <div className="flex items-center border rounded">
                <button type="button" className="px-2 py-1 text-gray-600 disabled:opacity-50" onClick={handleDecrease} disabled={quantity <= 1}>
                  —
                </button>
                <span className="px-3 py-1 border-l border-r">{quantity}</span>
                <button type="button" className="px-2 py-1 text-gray-600" onClick={handleIncrease}>
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes do Preço */}
        <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>

          {/* Mostra os bumps apenas se houver */}
          {bumpsTotal > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Order Bumps</span>
              <span>+ {formatCurrency(bumpsTotal, currency)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Entrega</span>
            <span>---</span>
          </div>

          <div className="flex justify-between mt-2 pt-2 border-t border-gray-300 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(totalAmountInCents, currency)}</span>
          </div>
          <p className="text-right text-xs text-gray-500 mt-1">{totalText}</p>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
