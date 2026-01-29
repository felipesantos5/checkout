import { pt } from "./pt";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { de } from "./de";
import { it } from "./it";

export type Language = "pt" | "en" | "fr" | "es" | "de" | "it";

// Re-exportar o tipo Translation para facilitar importações
export type Translation = typeof pt;

export const translations: Record<Language, Translation> = {
  pt,
  en,
  fr,
  es,
  de,
  it,
};

export const defaultLanguage: Language = "pt";
