# Multi-stage build for Property Studio
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json turbo.json ./
COPY theme/package.json theme/
COPY property/web/package.json property/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY theme/ theme/
COPY property/web/ property/web/

# Build
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files
COPY --from=builder /app/property/web/dist ./dist
COPY --from=builder /app/property/web/api/dist ./api/dist
COPY --from=builder /app/property/web/package.json ./

# Install production dependencies only
RUN npm install --production

EXPOSE 3030

CMD ["npm", "start"]
