// src/routes/product.routes.ts
import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router();

// Todas as rotas de '/api/products' passam pelo middleware de proteção
router.use(protectRoute);

// POST /api/products (Cria produto)
router.post("/", productController.handleCreateProduct);

// GET /api/products (Lista produtos do usuário)
router.get("/", productController.handleListMyProducts);

// GET /api/products/:id (Busca produto específico)
router.get("/:id", productController.handleGetProductById);

// TODO: Adicionar rotas de PUT (update) e DELETE

export default router;
