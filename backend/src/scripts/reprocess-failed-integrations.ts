/**
 * Script para reprocessar integrações falhadas
 *
 * Este script busca vendas com status "succeeded" mas que não tiveram
 * as integrações enviadas com sucesso (Facebook, Husky, UTMfy).
 *
 * Uso:
 * npm run ts-node src/scripts/reprocess-failed-integrations.ts
 *
 * Flags opcionais:
 * --dry-run: Apenas lista as vendas sem reprocessar
 * --limit=N: Limita o número de vendas a processar
 * --date-from=YYYY-MM-DD: Filtra vendas a partir desta data
 * --date-to=YYYY-MM-DD: Filtra vendas até esta data
 */

import "dotenv/config";
import mongoose from "mongoose";
import Sale from "../models/sale.model";
import Offer from "../models/offer.model";
import { sendAccessWebhook } from "../services/integration.service";
import { createFacebookUserData, sendFacebookEvent } from "../services/facebook.service";
import { processUtmfyIntegrationForPayPal } from "../services/utmfy.service";

// Parse argumentos da linha de comando
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const dateFromArg = args.find((arg) => arg.startsWith("--date-from="));
const dateToArg = args.find((arg) => arg.startsWith("--date-to="));

const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 1000;
const dateFrom = dateFromArg ? new Date(dateFromArg.split("=")[1]) : null;
const dateTo = dateToArg ? new Date(dateToArg.split("=")[1]) : null;

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Script de Reprocessamento de Integrações Falhadas           ║
╚════════════════════════════════════════════════════════════════╝

Modo: ${isDryRun ? "DRY RUN (não vai reprocessar)" : "PRODUÇÃO (vai reprocessar)"}
Limite: ${limit} vendas
Data de: ${dateFrom ? dateFrom.toISOString() : "não filtrado"}
Data até: ${dateTo ? dateTo.toISOString() : "não filtrado"}

`);

/**
 * Reenvia evento Purchase para o Facebook CAPI
 */
const resendFacebookEvent = async (offer: any, sale: any, items: any[]): Promise<boolean> => {
  try {
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

    if (pixels.length === 0) {
      console.log(`   ℹ️  Sem pixels configurados`);
      return true; // Considera sucesso se não houver pixels
    }

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
      event_id: `reprocess_${sale._id}`,
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

    const results = await Promise.allSettled(
      pixels.map((pixel) =>
        sendFacebookEvent(pixel.pixelId, pixel.accessToken, eventData).catch((err) => {
          console.error(`   ❌ Erro Facebook pixel ${pixel.pixelId}:`, err.message);
          throw err;
        })
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`   📊 Facebook: ${successful} sucesso, ${failed} falhas de ${pixels.length} pixels`);
    return successful > 0;
  } catch (error: any) {
    console.error(`   ❌ Erro ao enviar Facebook:`, error.message);
    return false;
  }
};

/**
 * Reenvia webhook para Husky/área de membros
 */
const resendHuskyWebhook = async (offer: any, sale: any, items: any[]): Promise<boolean> => {
  try {
    await sendAccessWebhook(offer, sale, items, sale.customerPhone || "");
    console.log(`   ✅ Husky webhook reenviado`);
    return true;
  } catch (error: any) {
    console.error(`   ❌ Erro ao enviar Husky:`, error.message);
    return false;
  }
};

/**
 * Reenvia webhook para UTMfy
 */
const resendUtmfyWebhook = async (offer: any, sale: any, items: any[]): Promise<boolean> => {
  try {
    const paypalOrderId = sale.stripePaymentIntentId.replace("PAYPAL_", "").replace("UPSELL_", "");

    await processUtmfyIntegrationForPayPal(
      offer,
      sale,
      items,
      paypalOrderId,
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
    console.log(`   ✅ UTMfy webhook reenviado`);
    return true;
  } catch (error: any) {
    console.error(`   ❌ Erro ao enviar UTMfy:`, error.message);
    return false;
  }
};

/**
 * Reprocessa uma única venda
 */
const reprocessSale = async (sale: any): Promise<void> => {
  console.log(`\n📦 Venda ${sale._id} (${sale.customerEmail})`);
  console.log(`   Data: ${sale.createdAt.toISOString()}`);
  console.log(`   Valor: ${sale.totalAmountInCents / 100} ${sale.currency}`);
  console.log(`   Status: ${sale.status}`);
  console.log(`   Integrações:`);
  console.log(`     - Facebook: ${sale.integrationsFacebookSent ? "✅" : "❌"}`);
  console.log(`     - Husky: ${sale.integrationsHuskySent ? "✅" : "❌"}`);
  console.log(`     - UTMfy: ${sale.integrationsUtmfySent ? "✅" : "❌"}`);

  if (isDryRun) {
    console.log(`   ⏭️  DRY RUN - pulando reprocessamento`);
    return;
  }

  // Buscar oferta
  const offer = await Offer.findById(sale.offerId).populate("ownerId");
  if (!offer) {
    console.error(`   ❌ Oferta não encontrada`);
    return;
  }

  // Montar items
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

  sale.integrationsLastAttempt = new Date();

  // Reenviar Facebook se necessário
  if (!sale.integrationsFacebookSent) {
    const success = await resendFacebookEvent(offer, sale, items);
    sale.integrationsFacebookSent = success;
  }

  // Reenviar Husky se necessário
  if (!sale.integrationsHuskySent) {
    const success = await resendHuskyWebhook(offer, sale, items);
    sale.integrationsHuskySent = success;
  }

  // Reenviar UTMfy se necessário
  if (!sale.integrationsUtmfySent) {
    const success = await resendUtmfyWebhook(offer, sale, items);
    sale.integrationsUtmfySent = success;
  }

  // Salvar alterações
  await sale.save();

  console.log(`   ✅ Reprocessamento concluído`);
  console.log(`   📊 Status final:`);
  console.log(`     - Facebook: ${sale.integrationsFacebookSent ? "✅" : "❌"}`);
  console.log(`     - Husky: ${sale.integrationsHuskySent ? "✅" : "❌"}`);
  console.log(`     - UTMfy: ${sale.integrationsUtmfySent ? "✅" : "❌"}`);
};

/**
 * Função principal
 */
const main = async (): Promise<void> => {
  try {
    // Conectar ao MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI não configurado no .env");
    }

    console.log("🔌 Conectando ao MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado ao MongoDB\n");

    // Montar filtro de query
    const query: any = {
      status: "succeeded",
      $or: [
        { integrationsFacebookSent: { $ne: true } },
        { integrationsHuskySent: { $ne: true } },
        { integrationsUtmfySent: { $ne: true } },
      ],
    };

    // Filtrar por data se necessário
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = dateFrom;
      if (dateTo) query.createdAt.$lte = dateTo;
    }

    // Buscar vendas que precisam ser reprocessadas
    console.log("🔍 Buscando vendas que precisam ser reprocessadas...\n");
    const sales = await Sale.find(query).sort({ createdAt: -1 }).limit(limit);

    console.log(`📊 Encontradas ${sales.length} vendas para reprocessar\n`);

    if (sales.length === 0) {
      console.log("✅ Nenhuma venda precisa ser reprocessada!");
      return;
    }

    // Estatísticas
    const stats = {
      total: sales.length,
      facebookMissing: sales.filter((s) => !s.integrationsFacebookSent).length,
      huskyMissing: sales.filter((s) => !s.integrationsHuskySent).length,
      utmfyMissing: sales.filter((s) => !s.integrationsUtmfySent).length,
    };

    console.log(`📈 Estatísticas:`);
    console.log(`   - Total de vendas: ${stats.total}`);
    console.log(`   - Faltando Facebook: ${stats.facebookMissing}`);
    console.log(`   - Faltando Husky: ${stats.huskyMissing}`);
    console.log(`   - Faltando UTMfy: ${stats.utmfyMissing}`);

    // Reprocessar cada venda
    let processedCount = 0;
    let errorCount = 0;

    for (const sale of sales) {
      try {
        await reprocessSale(sale);
        processedCount++;
      } catch (error: any) {
        console.error(`\n❌ Erro ao reprocessar venda ${sale._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n
╔════════════════════════════════════════════════════════════════╗
║  Reprocessamento Concluído                                     ║
╚════════════════════════════════════════════════════════════════╝

📊 Resumo:
   - Vendas processadas: ${processedCount}
   - Vendas com erro: ${errorCount}
   - Total: ${sales.length}

${isDryRun ? "⚠️  DRY RUN - Nenhuma alteração foi feita no banco de dados" : "✅ Alterações salvas no banco de dados"}
`);
  } catch (error: any) {
    console.error("❌ Erro fatal:", error.message);
    process.exit(1);
  } finally {
    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log("🔌 Desconectado do MongoDB");
  }
};

// Executar script
main();
