interface Buyer {
  Id: string;
  Email: string;
  Name: string;
  PhoneNumber: string;
  Document: string;
}

interface Product {
  Id: string;
  Name: string;
}

interface Seller {
  Id: string;
  Email: string;
}

interface CommissionDetail {
  ReceiverId: string;
  Amount: number;
  ReceiverEmail: string;
}

interface Commission {
  Value: number;
  Source: string;
  // A propriedade 'Details' só aparece no 'COPRODUCER', por isso é marcada como opcional.
  Details?: CommissionDetail[];
}

interface Price {
  Value: number;
}

interface Payment {
  NumberOfInstallments: number;
  PaymentMethod: string;
}

interface Purchase {
  PaymentId: string;
  Recurrency: number;
  PaymentDate: string;
  OriginalPrice: Price;
  Price: Price;
  Payment: Payment;
}

interface Offer {
  Id: string;
  Name: string;
  Url: string;
}

interface Utm {
  UtmSource: string;
  UtmMedium: string;
  UtmCampaign: string;
  UtmTerm: string;
  UtmContent: string;
}

interface DeviceInfo {
  UserAgent: string;
  ip: string;
}

interface EventData {
  Products: Product[];
  Buyer: Buyer;
  Seller: Seller;
  Commissions: Commission[];
  Purchase: Purchase;
  Offer: Offer;
  Utm: Utm;
  DeviceInfo: DeviceInfo;
}

export interface PurchaseEvent {
  Id: string;
  IsTest: boolean;
  Event: "Purchase_Order_Confirmed"; // Tipagem literal para o evento específico
  CreatedAt: string; // Pode ser alterado para 'Date' se for ser desserializado
  Data: EventData;
}
