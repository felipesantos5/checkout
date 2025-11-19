// src/routes/payment.routes.ts
import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";

const router = Router();

router.post("/create-intent", paymentController.handleCreatePaymentIntent);
router.post("/upsell-token", paymentController.generateUpsellToken);
router.post("/one-click-upsell", paymentController.handleOneClickUpsell);
router.post("/upsell-refuse", paymentController.handleRefuseUpsell);

export default router;
