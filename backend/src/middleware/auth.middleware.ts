// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const protectRoute = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: { message: "Não autorizado, sem token." } });
  }

  try {
    // 1. Extrai o token do header
    const token = authHeader.split(" ")[1];

    // 2. Verifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 3. Adiciona o ID do usuário ao objeto 'req'
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ error: { message: "Não autorizado, token falhou." } });
  }
};
