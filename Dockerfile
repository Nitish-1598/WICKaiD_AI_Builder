# Multi-Stage Production Dockerfile for Google Cloud Run
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy backend built files and dependencies
COPY backend/package*.json ./
RUN npm ci --only=production
COPY --from=backend-builder /app/backend/dist ./dist
COPY backend/src/data ./src/data
COPY gcp-key.json ./gcp-key.json

# Copy frontend built static files into public directory
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 8080
CMD ["node", "dist/server.js"]
