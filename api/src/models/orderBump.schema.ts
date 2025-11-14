// src/models/orderBump.schema.ts
import { Schema } from "mongoose";

// Definimos o OrderBump como um Schema separado
// para poder reutilizá-lo.
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
    // Sempre armazene dinheiro como centavos (inteiro)
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
});
