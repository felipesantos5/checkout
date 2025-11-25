export const formatCurrency = (amountInCents: number, currency: string = "BRL") => {
  // Mapeia os códigos de moeda em minúscula para maiúscula
  const currencyCode = currency.toUpperCase();

  // Mapeamento de moedas para locales apropriados
  const localeMap: Record<string, string> = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
  };

  const locale = localeMap[currencyCode] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amountInCents / 100);
};
