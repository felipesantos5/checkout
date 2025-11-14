import React from "react";
import { Input } from "../ui/Input";

export const ContactInfo: React.FC = () => {
  return (
    <div className="w-full mt-6">
      <h2 className="text-lg font-semibold text-primary mb-4">Contato</h2>
      <div className="space-y-4">
        <Input label="E-mail*" id="email" type="email" placeholder="seuemail@exemplo.com" />
        <Input label="Nome completo*" id="name" type="text" placeholder="Seu nome" />
        <Input label="Celular*" id="phone" type="tel" placeholder="(XX) XXXXX-XXXX" />
      </div>
    </div>
  );
};
