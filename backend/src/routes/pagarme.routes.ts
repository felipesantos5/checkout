// src/routes/pagarme.routes.ts
import { Router } from "express";
import { createPixPayment, getOrderStatus } from "../controllers/pagarme.controller";

const router = Router();

/**
 * Rota para criar um pagamento PIX via Pagar.me
 * POST /payments/pagarme/pix
 * Público (não requer autenticação)
 */
router.post("/pix", createPixPayment);

/**
 * Rota para consultar o status de um pedido
 * GET /payments/pagarme/order/:orderId
 * Público (não requer autenticação)
 */
router.get("/order/:orderId", getOrderStatus);

export default router;
