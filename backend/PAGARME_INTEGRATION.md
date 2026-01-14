# Integração Pagar.me PIX - SnappCheckout

## 📋 Visão Geral

Esta documentação descreve a implementação completa da integração com a API v5 da Pagar.me para pagamentos via PIX no sistema SnappCheckout. A integração permite que cada usuário configure suas próprias credenciais da Pagar.me e receba pagamentos diretamente em sua conta.

## 🏗️ Arquitetura

### Componentes Implementados

1. **Modelos de Dados** (`models/`)
   - `user.model.ts`: Armazena credenciais Pagar.me (encriptadas)
   - `offer.model.ts`: Controla ativação do PIX por oferta
   - `sale.model.ts`: Registra transações PIX

2. **Serviços** (`services/`)
   - `pagarme.service.ts`: Comunicação com API Pagar.me v5

3. **Controllers** (`controllers/`)
   - `pagarme.controller.ts`: Endpoints de pagamento PIX
   - `settings.controller.ts`: Configuração de credenciais

4. **Webhooks** (`webhooks/pagarme/`)
   - `pagarme-webhook.controller.ts`: Recebe notificações
   - `handlers/order-paid.handler.ts`: Processa pagamentos confirmados

5. **Helpers** (`helper/`)
   - `encryption.ts`: Encriptação AES-256-CBC para credenciais

## 🔐 Segurança

### Encriptação de Credenciais

As credenciais da Pagar.me são armazenadas de forma segura usando:

- **Algoritmo**: AES-256-CBC
- **Chave**: Definida em `ENCRYPTION_KEY` no `.env`
- **IV**: Gerado aleatoriamente para cada encriptação
- **Formato**: `iv:encryptedData` (ambos em hexadecimal)

**Importante**: 
- A `ENCRYPTION_KEY` deve ter no mínimo 32 caracteres
- Gere uma chave forte em produção: `openssl rand -base64 32`
- Nunca commite a chave no repositório

### Campos Sensíveis

Os seguintes campos são marcados com `select: false` no Mongoose:
- `pagarme_api_key`
- `pagarme_encryption_key`
- `paypalClientSecret`

## 📡 API Endpoints

### 1. Criar Pagamento PIX

**Endpoint**: `POST /api/payments/pagarme/pix`

**Descrição**: Cria um novo pedido PIX e retorna QR Code

**Request Body**:
```json
{
  "offerSlug": "minha-oferta",
  "selectedOrderBumps": ["bump_id_1", "bump_id_2"],
  "quantity": 1,
  "contactInfo": {
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "document": "12345678900",
    "phone": "+5511999999999"
  },
  "addressInfo": {
    "zipCode": "01310-100",
    "street": "Av. Paulista",
    "number": "1000",
    "city": "São Paulo",
    "state": "SP"
  },
  "metadata": {
    "customId": "custom_123"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "saleId": "sale_id_mongodb",
  "orderId": "or_abc123xyz",
  "qrCode": "00020126580014br.gov.bcb.pix...",
  "qrCodeUrl": "https://api.pagar.me/core/v5/...",
  "expiresAt": "2026-01-13T22:30:00Z",
  "amount": 9900,
  "currency": "brl"
}
```

**Validações**:
- Oferta deve existir
- PIX da Pagar.me deve estar ativo na oferta (`pagarme_pix_enabled: true`)
- Usuário deve ter credenciais configuradas
- Dados do cliente (nome, email, CPF) são obrigatórios

### 2. Consultar Status do Pedido

**Endpoint**: `GET /api/payments/pagarme/order/:orderId`

**Descrição**: Consulta o status atual de um pedido PIX

**Response** (200 OK):
```json
{
  "success": true,
  "orderId": "or_abc123xyz",
  "status": "paid",
  "amount": 9900,
  "saleStatus": "succeeded"
}
```

### 3. Webhook Pagar.me

**Endpoint**: `POST /api/webhooks/pagarme`

**Descrição**: Recebe notificações da Pagar.me

**Eventos Suportados**:
- `order.paid`: Pagamento confirmado

**Configuração no Painel Pagar.me**:
1. Acesse: Configurações → Webhooks
2. URL: `https://seu-dominio.com/api/webhooks/pagarme`
3. Eventos: Selecione `order.paid`

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```bash
# Pagar.me
PAGARME_API_URL=https://api.pagar.me/core/v5

# Encriptação
ENCRYPTION_KEY=sua_chave_forte_aqui_min_32_chars
```

### 2. Configuração por Usuário

Cada usuário deve configurar suas credenciais via API:

**Endpoint**: `PUT /api/settings`

**Request Body**:
```json
{
  "pagarme_api_key": "sk_test_abc123...",
  "pagarme_encryption_key": "ek_test_xyz789..."
}
```

O sistema automaticamente:
- Valida as credenciais fazendo uma requisição de teste
- Encripta as chaves antes de salvar
- Retorna erro se as credenciais forem inválidas

### 3. Ativar PIX em uma Oferta

**Endpoint**: `PUT /api/offers/:id`

**Request Body**:
```json
{
  "pagarme_pix_enabled": true
}
```

## 🔄 Fluxo de Pagamento

### 1. Criação do Pedido

```
Cliente → Frontend → Backend → Pagar.me API
                         ↓
                    Cria Sale (pending)
                         ↓
                    Retorna QR Code
```

### 2. Confirmação do Pagamento

```
Pagar.me → Webhook → Backend
                        ↓
                   Atualiza Sale (succeeded)
                        ↓
                   Dispara Integrações
                   (UTMfy, Membership, etc.)
```

## 📊 Modelo de Dados

### Sale (Venda)

```typescript
{
  ownerId: ObjectId,              // Vendedor
  offerId: ObjectId,              // Oferta
  pagarme_order_id: string,       // ID do pedido Pagar.me
  pagarme_transaction_id: string, // ID da transação PIX
  customerName: string,
  customerEmail: string,
  totalAmountInCents: number,
  platformFeeInCents: number,     // 5% de taxa
  currency: string,               // "brl"
  status: string,                 // "pending" | "succeeded"
  gateway: string,                // "pagarme"
  paymentMethod: string,          // "pagarme"
  items: [{
    name: string,
    priceInCents: number,
    isOrderBump: boolean
  }],
  createdAt: Date
}
```

### User (Credenciais)

```typescript
{
  pagarme_api_key: string,        // Encriptado
  pagarme_encryption_key: string, // Encriptado
  // ... outros campos
}
```

### Offer (Configuração)

```typescript
{
  pagarme_pix_enabled: boolean,   // Ativa/desativa PIX
  // ... outros campos
}
```

## 🔌 Integrações Pós-Venda

Quando um pagamento é confirmado (`order.paid`), o sistema dispara automaticamente:

### 1. UTMfy Webhooks

Envia para todas as URLs configuradas em:
- `offer.utmfyWebhookUrls[]`
- `offer.utmfyWebhookUrl` (legado)

**Payload**:
```json
{
  "event": "sale.succeeded",
  "gateway": "pagarme",
  "sale_id": "...",
  "order_id": "...",
  "customer_name": "...",
  "customer_email": "...",
  "amount": 9900,
  "currency": "brl",
  "offer_slug": "...",
  "items": [...]
}
```

### 2. Membership Webhook

Se `offer.membershipWebhook.enabled === true`:

**Payload**:
```json
{
  "event": "member.created",
  "gateway": "pagarme",
  "sale_id": "...",
  "order_id": "...",
  "customer_name": "...",
  "customer_email": "...",
  "offer_slug": "...",
  "custom_id": "..."
}
```

**Headers**:
```
Authorization: Bearer {membershipWebhook.authToken}
```

## 📈 Relatórios Financeiros

### Calcular Receita

O serviço `PagarMeService` possui o método:

```typescript
async calculateRevenue(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number>
```

**Exemplo de Uso**:
```typescript
const pagarmeService = createPagarMeService(apiKey, encryptionKey);
const revenue = await pagarmeService.calculateRevenue(
  userId,
  new Date('2026-01-01'),
  new Date('2026-01-31')
);
console.log(`Receita: R$ ${revenue / 100}`);
```

## 🧪 Testes

### Credenciais de Teste

Obtenha credenciais de teste no painel da Pagar.me:
- Dashboard → Configurações → Chaves de API
- Use as chaves que começam com `sk_test_` e `ek_test_`

### Testar PIX

1. Crie um pedido via API
2. Use o QR Code de teste fornecido pela Pagar.me
3. Simule o pagamento no painel de testes
4. Verifique se o webhook foi recebido

### Validar Credenciais

```typescript
const pagarmeService = createPagarMeService(apiKey, encryptionKey);
const isValid = await pagarmeService.validateCredentials();
```

## ⚠️ Tratamento de Erros

### Erros Comuns

1. **Credenciais Inválidas**
   - Status: 400
   - Mensagem: "Credenciais da Pagar.me inválidas"

2. **PIX Não Ativo**
   - Status: 400
   - Mensagem: "PIX da Pagar.me não está ativo para esta oferta"

3. **CPF Inválido**
   - Status: 400
   - Mensagem: "CPF/CNPJ inválido"

4. **Erro na API Pagar.me**
   - Status: 500
   - Mensagem: Detalhes do erro da Pagar.me

### Logs

Todos os eventos importantes são logados com prefixo:
- `[Pagar.me]` - Serviço
- `[Pagar.me Controller]` - Controller
- `[Pagar.me Webhook]` - Webhook
- `[Settings]` - Configurações

## 🚀 Deploy

### Checklist

- [ ] Configurar `ENCRYPTION_KEY` forte em produção
- [ ] Configurar `PAGARME_API_URL` (produção: `https://api.pagar.me/core/v5`)
- [ ] Configurar webhook no painel Pagar.me
- [ ] Testar fluxo completo em ambiente de staging
- [ ] Validar integrações (UTMfy, Membership)
- [ ] Configurar monitoramento de erros

### Migração de Dados

Se já existem usuários, eles precisarão:
1. Acessar configurações
2. Adicionar credenciais Pagar.me
3. Ativar PIX nas ofertas desejadas

## 📚 Referências

- [Documentação Pagar.me API v5](https://docs.pagar.me/reference/api-v5)
- [Guia de PIX Pagar.me](https://docs.pagar.me/docs/pix)
- [Webhooks Pagar.me](https://docs.pagar.me/docs/webhooks)

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do servidor
2. Consulte a documentação da Pagar.me
3. Teste as credenciais no painel da Pagar.me
4. Verifique se o webhook está configurado corretamente

---

**Versão**: 1.0.0  
**Data**: 13/01/2026  
**Autor**: SnappCheckout Team
