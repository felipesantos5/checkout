import type { Plugin } from 'vite';

/**
 * Plugin customizado do Vite para otimizações adicionais
 * - Remove console.logs em produção
 * - Otimiza imports
 */
export function optimizePlugin(): Plugin {
  return {
    name: 'vite-plugin-optimize',
    apply: 'build',

    transform(code, id) {
      // Remove console.log, console.info, console.debug em produção
      if (id.endsWith('.ts') || id.endsWith('.tsx') || id.endsWith('.js') || id.endsWith('.jsx')) {
        // Remove console statements mas mantém console.error e console.warn
        code = code.replace(/console\.(log|info|debug)\([^)]*\);?/g, '');
      }

      return { code };
    },
  };
}
