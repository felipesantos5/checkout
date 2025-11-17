# Implementação de Multi-idiomas no Checkout

## ✅ O que já foi implementado (Frontend Checkout)

### 1. Sistema de Traduções
- **Localização**: `src/i18n/`
- **Arquivos criados**:
  - `translations/pt.ts` - Português
  - `translations/en.ts` - Inglês
  - `translations/fr.ts` - Francês
  - `translations/index.ts` - Exportações
  - `I18nContext.tsx` - Contexto de internacionalização

### 2. Tipos Atualizados
- Interface `OfferData` agora inclui campo `language?: Language` ("pt" | "en" | "fr")
- Localização: `src/pages/CheckoutSlugPage.tsx`

### 3. Componentes Traduzidos
- `OrderSummary.tsx` - Totalmente traduzido
- Usa hook `useTranslation()` para acessar traduções

### 4. Provider de I18n
- `CheckoutSlugPage` envolve o app com `<I18nProvider>`
- Idioma é passado dinamicamente baseado em `offerData.language`
- Fallback padrão: Português ("pt")

---

## 📋 Próximos passos (Backend)

### 1. Adicionar campo `language` no modelo Offer

**Arquivo**: `api/src/models/offer.model.ts`

```typescript
interface IOffer extends Document {
  ownerId: Schema.Types.ObjectId;
  name: string;
  slug: string;
  language: 'pt' | 'en' | 'fr'; // NOVO CAMPO
  bannerImageUrl?: string;
  currency: string;
  primaryColor: string;
  buttonColor: string;
  mainProduct: IProductSubDocument;
  orderBumps: IProductSubDocument[];
}

const offerSchema = new Schema<IOffer>({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  language: {
    type: String,
    enum: ['pt', 'en', 'fr'],
    default: 'pt',  // NOVO CAMPO
    required: true
  },
  bannerImageUrl: String,
  currency: { type: String, required: true },
  primaryColor: { type: String, required: true },
  buttonColor: { type: String, required: true },
  mainProduct: { type: productSubSchema, required: true },
  orderBumps: [productSubSchema],
});
```

### 2. Atualizar Validação no Controller

**Arquivo**: `api/src/controllers/offer.controller.ts`

```typescript
// Adicionar validação do campo language
const validLanguages = ['pt', 'en', 'fr'];
if (payload.language && !validLanguages.includes(payload.language)) {
  return res.status(400).json({
    error: "Invalid language. Must be 'pt', 'en', or 'fr'"
  });
}
```

### 3. Incluir no `transformOfferForFrontend`

**Arquivo**: `api/src/services/offer.service.ts`

```typescript
export const transformOfferForFrontend = (offer: IOffer) => {
  return {
    _id: offer._id,
    slug: offer.slug,
    name: offer.name,
    language: offer.language, // INCLUIR ESTE CAMPO
    bannerImageUrl: offer.bannerImageUrl,
    currency: offer.currency,
    primaryColor: offer.primaryColor,
    buttonColor: offer.buttonColor,
    mainProduct: transformProductForFrontend(offer.mainProduct),
    orderBumps: offer.orderBumps.map(transformProductForFrontend),
    ownerId: {
      stripeAccountId: offer.ownerId.stripeAccountId
    }
  };
};
```

---

## 📋 Próximos passos (Admin Dashboard)

### 1. Adicionar campo de seleção de idioma no OfferForm

**Arquivo**: `dashboard/admin/src/components/forms/OfferForm.tsx`

Adicionar no schema de validação:

```typescript
const offerFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  language: z.enum(['pt', 'en', 'fr']).default('pt'), // NOVO CAMPO
  bannerImageUrl: z.string().optional(),
  currency: z.string().min(1, "Moeda é obrigatória"),
  // ... outros campos
});
```

Adicionar no formulário JSX:

```tsx
{/* Campo de Idioma */}
<div className="space-y-2">
  <Label htmlFor="language">Idioma do Checkout</Label>
  <Controller
    name="language"
    control={control}
    render={({ field }) => (
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o idioma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pt">🇧🇷 Português</SelectItem>
          <SelectItem value="en">🇺🇸 English</SelectItem>
          <SelectItem value="fr">🇫🇷 Français</SelectItem>
        </SelectContent>
      </Select>
    )}
  />
  {errors.language && (
    <p className="text-sm text-red-500">{errors.language.message}</p>
  )}
</div>
```

### 2. Atualizar tipos do formulário

**Arquivo**: `dashboard/admin/src/types/offer.ts` (ou onde estiver definido)

```typescript
export interface OfferFormInput {
  name: string;
  language: 'pt' | 'en' | 'fr'; // NOVO CAMPO
  bannerImageUrl?: string;
  currency: string;
  primaryColor: string;
  buttonColor: string;
  mainProduct: {
    name: string;
    description?: string;
    imageUrl?: string;
    priceInCents: unknown;
    compareAtPriceInCents?: unknown;
  };
  orderBumps?: Array<{...}>;
}
```

### 3. Incluir no payload de criação/edição

Verificar que o campo `language` está sendo enviado nas requisições:

```typescript
// Ao criar oferta
const createOfferPayload = {
  ...formData,
  language: formData.language || 'pt', // Garantir que o campo seja enviado
};

// Ao editar oferta
const updateOfferPayload = {
  ...formData,
  language: formData.language, // Incluir o campo
};
```

---

## 🧪 Como Testar

### 1. Testar Localmente (Frontend já está pronto)

O frontend já suporta os 3 idiomas. Para testar:

```typescript
// Mock de dados para teste no CheckoutSlugPage
const mockOfferData = {
  // ... outros campos
  language: 'en', // Trocar para 'pt', 'en' ou 'fr' para testar
};
```

### 2. Testar após implementação Backend

1. Crie uma oferta no admin selecionando o idioma
2. Acesse o checkout pelo slug: `/c/SEU_SLUG`
3. Verifique que todos os textos estão no idioma correto:
   - "Resumo do pedido" / "Order Summary" / "Résumé de la commande"
   - "Subtotal" / "Subtotal" / "Sous-total"
   - "Desconto" / "Discount" / "Réduction"
   - "Total" / "Total" / "Total"

---

## 📝 Traduções Disponíveis

### Seções traduzidas:
- ✅ Order Summary (Resumo do pedido)
- ✅ Payment Methods (Métodos de pagamento)
- ✅ Contact Info (Informações de contato)
- ✅ Credit Card Form (Formulário de cartão)
- ✅ PIX Payment (Pagamento PIX)
- ✅ Buttons (Botões)
- ✅ Validation Messages (Mensagens de validação)
- ✅ Success/Error Messages (Mensagens de sucesso/erro)
- ✅ Product Info (Informações do produto)

### Para adicionar mais traduções:

Edite os arquivos em `src/i18n/translations/`:
- `pt.ts` - Português
- `en.ts` - Inglês
- `fr.ts` - Francês

---

## 🔧 Estrutura de Arquivos

```
checkout/
├── src/
│   ├── i18n/
│   │   ├── translations/
│   │   │   ├── pt.ts           ← Traduções PT
│   │   │   ├── en.ts           ← Traduções EN
│   │   │   ├── fr.ts           ← Traduções FR
│   │   │   └── index.ts        ← Exportações
│   │   └── I18nContext.tsx     ← Provider e hook
│   ├── pages/
│   │   └── CheckoutSlugPage.tsx ← Inicializa I18nProvider
│   └── components/
│       └── checkout/
│           └── OrderSummary.tsx ← Usa traduções
```

---

## 💡 Próximos componentes a traduzir

Para finalizar a implementação, traduzir os seguintes componentes:

1. ✅ `OrderSummary.tsx` - CONCLUÍDO
2. ⏳ `PaymentMethods.tsx` - Pendente
3. ⏳ `CreditCardForm.tsx` - Pendente
4. ⏳ `ContactInfo.tsx` - Pendente
5. ⏳ `CheckoutForm.tsx` - Pendente (botões e mensagens)
6. ⏳ `CheckoutSlugPage.tsx` - Pendente (mensagens de loading/erro)

Para cada componente, seguir o padrão:

```tsx
import { useTranslation } from "../../i18n/I18nContext";

export const MeuComponente = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t.minhaSecao.titulo}</h1>
      {/* ... */}
    </div>
  );
};
```

---

## 🌍 Idiomas Suportados

| Código | Idioma | Flag |
|--------|--------|------|
| `pt` | Português (Brasil) | 🇧🇷 |
| `en` | English (US) | 🇺🇸 |
| `fr` | Français | 🇫🇷 |

---

## ❓ FAQ

**P: O que acontece se o backend não enviar o campo `language`?**
R: O sistema usa "pt" (português) como padrão.

**P: Como adicionar um novo idioma?**
R:
1. Crie um novo arquivo em `src/i18n/translations/novo-idioma.ts`
2. Adicione o tipo em `Language` no `index.ts`
3. Adicione no enum do backend
4. Adicione a opção no select do admin

**P: As traduções afetam a formatação de moeda?**
R: Não. A formatação de moeda já usa `Intl.NumberFormat` e respeita a moeda da oferta (`currency`).
