import { pt } from "./pt";
import { en } from "./en";
import { fr } from "./fr";

export type Language = "pt" | "en" | "fr";

// Re-exportar o tipo Translation para facilitar importações
export type Translation = typeof pt;

export const translations: Record<Language, Translation> = {
  pt,
  en,
  fr,
};

export const defaultLanguage: Language = "pt";
