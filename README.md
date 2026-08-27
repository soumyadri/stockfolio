# Stockfolio

A full-stack **paper trading** web application for managing a virtual stock portfolio. Track simulated live quotes, place buy/sell orders, monitor holdings, manage a cash wallet, and curate a watchlist — all without risking real money.

Built as a portfolio project demonstrating modern monorepo architecture, a GraphQL API, JWT authentication, and database-backed trading flows.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [GraphQL API](#graphql-api)
- [Available Scripts](#available-scripts)
- [Seed Data](#seed-data)
- [Development Workflow](#development-workflow)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Implemented

| Area | Details |
|------|---------|
| **Monorepo** | pnpm workspaces with shared config and UI package |
| **GraphQL API** | Apollo Server on Express — auth, quotes, orders, portfolio, wallet, watchlist |
| **Authentication** | Email/password registration and login with JWT (bcrypt-hashed passwords) |
| **Paper trading** | Buy/sell orders with wallet debits/credits, holdings, and trade history |
| **Price locking** | Orders fill at the user-confirmed price (validated within 0.5% of current price) |
| **Simulated quotes** | Deterministic price engine with intraday drift, charts, and day stats |
| **Dashboard** | Portfolio stats, allocation chart, watchlist, order placement, transaction history |
| **Stock pages** | Live quote header, price chart, stats, and trade panel per ticker |
| **Wallet page** | Cash balance, holdings, ledger, and trade activity |
| **Watchlist** | Per-user watchlist stored in PostgreSQL, synced via GraphQL |
| **Database** | PostgreSQL via Prisma ORM (Neon-compatible), versioned migrations |
| **Seed data** | 20 stocks, demo user with $1,000 wallet, sample holdings and watchlist |

### Planned

- Live stock quotes via Finnhub (or similar provider)
- Row-level locking for concurrent order safety
- GraphQL Code Generator for shared types (`packages/graphql-types`)
- Design system expansion + Storybook
- Accessibility pass (WCAG AA)
- E2E tests (Playwright) + CI (GitHub Actions)
- Deployment (Vercel + Render + Neon)

---

## Architecture

```mermaid
flowchart TB
  subgraph client [apps/web]
    NextApp[Next.js App Router]
    Components[Dashboard · Stock · Wallet]
    NextApp --> Components
  end

  subgraph server [apps/api]
    Express[Express]
    Apollo[Apollo Server /graphql]
    Services[Auth · Orders · Quotes · Portfolio]
    Express --> Apollo --> Services
    Prisma[Prisma ORM]
    Services --> Prisma
  end

  subgraph data [PostgreSQL / Neon]
    DB[(Users · Wallets · Orders · Holdings · Watchlist · Stocks)]
    Prisma --> DB
  end

  subgraph pricing [Simulated pricing]
    PriceEngine[Deterministic price engine]
    Services --> PriceEngine
  end

  client -->|GraphQL over HTTP| server
```

| Layer | Package | Role |
|-------|---------|------|
| Frontend | `apps/web` | Next.js 14 App Router, Tailwind CSS, React 18 |
| Backend | `apps/api` | Express, Apollo Server, Prisma, PostgreSQL |
| UI library | `packages/ui` | Shared React components |
| GraphQL types | `packages/graphql-types` | Shared types (codegen planned) |
| Tooling | `packages/config` | Shared ESLint, Prettier, TSConfig |

### Web routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Portfolio overview, watchlist, order placement |
| `/stock/[symbol]` | Stock detail, chart, buy/sell panel |
| `/wallet` | Wallet summary, holdings, ledger, trades |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20+ |
| Package manager | pnpm 9 (workspaces) |
| Language | TypeScript |
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Express, Apollo Server (GraphQL) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 6 |
| Auth | JWT + bcrypt (token stored in `sessionStorage`) |
| Quotes | Simulated price engine (Finnhub planned) |

---

## Project Structure

```
stockfolio/
├── apps/
│   ├── api/                         # Express + GraphQL backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Database models
│   │   │   ├── seed.ts              # Stocks + demo user seeder
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── index.ts             # Server entry, CORS, /health, /graphql
│   │       ├── context.ts           # Per-request GraphQL context (JWT)
│   │       ├── graphql/
│   │       │   ├── schema.ts        # GraphQL type definitions
│   │       │   └── resolvers/       # auth, quote, order, portfolio, watchlist
│   │       ├── lib/                 # auth, prisma, requireAuth
│   │       └── services/            # orderService, priceService, portfolioService
│   └── web/                         # Next.js frontend
│       ├── app/                     # App Router pages
│       ├── components/              # UI, dashboard, stock, wallet, auth
│       └── lib/
│           ├── auth/                # Auth context, sessionStorage token helpers
│           ├── graphql/             # Typed GraphQL client functions
│           ├── watchlist/           # Watchlist React context (API-backed)
│           └── utils/               # Shared formatters
├── packages/
│   ├── config/                      # Shared ESLint, Prettier, TSConfig
│   ├── graphql-types/               # Shared GraphQL types (placeholder)
│   └── ui/                          # Shared React component library
├── package.json
├── pnpm-workspace.yaml
└── .nvmrc
```

---

## Prerequisites

Before you begin, install:

1. **Node.js 20+** — use [nvm](https://github.com/nvm-sh/nvm) or check `.nvmrc`
2. **pnpm 9+** — `npm install -g pnpm`
3. **PostgreSQL** — either:
   - A [Neon](https://neon.tech) account (recommended, free tier), or
   - [Docker](https://www.docker.com/) for a local Postgres container

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/soumyadri/stockfolio.git
cd stockfolio

# 2. Install dependencies
pnpm install

# 3. Configure environment (see below)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Set up the database (migrate + seed)
pnpm --filter api db:migrate:deploy
pnpm --filter api db:seed

# 5. Start development servers
pnpm dev
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:4000 |
| GraphQL | http://localhost:4000/graphql |
| Health check | http://localhost:4000/health |

Log in with the seeded demo account (see [Seed Data](#seed-data)) or create a new account via the sign-up modal.

---

## Environment Variables

### `apps/api/.env`

Copy from `apps/api/.env.example`:

```env
# PostgreSQL connection string (Neon or local Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stockfolio?schema=public"

# Secret for signing JWTs (change in production)
JWT_SECRET="change-me-in-production"

# JWT expiry (default: 30d)
JWT_EXPIRES_IN="30d"

# API server port
PORT=4000

# Allowed frontend origin for CORS
CORS_ORIGIN="http://localhost:3000"
```

### `apps/web/.env`

Copy from `apps/web/.env.example`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Public site URL (metadata / SEO)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> **Never commit `.env` files.** They are gitignored. Only `.env.example` templates are tracked.

---

## Database Setup

Stockfolio uses **Prisma** with **PostgreSQL**. You can use Neon (cloud) or Docker (local).

### Option A: Neon (recommended)

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string from the Neon dashboard
3. Paste it into `apps/api/.env` as `DATABASE_URL`
4. Run migrations and seed:

```bash
pnpm --filter api db:migrate:deploy
pnpm --filter api db:seed
```

### Option B: Local Docker Postgres

```bash
docker run -d \
  --name stockfolio-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stockfolio \
  -p 5432:5432 \
  postgres:16
```

Then set in `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stockfolio?schema=public"
```

Run migrations and seed:

```bash
pnpm --filter api db:migrate:deploy
pnpm --filter api db:seed
```

### Database commands

| Command | Description |
|---------|-------------|
| `pnpm --filter api db:migrate` | Create/apply migrations in dev (interactive) |
| `pnpm --filter api db:migrate:deploy` | Apply migrations in CI/production |
| `pnpm --filter api db:seed` | Insert stocks and demo user |
| `pnpm --filter api db:studio` | Open Prisma Studio (visual DB browser) |
| `pnpm --filter api db:generate` | Regenerate Prisma Client after schema changes |

### Data model overview

```
User
 ├── Wallet (cash balance)
 │    └── WalletTransaction (credits, debits, resets)
 ├── Holding (owned shares per ticker)
 ├── Order (buy/sell requests)
 ├── Transaction (trade ledger)
 └── WatchlistItem (tracked tickers)

Stock (ticker catalog with base price for simulation)
```

Key enums: `OrderSide` (BUY/SELL), `OrderStatus` (PENDING/FILLED/CANCELLED), `WalletTransactionType` (CREDIT/DEBIT/RESET).

Monetary values are stored as `Decimal` in the database.

---

## Running the App

### Development (all services)

Starts the API, web app, and UI package in watch mode:

```bash
pnpm dev
```

### Individual services

```bash
# API only (port 4000)
pnpm --filter api dev

# Web only (port 3000)
pnpm --filter web dev

# UI package watch build
pnpm --filter ui dev
```

### Production build

```bash
pnpm build
pnpm --filter api start    # API: node dist/src/index.js
pnpm --filter web start    # Web: next start
```

### Verify the API

```bash
curl http://localhost:4000/health
# {"status":"ok"}
```

---

## GraphQL API

Endpoint: `POST http://localhost:4000/graphql`

Authenticated requests pass the JWT as a Bearer token:

```
Authorization: Bearer <token>
```

### Queries

| Query | Auth | Description |
|-------|------|-------------|
| `me` | Optional | Current user (null if unauthenticated) |
| `stocks` | No | All tradeable tickers |
| `quote(ticker)` | No | Single stock quote |
| `quotes(tickers)` | No | Batch quotes |
| `priceHistory(ticker, days)` | No | Historical price points for charts |
| `portfolio` | Yes | Cash, holdings, gains |
| `wallet` | Yes | Full wallet details with ledger and trades |
| `transactions` | Yes | Recent trade history |
| `watchlist` | Yes | User's watchlist tickers |
| `watchlistQuotes` | Yes | Quotes for watchlist items |

### Mutations

| Mutation | Auth | Description |
|----------|------|-------------|
| `register(email, password)` | No | Create account + $1,000 wallet |
| `login(email, password)` | No | Returns JWT |
| `placeOrder(ticker, side, quantity, confirmedPrice)` | Yes | Execute a paper trade at the confirmed price |
| `addToWatchlist(ticker)` | Yes | Add ticker to watchlist |
| `removeFromWatchlist(ticker)` | Yes | Remove ticker from watchlist |

`placeOrder` validates that `confirmedPrice` is within **0.5%** of the current simulated market price before filling.

---

## Available Scripts

Run from the **repository root**:

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start API + web + UI in development |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | Type-check all workspaces |
| `pnpm test` | Run tests (placeholder) |

API-specific (`pnpm --filter api <script>`):

| Script | Description |
|--------|-------------|
| `dev` | Start Express with hot reload |
| `build` | Generate Prisma client + compile TypeScript |
| `start` | Run compiled production server |
| `db:migrate` | Dev migration (creates + applies) |
| `db:migrate:deploy` | Production migration (apply only) |
| `db:seed` | Seed stocks and demo data |
| `db:studio` | Prisma Studio GUI |
| `db:generate` | Regenerate Prisma Client |

---

## Seed Data

Running `pnpm --filter api db:seed` creates:

**20 stocks** — AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META, INFY, RELIANCE, JPM, V, WMT, DIS, NFLX, AMD, INTC, BA, KO, PEP, IBM

**Demo account:**

| Field | Value |
|-------|-------|
| Email | `demo@stockfolio.app` |
| Password | `demo1234` |
| Wallet balance | $1,000.00 |
| Watchlist | AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA |
| Sample holding | 2 shares of AAPL @ $175.50 |

The seed is idempotent — re-running it won't duplicate the user (uses `upsert` on email).

---

## Development Workflow

### Adding a Prisma model

1. Edit `apps/api/prisma/schema.prisma`
2. Create a migration: `pnpm --filter api db:migrate`
3. Prisma Client regenerates automatically on install/build

### Adding a GraphQL operation

1. Add types to `apps/api/src/graphql/schema.ts`
2. Implement resolver in `apps/api/src/graphql/resolvers/`
3. Register in `apps/api/src/graphql/resolvers/index.ts`
4. Add client function in `apps/web/lib/graphql/`

### Adding a UI component

1. Create the component in `packages/ui/src/` (shared) or `apps/web/components/` (app-specific)
2. Export shared components from `packages/ui/src/index.ts`
3. Import in web: `import { Button } from "@stockfolio/ui"`

### Code quality

```bash
pnpm lint        # ESLint across all workspaces
pnpm typecheck   # TypeScript strict checks
```

Shared config lives in `packages/config/` (ESLint flat config, Prettier, base TSConfig).

---

## Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Monorepo & tooling | Done |
| 2 | Database & Prisma | Done |
| 3 | Backend core (GraphQL, auth, orders) | Done |
| 4 | Frontend core (dashboard, wallet, stock pages) | Done |
| 5 | Design system + Storybook | Planned |
| 6 | Accessibility pass | Planned |
| 7 | Live market data (Finnhub) | Planned |
| 8 | Testing & CI | Planned |
| 9 | Deployment (Vercel + Render) | Planned |
| 10 | Optional AWS layer | Planned |

---

## Troubleshooting

### `Module '"@prisma/client"' has no exported member ...`

Regenerate the Prisma Client:

```bash
pnpm --filter api db:generate
```

Restart your IDE/TypeScript server if errors persist.

### Database connection refused

- **Neon:** Check that `DATABASE_URL` includes `?sslmode=require`
- **Docker:** Ensure the container is running: `docker start stockfolio-db`
- **Port conflict:** Make sure nothing else is using port 5432

### CORS errors in the browser

Ensure `CORS_ORIGIN` in `apps/api/.env` matches your frontend URL (default: `http://localhost:3000`).

### `pnpm dev` fails on UI build

The root `dev` script builds the UI package first. If it fails, try:

```bash
pnpm --filter ui build
pnpm dev
```

### Migration drift

If your local DB is out of sync with migrations:

```bash
pnpm --filter api db:migrate:deploy
```

For a clean slate in local dev, reset the Docker container and re-run migrate + seed.

### Order rejected: "Price has changed"

The confirmed price drifted more than 0.5% from the current simulated price between review and submission. Re-open the order dialog to get an updated quote.

---

## License

This project is for educational and portfolio purposes.
