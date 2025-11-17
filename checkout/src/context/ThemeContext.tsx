// src/context/ThemeContext.tsx
import { createContext, useContext } from "react";

export interface ThemeColors {
  primary: string;
  button: string;
  buttonForeground: string;
}

// Valores padrão caso algo falhe
const defaultTheme: ThemeColors = {
  primary: "#000000",
  button: "#2563eb",
  buttonForeground: "#ffffff",
};

export const ThemeContext = createContext<ThemeColors>(defaultTheme);

export const useTheme = () => {
  return useContext(ThemeContext);
};
