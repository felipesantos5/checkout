export const OrderSummary: React.FC = () => {
  // Dados do carrinho (viriam de um contexto ou props)
  const product = {
    name: "Practical Autism Transformation Toolkit",
    price: 49.05,
    installments: "6x de R$ 9,33",
  };

  return (
    <div className="w-full bg-gray-50 p-4 rounded-lg shadow">
      <div className="flex items-center">
        <img
          src="https://perfectpay-files.s3.us-east-2.amazonaws.com/app/img/product/checkout/order_bump/176247877720_plan_es.png" // Substitua pelo caminho da imagem
          alt={product.name}
          className="w-20 h-20 rounded-md object-cover"
        />
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-800">{product.name}</h3>
          <p className="text-lg font-bold text-gray-900">R$ {product.price.toFixed(2).replace(".", ",")}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>R$ {product.price.toFixed(2).replace(".", ",")}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Entrega</span>
          <span>---</span>
        </div>
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-300 text-base font-bold text-gray-900">
          <span>Total</span>
          <span>R$ {product.price.toFixed(2).replace(".", ",")}</span>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">ou {product.installments}</p>
      </div>
    </div>
  );
};
