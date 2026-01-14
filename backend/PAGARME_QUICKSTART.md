# 🚀 Guia Rápido - Integração Pagar.me PIX

## ⚡ Início Rápido (5 minutos)

### 1. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env`:

```bash
# Pagar.me
PAGARME_API_URL=https://api.pagar.me/core/v5

# Encriptação (IMPORTANTE!)
ENCRYPTION_KEY=SuaChaveForteAqui123456789012
```

**Gerar chave forte**:
```bash
openssl rand -base64 32
```

### 2. Obter Credenciais Pagar.me

1. Acesse: https://dashboard.pagar.me
2. Vá em: **Configurações → Chaves de API**
3. Copie:
   - **API Key** (começa com `sk_test_` ou `sk_live_`)
   - **Encryption Key** (começa com `ek_test_` ou `ek_live_`)

### 3. Configurar Credenciais (via API)

```bash
curl -X PUT http://localhost:5000/api/settings \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pagarme_api_key": "sk_test_abc123...",
    "pagarme_encryption_key": "ek_test_xyz789..."
  }'
```

**Resposta de Sucesso**:
```json
{
  "message": "Configurações atualizadas com sucesso."
}
```

### 4. Ativar PIX em uma Oferta

```bash
curl -X PUT http://localhost:5000/api/offers/OFFER_ID \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pagarme_pix_enabled": true
  }'
```

### 5. Criar um Pagamento PIX

```bash
curl -X POST http://localhost:5000/api/payments/pagarme/pix \
  -H "Content-Type: application/json" \
  -d '{
    "offerSlug": "minha-oferta",
    "quantity": 1,
    "contactInfo": {
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "document": "12345678900",
      "phone": "+5511999999999"
    }
  }'
```

**Resposta**:
```json
{
  "success": true,
  "saleId": "65abc123...",
  "orderId": "or_abc123xyz",
  "qrCode": "00020126580014br.gov.bcb.pix...",
  "qrCodeUrl": "https://api.pagar.me/core/v5/...",
  "expiresAt": "2026-01-13T22:30:00Z",
  "amount": 9900,
  "currency": "brl"
}
```

### 6. Configurar Webhook

1. Acesse: https://dashboard.pagar.me
2. Vá em: **Configurações → Webhooks**
3. Clique em: **Novo Webhook**
4. Configure:
   - **URL**: `https://seu-dominio.com/api/webhooks/pagarme`
   - **Eventos**: Selecione `order.paid`
   - **Status**: Ativo

## 📱 Exemplo de Integração Frontend

### React/Next.js

```typescript
// Criar pagamento PIX
const createPixPayment = async (offerSlug: string, contactInfo: any) => {
  const response = await fetch('/api/payments/pagarme/pix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offerSlug,
      quantity: 1,
      contactInfo,
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    // Exibir QR Code
    displayQRCode(data.qrCode, data.qrCodeUrl);
    
    // Iniciar polling de status
    pollPaymentStatus(data.orderId);
  }
};

// Verificar status do pagamento
const pollPaymentStatus = async (orderId: string) => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/payments/pagarme/order/${orderId}`);
    const data = await response.json();
    
    if (data.saleStatus === 'succeeded') {
      clearInterval(interval);
      // Redirecionar para página de sucesso
      window.location.href = '/obrigado';
    }
  }, 3000); // Verifica a cada 3 segundos
};

// Exibir QR Code
const displayQRCode = (qrCode: string, qrCodeUrl: string) => {
  return (
    <div>
      <img src={qrCodeUrl} alt="QR Code PIX" />
      <p>Ou copie o código:</p>
      <input 
        type="text" 
        value={qrCode} 
        readOnly 
        onClick={(e) => {
          e.currentTarget.select();
          navigator.clipboard.writeText(qrCode);
        }}
      />
    </div>
  );
};
```

## 🧪 Testar Integração

### 1. Criar Pedido de Teste

```bash
npm run dev
```

Acesse: http://localhost:5000/health

### 2. Simular Pagamento

1. Crie um pedido PIX via API
2. Acesse: https://dashboard.pagar.me
3. Vá em: **Transações → Pedidos**
4. Encontre seu pedido
5. Clique em: **Simular Pagamento**

### 3. Verificar Webhook

Verifique os logs do servidor:
```
[Pagar.me Webhook] Webhook recebido: order.paid
[Pagar.me Webhook] Venda atualizada para succeeded: saleId=...
```

## 🔍 Verificar Status

### Via API

```bash
curl http://localhost:5000/api/payments/pagarme/order/or_abc123xyz
```

### Via Banco de Dados

```javascript
// MongoDB
db.sales.findOne({ pagarme_order_id: "or_abc123xyz" })
```

## ❌ Solução de Problemas

### Erro: "Credenciais da Pagar.me inválidas"

**Solução**:
1. Verifique se as chaves estão corretas
2. Confirme que está usando chaves de teste (`sk_test_` / `ek_test_`)
3. Verifique se as chaves não expiraram

### Erro: "PIX da Pagar.me não está ativo"

**Solução**:
```bash
# Ativar PIX na oferta
curl -X PUT http://localhost:5000/api/offers/OFFER_ID \
  -H "Authorization: Bearer TOKEN" \
  -d '{"pagarme_pix_enabled": true}'
```

### Webhook não está sendo recebido

**Solução**:
1. Verifique se a URL está acessível publicamente
2. Use ngrok para testes locais:
   ```bash
   ngrok http 5000
   ```
3. Configure a URL do ngrok no painel Pagar.me

### Erro: "ENCRYPTION_KEY não está definida"

**Solução**:
```bash
# Adicione ao .env
ENCRYPTION_KEY=$(openssl rand -base64 32)
```

## 📊 Monitoramento

### Logs Importantes

```bash
# Criação de pedido
[Pagar.me] Criando pedido PIX: amount=9900, customer=joao@exemplo.com
[Pagar.me] Pedido PIX criado com sucesso: orderId=or_abc123xyz

# Webhook
[Pagar.me Webhook] Processando order.paid: orderId=or_abc123xyz
[Pagar.me Webhook] Venda atualizada para succeeded

# Integrações
[Pagar.me Webhook] Enviando webhook UTMfy
[Pagar.me Webhook] Webhook UTMfy enviado com sucesso
```

### Métricas

```typescript
// Calcular receita do mês
const pagarmeService = createPagarMeService(apiKey, encryptionKey);
const revenue = await pagarmeService.calculateRevenue(
  userId,
  new Date('2026-01-01'),
  new Date('2026-01-31')
);
console.log(`Receita: R$ ${(revenue / 100).toFixed(2)}`);
```

## 🎯 Próximos Passos

1. ✅ Testar em ambiente de desenvolvimento
2. ✅ Configurar webhook no painel Pagar.me
3. ✅ Integrar frontend com endpoints
4. ✅ Testar fluxo completo
5. ✅ Configurar produção
6. ✅ Monitorar transações

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [PAGARME_INTEGRATION.md](./PAGARME_INTEGRATION.md) - Documentação completa
- [PAGARME_IMPLEMENTATION_SUMMARY.md](./PAGARME_IMPLEMENTATION_SUMMARY.md) - Resumo da implementação

## 🆘 Suporte

- **Documentação Pagar.me**: https://docs.pagar.me
- **Dashboard**: https://dashboard.pagar.me
- **Suporte**: suporte@pagar.me

---

**Versão**: 1.0.0  
**Última Atualização**: 13/01/2026
