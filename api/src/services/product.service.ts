// src/services/product.service.ts
import Product, { IProduct } from "../models/product.model";

// Interface para o payload de criação
export type CreateProductPayload = {
  name: string;
  description?: string;
  imageUrl: string;
  priceInCents: number;
};

/**
 * Cria um novo produto no banco de dados.
 */
export const createProduct = async (
  payload: CreateProductPayload,
  ownerId: string // <-- Exige o dono
): Promise<IProduct> => {
  try {
    const product = new Product({
      ...payload,
      ownerId, // Associa ao dono
    });
    await product.save();
    return product;
  } catch (error) {
    throw new Error("Falha ao salvar produto.");
  }
};

/**
 * Busca um produto pelo seu ID, garantindo que pertence ao dono.
 */
export const getProductById = async (
  id: string,
  ownerId: string // <-- Exige o dono
): Promise<IProduct | null> => {
  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

    const product = await Product.findOne({
      _id: id,
      ownerId: ownerId, // <-- Garante a posse
    });
    return product;
  } catch (error) {
    throw new Error("Falha ao buscar produto.");
  }
};

/**
 * Lista todos os produtos de um usuário.
 */
export const listProductsByOwner = async (ownerId: string): Promise<IProduct[]> => {
  try {
    const products = await Product.find({ ownerId });
    return products;
  } catch (error) {
    throw new Error("Falha ao listar produtos.");
  }
};
