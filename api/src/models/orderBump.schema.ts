// src/models/orderBump.schema.ts
import { Schema } from "mongoose";

export interface IOrderBump {
  productId: string;
  name: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  imageUrl?: string;
  description: string;
}

export const orderBumpSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priceInCents: {
    type: Number,
    required: true,
  },
  compareAtPriceInCents: { type: Number, required: false },
  imageUrl: {
    type: String,
    required: false,
  },
});
