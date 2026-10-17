# Multi-Stage Production Dockerfile for Google Cloud Run
# Stage 1: Build Frontend (React + Vite + Tailwind + Recharts)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend (TypeScript + Express + BigQuery + Gemini)
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
RUN npm run build

# Stage 3: Production Runner for Cloud Run
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built backend code
COPY --from=backend-builder /app/backend/dist ./dist

# Copy catalog data
COPY --from=backend-builder /app/backend/src/data ./data
COPY --from=backend-builder /app/backend/src/data ./dist/data

# Copy built frontend assets into public & frontend/dist for unified serving
COPY --from=frontend-builder /app/frontend/dist ./public
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8080

CMD ["node", "dist/server.js"]
