FROM node:20-alpine AS base

# ─── Dependencies ────────────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ─── Build ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ─── Production image ────────────────────────────────────────────────────────
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema + migrations
COPY --from=builder /app/prisma ./prisma

# Copy the PINNED Prisma CLI and client from the build stage.
# Do NOT use `npx prisma` at runtime — npx would download the latest version
# (currently 7.x) which dropped support for `url = env("DATABASE_URL")`.
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

# Use local prisma binary (pinned 6.x) — never npx
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
