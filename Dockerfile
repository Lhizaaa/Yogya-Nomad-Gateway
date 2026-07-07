# ============================================================================
# Dockerfile — Multi-stage build untuk Express backend
# Base: Node.js 18 Alpine (lightweight, ~360MB final)
# ============================================================================

# ============================================================================
# STAGE 1: Builder — Install dependencies
# ============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install production dependencies (hanya production, tidak dev)
RUN npm ci --omit=dev

# ============================================================================
# STAGE 2: Production — Final minimal image
# ============================================================================
FROM node:18-alpine

# Metadata
LABEL maintainer="Yogya Nomad Gateway"
LABEL description="Express backend API untuk Yogya Nomad Gateway"

WORKDIR /app

# Copy node_modules dari builder stage (faster, cleaner)
COPY --from=builder /app/node_modules ./node_modules

# Copy server code
COPY server/ ./

# Expose port
EXPOSE 8787

# Health check — pastikan container tetap running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8787/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Environment
ENV NODE_ENV=production

# Start server
CMD ["npm", "start"]
