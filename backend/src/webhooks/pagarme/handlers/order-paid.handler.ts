// src/webhooks/pagarme/handlers/order-paid.handler.ts
import Sale from "../../../models/sale.model";
import Offer from "../../../models/offer.model";
import { sendAccessWebhook } from "../../../services/integration.service";
import { createFacebookUserData, sendFacebookEvent } from "../../../services/facebook.service";
import { processUtmfyIntegrationForPayPal } from "../../../services/utmfy.service";

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
    sale.integrationsLastAttempt = new Date();
    await sale.save();

    console.log(`[Pagar.me Webhook] Venda atualizada para succeeded: saleId=${sale._id}`);

    // Busca a oferta para obter configurações de integração
    const offer = await Offer.findById(sale.offerId).populate("ownerId");
    if (!offer) {
      console.warn(`[Pagar.me Webhook] Oferta não encontrada: offerId=${sale.offerId}`);
      return;
    }

    // Montar items para os webhooks
    const items =
      sale.items ||
      [
        {
          _id: (offer.mainProduct as any)._id?.toString(),
          name: offer.mainProduct.name,
          priceInCents: offer.mainProduct.priceInCents,
          isOrderBump: false,
          customId: (offer.mainProduct as any).customId,
        },
      ];

    // Dispara TODAS as integrações (Facebook, Husky, UTMfy)
    await dispatchAllIntegrations(sale, offer, items);

    console.log(`[Pagar.me Webhook] Processamento concluído para orderId=${orderId}`);
  } catch (error: any) {
    console.error(`[Pagar.me Webhook] Erro ao processar order.paid:`, error);
    throw error; // Re-throw para que o webhook seja retentado
  }
};

/**
 * Dispara TODAS as integrações (Facebook, Husky, UTMfy) de forma padronizada
 */
const dispatchAllIntegrations = async (sale: any, offer: any, items: any[]) => {
  // A: Webhook de Área de Membros (Husky/MemberKit)
  try {
    await sendAccessWebhook(offer as any, sale, items, sale.customerPhone || "");
    sale.integrationsHuskySent = true;
    console.log(`✅ [Pagar.me] Webhook Husky enviado com sucesso`);
  } catch (error: any) {
    console.error(`❌ [Pagar.me] Erro ao enviar webhook Husky:`, error.message);
    sale.integrationsHuskySent = false;
  }

  // B: Facebook CAPI (Purchase Event)
  try {
    await sendFacebookPurchaseForPagarme(offer, sale, items);
    sale.integrationsFacebookSent = true;
    console.log(`✅ [Pagar.me] Evento Facebook enviado com sucesso`);
  } catch (error: any) {
    console.error(`❌ [Pagar.me] Erro ao enviar evento Facebook:`, error.message);
    sale.integrationsFacebookSent = false;
  }

  // C: Webhook de Rastreamento (UTMfy)
  try {
    await processUtmfyIntegrationForPayPal(
      offer as any,
      sale,
      items,
      sale.pagarme_order_id, // Pagar.me Order ID
      {
        email: sale.customerEmail,
        name: sale.customerName,
        phone: sale.customerPhone,
      },
      {
        ip: sale.ip,
        userAgent: sale.userAgent,
        utm_source: (sale as any).utm_source,
        utm_medium: (sale as any).utm_medium,
        utm_campaign: (sale as any).utm_campaign,
        utm_term: (sale as any).utm_term,
        utm_content: (sale as any).utm_content,
      }
    );
    sale.integrationsUtmfySent = true;
    console.log(`✅ [Pagar.me] Webhook UTMfy enviado com sucesso`);
  } catch (error: any) {
    console.error(`❌ [Pagar.me] Erro ao enviar webhook UTMfy:`, error.message);
    sale.integrationsUtmfySent = false;
  }

  // Salva as flags de integração
  await sale.save();
  console.log(`📊 [Pagar.me] Status das integrações: Husky=${sale.integrationsHuskySent}, Facebook=${sale.integrationsFacebookSent}, UTMfy=${sale.integrationsUtmfySent}`);
};

/**
 * Envia evento Purchase para o Facebook CAPI após pagamento Pagar.me
 */
const sendFacebookPurchaseForPagarme = async (offer: any, sale: any, items: any[]): Promise<void> => {
  // Coletar todos os pixels
  const pixels: Array<{ pixelId: string; accessToken: string }> = [];

  if (offer.facebookPixels && offer.facebookPixels.length > 0) {
    pixels.push(...offer.facebookPixels);
  }

  if (offer.facebookPixelId && offer.facebookAccessToken) {
    const alreadyExists = pixels.some((p) => p.pixelId === offer.facebookPixelId);
    if (!alreadyExists) {
      pixels.push({
        pixelId: offer.facebookPixelId,
        accessToken: offer.facebookAccessToken,
      });
    }
  }

  if (pixels.length === 0) return;

  const totalValue = sale.totalAmountInCents / 100;

  const userData = createFacebookUserData(
    sale.ip || "",
    sale.userAgent || "",
    sale.customerEmail,
    sale.customerPhone || "",
    sale.customerName,
    sale.fbc,
    sale.fbp,
    sale.addressCity,
    sale.addressState,
    sale.addressZipCode,
    sale.addressCountry
  );

  const eventData = {
    event_name: "Purchase" as const,
    event_time: Math.floor(new Date(sale.createdAt).getTime() / 1000),
    event_id: `pagarme_purchase_${sale._id}`,
    action_source: "website" as const,
    user_data: userData,
    custom_data: {
      currency: (sale.currency || "BRL").toUpperCase(),
      value: totalValue,
      order_id: String(sale._id),
      content_ids: items.map((i) => i._id || i.customId || "unknown"),
      content_type: "product",
    },
  };

  console.log(`🔵 [Pagar.me] Enviando Purchase para ${pixels.length} pixel(s) Facebook | Valor: ${totalValue}`);

  const results = await Promise.allSettled(
    pixels.map((pixel) =>
      sendFacebookEvent(pixel.pixelId, pixel.accessToken, eventData).catch((err) => {
        console.error(`❌ Erro Facebook pixel ${pixel.pixelId}:`, err);
        throw err;
      })
    )
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`📊 [Pagar.me] Facebook Purchase: ${successful} sucesso, ${failed} falhas de ${pixels.length} pixels`);
};
