# ==============================================================================
# Task Management Frontend - Production Multi-Stage Dockerfile
# Stage 1: Build the React 19 + Vite Single Page Application
# Stage 2: Serve compiled static files with lightweight Nginx Alpine
# ==============================================================================

# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS builder

# Set working directory for build operations
WORKDIR /app

# Build-time argument for backend API URL (embedded by Vite into the client bundle)
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=${VITE_API_URL}

# Copy package manifests first to maximize Docker layer cache efficiency
COPY package*.json ./

# Install all dependencies (including devDependencies like Vite, React plugins, Tailwind)
RUN npm ci || npm install

# Copy application source code, Vite config, HTML, and assets
COPY . .

# Run Vite build script to compile and minify assets into /app/dist
RUN npm run build

# --- Stage 2: Production Nginx Server ---
FROM nginx:alpine

# Remove default Nginx welcome assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static distribution files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing, gzip, and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Document web server port (mapped to host port 3000 in docker-compose.yml)
EXPOSE 80

# Health check to ensure Nginx is responding on HTTP port 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Run Nginx in the foreground as PID 1
CMD ["nginx", "-g", "daemon off;"]
