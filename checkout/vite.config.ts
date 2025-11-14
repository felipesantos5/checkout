import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    tailwindcss(),
    basicSsl(), // 2. Adicione o plugin
  ],
  server: {
    https: true, // 3. Force o HTTPS
  },
});
