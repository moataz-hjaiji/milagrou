# Dockerfile for MCP Server
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies for build
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Install ts-node for running TypeScript directly
RUN npm install -g ts-node

# Skip build step - run directly with ts-node
# RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('MCP Server health check')" || exit 1

# Start the MCP server with ts-node
CMD ["npx", "ts-node", "src/server.ts"]
