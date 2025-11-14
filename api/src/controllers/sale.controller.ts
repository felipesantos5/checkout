// src/controllers/sale.controller.ts
import { Request, Response } from "express";
import Sale from "../models/sale.model";
import * as saleService from "../services/sale.service";

/**
 * Lista todas as vendas pertencentes ao usuário logado (vendedor)
 */
export const handleListMySales = async (req: Request, res: Response) => {
  try {
    const ownerId = req.userId!;
    const sales = await saleService.listMySales(ownerId); // Chama o serviço
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: { message: (error as Error).message } });
  }
};

// --- CONTROLLER NOVO ADICIONADO AQUI ---
/**
 * Lista todas as vendas de UMA OFERTA
 */
export const handleListSalesByOffer = async (req: Request, res: Response) => {
  try {
    const ownerId = req.userId!;
    const { offerId } = req.params; // Pega o ID da oferta pela URL

    if (!offerId) {
      return res.status(400).json({ error: { message: "ID da oferta é obrigatório." } });
    }

    const sales = await saleService.listSalesByOffer(ownerId, offerId);
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: { message: (error as Error).message } });
  }
};
