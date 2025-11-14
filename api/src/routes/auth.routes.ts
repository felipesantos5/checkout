// src/routes/auth.routes.ts
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router();

// (PÚBLICO) Registra um novo "cliente" (usuário do dashboard)
// POST /api/auth/register
router.post("/register", authController.handleRegister);

// (PÚBLICO) Login do cliente
// POST /api/auth/login
router.post("/login", authController.handleLogin);

// (PROTEGIDO) Busca os dados do usuário logado
// GET /api/auth/me
router.get("/me", protectRoute, authController.handleGetMe);

export default router;
