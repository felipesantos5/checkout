// src/services/abtest.service.ts
import ABTest, { IABTest, IABTestOffer } from "../models/abtest.model";
import ABTestView from "../models/abtestview.model";
import Offer from "../models/offer.model";
import { Types } from "mongoose";
import { customAlphabet } from "nanoid";

// Mesmo padrão usado nas ofertas normais
const generateSlug = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 16);

export interface CreateABTestPayload {
  name: string;
  slug?: string;
  offers: { offerId: string; percentage: number }[];
  isActive?: boolean;
}

export interface UpdateABTestPayload {
  name?: string;
  slug?: string;
  offers?: { offerId: string; percentage: number }[];
  isActive?: boolean;
}

/**
 * Valida que todas as ofertas pertencem ao mesmo owner
 */
const validateOffersOwnership = async (offerIds: string[], ownerId: string): Promise<boolean> => {
  const offers = await Offer.find({
    _id: { $in: offerIds },
    ownerId: new Types.ObjectId(ownerId),
  });
  return offers.length === offerIds.length;
};

/**
 * Cria um novo teste A/B
 */
export const createABTest = async (payload: CreateABTestPayload, ownerId: string): Promise<IABTest> => {
  const offerIds = payload.offers.map((o) => o.offerId);

  // Valida ownership das ofertas
  const ownershipValid = await validateOffersOwnership(offerIds, ownerId);
  if (!ownershipValid) {
    throw new Error("Uma ou mais ofertas não pertencem a você.");
  }

  // Valida soma das porcentagens
  const total = payload.offers.reduce((sum, o) => sum + o.percentage, 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error("A soma das porcentagens deve ser 100%.");
  }

  // Valida mínimo de ofertas
  if (payload.offers.length < 2) {
    throw new Error("O teste deve ter pelo menos 2 ofertas.");
  }

  const slug = payload.slug || generateSlug();

  // Verifica se slug já existe
  const existingSlug = await ABTest.findOne({ slug });
  if (existingSlug) {
    throw new Error("Este slug já está em uso. Por favor, escolha outro.");
  }

  // Verifica se slug já existe em ofertas normais
  const existingOffer = await Offer.findOne({ slug });
  if (existingOffer) {
    throw new Error("Este slug já está em uso por uma oferta. Por favor, escolha outro.");
  }

  const abTest = new ABTest({
    ownerId: new Types.ObjectId(ownerId),
    name: payload.name,
    slug,
    isActive: payload.isActive ?? true,
    offers: payload.offers.map((o) => ({
      offerId: new Types.ObjectId(o.offerId),
      percentage: o.percentage,
    })),
  });

  await abTest.save();
  return abTest;
};

/**
 * Lista todos os testes A/B do usuário
 */
export const listABTestsByOwner = async (ownerId: string): Promise<any[]> => {
  const tests = await ABTest.find({ ownerId: new Types.ObjectId(ownerId) })
    .populate("offers.offerId", "name slug mainProduct")
    .sort({ createdAt: -1 })
    .lean();

  // Busca métricas básicas para cada teste
  const testsWithMetrics = await Promise.all(
    tests.map(async (test) => {
      const views = await ABTestView.countDocuments({ abTestId: test._id });
      return {
        ...test,
        totalViews: views,
      };
    })
  );

  return testsWithMetrics;
};

/**
 * Busca um teste A/B por ID
 */
export const getABTestById = async (id: string, ownerId: string): Promise<IABTest | null> => {
  return ABTest.findOne({
    _id: new Types.ObjectId(id),
    ownerId: new Types.ObjectId(ownerId),
  }).populate("offers.offerId", "name slug mainProduct");
};

/**
 * Atualiza um teste A/B
 */
export const updateABTest = async (id: string, ownerId: string, payload: UpdateABTestPayload): Promise<IABTest | null> => {
  const test = await ABTest.findOne({
    _id: new Types.ObjectId(id),
    ownerId: new Types.ObjectId(ownerId),
  });

  if (!test) return null;

  if (payload.offers) {
    const offerIds = payload.offers.map((o) => o.offerId);

    // Valida ownership das ofertas
    const ownershipValid = await validateOffersOwnership(offerIds, ownerId);
    if (!ownershipValid) {
      throw new Error("Uma ou mais ofertas não pertencem a você.");
    }

    // Valida soma das porcentagens
    const total = payload.offers.reduce((sum, o) => sum + o.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new Error("A soma das porcentagens deve ser 100%.");
    }

    // Valida mínimo de ofertas
    if (payload.offers.length < 2) {
      throw new Error("O teste deve ter pelo menos 2 ofertas.");
    }

    test.offers = payload.offers.map((o) => ({
      offerId: new Types.ObjectId(o.offerId),
      percentage: o.percentage,
    })) as unknown as IABTestOffer[];
  }

  if (payload.name) test.name = payload.name;
  if (payload.isActive !== undefined) test.isActive = payload.isActive;

  if (payload.slug && payload.slug !== test.slug) {
    // Verifica se novo slug já existe
    const existingSlug = await ABTest.findOne({ slug: payload.slug, _id: { $ne: test._id } });
    if (existingSlug) {
      throw new Error("Este slug já está em uso. Por favor, escolha outro.");
    }

    const existingOffer = await Offer.findOne({ slug: payload.slug });
    if (existingOffer) {
      throw new Error("Este slug já está em uso por uma oferta. Por favor, escolha outro.");
    }

    test.slug = payload.slug;
  }

  await test.save();
  return test;
};

/**
 * Deleta um teste A/B
 */
export const deleteABTest = async (id: string, ownerId: string): Promise<boolean> => {
  const result = await ABTest.deleteOne({
    _id: new Types.ObjectId(id),
    ownerId: new Types.ObjectId(ownerId),
  });

  if (result.deletedCount > 0) {
    // Remove também as views associadas
    await ABTestView.deleteMany({ abTestId: new Types.ObjectId(id) });
    return true;
  }

  return false;
};

/**
 * Duplica um teste A/B
 */
export const duplicateABTest = async (id: string, ownerId: string): Promise<IABTest | null> => {
  const original = await ABTest.findOne({
    _id: new Types.ObjectId(id),
    ownerId: new Types.ObjectId(ownerId),
  });

  if (!original) return null;

  const newSlug = generateSlug();

  const duplicate = new ABTest({
    ownerId: original.ownerId,
    name: `${original.name} - Cópia`,
    slug: newSlug,
    isActive: false, // Duplicado começa desativado
    offers: original.offers,
  });

  await duplicate.save();
  return duplicate;
};

/**
 * Busca teste A/B por slug e randomiza uma oferta (público)
 */
export const getABTestBySlugAndRandomize = async (
  slug: string,
  ip?: string,
  userAgent?: string
): Promise<{ offer: any; abTestId: string } | null> => {
  const test = await ABTest.findOne({ slug, isActive: true }).populate({
    path: "offers.offerId",
    populate: {
      path: "ownerId",
      select: "stripeAccountId",
    },
  });

  if (!test) return null;

  // Algoritmo de randomização baseado em porcentagens
  const random = Math.random() * 100;
  let cumulative = 0;
  let selectedOffer = null;

  for (const offer of test.offers) {
    cumulative += offer.percentage;
    if (random < cumulative) {
      selectedOffer = offer;
      break;
    }
  }

  // Fallback para última oferta caso não encontre
  if (!selectedOffer) {
    selectedOffer = test.offers[test.offers.length - 1];
  }

  // Registra a view
  const populatedOffer = selectedOffer.offerId as any;
  const view = new ABTestView({
    abTestId: test._id,
    offerId: populatedOffer._id,
    ownerId: test.ownerId,
    ip: ip || "",
    userAgent: userAgent || "",
  });
  await view.save();

  return {
    offer: populatedOffer,
    abTestId: (test._id as Types.ObjectId).toString(),
  };
};

