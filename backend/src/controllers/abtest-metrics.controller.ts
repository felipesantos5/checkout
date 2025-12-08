// src/controllers/abtest-metrics.controller.ts
import { Request, Response } from "express";
import ABTest from "../models/abtest.model";
import ABTestView from "../models/abtestview.model";
import Sale from "../models/sale.model";
import { Types } from "mongoose";

interface OfferMetrics {
  offerId: string;
  offerName: string;
  percentage: number;
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
  averageTicket: number;
}

interface DailyMetric {
  date: string;
  offerId: string;
  offerName: string;
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}

/**
 * Controller para buscar métricas agregadas de um teste A/B
 */
export const handleGetABTestMetrics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId!;
    const { startDate, endDate } = req.query;

    // Busca o teste A/B
    const test = await ABTest.findOne({
      _id: new Types.ObjectId(id),
      ownerId: new Types.ObjectId(ownerId),
    }).populate("offers.offerId", "name slug mainProduct");

    if (!test) {
      return res.status(404).json({ error: { message: "Teste A/B não encontrado." } });
    }

    // Define período de análise
    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.setDate(now.getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    // Busca views por oferta
    const viewsByOffer = await ABTestView.aggregate([
      {
        $match: {
          abTestId: test._id,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$offerId",
          views: { $sum: 1 },
        },
      },
    ]);

    // Busca vendas por oferta (apenas vendas deste teste A/B)
    const salesByOffer = await Sale.aggregate([
      {
        $match: {
          abTestId: test._id,
          status: "succeeded",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$offerId",
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmountInCents" },
        },
      },
    ]);

    // Mapeia para fácil acesso
    const viewsMap = new Map(viewsByOffer.map((v) => [v._id.toString(), v.views]));
    const salesMap = new Map(
      salesByOffer.map((s) => [s._id.toString(), { sales: s.sales, revenue: s.revenue }])
    );

    // Constrói métricas por oferta
    const offerMetrics: OfferMetrics[] = test.offers.map((offer) => {
      const populatedOffer = offer.offerId as any;
      const offerId = populatedOffer._id.toString();
      const views = viewsMap.get(offerId) || 0;
      const salesData = salesMap.get(offerId) || { sales: 0, revenue: 0 };

      return {
        offerId,
        offerName: populatedOffer.name,
        percentage: offer.percentage,
        views,
        sales: salesData.sales,
        revenue: salesData.revenue,
        conversionRate: views > 0 ? (salesData.sales / views) * 100 : 0,
        averageTicket: salesData.sales > 0 ? salesData.revenue / salesData.sales : 0,
      };
    });

    // Calcula totais
    const totals = {
      views: offerMetrics.reduce((sum, o) => sum + o.views, 0),
      sales: offerMetrics.reduce((sum, o) => sum + o.sales, 0),
      revenue: offerMetrics.reduce((sum, o) => sum + o.revenue, 0),
      conversionRate: 0,
      averageTicket: 0,
    };

    totals.conversionRate = totals.views > 0 ? (totals.sales / totals.views) * 100 : 0;
    totals.averageTicket = totals.sales > 0 ? totals.revenue / totals.sales : 0;

    // Busca dados diários para gráficos
    const dailyViews = await ABTestView.aggregate([
      {
        $match: {
          abTestId: test._id,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            offerId: "$offerId",
          },
          views: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const dailySales = await Sale.aggregate([
      {
        $match: {
          abTestId: test._id,
          status: "succeeded",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            offerId: "$offerId",
          },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmountInCents" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Gera todas as datas no período
    const dates: string[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Mapa de nomes de ofertas
    const offerNamesMap = new Map(
      test.offers.map((o) => [(o.offerId as any)._id.toString(), (o.offerId as any).name])
    );

    // Organiza dados diários por oferta
    const dailyData: { [offerId: string]: DailyMetric[] } = {};

    test.offers.forEach((offer) => {
      const offerId = (offer.offerId as any)._id.toString();
      dailyData[offerId] = dates.map((date) => {
        const viewData = dailyViews.find(
          (v) => v._id.date === date && v._id.offerId.toString() === offerId
        );
        const saleData = dailySales.find(
          (s) => s._id.date === date && s._id.offerId.toString() === offerId
        );

        const views = viewData?.views || 0;
        const sales = saleData?.sales || 0;
        const revenue = saleData?.revenue || 0;

        return {
          date,
          offerId,
          offerName: offerNamesMap.get(offerId) || "Unknown",
          views,
          sales,
          revenue,
          conversionRate: views > 0 ? (sales / views) * 100 : 0,
        };
      });
    });

    // Encontra o melhor performer por conversão
    const bestByConversion = offerMetrics.reduce(
      (best, current) => (current.conversionRate > best.conversionRate ? current : best),
      offerMetrics[0]
    );

    // Encontra o melhor performer por revenue
    const bestByRevenue = offerMetrics.reduce(
      (best, current) => (current.revenue > best.revenue ? current : best),
      offerMetrics[0]
    );

    res.status(200).json({
      abTestId: (test._id as Types.ObjectId).toString(),
      abTestName: test.name,
      dateRange: { start, end },
      offers: offerMetrics,
      totals,
      dailyData,
      bestPerformers: {
        byConversion: bestByConversion?.offerId,
        byRevenue: bestByRevenue?.offerId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { message: (error as Error).message } });
  }
};
