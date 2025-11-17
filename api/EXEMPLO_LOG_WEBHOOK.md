# Exemplo de Log do Webhook

Este é um exemplo de como os logs aparecerão quando uma venda for processada.

## 📊 Log Completo de uma Venda

```
================================================================================
💰 NOVA VENDA RECEBIDA!
================================================================================
🆔 Payment Intent ID: pi_3QRstUvWxYz123456789
💵 Valor Total: R$ 149.90
📅 Data/Hora: 17/01/2025 14:30:45

📋 METADADOS RECEBIDOS:
{
  "offerSlug": "curso-completo-marketing",
  "selectedOrderBumps": "[\"67890bump123\"]",
  "quantity": "1",
  "customerEmail": "cliente@email.com",
  "customerName": "João Silva",
  "customerPhone": "(11) 99999-9999"
}

🔍 BUSCANDO OFERTA: curso-completo-marketing

👤 VENDEDOR IDENTIFICADO:
   Nome: Felipe Santos
   Email: felipe@vendedor.com
   ID: 67123abc456def789
   Stripe Account: acct_1QRstStripeAccount123

🛒 OFERTA:
   Nome: Curso Completo de Marketing Digital
   Slug: curso-completo-marketing
   ID: 67123oferta456def789

📦 ITENS DA COMPRA:
   ✓ Produto Principal: Curso de Marketing - R$ 99.90
   ✓ Order Bump: Ebook Bônus de SEO - R$ 50.00

💰 VALORES:
   Total da venda: R$ 149.90
   Taxa da plataforma (5%): R$ 7.50
   Valor do vendedor: R$ 142.40

💾 SALVANDO NO BANCO DE DADOS...
✅ Venda salva com sucesso!
   ID da venda: 67890venda123def456

📡 ENVIANDO PARA API EXTERNA...
   URL: https://api.exemplo.com/webhooks/sales
   Método: POST
   Timeout: 10s

📤 PAYLOAD SENDO ENVIADO:
{
  "saleId": "67890venda123def456",
  "stripePaymentIntentId": "pi_3QRstUvWxYz123456789",
  "status": "succeeded",
  "totalAmountInCents": 14990,
  "platformFeeInCents": 750,
  "createdAt": "2025-01-17T17:30:45.000Z",
  "customer": {
    "name": "João Silva",
    "email": "cliente@email.com"
  },
  "seller": {
    "id": "67123abc456def789",
    "name": "Felipe Santos",
    "email": "felipe@vendedor.com",
    "stripeAccountId": "acct_1QRstStripeAccount123"
  },
  "offer": {
    "id": "67123oferta456def789",
    "name": "Curso Completo de Marketing Digital",
    "slug": "curso-completo-marketing"
  },
  "items": [
    {
      "name": "Curso de Marketing",
      "priceInCents": 9990,
      "isOrderBump": false
    },
    {
      "name": "Ebook Bônus de SEO",
      "priceInCents": 5000,
      "isOrderBump": true
    }
  ]
}
   🔑 Autenticação: Bearer Token configurado

✅ RESPOSTA DA API EXTERNA:
   Status: 200
   Data: {
  "success": true,
  "message": "Venda recebida com sucesso",
  "id": "external-sale-123"
}
✅ Enviado para API externa com sucesso!

================================================================================
🎉 VENDA PROCESSADA COM SUCESSO!
================================================================================
```

## 🔍 Identificação do Vendedor

Cada log mostra claramente:
- ✅ **Nome do vendedor** - Para saber quem fez a venda
- ✅ **Email do vendedor** - Para contato
- ✅ **ID do vendedor** - ID único no MongoDB
- ✅ **Stripe Account ID** - Conta conectada do Stripe
- ✅ **Oferta vendida** - Qual produto foi vendido
- ✅ **Valor total** - Quanto foi a venda
- ✅ **Taxa da plataforma** - Quanto você (plataforma) vai receber
- ✅ **Valor do vendedor** - Quanto o vendedor vai receber

## ⚠️ Log de Venda Duplicada

Se o Stripe enviar o mesmo webhook duas vezes (pode acontecer):

```
================================================================================
💰 NOVA VENDA RECEBIDA!
================================================================================
🆔 Payment Intent ID: pi_3QRstUvWxYz123456789
💵 Valor Total: R$ 149.90
📅 Data/Hora: 17/01/2025 14:30:50

📋 METADADOS RECEBIDOS:
{
  "offerSlug": "curso-completo-marketing",
  ...
}

🔍 BUSCANDO OFERTA: curso-completo-marketing

👤 VENDEDOR IDENTIFICADO:
   Nome: Felipe Santos
   Email: felipe@vendedor.com
   ID: 67123abc456def789
   Stripe Account: acct_1QRstStripeAccount123

🛒 OFERTA:
   Nome: Curso Completo de Marketing Digital
   Slug: curso-completo-marketing
   ID: 67123oferta456def789

📦 ITENS DA COMPRA:
   ✓ Produto Principal: Curso de Marketing - R$ 99.90
   ✓ Order Bump: Ebook Bônus de SEO - R$ 50.00

⚠️  VENDA DUPLICADA DETECTADA!
   Esta venda já foi processada anteriormente.
   ID da venda existente: 67890venda123def456
================================================================================
```

## ❌ Log de Erro

Se algo der errado:

```
================================================================================
❌ ERRO AO PROCESSAR VENDA!
================================================================================
Erro: Oferta com slug 'produto-inexistente' não encontrada
Stack: Error: Oferta com slug 'produto-inexistente' não encontrada
    at handlePaymentIntentSucceeded (/app/src/webhooks/stripe/handlers/payment-intent.handler.ts:40:13)
    ...
================================================================================
```

## 🎯 Como Usar os Logs

### 1. Monitorar Vendas em Tempo Real
```bash
# No servidor, acompanhe os logs:
tail -f /var/log/app.log | grep "💰 NOVA VENDA"
```

### 2. Identificar Vendedor
Procure por `👤 VENDEDOR IDENTIFICADO:` no log para ver:
- Quem fez a venda
- Email do vendedor
- Conta Stripe do vendedor

### 3. Verificar Valores
Procure por `💰 VALORES:` para ver:
- Total da venda
- Taxa da plataforma
- Quanto o vendedor receberá

### 4. Debug de Problemas
Se a API externa não receber:
- Verifique `📡 ENVIANDO PARA API EXTERNA...`
- Veja o `📤 PAYLOAD SENDO ENVIADO`
- Confira a `✅ RESPOSTA DA API EXTERNA`

## 📌 Notas Importantes

- ✅ **Vendedor sempre identificado** - Todo log mostra de quem é a venda
- ✅ **Proteção contra duplicatas** - Sistema detecta vendas duplicadas
- ✅ **Venda salva mesmo se API externa falhar** - Garantia de registro
- ✅ **Logs estruturados** - Fácil de ler e fazer grep/busca
- ✅ **Informações completas** - Todos os dados relevantes em um só lugar
