import React, { useState } from "react";
import { Input } from "../ui/Input";
import { useTranslation } from "../../i18n/I18nContext";

export const ContactInfo: React.FC = () => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove tudo que não é dígito
    value = value.replace(/\D/g, "");

    // Limita a 11 dígitos (o máximo para celular)
    value = value.slice(0, 11);

    // Aplica a máscara dinamicamente
    if (value.length > 10) {
      // Celular: (XX) 9XXXX-XXXX
      value = value.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (value.length > 6) {
      // Fixo (ou celular incompleto): (XX) XXXX-XXXX
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (value.length > 2) {
      // (XX) XXXX
      value = value.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
    } else if (value.length > 0) {
      // (XX
      value = value.replace(/^(\d{0,2})/, "($1");
    }

    // Atualiza o estado com o valor formatado
    setPhone(value);
  };

  return (
    <div className="w-full mt-6">
      <h2 className="text-lg font-semibold text-primary mb-4">{t.contact.title}</h2>
      <div className="space-y-4">
        <Input label={t.contact.email} id="email" type="email" placeholder={t.contact.emailPlaceholder} />
        <Input label={t.contact.name} id="name" type="text" placeholder={t.contact.namePlaceholder} />
        <Input
          label={t.contact.phone}
          onChange={handlePhoneChange}
          value={phone}
          id="phone"
          type="tel"
          maxLength={15}
          placeholder={t.contact.phonePlaceholder}
        />
      </div>
    </div>
  );
};
