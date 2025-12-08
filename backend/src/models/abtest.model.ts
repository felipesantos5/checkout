// src/models/abtest.model.ts
import mongoose, { Schema, Document, model, Model } from "mongoose";

// Sub-schema para cada oferta no teste
const abTestOfferSchema = new Schema({
  offerId: {
    type: Schema.Types.ObjectId,
    ref: "Offer",
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

export interface IABTestOffer {
  offerId: Schema.Types.ObjectId;
  percentage: number;
}

export interface IABTest extends Document {
  ownerId: Schema.Types.ObjectId;
  name: string;
  slug: string;
  isActive: boolean;
  offers: IABTestOffer[];
  createdAt?: Date;
  updatedAt?: Date;
}

const abTestSchema = new Schema<IABTest>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    offers: {
      type: [abTestOfferSchema],
      validate: {
        validator: function (offers: IABTestOffer[]) {
          // Mínimo de 2 ofertas
          if (offers.length < 2) return false;
          // Soma das porcentagens deve ser 100
          const total = offers.reduce((sum, o) => sum + o.percentage, 0);
          return Math.abs(total - 100) < 0.01; // Tolerância para floating point
        },
        message: "O teste deve ter pelo menos 2 ofertas e as porcentagens devem somar 100%",
      },
    },
  },
  { timestamps: true }
);

// Índices
abTestSchema.index({ slug: 1 });
abTestSchema.index({ ownerId: 1, createdAt: -1 });

const ABTest: Model<IABTest> = mongoose.models.ABTest || model<IABTest>("ABTest", abTestSchema);

export default ABTest;
