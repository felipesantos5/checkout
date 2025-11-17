# Configuração do Webhook do Stripe

Este documento explica como o sistema de webhooks do Stripe está configurado e como funciona o fluxo de vendas.

## 📋 Visão Geral

Quando um cliente completa um pagamento, o Stripe envia um webhook para nosso backend. O sistema então:
1. ✅ Valida a autenticidade do webhook
2. 💾 Salva a venda no banco de dados
3. 📡 Envia os dados da venda para uma API externa (configurável)

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Stripe Webhook Secret (obrigatório)
STRIPE_WEBHOOK_SECRET=whsec_...

# API Externa para receber notificações de venda (opcional)
EXTERNAL_API_URL=https://api.exemplo.com/webhooks/sales
EXTERNAL_API_KEY=your_api_key_here
```

### 2. Configurar Webhook no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em **"Add endpoint"**
3. URL do webhook: `https://seu-dominio.com/api/webhooks/stripe`
4. Selecione os eventos:
   - `payment_intent.succeeded` ✅ (obrigatório)
   - `payment_intent.payment_failed` ⚠️ (opcional)
   - `charge.refunded` 💸 (opcional)
5. Copie o **Signing secret** e adicione em `STRIPE_WEBHOOK_SECRET`

## 📂 Estrutura de Arquivos

```
api/src/
├── webhooks/stripe/
│   ├── stripe-webhook.controller.ts  # Controlador principal
│   ├── stripe-webhook.routes.ts      # Rota do webhook
│   └── handlers/
│       ├── index.ts                   # Router de eventos
│       └── payment-intent.handler.ts  # Handler de pagamento aprovado
├── services/
│   └── external-api.service.ts        # Serviço de disparo para API externa
├── models/
│   └── sale.model.ts                  # Model de Venda
└── controllers/
    └── payment.controller.ts          # Criação do PaymentIntent
```

## 🔄 Fluxo Completo

### 1. Cliente Finaliza Compra

```typescript
// Frontend envia:
{
  offerSlug: "meu-produto",
  selectedOrderBumps: ["bump-id-1"],
  quantity: 1,
  contactInfo: {
    email: "cliente@email.com",
    name: "João Silva",
    phone: "(11) 99999-9999"
  }
}
```

### 2. Backend Cria PaymentIntent

O backend (`payment.controller.ts`) cria um PaymentIntent no Stripe com **metadata**:

```javascript
{
  offerSlug: "meu-produto",
  selectedOrderBumps: '["bump-id-1"]',
  quantity: "1",
  customerEmail: "cliente@email.com",
  customerName: "João Silva",
  customerPhone: "(11) 99999-9999"
}
```

### 3. Stripe Processa Pagamento

Quando o pagamento é aprovado, o Stripe envia um webhook `payment_intent.succeeded`.

### 4. Webhook Recebe e Processa

**stripe-webhook.controller.ts** → valida assinatura
↓
**handlers/index.ts** → roteia para handler correto
↓
**payment-intent.handler.ts** → processa venda

### 5. Salvamento no Banco

O handler salva a venda no MongoDB:

```javascript
{
  ownerId: ObjectId("..."),
  offerId: ObjectId("..."),
  stripePaymentIntentId: "pi_...",
  customerName: "João Silva",
  customerEmail: "cliente@email.com",
  totalAmountInCents: 9900,
  platformFeeInCents: 495,
  status: "succeeded",
  items: [
    { name: "Produto Principal", priceInCents: 9000, isOrderBump: false },
    { name: "Bump Extra", priceInCents: 900, isOrderBump: true }
  ]
}
```

### 6. Disparo para API Externa

Se `EXTERNAL_API_URL` estiver configurada, envia POST:

```javascript
{
  // Venda
  saleId: "...",
  stripePaymentIntentId: "pi_...",
  status: "succeeded",
  totalAmountInCents: 9900,
  platformFeeInCents: 495,
  createdAt: "2025-01-17T...",

  // Cliente
  customer: {
    name: "João Silva",
    email: "cliente@email.com"
  },

  // Vendedor
  seller: {
    id: "...",
    name: "Vendedor X",
    email: "vendedor@email.com",
    stripeAccountId: "acct_..."
  },

  // Oferta
  offer: {
    id: "...",
    name: "Meu Produto",
    slug: "meu-produto"
  },

  // Itens
  items: [...]
}
```

## 🧪 Testar Localmente

### Usar Stripe CLI

```bash
# 1. Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# 2. Login
stripe login

# 3. Encaminhar webhooks para localhost
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# 4. O CLI vai mostrar o webhook secret, adicione no .env:
# STRIPE_WEBHOOK_SECRET=whsec_...

# 5. Criar um pagamento de teste
stripe trigger payment_intent.succeeded
```

## 🔐 Segurança

- ✅ Webhook assinado criptograficamente pelo Stripe
- ✅ Validação obrigatória da assinatura
- ✅ Idempotência: vendas duplicadas são ignoradas
- ✅ Timeout de 10s para API externa
- ✅ Erros da API externa não afetam salvamento no banco

## 🐛 Troubleshooting

### Webhook retorna 400

- Verifique se `STRIPE_WEBHOOK_SECRET` está correto
- Confirme que a rota usa `express.raw()` (já configurado)

### Venda não é salva

- Verifique logs do console
- Confirme que os metadados estão sendo enviados no PaymentIntent
- Verifique se a oferta existe no banco

### API externa não recebe

- Confirme que `EXTERNAL_API_URL` está configurada
- Verifique logs: pode ser timeout, erro de conexão, etc.
- A venda É salva mesmo se a API externa falhar

## 📊 Monitoramento

Logs importantes:

```
🎯 Webhook recebido: payment_intent.succeeded | ID: evt_...
💰 Processando pagamento aprovado: pi_...
✅ Venda salva no banco: 67890...
📡 Enviando venda para API externa: https://...
✅ Resposta da API externa: 200
🎉 Processamento completo do pagamento pi_...
```

## 🎯 Eventos Suportados

| Evento | Status | Descrição |
|--------|--------|-----------|
| `payment_intent.succeeded` | ✅ Implementado | Pagamento aprovado |
| `payment_intent.payment_failed` | ⚠️ Log apenas | Pagamento falhou |
| `charge.refunded` | ⚠️ Log apenas | Reembolso realizado |

## 📝 Próximos Passos

Para adicionar suporte a novos eventos:

1. Adicione handler em `webhooks/stripe/handlers/`
2. Registre no switch em `handlers/index.ts`
3. Implemente lógica de negócio

## 🔗 Links Úteis

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
