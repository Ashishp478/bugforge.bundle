# ---------- Build Stage ----------
FROM node:22-alpine AS build

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

# Copy workspace files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy package.json files
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install workspace dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build argument
ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build only the web app
RUN pnpm --filter @bugforge/web build


# ---------- Production Stage ----------
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

# Copy standalone build
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./.next/static
COPY --from=build /app/apps/web/public ./public

EXPOSE 3000

CMD ["node", "server.js"]