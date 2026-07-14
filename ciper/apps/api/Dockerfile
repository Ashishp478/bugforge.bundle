FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

ENV CI=true

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --prod --filter @bugforge/api

FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --prod --filter @bugforge/api

COPY --from=build /app/apps/api/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]