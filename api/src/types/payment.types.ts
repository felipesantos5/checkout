// src/types/payment.types.ts
export interface CreatePaymentPayload {
  isOrderBumpChecked: boolean;
  // Futuramente:
  // items: { id: string, quantity: number }[];
  // customerInfo: { ... }
}
