import React from "react";

export const PixDisplay: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 flex flex-col items-center text-center">
      <h3 className="text-lg font-semibold text-gray-900">Pague com Pix</h3>
      <p className="text-sm text-gray-600 mt-2">Aponte a câmera do seu celular para o QR Code ou use o "Copia e Cola".</p>

      {/*  */}
      <div className="w-48 h-48 bg-gray-300 rounded-lg my-4 flex items-center justify-center">
        <span className="text-gray-500">Espaço para o QR Code</span>
      </div>

      <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300">Copiar Código Pix</button>

      <p className="text-xs text-gray-500 mt-4">O pagamento é aprovado em poucos segundos.</p>
    </div>
  );
};
