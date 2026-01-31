# Script de Reprocessamento de Integrações

## Problema Identificado

Vendas com status "succeeded" (aprovadas) não estavam disparando corretamente as integrações para:
- **Facebook CAPI** (Conversions API)
- **Husky/Área de Membros** (webhook de acesso)
- **UTMfy** (webhook de rastreamento)

Isso acontecia porque:
1. Os webhooks estavam envolvidos em try/catch e falhavam silenciosamente
2. O webhook do PayPal não reenviava TODAS as integrações (apenas Husky)
3. Não havia tracking de quais integrações foram enviadas com sucesso

## Correções Implementadas

### 1. Modelo Sale Atualizado
Adicionados campos para rastrear o status das integrações:
- `integrationsFacebookSent` (boolean) - Se o evento foi enviado para Facebook CAPI
- `integrationsHuskySent` (boolean) - Se o webhook foi enviado para Husky
- `integrationsUtmfySent` (boolean) - Se o webhook foi enviado para UTMfy
- `integrationsLastAttempt` (Date) - Última tentativa de envio

### 2. Webhook PayPal Corrigido
Agora quando o webhook `PAYMENT.CAPTURE.COMPLETED` é recebido:
- Verifica se as integrações foram enviadas
- Reenvia TODAS as integrações faltantes (Facebook, Husky, UTMfy)
- Marca as flags conforme o sucesso

### 3. Controllers Atualizados
Tanto o controller do PayPal quanto o handler do Stripe agora:
- Marcam a flag de integração quando o envio é bem-sucedido
- Registram falhas para possível reprocessamento
- Salvam o timestamp da última tentativa

## Como Usar o Script de Reprocessamento

### Pré-requisitos
1. Certifique-se de que o arquivo `.env` está configurado corretamente
2. O MongoDB deve estar acessível

### Executar em modo DRY RUN (apenas lista, sem reprocessar)

```bash
cd backend
npx ts-node src/scripts/reprocess-failed-integrations.ts --dry-run
```

### Executar em PRODUÇÃO (reprocessa de verdade)

```bash
cd backend
npx ts-node src/scripts/reprocess-failed-integrations.ts
```

### Opções Disponíveis

```bash
# Limitar a 100 vendas
npx ts-node src/scripts/reprocess-failed-integrations.ts --limit=100

# Filtrar por data (apenas vendas de 30/01/2026)
npx ts-node src/scripts/reprocess-failed-integrations.ts --date-from=2026-01-30 --date-to=2026-01-31

# Combinar opções
npx ts-node src/scripts/reprocess-failed-integrations.ts --dry-run --limit=50 --date-from=2026-01-30
```

## O Que o Script Faz

1. **Busca vendas com problemas**: Vendas com status "succeeded" mas que não têm todas as integrações marcadas como enviadas
2. **Lista informações**: Mostra detalhes de cada venda (ID, email, valor, status das integrações)
3. **Reenvia integrações faltantes**:
   - Facebook CAPI (se não foi enviado)
   - Husky webhook (se não foi enviado)
   - UTMfy webhook (se não foi enviado)
4. **Atualiza flags**: Marca as integrações como enviadas quando bem-sucedidas
5. **Mostra relatório**: Estatísticas de quantas vendas foram reprocessadas

## Exemplo de Saída

```
╔════════════════════════════════════════════════════════════════╗
║  Script de Reprocessamento de Integrações Falhadas           ║
╚════════════════════════════════════════════════════════════════╝

Modo: PRODUÇÃO (vai reprocessar)
Limite: 1000 vendas
Data de: não filtrado
Data até: não filtrado

🔌 Conectando ao MongoDB...
✅ Conectado ao MongoDB

🔍 Buscando vendas que precisam ser reprocessadas...

📊 Encontradas 15 vendas para reprocessar

📈 Estatísticas:
   - Total de vendas: 15
   - Faltando Facebook: 10
   - Faltando Husky: 5
   - Faltando UTMfy: 12

📦 Venda 679a1b2c3d4e5f6789012345 (cliente@email.com)
   Data: 2026-01-30T09:16:00.000Z
   Valor: 17 usd
   Status: succeeded
   Integrações:
     - Facebook: ❌
     - Husky: ❌
     - UTMfy: ❌
   📊 Facebook: 1 sucesso, 0 falhas de 1 pixels
   ✅ Husky webhook reenviado
   ✅ UTMfy webhook reenviado
   ✅ Reprocessamento concluído
   📊 Status final:
     - Facebook: ✅
     - Husky: ✅
     - UTMfy: ✅

...

╔════════════════════════════════════════════════════════════════╗
║  Reprocessamento Concluído                                     ║
╚════════════════════════════════════════════════════════════════╝

📊 Resumo:
   - Vendas processadas: 15
   - Vendas com erro: 0
   - Total: 15

✅ Alterações salvas no banco de dados
```

## Próximos Passos

### 1. Testar as Correções
1. Faça uma venda de teste com PayPal
2. Verifique nos logs se as três integrações foram disparadas:
   - `✅ [PayPal] Webhook Husky enviado com sucesso`
   - `✅ [PayPal] Evento Facebook enviado com sucesso`
   - `✅ [PayPal] Webhook UTMfy enviado com sucesso`
3. Confira no banco se os campos `integrationsFacebookSent`, `integrationsHuskySent` e `integrationsUtmfySent` estão como `true`

### 2. Reprocessar Vendas Antigas
1. Execute o script em modo DRY RUN primeiro para ver quantas vendas precisam ser reprocessadas
2. Se tudo estiver correto, execute sem `--dry-run` para reprocessar de verdade
3. Monitore os logs para garantir que as integrações estão sendo enviadas

### 3. Monitoramento Contínuo
- Crie um alerta ou dashboard que mostre vendas com integrações faltantes
- Execute o script periodicamente (ex: diariamente) para reprocessar falhas recentes
- Query útil para MongoDB:
  ```javascript
  db.sales.find({
    status: "succeeded",
    $or: [
      { integrationsFacebookSent: { $ne: true } },
      { integrationsHuskySent: { $ne: true } },
      { integrationsUtmfySent: { $ne: true } }
    ]
  })
  ```

## Troubleshooting

### Script não encontra vendas
- Verifique se as vendas antigas não têm os novos campos (são `undefined`)
- O script busca por `{ $ne: true }` que pega tanto `false` quanto `undefined`

### Erros ao reenviar Facebook
- Verifique se os tokens de acesso estão válidos
- Confira se os pixels estão configurados corretamente na oferta

### Erros ao reenviar UTMfy
- Verifique se `UTMFY_API_URL` e `UTMFY_API_KEY` estão no `.env`
- Confira se a URL do webhook está configurada na oferta

### Vendas continuam aparecendo como pendentes no admin
- Isso é um problema diferente (dashboard)
- Verifique o componente `AllSalesPage.tsx` para ver como o status é exibido
- O status no banco deve ser "succeeded", não "pending"
