// src/components/checkout/PixDisplay.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "../../i18n/I18nContext";
import { useTheme } from "../../context/ThemeContext";
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
  // orderId, // Não utilizado atualmente
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
        const response = await axios.get(`${API_URL}/sales/${saleId}`);

        if (response.data.status === "succeeded" || response.data.status === "paid") {
          onSuccess();
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
      }
    };

    // Verifica a cada 3 segundos
    const interval = setInterval(checkPaymentStatus, 3000);

    // Primeira verificação imediata
    checkPaymentStatus();

    return () => clearInterval(interval);
  }, [saleId, onSuccess]);

  return (
    <div className="w-full max-w-md mx-auto p-5 rounded-xl border-t-8 shadow-2xl" style={{ backgroundColor, borderColor: primary }}>
      {/* Título */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-1" style={{ color: textColor }}>
          {t.pix?.title || "Pagamento via PIX"}
        </h2>
        <p className="text-2xl font-black" style={{ color: primary }}>
          {formattedAmount}
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-3 rounded-xl mb-4 flex justify-center shadow-inner mx-auto w-fit border-2 border-gray-100">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 object-contain" />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded">
            <svg className="h-10 w-10 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Instruções Simplificadas */}
      <div className="mb-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wider mb-3 opacity-60" style={{ color: textColor }}>
          {t.pix?.instruction || "Escaneie o QR Code abaixo"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${primary}20`, color: primary }}>1</span>
            <span className="text-[10px] leading-tight" style={{ color: textColor }}>Abra o app banco</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${primary}20`, color: primary }}>2</span>
            <span className="text-[10px] leading-tight" style={{ color: textColor }}>Pague via PIX</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${primary}20`, color: primary }}>3</span>
            <span className="text-[10px] leading-tight" style={{ color: textColor }}>Aguarde o sucesso</span>
          </div>
        </div>
      </div>

      {/* Código Copia e Cola */}
      <div className="mb-4">
        <div className="relative group">
          <input
            type="text"
            value={qrCode}
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="w-full pl-3 pr-20 py-2.5 border-2 rounded-xl text-xs font-mono bg-gray-50 focus:outline-none"
            style={{ borderColor: `${primary}20`, color: textColor }}
          />
          <button
            onClick={handleCopy}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: copied ? "#10b981" : primary,
              color: "#ffffff",
            }}
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Status e Tempo Restante */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 p-2 rounded-xl" style={{ backgroundColor: `${primary}08` }}>
          <svg className="h-4 w-4 animate-spin" style={{ color: primary }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[11px] font-semibold" style={{ color: primary }}>
            {t.pix?.waiting || "Aguardando pagamento..."}
          </span>
          <span className="text-[11px] font-bold ml-auto" style={{ color: primary }}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Informação adicional */}
      <div className="mt-4">
        <p className="text-[9px] text-center opacity-50 uppercase tracking-tighter" style={{ color: textColor }}>
          Redirecionamento automático após confirmação
        </p>
      </div>
    </div>
  );
};
