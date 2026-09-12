# ==============================================================================
# Task Management Backend - Production Multi-Stage Dockerfile
# Stage 1: Install production dependencies in an isolated container
# Stage 2: Create minimal, secure, non-root Node.js 20 Alpine runtime
# ==============================================================================

# --- Stage 1: Dependency Installation ---
FROM node:20-alpine AS deps

# Set working directory for installing dependencies
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies (--omit=dev ignores @types/* packages)
RUN npm ci --omit=dev || npm install --omit=dev

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner

# Set working directory for the application
WORKDIR /app

# Set NODE_ENV to production for optimal performance and framework behavior
ENV NODE_ENV=production

# Copy installed production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package manifest for runtime reference
COPY package*.json ./

# Copy application source code (routes, db client, app, entrypoint)
COPY src ./src

# Switch to the pre-existing unprivileged 'node' user for security hardening
USER node

# Document the listening port (5000 for backend REST API)
EXPOSE 5000

# Docker healthcheck using Alpine's built-in wget against /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the Node.js Express server
CMD ["node", "src/index.js"]
