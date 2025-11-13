import React, { useState } from "react";
import { CreditCardForm } from "./CreditCardForm";
import { PixDisplay } from "./PixDisplay";

// Ícones (você pode usar react-icons ou SVGs)
const VisaIcon = () => <span className="text-blue-800 font-bold">VISA</span>;
const AmexIcon = () => <span className="text-blue-600 font-bold">AMEX</span>;

type PaymentMethod = "creditCard" | "pix";

export const PaymentMethods: React.FC = () => {
  const [method, setMethod] = useState<PaymentMethod>("creditCard");

  const PaymentOption: React.FC<{
    value: PaymentMethod;
    title: string;
    children: React.ReactNode;
  }> = ({ value, title, children }) => (
    <div
      onClick={() => setMethod(value)}
      className={`border rounded-lg p-4 cursor-pointer ${method === value ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-300"}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            checked={method === value}
            onChange={() => setMethod(value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-3 block text-sm font-medium text-gray-800">{title}</label>
        </div>
        <div className="flex space-x-1 items-center">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Pagamento</h2>
      <div className="space-y-4">
        <PaymentOption value="creditCard" title="Cartão de Crédito">
          <div className="flex gap-2 ">
            <div className="inner_payment_img brand-visa">
              <img loading="lazy" src="https://assets.mycartpanda.com/cartx-ecomm-ui-assets/images/payment/visa.svg" />
            </div>
            <div className="inner_payment_img brand-mastercard">
              <img loading="lazy" src="https://assets.mycartpanda.com/cartx-ecomm-ui-assets/images/payment/mastercard.svg" />
            </div>
            <div className="inner_payment_img brand-amex">
              <img loading="lazy" src="https://assets.mycartpanda.com/cartx-ecomm-ui-assets/images/payment/amex.svg" />
            </div>
            <div className="inner_payment_img hideonmobile brand-dinersclub">
              <img loading="lazy" src="https://assets.mycartpanda.com/cartx-ecomm-ui-assets/images/payment/dinersclub.svg" />
            </div>

            {/* <div className="">E mais…</div> */}
          </div>
          {/* Adicione outros ícones aqui */}
        </PaymentOption>

        {/* Você adicionaria a opção de Pix aqui */}
        <PaymentOption value="pix" title="Pix">
          {/*  */}
          <span className="font-bold">Pix</span>
        </PaymentOption>
      </div>

      <div className="mt-6">
        {method === "creditCard" && <CreditCardForm />}
        {method === "pix" && <PixDisplay />}
      </div>
    </div>
  );
};
