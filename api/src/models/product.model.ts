// src/models/product.model.ts
import mongoose, { Schema, Document, model, Model } from "mongoose";
import { orderBumpSchema } from "./orderBump.schema";

// Interface para o documento (para tipagem)
export interface IProduct extends Document {
  name: string;
  description: string;
  imageUrl: string;
  priceInCents: number; // Preço principal
  orderBumps: (typeof orderBumpSchema)[]; // Array de order bumps
  // Futuramente:
  // ownerId: Schema.Types.ObjectId; // Para saber qual cliente/usuário criou
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
    // Incorpora o schema do order bump como um array
    orderBumps: [orderBumpSchema],

    // ownerId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User', // Referência a um futuro modelo 'User'
    //   required: true
    // }
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt
  }
);

// Cria o modelo se ele não existir
const Product: Model<IProduct> = mongoose.models.Product || model<IProduct>("Product", productSchema);

export default Product;
