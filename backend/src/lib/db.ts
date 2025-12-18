// src/lib/db.ts
import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGO_URI dentro do .env");
}

/**
 * Conecta ao banco de dados MongoDB (Padrão para Containers/VPS).
 * Removemos a lógica de cache manual pois o processo Node.js fica sempre rodando.
 */
async function connectDB() {
  // Se já estiver conectado ou conectando, não faz nada
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(MONGO_URI!);
    console.log("✅ MongoDB conectado com sucesso.");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    // Lança o erro para que o server.ts decida se mata o processo
    throw error;
  }
}

// Listeners para monitorar a saúde da conexão em tempo real
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB desconectado! Tentando reconectar...");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconectado.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Erro na conexão com o MongoDB:", err);
});

export default connectDB;