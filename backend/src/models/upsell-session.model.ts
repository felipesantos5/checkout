// api/src/models/upsell-session.model.ts
import mongoose, { Schema, Document, model } from "mongoose";

export interface IUpsellSession extends Document {
  token: string;
  accountId: string;
  customerId: string;
  paymentMethodId: string;
  offerId: mongoose.Schema.Types.ObjectId;
  paymentMethod: "stripe" | "paypal" | "pagarme"; // Método de pagamento usado na compra original
  ip?: string; // IP do cliente para manter localização correta no upsell
  customerName?: string; // Nome do cliente
  customerEmail?: string; // Email do cliente
  customerPhone?: string; // Telefone do cliente
  createdAt: Date;
}

const upsellSessionSchema = new Schema<IUpsellSession>(
  {
    token: { type: String, required: true, unique: true, index: true },
    accountId: { type: String, required: true },
    customerId: { type: String, required: true },
    paymentMethodId: { type: String, required: true },
    offerId: { type: Schema.Types.ObjectId, ref: "Offer", required: true },
    paymentMethod: { type: String, enum: ["stripe", "paypal", "pagarme"], default: "stripe" },
    ip: { type: String },
    customerName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
  },
  { timestamps: true }
);

export default model<IUpsellSession>("UpsellSession", upsellSessionSchema);
