// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const protectRoute = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 1. Extrai o token do header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verifica o token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      // 3. Adiciona o ID do usuário ao objeto 'req'
      req.userId = decoded.userId;

      next(); // Próximo
    } catch (error) {
      res.status(401).json({ error: { message: "Não autorizado, token falhou." } });
    }
  }

  if (!token) {
    res.status(401).json({ error: { message: "Não autorizado, sem token." } });
  }
};
