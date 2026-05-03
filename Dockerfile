# Multi-stage builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts && npm cache clean --force
COPY . .
RUN npm run build && npm run build:db && npm prune --omit=dev

# Runtime stage
FROM node:20-alpine AS runtime
RUN addgroup -g 1001 -S ansvar && adduser -u 1001 -S ansvar -G ansvar
WORKDIR /app
COPY --from=builder --chown=ansvar:ansvar /app/dist ./dist
COPY --from=builder --chown=ansvar:ansvar /app/node_modules ./node_modules
COPY --from=builder --chown=ansvar:ansvar /app/data/database.db ./data/database.db
COPY --from=builder --chown=ansvar:ansvar /app/package.json ./
USER ansvar
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
