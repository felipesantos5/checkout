export const getClientIP = async (): Promise<string | null> => {
  try {
    // Você pode usar qualquer serviço gratuito de IP
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) return null;
    const data = await response.json();
    return data.ip; // Retorna algo como "189.50.12.34"
  } catch (error) {
    console.error("Erro ao buscar IP:", error);
    return null;
  }
};
