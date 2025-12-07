// src/server.ts
import app from "./app";
import connectDB from "./lib/db";
import { initializeCurrencyService } from "./services/currency-conversion.service";

process.on("uncaughtException", (error) => {
  console.error("CRITICAL ERROR: Uncaught Exception:", error);
  // Opcional: manter o processo vivo ou deixar o orquestrador reiniciar (recomendado deixar reiniciar)
});

// ADICIONE ISTO: Captura promises rejeitadas sem catch
process.on("unhandledRejection", (reason, promise) => {
  console.error("CRITICAL ERROR: Unhandled Rejection at:", promise, "reason:", reason);
});

const PORT = process.env.PORT || 4242;

// Crie uma função 'startServer' assíncrona
async function startServer() {
  try {
    // Aguarde a conexão com o DB antes de iniciar o Express
    await connectDB();

    // Inicializa serviço de conversão de moeda (busca taxas de câmbio)
    await initializeCurrencyService();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao iniciar servidor:", error);
    process.exit(1);
  }
}

// Chame a função
startServer();
