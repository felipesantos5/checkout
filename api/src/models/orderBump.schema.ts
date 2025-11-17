// src/models/orderBump.schema.ts
import { Schema } from "mongoose";

export interface IOrderBump {
  productId: string;
  name: string;
  headline?: string;
  description?: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  imageUrl?: string;
}

export const orderBumpSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  headline: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
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
