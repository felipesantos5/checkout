// src/webhooks/stripe/handlers/payment-intent.handler.ts
import { Stripe } from "stripe";
import Sale from "../../../models/sale.model";
import Offer from "../../../models/offer.model";
import { sendSaleToExternalAPI } from "../../../services/external-api.service";

/**
 * Handler para quando um pagamento é aprovado
 * 1. Busca os dados da oferta usando o metadata
 * 2. Salva a venda no banco de dados
 * 3. Dispara notificação para API externa
 */
export const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`💰 NOVA VENDA RECEBIDA!`);
    console.log(`${"=".repeat(80)}`);
    console.log(`🆔 Payment Intent ID: ${paymentIntent.id}`);
    console.log(`💵 Valor Total: R$ ${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`📅 Data/Hora: ${new Date().toLocaleString("pt-BR")}`);

    // 1. Extrai metadados
    const metadata = paymentIntent.metadata;
    console.log(`\n📋 METADADOS RECEBIDOS:`);
    console.log(JSON.stringify(metadata, null, 2));

    const offerSlug = metadata.offerSlug;
    const customerEmail = metadata.customerEmail;
    const customerName = metadata.customerName;
    const selectedOrderBumps = metadata.selectedOrderBumps ? JSON.parse(metadata.selectedOrderBumps) : [];

    if (!offerSlug) {
      throw new Error("Metadata 'offerSlug' não encontrado no PaymentIntent");
    }

    console.log(`\n🔍 BUSCANDO OFERTA: ${offerSlug}`);

    // 2. Busca a oferta completa
    const offer = await Offer.findOne({ slug: offerSlug }).populate("ownerId");
    if (!offer) {
      throw new Error(`Oferta com slug '${offerSlug}' não encontrada`);
    }

    // Extrai informações do vendedor
    const owner = offer.ownerId as any;
    console.log(`\n👤 VENDEDOR IDENTIFICADO:`);
    console.log(`   Nome: ${owner.name}`);
    console.log(`   Email: ${owner.email}`);
    console.log(`   ID: ${owner._id}`);
    console.log(`   Stripe Account: ${owner.stripeAccountId || "N/A"}`);

    console.log(`\n🛒 OFERTA:`);
    console.log(`   Nome: ${offer.name}`);
    console.log(`   Slug: ${offer.slug}`);
    console.log(`   ID: ${offer._id}`);

    // 3. Monta a lista de itens comprados
    console.log(`\n📦 ITENS DA COMPRA:`);
    const items = [
      {
        name: offer.mainProduct.name,
        priceInCents: offer.mainProduct.priceInCents,
        isOrderBump: false,
      },
    ];
    console.log(`   ✓ Produto Principal: ${offer.mainProduct.name} - R$ ${(offer.mainProduct.priceInCents / 100).toFixed(2)}`);

    // Adiciona os order bumps selecionados
    for (const bumpId of selectedOrderBumps) {
      const bump = offer.orderBumps.find((b: any) => b._id.toString() === bumpId);
      if (bump) {
        items.push({
          name: bump.name,
          priceInCents: bump.priceInCents,
          isOrderBump: true,
        });
        console.log(`   ✓ Order Bump: ${bump.name} - R$ ${(bump.priceInCents / 100).toFixed(2)}`);
      }
    }

    // 4. Verifica se a venda já foi registrada (idempotência)
    const existingSale = await Sale.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (existingSale) {
      console.log(`\n⚠️  VENDA DUPLICADA DETECTADA!`);
      console.log(`   Esta venda já foi processada anteriormente.`);
      console.log(`   ID da venda existente: ${existingSale._id}`);
      console.log(`${"=".repeat(80)}\n`);
      return;
    }

    // 5. Calcula a taxa da plataforma (já vem do application_fee_amount)
    const platformFeeInCents = paymentIntent.application_fee_amount || 0;

    console.log(`\n💰 VALORES:`);
    console.log(`   Total da venda: R$ ${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`   Taxa da plataforma (5%): R$ ${(platformFeeInCents / 100).toFixed(2)}`);
    console.log(`   Valor do vendedor: R$ ${((paymentIntent.amount - platformFeeInCents) / 100).toFixed(2)}`);

    // 6. Cria o registro da venda no banco
    console.log(`\n💾 SALVANDO NO BANCO DE DADOS...`);
    const sale = await Sale.create({
      ownerId: offer.ownerId,
      offerId: offer._id,
      stripePaymentIntentId: paymentIntent.id,
      customerName,
      customerEmail,
      totalAmountInCents: paymentIntent.amount,
      platformFeeInCents,
      status: "succeeded",
      items,
    });

    console.log(`✅ Venda salva com sucesso!`);
    console.log(`   ID da venda: ${sale._id}`);

    // 7. Dispara para API externa
    console.log(`\n📡 ENVIANDO PARA API EXTERNA...`);
    try {
      await sendSaleToExternalAPI(sale, offer);
      console.log(`✅ Enviado para API externa com sucesso!`);
    } catch (apiError: any) {
      console.error(`❌ Erro ao enviar para API externa: ${apiError.message}`);
      console.log(`⚠️  A venda foi salva no banco, mas não foi enviada para API externa`);
      // Não falha o webhook se a API externa falhar
      // A venda já foi salva no banco
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log(`🎉 VENDA PROCESSADA COM SUCESSO!`);
    console.log(`${"=".repeat(80)}\n`);
  } catch (error: any) {
    console.error(`\n${"=".repeat(80)}`);
    console.error(`❌ ERRO AO PROCESSAR VENDA!`);
    console.error(`${"=".repeat(80)}`);
    console.error(`Erro: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error(`${"=".repeat(80)}\n`);
    throw error; // Re-lança o erro para que o Stripe tente novamente
  }
};
