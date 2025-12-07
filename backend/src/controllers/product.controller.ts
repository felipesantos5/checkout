// src/controllers/product.controller.ts
import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { CreateProductPayload } from "../services/product.service";

/**
 * Controller para CRIAR um novo produto.
 */
export const handleCreateProduct = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateProductPayload;
    const ownerId = req.userId!; // Garantido pelo middleware 'protectRoute'

    const product = await productService.createProduct(payload, ownerId);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: { message: (error as Error).message } });
  }
};

/**
 * Controller para BUSCAR um produto por ID.
 */
export const handleGetProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId!; // Garantido pelo middleware
    const product = await productService.getProductById(id, ownerId);

    if (!product) {
      return res.status(404).json({ error: { message: "Produto não encontrado ou não pertence a você." } });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: { message: (error as Error).message } });
  }
};

/**
 * Controller para LISTAR todos os produtos do usuário logado.
 */
export const handleListMyProducts = async (req: Request, res: Response) => {
  try {
    const ownerId = req.userId!; // Garantido pelo middleware
    const products = await productService.listProductsByOwner(ownerId);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: { message: (error as Error).message } });
  }
};
