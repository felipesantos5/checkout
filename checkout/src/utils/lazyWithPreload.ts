import { lazy } from 'react';
import type { ComponentType } from 'react';

/**
 * Lazy loading com suporte a preload
 * Permite fazer preload de componentes antes de serem renderizados
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = lazy(factory);

  // Adiciona função de preload ao componente
  (Component as any).preload = factory;

  return Component as typeof Component & { preload: () => Promise<{ default: T }> };
}
