// src/models/abtestview.model.ts
import mongoose, { Schema, Document, model, Model } from "mongoose";

export interface IABTestView extends Document {
  abTestId: Schema.Types.ObjectId;
  offerId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  type: "view" | "initiate_checkout"; // Tipo de evento
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
}

const abTestViewSchema = new Schema<IABTestView>(
  {
    abTestId: {
      type: Schema.Types.ObjectId,
      ref: "ABTest",
      required: true,
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["view", "initiate_checkout"],
      default: "view",
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Índices para queries de métricas
abTestViewSchema.index({ abTestId: 1, createdAt: -1 });
abTestViewSchema.index({ offerId: 1, createdAt: -1 });
abTestViewSchema.index({ ownerId: 1, createdAt: -1 });
abTestViewSchema.index({ abTestId: 1, offerId: 1, createdAt: -1 });
abTestViewSchema.index({ abTestId: 1, type: 1, createdAt: -1 });

const ABTestView: Model<IABTestView> = mongoose.models.ABTestView || model<IABTestView>("ABTestView", abTestViewSchema);

export default ABTestView;
