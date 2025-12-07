// src/lib/db.ts
import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGO_URI dentro do .env");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Conecta ao banco de dados MongoDB.
 * Utiliza um cache de conexão para otimizar em ambientes "serverless",
 * mas funciona perfeitamente com Express.
 */
async function connectDB() {
  if (cached.conn) {
    console.log("Utilizando conexão de DB cacheada.");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
      console.log("Nova conexão com o DB estabelecida.");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// Adiciona 'mongoose' ao tipo Global para evitar erros de TS
declare global {
  var mongoose: any;
}
