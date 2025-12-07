# backend/Dockerfile

# ---- Estágio 1: Build (Compilação) ----
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# ---- Estágio 2: Produção ----
FROM node:20-slim
WORKDIR /app

# [NOVO] Instala o curl para o Healthcheck funcionar
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 4242

CMD ["yarn", "start"]