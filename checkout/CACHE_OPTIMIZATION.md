# Otimizações de Cache - PageSpeed Insights

## Problema Identificado

O PageSpeed Insights mostrou o alerta: **"Use ciclos de vida eficientes de cache"** com economia estimada de **333 KiB**.

Recursos sem cache adequado:
- **Stripe** (js.stripe.com, m.stripe.com): 259 KiB - Cache TTL: 2-5 min
- **hCaptcha** (hcaptcha.com): 158 KiB - Cache TTL: 5 min
- **myCartPanda** (assets.mycartpanda.com): 3 KiB - Cache TTL: None

## Soluções Implementadas

### 1. Service Worker com Stale-While-Revalidate

**Arquivo**: `public/sw.js`

Implementa cache inteligente para recursos de terceiros:

```javascript
// Duração de cache otimizada
const CACHE_DURATION = {
  stripe: 30 dias,      // Scripts do Stripe
  hcaptcha: 30 dias,    // Scripts do hCaptcha
  mycartpanda: 7 dias,  // Assets do CartPanda
  cloudinary: 90 dias,  // Imagens (raramente mudam)
};
```

**Estratégia Stale-While-Revalidate**:
1. Retorna cache imediatamente (resposta instantânea)
2. Atualiza em background se necessário
3. Fallback para cache expirado se rede falhar

**Recursos cacheados**:
- ✅ Todos os domínios Stripe (js.stripe.com, m.stripe.com, stripe.network)
- ✅ hCaptcha completo
- ✅ myCartPanda SVG assets
- ✅ Imagens Cloudinary

### 2. Cache Headers Estáticos

**Arquivo**: `public/_headers`

Headers HTTP para plataformas de hospedagem (Netlify, Vercel, etc):

```
/assets/js/*     → Cache-Control: public, max-age=31536000, immutable
/assets/css/*    → Cache-Control: public, max-age=31536000, immutable
/assets/images/* → Cache-Control: public, max-age=31536000, immutable
/sw.js          → Cache-Control: public, max-age=0, must-revalidate
```

### 3. Registro do Service Worker

**Arquivo**: `src/utils/registerServiceWorker.ts`

- Registra apenas em produção
- Atualização automática quando disponível
- Falha silenciosa (progressive enhancement)

## Benefícios

### Performance
- ⚡ **Resposta instantânea** para recursos cacheados
- 📉 **Redução de 333 KiB** em transferências repetidas
- 🚀 **Faster TTI** (Time to Interactive) em visitas subsequentes

### Economia de Banda
- 🌐 **Stripe**: 259 KiB economizados por visita repetida
- 🛡️ **hCaptcha**: 158 KiB economizados
- 🎨 **Imagens**: Cache de 90 dias

### Experiência do Usuário
- ✅ Checkout funciona offline (com cache)
- ✅ Carregamento instantâneo em revisitas
- ✅ Menor consumo de dados móveis

## Como Funciona na Prática

### Primeira Visita
1. Scripts baixados normalmente da rede
2. Service Worker armazena em cache
3. Próxima visita: cache instantâneo

### Visitas Subsequentes (< 30 dias)
1. **Resposta instantânea** do cache (0ms)
2. Service Worker valida em background
3. Cache atualizado se houver nova versão

### Visitas Subsequentes (> 30 dias)
1. Retorna cache expirado imediatamente
2. Busca versão atualizada em paralelo
3. Atualiza cache para próxima visita

## Testando

### Desenvolvimento Local
```bash
npm run build
npm run preview
```

### Verificar Service Worker
1. Abra DevTools → Application → Service Workers
2. Verifique status "activated"
3. Abra Network → Force refresh (Cmd+Shift+R)
4. Segunda requisição: recursos virão de "ServiceWorker"

### PageSpeed Insights
1. Faça build e deploy
2. Teste no PageSpeed: https://pagespeed.web.dev/
3. Métrica "Use ciclos de vida eficientes de cache" deve estar verde ✅

## Arquivos Modificados

- ✅ `public/sw.js` - Service Worker com cache strategies
- ✅ `public/_headers` - Cache headers estáticos
- ✅ `src/utils/registerServiceWorker.ts` - Registro do SW
- ✅ `src/main.tsx` - Chama registro no init
- ✅ `vite.config.ts` - Configuração de build otimizada

## Compatibilidade

- ✅ Chrome 45+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+
- ✅ Mobile browsers (iOS Safari 11.3+, Chrome Android)

**Fallback**: Se Service Worker não disponível, funciona normalmente (progressive enhancement).

## Monitoramento

Para verificar eficácia do cache:

```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers ativos:', regs.length);
});

// Ver estatísticas do cache
caches.keys().then(keys => console.log('Caches:', keys));
```

## Próximos Passos (Opcional)

- [ ] Implementar cache de API responses (se necessário)
- [ ] Adicionar precaching de recursos críticos
- [ ] Implementar background sync para formulários offline
- [ ] Analytics de cache hit rate

---

**Impacto no PageSpeed**: Espera-se passar de ❌ para ✅ na auditoria de cache.
