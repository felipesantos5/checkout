import React from "react";
import { Input } from "../ui/Input";

export const ContactInfo: React.FC = () => {
  return (
    <div className="w-full mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contato</h2>
      <div className="space-y-4">
        <Input label="E-mail*" id="email" type="email" placeholder="seuemail@exemplo.com" />
        <Input label="Nome completo*" id="name" type="text" placeholder="Seu nome" />
        <Input label="Celular*" id="phone" type="tel" placeholder="(XX) XXXXX-XXXX" />
        <Input label="CPF*" id="cpf" type="text" placeholder="000.000.000-00" />

        {/* <div className="flex items-center">
          <input id="use-cnpj" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label htmlFor="use-cnpj" className="ml-2 block text-sm text-gray-700">
            Quero comprar com CNPJ
          </label>
        </div> */}
      </div>
    </div>
  );
};
