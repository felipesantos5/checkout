interface SaleItem {
  name: string;
  priceInCents: number;
  isOrderBump: boolean;
  _id?: string;
}

export interface Sale {
  _id: string;
  customerName: string;
  customerEmail: string;
  totalAmountInCents: number;
  status: "succeeded" | "pending" | "refunded";
  createdAt: string;
  isUpsell?: boolean;
  offerId: {
    _id: string;
    name: string;
    isUpsell?: boolean;
  } | null; // Pode ser null se a oferta foi deletada
  items: SaleItem[]; // Adicionamos os itens aqui
}
