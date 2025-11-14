// src/middleware/upload.middleware.ts
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Define quais tipos de arquivo (MIME types) são permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp") {
    cb(null, true); // Aceita o arquivo
  } else {
    cb(new Error("Formato de imagem inválido. Use apenas JPEG, PNG ou WebP."));
  }
};

// Configuração do Multer
// Usamos 'memoryStorage' para manter o arquivo na memória (buffer)
// antes de enviá-lo para um serviço de nuvem (S3, Cloudinary, etc.)
// Isso evita salvar arquivos temporários no disco do servidor.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limite de 5MB por imagem
  },
});

export default upload;
