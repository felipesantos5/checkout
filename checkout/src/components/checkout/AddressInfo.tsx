import React, { useState } from "react";
import { Input } from "../ui/Input";
import { useTranslation } from "../../i18n/I18nContext";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const AddressInfo: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [zipCode, setZipCode] = useState("");

  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove tudo que não é dígito
    value = value.replace(/\D/g, "");

    // Limita a 8 dígitos (o CEP tem 8 números)
    value = value.slice(0, 8);

    // Aplica a máscara (adiciona o hífen depois do 5º dígito)
    // Ex: "12345" -> "12345"
    // Ex: "123456" -> "12345-6"
    // Ex: "12345678" -> "12345-678"
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{1,3})/, "$1-$2");
    }

    const zipCodeClean = e.target.value.replace(/\D/g, "");

    // Atualiza o estado com o valor formatado
    setZipCode(value);
    // Remove caracteres não numéricos

    // Quando tiver 8 dígitos, busca automaticamente
    if (zipCodeClean.length === 8) {
      setLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCodeClean}/json/`);
        const data: ViaCepResponse = await response.json();

        if (!data.erro) {
          // Preenche os campos automaticamente
          const streetInput = document.getElementById("address-street") as HTMLInputElement;
          const neighborhoodInput = document.getElementById("address-neighborhood") as HTMLInputElement;
          const cityInput = document.getElementById("address-city") as HTMLInputElement;
          const stateInput = document.getElementById("address-state") as HTMLInputElement;

          if (streetInput) streetInput.value = data.logradouro;
          if (neighborhoodInput) neighborhoodInput.value = data.bairro;
          if (cityInput) cityInput.value = data.localidade;
          if (stateInput) stateInput.value = data.uf;

          // Foca no campo número para o usuário continuar
          const numberInput = document.getElementById("address-number") as HTMLInputElement;
          if (numberInput) numberInput.focus();
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full mt-6">
      <h2 className="text-lg font-semibold text-textcolor mb-4">{t.address.title}</h2>
      <div className="space-y-4">
        {/* CEP - Primeiro campo */}
        <div className="relative">
          <Input
            label={t.address.zipCode}
            value={zipCode}
            maxLength={9}
            id="address-zipCode"
            type="text"
            placeholder={t.address.zipCode}
            onChange={handleZipCodeChange}
          />
          {loading && (
            <div className="absolute right-3 top-9">
              <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input label={t.address.street} id="address-street" type="text" placeholder={t.address.streetPlaceholder} />
          </div>
          <div>
            <Input label={t.address.number} id="address-number" type="text" placeholder={t.address.numberPlaceholder} />
          </div>
        </div>

        <Input label={t.address.complement} id="address-complement" type="text" placeholder={t.address.complementPlaceholder} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t.address.neighborhood} id="address-neighborhood" type="text" placeholder={t.address.neighborhoodPlaceholder} />
          <Input label={t.address.city} id="address-city" type="text" placeholder={t.address.cityPlaceholder} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t.address.state} id="address-state" type="text" placeholder={t.address.statePlaceholder} />
          <Input label={t.address.country} id="address-country" type="text" placeholder={t.address.countryPlaceholder} defaultValue="Brasil" />
        </div>
      </div>
    </div>
  );
};
