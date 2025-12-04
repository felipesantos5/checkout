// src/models/product.model.ts
import mongoose, { Schema, Document, model, Model } from "mongoose";
import { orderBumpSchema } from "./orderBump.schema";

// Interface para o documento (para tipagem)
export interface IProduct extends Document {
  name: string;
  description: string;
  imageUrl: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  orderBumps: (typeof orderBumpSchema)[];
}

// Schema do Mongoose
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    priceInCents: {
      type: Number,
      required: true,
    },
    compareAtPriceInCents: { type: Number, required: false },
    orderBumps: [orderBumpSchema],
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> = mongoose.models.Product || model<IProduct>("Product", productSchema);

export default Product;
