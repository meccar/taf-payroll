# Build stage
FROM node:22-alpine3.21 AS builder

WORKDIR /app

# Install yarn classic (v1) for compatibility with existing yarn.lock
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (skip husky prepare script)
RUN yarn install --frozen-lockfile --ignore-scripts || yarn install --ignore-scripts

# Copy source code
COPY . .

# Build application
RUN yarn build

# Production stage
FROM node:22-alpine3.21 AS production

WORKDIR /app

# Install yarn classic (v1) for compatibility with existing yarn.lock
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only (skip husky prepare script)
RUN yarn install --frozen-lockfile --production --ignore-scripts || yarn install --production --ignore-scripts

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]
