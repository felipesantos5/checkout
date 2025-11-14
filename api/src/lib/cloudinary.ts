// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

// 1. Validação das variáveis de ambiente
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("Variáveis de ambiente do Cloudinary não estão definidas!");
  // Em produção, você pode querer lançar um erro:
  // throw new Error('Variáveis de ambiente do Cloudinary não estão definidas!');
}

// 2. Configuração global do SDK
// (Só execute se as variáveis existirem)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Sempre use HTTPS
  });
}

// 3. Exporte o SDK configurado
export default cloudinary;
