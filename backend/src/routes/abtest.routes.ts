// src/routes/abtest.routes.ts
import { Router } from "express";
import * as abTestController from "../controllers/abtest.controller";
import { protectRoute } from "../middleware/auth.middleware";
import { createResourceLimiter } from "../middleware/rate-limit.middleware";

const router = Router();

// --- Rotas Protegidas (Dashboard) ---

// POST /api/abtests (Cria um novo teste A/B)
router.post("/", protectRoute, createResourceLimiter, abTestController.handleCreateABTest);

// GET /api/abtests (Lista todos os testes A/B do usuário logado)
router.get("/", protectRoute, abTestController.handleListMyABTests);

// GET /api/abtests/:id (Busca UM teste A/B por ID para edição)
router.get("/:id", protectRoute, abTestController.handleGetABTestById);

// PUT /api/abtests/:id (Atualiza um teste A/B)
router.put("/:id", protectRoute, abTestController.handleUpdateABTest);

// DELETE /api/abtests/:id (Deleta um teste A/B)
router.delete("/:id", protectRoute, abTestController.handleDeleteABTest);

// POST /api/abtests/:id/duplicate (Duplica um teste A/B)
router.post("/:id/duplicate", protectRoute, abTestController.handleDuplicateABTest);

// --- Rotas Públicas (Checkout) ---

// GET /api/abtests/slug/:slug (Busca teste por slug e retorna oferta randomizada)
router.get("/slug/:slug", abTestController.handleGetABTestBySlug);

export default router;
