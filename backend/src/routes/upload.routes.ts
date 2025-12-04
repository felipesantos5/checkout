// src/routes/upload.routes.ts
import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";
import { protectRoute } from "../middleware/auth.middleware";
import { uploadLimiter } from "../middleware/rate-limit.middleware";
import upload from "../middleware/upload.middleware";

const router = Router();

/**
 * Rota para upload de imagem
 * POST /api/upload
 *
 * O 'protectRoute' garante que só usuários logados possam fazer upload.
 * O 'upload.single('image')' processa um único arquivo vindo do campo 'image'.
 */
router.post(
  "/",
  protectRoute,
  uploadLimiter,
  upload.single("image"), // 'image' é o 'name' do campo no formulário
  uploadController.handleUploadImage
);

export default router;
