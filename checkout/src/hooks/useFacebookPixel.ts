import { useEffect, useRef } from "react";

// Declaração global do fbq para TypeScript
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Hook para carregar o Facebook Pixel dinamicamente
 * Carrega o script SOMENTE se o pixelId for fornecido
 *
 * @param pixelId - ID do pixel do Facebook (opcional)
 * @returns Funções para disparar eventos manualmente
 */
export const useFacebookPixel = (pixelId?: string) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Se não tiver pixelId ou já foi inicializado, não faz nada
    if (!pixelId || isInitialized.current) {
      return;
    }

    // Marca como inicializado imediatamente para evitar duplicação
    isInitialized.current = true;

    console.log(`🔵 Inicializando Facebook Pixel: ${pixelId}`);

    // Injeta o script base do Facebook Pixel
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    // Inicializa o pixel com o ID fornecido
    window.fbq("init", pixelId);

    // Dispara o PageView automaticamente
    window.fbq("track", "PageView");

    console.log("✅ Facebook Pixel carregado e PageView disparado");
  }, [pixelId]);

  // Retorna funções helper para disparar eventos manualmente
  return {
    trackEvent: (eventName: string, data?: any) => {
      if (window.fbq && pixelId) {
        window.fbq("track", eventName, data);
        console.log(`🔵 Facebook Event: ${eventName}`, data);
      }
    },
    trackCustomEvent: (eventName: string, data?: any) => {
      if (window.fbq && pixelId) {
        window.fbq("trackCustom", eventName, data);
        console.log(`🔵 Facebook Custom Event: ${eventName}`, data);
      }
    },
  };
};
