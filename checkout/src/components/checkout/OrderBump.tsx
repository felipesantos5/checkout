import React from "react";

export const OrderBump: React.FC = () => {
  return (
    <div className="w-full mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-start">
        <input id="order-bump" type="checkbox" className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1" />
        <div className="ml-3 text-sm">
          <label htmlFor="order-bump" className="font-medium text-gray-800">
            How to Develop Reading, Writing, School Routines, and Math Based on the VB-MAPP
            <span className="ml-2 font-bold text-green-600">R$ 65,07</span>
          </label>

          <div className="flex items-center mt-2">
            <img
              src="https://perfectpay-files.s3.us-east-2.amazonaws.com/app/img/product/checkout/order_bump/176247877720_plan_es.png" // Substitua pela imagem do livro
              alt="School Readiness"
              className="w-14 h-auto rounded"
            />
            <p className="ml-3 text-xs text-gray-600">
              Develop reading, writing, routines, and math with structured strategies based on the VB-MAPP!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
