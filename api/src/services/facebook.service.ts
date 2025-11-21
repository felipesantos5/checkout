import crypto from "crypto";
import axios from "axios";

interface FacebookUserData {
  fbc?: string;
  fbp?: string;
  client_ip_address: string;
  client_user_agent: string;
  em?: string; // Email (hashed)
  ph?: string; // Phone (hashed)
  fn?: string; // First Name (hashed)
  ln?: string; // Last Name (hashed)
  ct?: string; // City (hashed)
  st?: string; // State (hashed)
  country?: string; // Country (hashed)
}

interface FacebookEventPayload {
  event_name: "InitiateCheckout" | "Purchase";
  event_time: number;
  event_source_url?: string;
  action_source: "website";
  user_data: FacebookUserData;
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_type?: string;
    order_id?: string;
  };
}

/**
 * Normaliza e faz o Hash SHA256 de dados sensíveis conforme requisitos do Facebook
 */
const hashData = (data: string): string => {
  if (!data) return "";
  const normalized = data.trim().toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
};

/**
 * Envia evento para o Facebook Conversion API
 */
export const sendFacebookEvent = async (pixelId: string, accessToken: string, payload: FacebookEventPayload) => {
  if (!pixelId || !accessToken) return;

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

  const body = {
    data: [payload],
    // test_event_code: "TEST12345" // Descomente para testar no gerenciador de eventos
  };

  try {
    console.log(`🔵 Enviando evento Facebook: ${payload.event_name}`);
    await axios.post(url, body);
  } catch (error: any) {
    console.error("❌ Erro ao enviar evento Facebook:", error.response?.data?.error?.message || error.message);
  }
};

/**
 * Helper para criar o objeto user_data básico
 */
export const createFacebookUserData = (
  ip: string,
  userAgent: string,
  email?: string,
  phone?: string,
  name?: string,
  fbc?: string, // Novo
  fbp?: string
): FacebookUserData => {
  const userData: FacebookUserData = {
    client_ip_address: ip,
    client_user_agent: userAgent,
  };

  if (email) userData.em = hashData(email);
  if (phone) userData.ph = hashData(phone.replace(/\D/g, "")); // Remove não-números antes do hash

  if (name) {
    const names = name.trim().split(" ");
    if (names.length > 0) userData.fn = hashData(names[0]);
    if (names.length > 1) userData.ln = hashData(names[names.length - 1]);
  }

  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;

  return userData;
};
