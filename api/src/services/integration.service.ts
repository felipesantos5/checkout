// api/src/services/integration.service.ts
import { ISale } from "../models/sale.model";
import { IOffer } from "../models/offer.model";

interface ProductItem {
  id: string;
  name: string;
}

interface MembershipPayload {
  event: "ACCESS_GRANTED";
  customer: {
    email: string;
    name: string;
    phone: string;
  };
  products: ProductItem[];
  transactionId: string;
  subscriptionId: string | null;
}

export const sendAccessWebhook = async (
  offer: IOffer,
  sale: ISale,
  items: Array<{ _id?: string; name: string; isOrderBump: boolean; customId?: string }>,
  customerPhone?: string
) => {
  if (!offer.membershipWebhook || !offer.membershipWebhook.enabled || !offer.membershipWebhook.url) {
    return;
  }

  console.log(`\n🔗 INICIANDO INTEGRAÇÃO DE ACESSO (Membership)...`);

  try {
    const productsPayload: ProductItem[] = items.map((item) => ({
      id: item.customId || item._id || "product-no-id",
      name: item.name,
    }));

    // 3. Define o subscriptionId usando o customId do produto principal (item 0)
    // Se não tiver customId, enviamos null ou vazio
    const mainItem = items[0];
    const subscriptionId = mainItem?.customId || null;

    // 4. Monta o Payload
    const payload: MembershipPayload = {
      event: "ACCESS_GRANTED",
      customer: {
        email: sale.customerEmail,
        name: sale.customerName,
        phone: customerPhone || (sale as any).customerPhone || "",
      },
      products: productsPayload,
      transactionId: sale.stripePaymentIntentId,
      subscriptionId: subscriptionId,
    };

    console.log(`📤 Enviando para: ${offer.membershipWebhook.url}`);

    const response = await fetch(offer.membershipWebhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${offer.membershipWebhook.authToken || ""}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro no Webhook de Integração: ${response.status} - ${errorText}`);
    } else {
      console.log(`✅ Integração de Acesso enviada com sucesso!`);
    }
  } catch (error: any) {
    console.error(`❌ Falha ao enviar integração: ${error.message}`);
  }
};
