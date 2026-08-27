# Database

Stockfolio uses **PostgreSQL** with **Prisma ORM** for schema management, migrations, and type-safe queries.

---

## Entity Relationship Diagram

```
User
 ├── Wallet (1:1)
 │    └── WalletTransaction (1:many)
 ├── Holding (1:many)
 ├── Order (1:many)
 ├── Transaction (1:many)
 └── WatchlistItem (1:many)

Stock (standalone catalog — no user relation)

Order ──→ Transaction (1:many, optional orderId on Transaction)
```

---

## Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `email` | String | Unique, lowercase |
| `passwordHash` | String | bcrypt hash |
| `isDemo` | Boolean | Marks seeded demo account |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

### Wallet

One wallet per user. Stores cash balance.

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `userId` | String | Unique FK → User |
| `balance` | Decimal(18,2) | Available cash |

### WalletTransaction

Ledger of cash movements (credits, debits, resets).

| Field | Type | Notes |
|-------|------|-------|
| `walletId` | String | FK → Wallet |
| `type` | WalletTransactionType | CREDIT, DEBIT, RESET |
| `amount` | Decimal(18,2) | Transaction amount |
| `balanceAfter` | Decimal(18,2) | Balance after this entry |
| `reference` | String? | Human-readable description |

### Holding

Shares owned per ticker per user.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | String | FK → User |
| `ticker` | String | e.g. AAPL |
| `quantity` | Decimal(18,6) | Supports fractional shares |
| `avgCost` | Decimal(18,2) | Weighted average cost basis |

Unique constraint: `(userId, ticker)`.

### Order

Buy/sell order records.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | String | FK → User |
| `ticker` | String | |
| `side` | OrderSide | BUY or SELL |
| `quantity` | Decimal(18,6) | |
| `status` | OrderStatus | PENDING, FILLED, CANCELLED |
| `filledPrice` | Decimal(18,2)? | Execution price |

All orders are immediately filled (`FILLED`) in the current implementation.

### Transaction

Trade ledger — one row per executed trade.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | String | FK → User |
| `orderId` | String? | FK → Order |
| `ticker` | String | |
| `side` | OrderSide | |
| `quantity` | Decimal(18,6) | |
| `price` | Decimal(18,2) | Fill price |

### Stock

Ticker catalog for the simulated price engine.

| Field | Type | Notes |
|-------|------|-------|
| `ticker` | String | Primary key |
| `companyName` | String | Display name |
| `basePrice` | Decimal(12,2) | Starting price for simulation |
| `tickerSeed` | Int | Seed for per-ticker price variation |

### WatchlistItem

User's tracked tickers.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | String | FK → User |
| `ticker` | String | |

Unique constraint: `(userId, ticker)`.

---

## Enums

```prisma
enum WalletTransactionType { CREDIT  DEBIT  RESET }
enum OrderSide             { BUY     SELL }
enum OrderStatus           { PENDING FILLED CANCELLED }
```

---

## Migrations

Migrations live in `apps/api/prisma/migrations/`. Apply them with:

```bash
# Development (creates new migrations interactively)
pnpm --filter api db:migrate

# CI / production (apply only)
pnpm --filter api db:migrate:deploy
```

After schema changes, Prisma Client regenerates on `pnpm install` or `pnpm --filter api db:generate`.

---

## Seed Data

Run: `pnpm --filter api db:seed`

### Stocks (20 tickers)

AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META, INFY, RELIANCE, JPM, V, WMT, DIS, NFLX, AMD, INTC, BA, KO, PEP, IBM

Each stock gets a `basePrice` and `tickerSeed` for the price engine.

### Demo user

| Field | Value |
|-------|-------|
| Email | `demo@stockfolio.app` |
| Password | `demo1234` |
| `isDemo` | `true` |
| Wallet | $1,000.00 |
| Watchlist | AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA |
| Holding | 2 AAPL @ $175.50 avg cost |

The seed is **idempotent** — it uses `upsert` on email and ticker, so re-running won't duplicate data.

### New user registration

When a user registers via GraphQL, the API creates:

- User record with bcrypt-hashed password
- Wallet with $1,000 balance
- Initial `WalletTransaction` (CREDIT, "Initial wallet funding")

---

## Prisma Client

The singleton lives at `apps/api/src/lib/prisma.ts`:

- Reuses one client in development (via `globalThis`)
- Logs warnings/errors in dev, errors only in production

---

## Decimal Handling

Monetary values are stored as `Decimal` in PostgreSQL. Service layer code converts to JavaScript `Number` for calculations — see [Roadmap & Limitations](./12-roadmap-and-limitations.md) for precision notes.

---

## Useful Commands

```bash
# Visual database browser
pnpm --filter api db:studio

# Regenerate client after schema change
pnpm --filter api db:generate

# Reset local DB (Docker)
docker rm -f stockfolio-db
# recreate container, then migrate + seed
```

---

## Next Steps

- [GraphQL API](./05-graphql-api.md) — how data is queried
- [Backend](./06-backend.md) — service layer that writes to these tables
