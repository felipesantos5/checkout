// src/routes/sale.routes.ts
import { Router } from "express";
import * as saleController from "../controllers/sale.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router();

// GET /api/sales
// Rota protegida para o vendedor ver suas vendas
router.get("/", protectRoute, saleController.handleListMySales);

// --- ROTA NOVA ADICIONADA AQUI ---
// Rota para vendas de UMA oferta
// GET /api/sales/offer/:offerId
router.get("/offer/:offerId", protectRoute, saleController.handleListSalesByOffer);

// Rota pública para polling de status de pagamento
// GET /api/sales/:id
router.get("/:id", saleController.handleGetSaleById);

export default router;
