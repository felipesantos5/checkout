# Exemplos de Uso - Integração Pagar.me PIX

## 📝 Exemplos Práticos

### 1. Configurar Credenciais do Usuário

```typescript
// backend/src/controllers/settings.controller.ts

import { Request, Response } from "express";
import User from "../models/user.model";
import { encrypt } from "../helper/encryption";
import { createPagarMeService } from "../services/pagarme.service";

export const configurePagarMeCredentials = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { apiKey, encryptionKey } = req.body;

    // Valida credenciais
    const pagarmeService = createPagarMeService(apiKey, encryptionKey);
    const isValid = await pagarmeService.validateCredentials();

    if (!isValid) {
      return res.status(400).json({ 
        error: "Credenciais inválidas" 
      });
    }

    // Encripta e salva
    const user = await User.findById(userId);
    user.pagarme_api_key = encrypt(apiKey);
    user.pagarme_encryption_key = encrypt(encryptionKey);
    await user.save();

    res.json({ message: "Credenciais configuradas com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
```

### 2. Criar Pagamento PIX com Order Bumps

```typescript
// Exemplo completo de criação de pagamento

const createPixPaymentWithBumps = async (
  offerSlug: string,
  contactInfo: any,
  selectedBumps: string[]
) => {
  const response = await fetch('/api/payments/pagarme/pix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offerSlug,
      quantity: 1,
      selectedOrderBumps: selectedBumps,
      contactInfo: {
        name: contactInfo.name,
        email: contactInfo.email,
        document: contactInfo.cpf.replace(/\D/g, ''), // Remove formatação
        phone: contactInfo.phone,
      },
      metadata: {
        source: 'checkout-v2',
        campaign: 'black-friday',
      },
    }),
  });

  const data = await response.json();
  return data;
};

// Uso
const payment = await createPixPaymentWithBumps(
  'minha-oferta',
  {
    name: 'João Silva',
    email: 'joao@exemplo.com',
    cpf: '123.456.789-00',
    phone: '(11) 99999-9999',
  },
  ['bump_id_1', 'bump_id_2']
);

console.log('QR Code:', payment.qrCode);
console.log('Expira em:', payment.expiresAt);
```

### 3. Componente React para Exibir QR Code

```typescript
// components/PixPayment.tsx

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

interface PixPaymentProps {
  orderId: string;
  qrCode: string;
  qrCodeUrl: string;
  expiresAt: string;
  amount: number;
  onSuccess: () => void;
}

export const PixPayment: React.FC<PixPaymentProps> = ({
  orderId,
  qrCode,
  qrCodeUrl,
  expiresAt,
  amount,
  onSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Polling de status
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/payments/pagarme/order/${orderId}`);
      const data = await response.json();

      if (data.saleStatus === 'succeeded') {
        clearInterval(interval);
        onSuccess();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, onSuccess]);

  // Contador de tempo
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expirado');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pix-payment">
      <h2>Pagamento PIX</h2>
      <p className="amount">R$ {(amount / 100).toFixed(2)}</p>
      
      <div className="qr-code">
        <QRCode value={qrCode} size={256} />
      </div>

      <div className="instructions">
        <p>1. Abra o app do seu banco</p>
        <p>2. Escaneie o QR Code ou copie o código</p>
        <p>3. Confirme o pagamento</p>
      </div>

      <div className="copy-section">
        <input 
          type="text" 
          value={qrCode} 
          readOnly 
          className="qr-code-input"
        />
        <button onClick={copyToClipboard}>
          {copied ? '✓ Copiado!' : 'Copiar Código'}
        </button>
      </div>

      <p className="expires">
        Expira em: <strong>{timeLeft}</strong>
      </p>

      <div className="status">
        <div className="spinner"></div>
        <p>Aguardando pagamento...</p>
      </div>
    </div>
  );
};
```

### 4. Hook Personalizado para Pagamento PIX

```typescript
// hooks/usePixPayment.ts

import { useState, useCallback } from 'react';

interface UsePixPaymentReturn {
  createPayment: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  paymentData: any | null;
}

export const usePixPayment = (): UsePixPaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any | null>(null);

  const createPayment = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/pagarme/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao criar pagamento');
      }

      const result = await response.json();
      setPaymentData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPayment, loading, error, paymentData };
};

// Uso
const CheckoutPage = () => {
  const { createPayment, loading, error, paymentData } = usePixPayment();

  const handleSubmit = async (formData: any) => {
    await createPayment({
      offerSlug: 'minha-oferta',
      contactInfo: formData,
    });
  };

  if (loading) return <div>Processando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (paymentData) return <PixPayment {...paymentData} />;

  return <CheckoutForm onSubmit={handleSubmit} />;
};
```

### 5. Webhook Handler Customizado

```typescript
// webhooks/pagarme/handlers/custom-handler.ts

import Sale from "../../../models/sale.model";
import axios from "axios";

/**
 * Handler customizado para processar eventos específicos
 */
export const handleCustomEvent = async (eventData: any) => {
  const orderId = eventData.id;

  // Busca a venda
  const sale = await Sale.findOne({ pagarme_order_id: orderId });
  if (!sale) return;

  // Lógica customizada
  if (eventData.status === 'paid') {
    // Enviar email de confirmação
    await sendConfirmationEmail(sale.customerEmail, sale);

    // Criar conta no sistema de membros
    await createMemberAccount(sale);

    // Enviar para CRM
    await sendToCRM(sale);
  }
};

const sendConfirmationEmail = async (email: string, sale: any) => {
  // Implementar envio de email
  console.log(`Enviando email para ${email}`);
};

const createMemberAccount = async (sale: any) => {
  // Implementar criação de conta
  console.log(`Criando conta para ${sale.customerEmail}`);
};

const sendToCRM = async (sale: any) => {
  // Implementar integração com CRM
  await axios.post('https://crm.exemplo.com/api/leads', {
    name: sale.customerName,
    email: sale.customerEmail,
    value: sale.totalAmountInCents / 100,
  });
};
```

### 6. Relatório de Vendas PIX

```typescript
// services/reports.service.ts

import { createPagarMeService } from "./pagarme.service";
import Sale from "../models/sale.model";
import User from "../models/user.model";
import { decrypt } from "../helper/encryption";

export class ReportsService {
  /**
   * Gera relatório de vendas PIX por período
   */
  static async generatePixReport(userId: string, startDate: Date, endDate: Date) {
    // Busca credenciais do usuário
    const user = await User.findById(userId)
      .select("+pagarme_api_key +pagarme_encryption_key");

    if (!user?.pagarme_api_key || !user?.pagarme_encryption_key) {
      throw new Error("Credenciais não configuradas");
    }

    const apiKey = decrypt(user.pagarme_api_key);
    const encryptionKey = decrypt(user.pagarme_encryption_key);

    // Cria serviço
    const pagarmeService = createPagarMeService(apiKey, encryptionKey);

    // Busca vendas do período
    const sales = await Sale.find({
      ownerId: userId,
      gateway: "pagarme",
      status: "succeeded",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Calcula métricas
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmountInCents, 0);
    const totalSales = sales.length;
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Agrupa por dia
    const salesByDay = sales.reduce((acc, sale) => {
      const day = sale.createdAt.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = { count: 0, revenue: 0 };
      }
      acc[day].count++;
      acc[day].revenue += sale.totalAmountInCents;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return {
      period: { start: startDate, end: endDate },
      metrics: {
        totalRevenue,
        totalSales,
        averageTicket,
      },
      salesByDay,
      sales: sales.map(sale => ({
        id: sale._id,
        orderId: sale.pagarme_order_id,
        customerName: sale.customerName,
        customerEmail: sale.customerEmail,
        amount: sale.totalAmountInCents,
        date: sale.createdAt,
      })),
    };
  }
}

// Uso
const report = await ReportsService.generatePixReport(
  userId,
  new Date('2026-01-01'),
  new Date('2026-01-31')
);

console.log(`Receita Total: R$ ${(report.metrics.totalRevenue / 100).toFixed(2)}`);
console.log(`Total de Vendas: ${report.metrics.totalSales}`);
console.log(`Ticket Médio: R$ ${(report.metrics.averageTicket / 100).toFixed(2)}`);
```

### 7. Middleware de Validação

```typescript
// middleware/validatePixPayment.ts

import { Request, Response, NextFunction } from "express";
import Offer from "../models/offer.model";

/**
 * Middleware para validar requisição de pagamento PIX
 */
export const validatePixPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { offerSlug, contactInfo } = req.body;

    // Valida campos obrigatórios
    if (!offerSlug) {
      return res.status(400).json({
        error: { message: "Slug da oferta é obrigatório" },
      });
    }

    if (!contactInfo?.name || !contactInfo?.email || !contactInfo?.document) {
      return res.status(400).json({
        error: { message: "Dados do cliente incompletos" },
      });
    }

    // Valida CPF
    const cpf = contactInfo.document.replace(/\D/g, '');
    if (cpf.length !== 11) {
      return res.status(400).json({
        error: { message: "CPF inválido" },
      });
    }

    // Valida email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      return res.status(400).json({
        error: { message: "Email inválido" },
      });
    }

    // Verifica se a oferta existe e tem PIX ativo
    const offer = await Offer.findOne({ slug: offerSlug });
    if (!offer) {
      return res.status(404).json({
        error: { message: "Oferta não encontrada" },
      });
    }

    if (!offer.pagarme_pix_enabled) {
      return res.status(400).json({
        error: { message: "PIX não está ativo para esta oferta" },
      });
    }

    next();
  } catch (error: any) {
    res.status(500).json({
      error: { message: error.message },
    });
  }
};

// Uso nas rotas
import { validatePixPayment } from "../middleware/validatePixPayment";

router.post("/pix", validatePixPayment, createPixPayment);
```

### 8. Testes Unitários

```typescript
// tests/pagarme.service.test.ts

import { createPagarMeService } from "../services/pagarme.service";

describe("PagarMeService", () => {
  const apiKey = "sk_test_abc123";
  const encryptionKey = "ek_test_xyz789";

  it("deve criar um pedido PIX", async () => {
    const service = createPagarMeService(apiKey, encryptionKey);

    const order = await service.createPixOrder({
      amount: 9900,
      customerName: "João Silva",
      customerEmail: "joao@exemplo.com",
      customerDocument: "12345678900",
      offerId: "offer_123",
      userId: "user_123",
      items: [
        { name: "Produto Teste", quantity: 1, amount: 9900 },
      ],
    });

    expect(order.orderId).toBeDefined();
    expect(order.qrCode).toBeDefined();
    expect(order.amount).toBe(9900);
  });

  it("deve validar credenciais", async () => {
    const service = createPagarMeService(apiKey, encryptionKey);
    const isValid = await service.validateCredentials();
    expect(isValid).toBe(true);
  });

  it("deve calcular receita", async () => {
    const service = createPagarMeService(apiKey, encryptionKey);
    
    const revenue = await service.calculateRevenue(
      "user_123",
      new Date("2026-01-01"),
      new Date("2026-01-31")
    );

    expect(revenue).toBeGreaterThanOrEqual(0);
  });
});
```

## 🎯 Conclusão

Estes exemplos cobrem os casos de uso mais comuns da integração Pagar.me PIX. Para mais detalhes, consulte a documentação completa em [PAGARME_INTEGRATION.md](./PAGARME_INTEGRATION.md).
