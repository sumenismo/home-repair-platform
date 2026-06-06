# Home Repair Platform

A two-sided marketplace connecting homeowners with home repair tradies. Homeowners post jobs, tradies bid, and the platform facilitates contact and in-platform messaging.

## Tech Stack

- **API** — Node.js, Fastify, GraphQL Yoga, TypeScript
- **Database** — PostgreSQL via postgres.js (raw SQL)
- **Auth + Realtime** — Supabase
- **Frontend** — Vite, React, TypeScript, urql
- **Monorepo** — pnpm workspaces + Turborepo

## Project Structure

```
home-repair-platform/
├── apps/
│   ├── api/          # GraphQL API (Fastify + GraphQL Yoga)
│   └── web/          # Frontend (Vite + React)
├── packages/
│   ├── db/           # postgres.js client + SQL migrations
│   ├── gql/          # GraphQL SDL schema + codegen config
│   └── tsconfig/     # Shared TypeScript configs
└── infra/            # Serverless Framework (satellite functions)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 9 — `npm install -g pnpm`
- [Docker](https://www.docker.com/) (for local Postgres)
- A [Supabase](https://supabase.com/) project

### Setup

**1. Start local Postgres**

```bash
docker-compose up -d
```

**2. Configure environment**

```bash
cp .env.example .env
```

Fill in your Supabase values in `.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**3. Install dependencies**

```bash
pnpm install
```

**4. Run database migrations**

```bash
pnpm db:migrate
```

**5. Generate TypeScript types**

This step generates typed resolver signatures for the API and typed hooks for the frontend from the GraphQL schema. Run it once before starting, and again whenever the schema changes.

```bash
pnpm codegen
```

**6. Start development servers**

```bash
pnpm dev
```

- API: [http://localhost:4000/graphql](http://localhost:4000/graphql)
- Web: [http://localhost:5173](http://localhost:5173)

## Common Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all apps and packages |
| `pnpm codegen` | Regenerate TypeScript types from GraphQL schema |
| `pnpm typecheck` | Run codegen then TypeScript check across all packages |
| `pnpm test` | Run tests across all packages |
| `pnpm db:migrate` | Run pending database migrations |

## Development Notes

- **Schema changes** — edit files in `packages/gql/schema/`, then run `pnpm codegen`
- **New migrations** — add numbered `.sql` files to `packages/db/migrations/`
- **Adding a module** — create `apps/api/src/modules/<name>/` with `resolvers.ts` and `service.ts`, then register in `apps/api/src/schema.ts`
- **Generated files** — never edit `apps/*/src/generated/` directly; they are overwritten by codegen
