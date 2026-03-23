# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo files
COPY package*.json ./
COPY server/ ./server/
COPY client/ ./client/

# Install dependencies
RUN npm ci

# Build both projects
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy only production files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules

# Install server deps only (no devDeps)
RUN cd server && npm ci --omit=dev || true

# Create data directory
RUN mkdir -p /app/data /app/certs

# Expose ports
EXPOSE 3333 5173

# Set environment
ENV NODE_ENV=production
ENV PORT=3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('https').get('https://localhost:3333/health', {rejectUnauthorized: false}, (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start server
CMD ["node", "server/dist/index.js"]
