import geoip from "geoip-lite";

/**
 * Detecta o país baseado no endereço IP
 * @param ip - Endereço IP do cliente
 * @returns Código do país em ISO (ex: "US", "BR", "DE") ou "BR" como padrão
 */
export const getCountryFromIP = (ip: string | undefined): string => {
  if (!ip) return "BR";

  // Remove possível prefixo IPv6 (::ffff:)
  const cleanIP = ip.replace(/^::ffff:/, "");

  // IPs locais retornam Brasil como padrão
  if (cleanIP === "127.0.0.1" || cleanIP === "localhost" || cleanIP.startsWith("192.168.") || cleanIP.startsWith("10.")) {
    return "BR";
  }

  try {
    const geo = geoip.lookup(cleanIP);

    if (geo && geo.country) {
      return geo.country; // Retorna código ISO do país (ex: "US", "BR", "DE")
    }

    return "BR"; // Fallback para Brasil
  } catch (error) {
    console.error("Erro ao detectar país pelo IP:", error);
    return "BR";
  }
};
