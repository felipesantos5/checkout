import React from "react";
import { QRCodeSVG } from "qrcode.react"; // Importe a biblioteca

// 1. Defina a interface das props
interface PixDisplayProps {
  qrCodeData: string | null;
  pixCopiaECola: string | null;
}

// 2. Receba as props
export const PixDisplay: React.FC<PixDisplayProps> = ({ qrCodeData, pixCopiaECola }) => {
  if (!qrCodeData) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 flex flex-col items-center text-center">
        <h3 className="text-lg font-semibold text-gray-900">Pague com Pix</h3>
        <p className="text-sm text-gray-600 mt-2">O QR Code e o código "Copia e Cola" aparecerão aqui após clicar em "Gerar PIX".</p>
      </div>
    );
  }

  // Função para copiar
  const handleCopy = () => {
    if (pixCopiaECola) {
      // O pixCopiaECola é uma URL para a imagem,
      // O backend precisa mandar o código "string"
      // Vamos assumir que qrCodeData é o "copia e cola" por enquanto
      // TODO: Ajustar o backend para enviar a string do "Copia e Cola"
      navigator.clipboard.writeText(qrCodeData);
      alert("Código PIX copiado!");
    }
  };

  // Estado quando o PIX foi gerado
  return (
    <div className="p-4 border rounded-lg bg-gray-50 flex flex-col items-center text-center">
      <h3 className="text-lg font-semibold text-gray-900">Pague com Pix</h3>
      <p className="text-sm text-gray-600 mt-2">Aponte a câmera do seu celular para o QR Code ou use o "Copia e Cola".</p>

      {/* Renderiza o QR Code real */}
      <div className="w-48 h-48 bg-white rounded-lg my-4 p-2">
        <QRCodeSVG value={qrCodeData} size={176} />
      </div>

      <button onClick={handleCopy} className="w-full px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300">
        Copiar Código Pix
      </button>

      <p className="text-xs text-gray-500 mt-4">O pagamento é aprovado em poucos segundos.</p>
    </div>
  );
};
