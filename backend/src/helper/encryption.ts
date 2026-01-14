// src/helper/encryption.ts
import crypto from "crypto";

// Algoritmo de encriptação
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // Para AES, o IV é sempre 16 bytes

/**
 * Obtém a chave de encriptação do ambiente
 * @throws Error se a chave não estiver definida
 */
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error("ENCRYPTION_KEY não está definida no .env");
  }

  // A chave deve ter 32 bytes (256 bits) para AES-256
  // Se a chave fornecida for menor, fazemos hash SHA-256 para garantir o tamanho correto
  return crypto.createHash("sha256").update(key).digest();
};

/**
 * Encripta um texto usando AES-256-CBC
 * @param text Texto a ser encriptado
 * @returns String encriptada no formato: iv:encryptedData (ambos em hex)
 */
export const encrypt = (text: string): string => {
  if (!text) {
    return "";
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Retorna IV + dados encriptados separados por ':'
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error: any) {
    console.error("[Encryption] Erro ao encriptar:", error.message);
    throw new Error("Falha ao encriptar dados sensíveis");
  }
};

/**
 * Desencripta um texto que foi encriptado com a função encrypt
 * @param encryptedText Texto encriptado no formato: iv:encryptedData
 * @returns Texto original desencriptado
 */
export const decrypt = (encryptedText: string): string => {
  if (!encryptedText) {
    return "";
  }

  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(":");
    
    if (parts.length !== 2) {
      throw new Error("Formato de dados encriptados inválido");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error: any) {
    console.error("[Encryption] Erro ao desencriptar:", error.message);
    throw new Error("Falha ao desencriptar dados sensíveis");
  }
};

/**
 * Verifica se um texto está encriptado (formato válido)
 * @param text Texto a verificar
 * @returns true se o texto parece estar encriptado
 */
export const isEncrypted = (text: string): boolean => {
  if (!text) {
    return false;
  }
  
  const parts = text.split(":");
  return parts.length === 2 && parts[0].length === IV_LENGTH * 2; // IV em hex tem 32 caracteres
};
