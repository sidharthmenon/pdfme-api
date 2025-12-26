############################################
# 1️⃣ Build Designer (Svelte + Vite)
############################################
FROM node:24-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build
# Output → /frontend/dist

############################################
# 2️⃣ Build Backend (Fastify API)
############################################
FROM node:24-alpine AS api-builder

WORKDIR /backend

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ .

############################################
# 3️⃣ Runtime Image (Nginx + Node)
############################################
FROM node:24-alpine

# Install nginx
RUN apk add --no-cache nginx

# --- API ---
WORKDIR /app
COPY --from=api-builder /backend /app

# --- Designer ---
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html

# --- Nginx config ---
COPY nginx.conf /etc/nginx/nginx.conf

# Expose:
# 3000 → API
# 80   → Designer
EXPOSE 80

# Start both services
CMD sh -c "nginx && node src/server.js"
