// src/webhooks/pagarme/handlers/order-paid.handler.ts
import Sale from "../../../models/sale.model";
import Offer from "../../../models/offer.model";
import axios from "axios";

/**
 * Handler para o evento order.paid da Pagar.me
 * Chamado quando um pagamento PIX é confirmado
 */
export const handleOrderPaid = async (eventData: any) => {
  try {
    const orderId = eventData.id;
    const orderStatus = eventData.status;

    console.log(`[Pagar.me Webhook] Processando order.paid: orderId=${orderId}, status=${orderStatus}`);

    // Busca a venda pelo orderId
    const sale = await Sale.findOne({ pagarme_order_id: orderId });
    if (!sale) {
      console.warn(`[Pagar.me Webhook] Venda não encontrada para orderId=${orderId}`);
      return;
    }

    // Verifica se a venda já foi processada
    if (sale.status === "succeeded") {
      console.log(`[Pagar.me Webhook] Venda já processada: saleId=${sale._id}`);
      return;
    }

    // Atualiza o status da venda para succeeded
    sale.status = "succeeded";
    await sale.save();

    console.log(`[Pagar.me Webhook] Venda atualizada para succeeded: saleId=${sale._id}`);

    // Busca a oferta para obter configurações de integração
    const offer = await Offer.findById(sale.offerId);
    if (!offer) {
      console.warn(`[Pagar.me Webhook] Oferta não encontrada: offerId=${sale.offerId}`);
      return;
    }

    // Dispara webhooks de integração (UTMfy, Membership, etc.)
    await triggerIntegrationWebhooks(sale, offer);

    console.log(`[Pagar.me Webhook] Processamento concluído para orderId=${orderId}`);
  } catch (error: any) {
    console.error(`[Pagar.me Webhook] Erro ao processar order.paid:`, error);
    throw error; // Re-throw para que o webhook seja retentado
  }
};

/**
 * Dispara os webhooks de integração configurados na oferta
 */
const triggerIntegrationWebhooks = async (sale: any, offer: any) => {
  const webhookPromises: Promise<void>[] = [];

  // UTMfy Webhooks
  if (offer.utmfyWebhookUrls && offer.utmfyWebhookUrls.length > 0) {
    for (const webhookUrl of offer.utmfyWebhookUrls) {
      if (webhookUrl && webhookUrl.trim() !== "") {
        webhookPromises.push(sendUtmfyWebhook(webhookUrl, sale, offer));
      }
    }
  }

  // Webhook de UTMfy legado (retrocompatibilidade)
  if (offer.utmfyWebhookUrl && offer.utmfyWebhookUrl.trim() !== "") {
    webhookPromises.push(sendUtmfyWebhook(offer.utmfyWebhookUrl, sale, offer));
  }

  // Membership Webhook
  if (offer.membershipWebhook?.enabled && offer.membershipWebhook?.url) {
    webhookPromises.push(sendMembershipWebhook(offer.membershipWebhook, sale, offer));
  }

  // Aguarda todos os webhooks serem enviados
  await Promise.allSettled(webhookPromises);
};

/**
 * Envia webhook para UTMfy
 */
const sendUtmfyWebhook = async (webhookUrl: string, sale: any, offer: any) => {
  try {
    const payload = {
      event: "sale.succeeded",
      gateway: "pagarme",
      sale_id: sale._id.toString(),
      order_id: sale.pagarme_order_id,
      customer_name: sale.customerName,
      customer_email: sale.customerEmail,
      amount: sale.totalAmountInCents,
      currency: sale.currency,
      offer_slug: offer.slug,
      offer_name: offer.name,
      items: sale.items,
      created_at: sale.createdAt,
    };

    console.log(`[Pagar.me Webhook] Enviando webhook UTMfy: ${webhookUrl}`);

    await axios.post(webhookUrl, payload, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`[Pagar.me Webhook] Webhook UTMfy enviado com sucesso`);
  } catch (error: any) {
    console.error(`[Pagar.me Webhook] Erro ao enviar webhook UTMfy:`, error.message);
    // Não re-throw para não bloquear outros webhooks
  }
};

/**
 * Envia webhook para sistema de membership
 */
const sendMembershipWebhook = async (membershipConfig: any, sale: any, offer: any) => {
  try {
    const payload = {
      event: "member.created",
      gateway: "pagarme",
      sale_id: sale._id.toString(),
      order_id: sale.pagarme_order_id,
      customer_name: sale.customerName,
      customer_email: sale.customerEmail,
      offer_slug: offer.slug,
      offer_name: offer.name,
      custom_id: offer.customId || "",
      created_at: sale.createdAt,
    };

    console.log(`[Pagar.me Webhook] Enviando webhook Membership: ${membershipConfig.url}`);

    await axios.post(membershipConfig.url, payload, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${membershipConfig.authToken}`,
      },
    });

    console.log(`[Pagar.me Webhook] Webhook Membership enviado com sucesso`);
  } catch (error: any) {
    console.error(`[Pagar.me Webhook] Erro ao enviar webhook Membership:`, error.message);
    // Não re-throw para não bloquear outros webhooks
  }
};
