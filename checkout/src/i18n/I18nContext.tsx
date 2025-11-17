import React, { createContext, useContext, type ReactNode } from "react";
import { translations, type Language, defaultLanguage, type Translation } from "./translations";

interface I18nContextType {
  language: Language;
  t: Translation;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  language?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, language = defaultLanguage }) => {
  const currentLanguage = language in translations ? language : defaultLanguage;
  const t = translations[currentLanguage];

  return <I18nContext.Provider value={{ language: currentLanguage, t }}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
};
