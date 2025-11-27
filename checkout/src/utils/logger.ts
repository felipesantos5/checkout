/**
 * Sistema de logging condicional
 * Logs só aparecem em desenvolvimento, removidos automaticamente em produção
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },

  error: (...args: any[]) => {
    // Errors sempre logam, mas podem ser enviados para serviço de monitoring em prod
    console.error(...args);
  },

  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },

  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },

  // Logger específico para eventos do Facebook Pixel
  pixel: (event: string, data?: any) => {
    if (isDev) {
      console.log(`🔵 Facebook Pixel: ${event}`, data || '');
    }
  },

  // Logger específico para pagamentos
  payment: (step: string, data?: any) => {
    if (isDev) {
      console.log(`💳 Payment: ${step}`, data || '');
    }
  },

  // Logger específico para Apple/Google Pay
  wallet: (message: string, data?: any) => {
    if (isDev) {
      console.log(`💰 Wallet: ${message}`, data || '');
    }
  }
};
