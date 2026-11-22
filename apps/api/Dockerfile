FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package*.json ./
COPY packages/contracts/package*.json ./packages/contracts/
COPY packages/db/package*.json ./packages/db/
COPY apps/api/package*.json ./apps/api/
RUN npm ci

COPY packages/contracts ./packages/contracts
COPY packages/db ./packages/db
COPY apps/api ./apps/api
COPY tsconfig.base.json ./

RUN npm run build --workspace=@lab/contracts
RUN npm run build --workspace=@lab/db
RUN npm run build --workspace=@lab/api

FROM base AS runner
ENV NODE_ENV=production
COPY package*.json ./
COPY packages/contracts/package*.json ./packages/contracts/
COPY packages/db/package*.json ./packages/db/
COPY apps/api/package*.json ./apps/api/
RUN npm ci --omit=dev

COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 5000
CMD ["node", "apps/api/dist/server.js"]
