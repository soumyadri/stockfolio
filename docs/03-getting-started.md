# Getting Started

This guide walks you through running Stockfolio locally from scratch.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20+ | See `.nvmrc` in repo root |
| pnpm | 9+ | `npm install -g pnpm` |
| PostgreSQL | 16+ | Neon cloud or Docker locally |

---

## 1. Clone and Install

```bash
git clone https://github.com/soumyadri/stockfolio.git
cd stockfolio
pnpm install
```

---

## 2. Configure Environment

Copy the example env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### API environment (`apps/api/.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stockfolio?schema=public"
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="30d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs — change in production |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `30d`) |
| `PORT` | No | API port (default `4000`) |
| `CORS_ORIGIN` | No | Allowed frontend origin (default `http://localhost:3000`) |

### Web environment (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL used by GraphQL client |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL for metadata/SEO |

> Never commit `.env` files. Only `.env.example` templates are tracked.

---

## 3. Set Up the Database

### Option A: Neon (cloud, recommended)

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set `DATABASE_URL` in `apps/api/.env` (include `?sslmode=require` for Neon)

### Option B: Local Docker

```bash
docker run -d \
  --name stockfolio-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stockfolio \
  -p 5432:5432 \
  postgres:16
```

Use:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stockfolio?schema=public"
```

### Run migrations and seed

```bash
pnpm --filter api db:migrate:deploy
pnpm --filter api db:seed
```

This creates all tables, 20 stocks, and a demo user (see [Database](./04-database.md#seed-data)).

---

## 4. Start Development Servers

From the repo root:

```bash
pnpm dev
```

This builds the UI package, then starts API + web + UI in parallel.

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:4000 |
| GraphQL | http://localhost:4000/graphql |
| Health check | http://localhost:4000/health |

### Start services individually

```bash
pnpm --filter api dev    # API only
pnpm --filter web dev    # Web only
pnpm --filter ui dev     # UI package watch build
```

---

## 5. Log In

Use the seeded demo account:

| Field | Value |
|-------|-------|
| Email | `demo@stockfolio.app` |
| Password | `demo1234` |

Or click **"Try the demo"** in the auth modal to auto-register a new account.

---

## 6. Verify Everything Works

```bash
# API health
curl http://localhost:4000/health
# → {"status":"ok"}

# Type check
pnpm typecheck

# Lint
pnpm lint
```

In the browser:

1. Open http://localhost:3000 → redirects to dashboard
2. Log in with demo credentials
3. View portfolio stats, watchlist, and place a test order
4. Visit `/stock/AAPL` for stock detail and chart
5. Visit `/wallet` for wallet ledger and holdings

---

## Production Build

```bash
pnpm build
pnpm --filter api start   # node dist/src/index.js
pnpm --filter web start   # next start
```

Ensure production env vars are set (`JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`).

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages |
| `pnpm lint` | ESLint all workspaces |
| `pnpm typecheck` | TypeScript check all workspaces |
| `pnpm test` | Tests (placeholder) |

### API database scripts

| Command | Description |
|---------|-------------|
| `pnpm --filter api db:migrate` | Create + apply migration (dev) |
| `pnpm --filter api db:migrate:deploy` | Apply migrations (CI/prod) |
| `pnpm --filter api db:seed` | Seed stocks + demo user |
| `pnpm --filter api db:studio` | Open Prisma Studio GUI |
| `pnpm --filter api db:generate` | Regenerate Prisma Client |

---

## Troubleshooting

### Database connection refused

- **Neon:** Ensure `?sslmode=require` is in `DATABASE_URL`
- **Docker:** Run `docker start stockfolio-db`
- **Port conflict:** Check nothing else uses port 5432

### CORS errors in browser

Set `CORS_ORIGIN=http://localhost:3000` in `apps/api/.env` to match your frontend URL.

### Prisma client type errors

```bash
pnpm --filter api db:generate
```

Restart your IDE TypeScript server.

### `pnpm dev` fails on UI build

```bash
pnpm --filter ui build
pnpm dev
```

### Order rejected: "Price has changed"

The confirmed price drifted more than 0.5% from the current simulated price. Re-open the order dialog for an updated quote.

### Migration drift

```bash
pnpm --filter api db:migrate:deploy
```

For a clean local slate: remove the Docker container, recreate it, then migrate + seed again.

---

## Next Steps

- [Database](./04-database.md) — understand the data model
- [GraphQL API](./05-graphql-api.md) — explore the API
- [Features](./08-features.md) — feature walkthroughs
