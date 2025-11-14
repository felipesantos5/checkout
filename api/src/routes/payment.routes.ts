// src/routes/payment.routes.ts
import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";

const router = Router();

// Endpoint ÚNICO para criar a intenção de pagamento (Cartão ou PIX)
// POST /api/payments/create-intent
router.post(
  "/create-intent",
  // (Aqui não precisa de 'protectRoute' pois o pagamento é público)
  paymentController.handleCreatePaymentIntent
);

export default router;
