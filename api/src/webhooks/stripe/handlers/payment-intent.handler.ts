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
    console.log(`\n💰 Processando pagamento aprovado: ${paymentIntent.id}`);

    // 1. Extrai metadados
    const metadata = paymentIntent.metadata;
    const offerSlug = metadata.offerSlug;
    const customerEmail = metadata.customerEmail;
    const customerName = metadata.customerName;
    const selectedOrderBumps = metadata.selectedOrderBumps ? JSON.parse(metadata.selectedOrderBumps) : [];

    if (!offerSlug) {
      throw new Error("Metadata 'offerSlug' não encontrado no PaymentIntent");
    }

    // 2. Busca a oferta completa
    const offer = await Offer.findOne({ slug: offerSlug }).populate("ownerId");
    if (!offer) {
      throw new Error(`Oferta com slug '${offerSlug}' não encontrada`);
    }

    // 3. Monta a lista de itens comprados
    const items = [
      {
        name: offer.mainProduct.name,
        priceInCents: offer.mainProduct.priceInCents,
        isOrderBump: false,
      },
    ];

    // Adiciona os order bumps selecionados
    for (const bumpId of selectedOrderBumps) {
      const bump = offer.orderBumps.find((b: any) => b._id.toString() === bumpId);
      if (bump) {
        items.push({
          name: bump.name,
          priceInCents: bump.priceInCents,
          isOrderBump: true,
        });
      }
    }

    // 4. Verifica se a venda já foi registrada (idempotência)
    const existingSale = await Sale.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (existingSale) {
      console.log(`✅ Venda ${paymentIntent.id} já foi registrada anteriormente. Ignorando duplicata.`);
      return;
    }

    // 5. Calcula a taxa da plataforma (já vem do application_fee_amount)
    const platformFeeInCents = paymentIntent.application_fee_amount || 0;

    // 6. Cria o registro da venda no banco
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

    console.log(`✅ Venda salva no banco: ${sale._id}`);

    // 7. Dispara para API externa
    try {
      await sendSaleToExternalAPI(sale, offer);
      console.log(`✅ Venda enviada para API externa com sucesso`);
    } catch (apiError: any) {
      console.error(`❌ Erro ao enviar venda para API externa:`, apiError.message);
      // Não falha o webhook se a API externa falhar
      // A venda já foi salva no banco
    }

    console.log(`🎉 Processamento completo do pagamento ${paymentIntent.id}\n`);
  } catch (error: any) {
    console.error(`❌ Erro ao processar payment_intent.succeeded:`, error.message);
    throw error; // Re-lança o erro para que o Stripe tente novamente
  }
};
