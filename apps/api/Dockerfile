FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install deps for the whole monorepo (workspace hoisting)
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/gql/package.json ./packages/gql/
COPY packages/tsconfig/package.json ./packages/tsconfig/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# Build — compile workspace packages in dependency order, then the API,
# then use pnpm deploy to produce a symlink-free production node_modules
FROM base AS build
WORKDIR /app
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/node_modules ./node_modules
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm --filter @home-repair/db build && \
    pnpm --filter @home-repair/gql build && \
    pnpm --filter @home-repair/api build && \
    pnpm deploy --filter @home-repair/api --prod /prod/api

# Runtime — minimal image with only what Node needs to run
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /prod/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
EXPOSE 4000
CMD ["node", "dist/src/index.js"]
