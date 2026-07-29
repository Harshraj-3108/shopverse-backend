# ==============================================================================
# Multi-Stage Production Dockerfile for ShopVerse Backend Engine
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Dependencies
# ------------------------------------------------------------------------------
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies only (omit devDependencies)
RUN npm ci --only=production && npm cache clean --force

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Security: Create non-root system group and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S shopverse -u 1001 -G nodejs

# Copy installed production node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy application source code and configuration files
COPY src ./src
COPY swagger.json ./swagger.json

# Create log directory and set proper ownership
RUN mkdir -p logs && chown -R shopverse:nodejs /app

# Switch to non-root user for process execution
USER shopverse

# Expose HTTP application port
EXPOSE 5000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Launch application
CMD ["node", "src/server.js"]
