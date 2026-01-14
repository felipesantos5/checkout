// src/components/checkout/PixDisplay.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "../../i18n/I18nContext";
import { useTheme } from "../../context/ThemeContext";
import { Check, Copy, Loader2 } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../config/BackendUrl";

interface PixDisplayProps {
  qrCode: string;
  qrCodeUrl: string;
  orderId: string;
  amount: number;
  currency: string;
  expiresAt: string;
  saleId: string;
  onSuccess: () => void;
}

export const PixDisplay: React.FC<PixDisplayProps> = ({
  qrCode,
  qrCodeUrl,
  orderId,
  amount,
  currency,
  expiresAt,
  saleId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { textColor, backgroundColor, primary } = useTheme();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [checking, setChecking] = useState(false);

  // Formata o valor
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  // Copia o código PIX
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  // Contador de tempo restante
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft(t.pix?.expired || "Expirado");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, t.pix]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setChecking(true);
        const response = await axios.get(`${API_URL}/sales/${saleId}`);

        if (response.data.status === "succeeded" || response.data.status === "paid") {
          onSuccess();
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
      } finally {
        setChecking(false);
      }
    };

    // Verifica a cada 3 segundos
    const interval = setInterval(checkPaymentStatus, 3000);

    // Primeira verificação imediata
    checkPaymentStatus();

    return () => clearInterval(interval);
  }, [saleId, onSuccess]);

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg border" style={{ backgroundColor, borderColor: `${textColor}20` }}>
      {/* Título */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
          {t.pix?.title || "Pagamento via PIX"}
        </h2>
        <p className="text-lg font-semibold" style={{ color: primary }}>
          {formattedAmount}
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg mb-6 flex justify-center">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code PIX" className="w-64 h-64 object-contain" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="mb-6">
        <p className="text-sm text-center mb-4" style={{ color: textColor }}>
          {t.pix?.instruction || "Abra o app do seu banco e escaneie o código abaixo"}
        </p>
        <ol className="text-sm space-y-2" style={{ color: textColor }}>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2" style={{ backgroundColor: `${primary}20`, color: primary }}>
              1
            </span>
            <span>Abra o app do seu banco</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2" style={{ backgroundColor: `${primary}20`, color: primary }}>
              2
            </span>
            <span>Escolha pagar com PIX</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2" style={{ backgroundColor: `${primary}20`, color: primary }}>
              3
            </span>
            <span>Escaneie o QR Code ou copie o código</span>
          </li>
        </ol>
      </div>

      {/* Código Copia e Cola */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
          {t.pix?.copy_button || "Código Copia e Cola"}
        </label>
        <div className="relative">
          <input
            type="text"
            value={qrCode}
            readOnly
            className="w-full px-3 py-2 pr-24 border rounded-lg text-sm font-mono bg-gray-50"
            style={{ borderColor: `${textColor}30`, color: textColor }}
          />
          <button
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded text-sm font-medium transition-all"
            style={{
              backgroundColor: copied ? "#10b981" : primary,
              color: "#ffffff",
            }}
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                Copiado!
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="h-4 w-4" />
                Copiar
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Status e Tempo Restante */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg" style={{ backgroundColor: `${primary}10` }}>
          <div className="relative">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: primary }} />
            {checking && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
              </div>
            )}
          </div>
          <span className="text-sm font-medium" style={{ color: primary }}>
            {t.pix?.waiting || "Aguardando confirmação do pagamento..."}
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm" style={{ color: textColor }}>
            Tempo restante: <span className="font-bold">{timeLeft}</span>
          </p>
        </div>
      </div>

      {/* Informação adicional */}
      <div className="mt-6 p-3 rounded-lg" style={{ backgroundColor: `${textColor}05` }}>
        <p className="text-xs text-center" style={{ color: `${textColor}80` }}>
          Após a confirmação do pagamento, você será redirecionado automaticamente.
        </p>
      </div>
    </div>
  );
};
