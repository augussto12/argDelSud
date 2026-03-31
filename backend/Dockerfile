# ═══════════════════════════════════════════════
# Backend — Node.js + Prisma
# ═══════════════════════════════════════════════
FROM node:20-alpine

WORKDIR /app

# Copiar package files e instalar deps
COPY package*.json ./
RUN npm ci

# Copiar prisma schema y generar client
COPY prisma ./prisma
RUN npx prisma generate

# Copiar código fuente y compilar TypeScript
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/index.js"]

