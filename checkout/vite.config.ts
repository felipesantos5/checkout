import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
  ],
  build: {
    cssCodeSplit: true,
    minify: 'esbuild',
    target: 'es2020',
    reportCompressedSize: false,
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: 'no-external',
      },
      output: {
        manualChunks(id) {
          // React core separado
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // React Router separado
          if (id.includes('node_modules/react-router-dom/')) {
            return 'react-router';
          }
          // Stripe separado (carregado sob demanda)
          if (id.includes('@stripe/stripe-js') || id.includes('@stripe/react-stripe-js')) {
            return 'stripe';
          }
          // Radix UI separado
          if (id.includes('@radix-ui/')) {
            return 'radix-ui';
          }
          // Lucide icons separado
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          // Polished (utils CSS) separado
          if (id.includes('polished')) {
            return 'css-utils';
          }
          // Outros node_modules em vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: true,
  },
});
