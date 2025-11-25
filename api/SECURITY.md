# Configurações de Segurança da API

Este documento descreve as medidas de segurança implementadas na API.

## 1. Helmet - Proteção de Headers HTTP

O **Helmet** é um middleware que configura headers HTTP de segurança automaticamente.

### Configurações aplicadas:

- **Content Security Policy (CSP)**: Previne ataques XSS controlando quais recursos podem ser carregados
  - `defaultSrc: ['self']` - Só permite recursos do próprio domínio
  - `imgSrc` - Permite imagens do Cloudinary
  - `styleSrc`, `scriptSrc` - Controla estilos e scripts

- **Cross-Origin Policies**: Configurado para permitir integrações com Stripe e outros serviços

### Benefícios:
- Proteção contra clickjacking
- Prevenção de MIME type sniffing
- Proteção contra XSS
- Controle de referrer information

## 2. CORS - Controle de Origens

### Desenvolvimento vs Produção

**Desenvolvimento** (`NODE_ENV=development`):
- Permite qualquer origem para facilitar o desenvolvimento local
- Não requer configuração de `ALLOWED_ORIGINS`

**Produção** (`NODE_ENV=production`):
- Apenas origens na whitelist são permitidas
- Configure `ALLOWED_ORIGINS` no arquivo `.env`

### Configuração:

```env
# .env
ALLOWED_ORIGINS=https://admin.snappcheckout.com,https://pay.snappcheckout.com
```

### Recursos permitidos:
- Credentials (cookies, tokens)
- Métodos: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers personalizados: Authorization, sentry-trace, baggage

## 3. Rate Limiting - Proteção contra Abuso

Implementamos rate limiting em dois níveis:

### Global (Todas as rotas)
- **Janela**: 15 minutos
- **Limite**: 100 requisições por IP
- **Aplicado em**: Todas as rotas da API

### Específico por Endpoint

#### 3.1. Autenticação (`/api/auth/login`, `/api/auth/register`)
- **Janela**: 15 minutos
- **Limite**: 5 tentativas
- **Proteção**: Brute force attacks
- **Diferencial**: Não conta requisições bem-sucedidas

#### 3.2. Pagamentos (`/api/payments/*`)
- **Janela**: 1 minuto
- **Limite**: 10 requisições
- **Proteção**: Abuso de criação de pagamentos

#### 3.3. Upload de Arquivos (`/api/upload`)
- **Janela**: 1 minuto
- **Limite**: 10 uploads
- **Proteção**: Sobrecarga do servidor e Cloudinary

#### 3.4. Criação de Recursos (`/api/offers` POST)
- **Janela**: 1 minuto
- **Limite**: 20 criações
- **Proteção**: Spam de criação de ofertas

## 4. Variáveis de Ambiente Requeridas

### Produção (Obrigatórias):

```env
# CORS
ALLOWED_ORIGINS=https://admin.example.com,https://checkout.example.com

# Modo
NODE_ENV=production
```

### Desenvolvimento (Recomendadas):

```env
NODE_ENV=development
# ALLOWED_ORIGINS não é necessário em dev
```

## 5. Boas Práticas Implementadas

### 5.1. Headers de Segurança
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)

### 5.2. Proteção de Rotas
- JWT com expiração de 7 dias
- Tokens em cookies httpOnly
- Middleware `protectRoute` para rotas privadas

### 5.3. Validação de Entrada
- Sanitização de dados de entrada
- Validação de tipos com TypeScript
- Limite de tamanho de payload

### 5.4. Webhook Security
- Verificação de assinatura Stripe
- Uso de `express.raw()` para preservar payload
- Endpoint isolado sem rate limiting global

## 6. Monitoramento e Logs

### Headers de Rate Limit
Os clientes recebem headers informativos:
- `RateLimit-Limit`: Limite máximo de requisições
- `RateLimit-Remaining`: Requisições restantes
- `RateLimit-Reset`: Timestamp de reset do limite

### Resposta quando excede limite:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## 7. Checklist de Segurança para Deploy

Antes de fazer deploy em produção:

- [ ] Configurar `NODE_ENV=production`
- [ ] Definir `ALLOWED_ORIGINS` com todas as URLs dos frontends
- [ ] Gerar `JWT_SECRET` forte e aleatório (min 32 caracteres)
- [ ] Configurar `STRIPE_WEBHOOK_SECRET` corretamente
- [ ] Verificar que credenciais do Cloudinary são de produção
- [ ] Confirmar que MongoDB está com autenticação habilitada
- [ ] Testar rate limiting em staging
- [ ] Revisar logs de erro
- [ ] Configurar HTTPS/SSL no servidor

## 8. Customização de Rate Limits

Para ajustar os limites de acordo com sua necessidade, edite:

```typescript
// api/src/middleware/rate-limit.middleware.ts

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ajuste a janela
  max: 5, // Ajuste o limite
  // ...
});
```

## 9. Troubleshooting

### Erro: "Not allowed by CORS"
**Causa**: Origem não está na whitelist
**Solução**: Adicione a URL em `ALLOWED_ORIGINS` ou configure `NODE_ENV=development`

### Erro: "Too many requests"
**Causa**: Rate limit excedido
**Solução**: Aguarde o reset ou ajuste os limites se legítimo

### Headers de segurança bloqueando recursos
**Causa**: CSP muito restritivo
**Solução**: Ajuste as diretivas do Helmet em `app.ts`

## 10. Próximos Passos (Opcional)

Melhorias de segurança adicionais que podem ser implementadas:

- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Adicionar logging de segurança com Winston/Morgan
- [ ] Implementar IP whitelisting para endpoints admin
- [ ] Adicionar CAPTCHA em login/registro
- [ ] Configurar Web Application Firewall (WAF)
- [ ] Implementar detecção de anomalias
- [ ] Adicionar auditoria de ações críticas
- [ ] Configurar alertas de segurança
