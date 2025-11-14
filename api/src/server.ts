// src/server.ts
import app from "./app";
import connectDB from "./lib/db"; // 1. Importe a conexão

const PORT = process.env.PORT || 4242;

// 2. Crie uma função 'startServer' assíncrona
async function startServer() {
  try {
    // 3. Aguarde a conexão com o DB antes de iniciar o Express
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao conectar ao banco de dados:", error);
    process.exit(1);
  }
}

// 4. Chame a função
startServer();
