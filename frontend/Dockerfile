# ═══════════════════════════════════════════════
# Frontend — Vite build → Nginx serve
# ═══════════════════════════════════════════════

# --- Stage 1: Build ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

# Copiar build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Config de Nginx para SPA (redirigir todo a index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
