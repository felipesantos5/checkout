import React from "react";
import { Input } from "../ui/Input";
import { useTranslation } from "../../i18n/I18nContext";

export const ContactInfo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full mt-6">
      <h2 className="text-lg font-semibold text-primary mb-4">{t.contact.title}</h2>
      <div className="space-y-4">
        <Input label={t.contact.email} id="email" type="email" placeholder={t.contact.emailPlaceholder} />
        <Input label={t.contact.name} id="name" type="text" placeholder={t.contact.namePlaceholder} />
        <Input label={t.contact.phone} id="phone" type="tel" placeholder={t.contact.phonePlaceholder} />
      </div>
    </div>
  );
};
