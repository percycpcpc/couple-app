FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy Prisma schema and migrations so migrate deploy works
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Make the Prisma CLI available in the runner stage for migrations
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

# Run migrations before starting the app
CMD node node_modules/prisma/build/index.js migrate deploy && node server.js
