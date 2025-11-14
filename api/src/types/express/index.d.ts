// src/types/express/index.d.ts
// Este arquivo adiciona 'userId' ao tipo 'Request' do Express
declare namespace Express {
  export interface Request {
    userId?: string;
  }
}
