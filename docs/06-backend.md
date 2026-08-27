# Backend

The backend lives in `apps/api` and is an **Express** server with **Apollo Server** handling GraphQL at `/graphql`.

---

## Server Bootstrap

**File:** `apps/api/src/index.ts`

```typescript
// Startup sequence:
1. initStockConfigCache()     // Load all Stock rows into memory
2. new ApolloServer({ typeDefs, resolvers })
3. server.start()
4. app.get("/health")         // Health check endpoint
5. app.use("/graphql", cors, express.json, expressMiddleware)
6. app.listen(PORT)
```

| Setting | Default | Env var |
|---------|---------|---------|
| Port | 4000 | `PORT` |
| CORS origin | `http://localhost:3000` | `CORS_ORIGIN` |

The health endpoint returns `{ "status": "ok" }` — useful for deployment probes.

---

## GraphQL Context

**File:** `apps/api/src/context.ts`

Every GraphQL request gets a context object:

```typescript
interface GraphQLContext {
  userId: string | null;       // From JWT sub claim
  hasInvalidToken: boolean;    // True if token present but invalid/expired
  prisma: PrismaClient;
}
```

**Token extraction:**
1. Read `Authorization` header
2. Expect format `Bearer <token>`
3. Call `verifyToken(token)` → `userId`
4. On failure: set `hasInvalidToken = true`, leave `userId` null

**`requireAuth` guard** (`apps/api/src/lib/requireAuth.ts`):
- Throws `UNAUTHENTICATED` if `hasInvalidToken` or no `userId`
- Returns `userId` string for use in resolvers

---

## Authentication

**File:** `apps/api/src/lib/auth.ts`

| Function | Purpose |
|----------|---------|
| `hashPassword(plain)` | bcrypt hash (10 rounds) |
| `comparePassword(plain, hash)` | bcrypt compare |
| `signToken(userId)` | JWT with `sub` claim |
| `verifyToken(token)` | Returns userId from `sub` |

| Setting | Default | Env var |
|---------|---------|---------|
| JWT secret | (required) | `JWT_SECRET` |
| Token expiry | 30 days | `JWT_EXPIRES_IN` |

### Auth resolver (`resolvers/auth.ts`)

**`register`:**
1. Normalize email (trim, lowercase)
2. Validate email format and password length (≥ 8)
3. Check email uniqueness
4. Hash password
5. Transaction: create User + Wallet ($1,000) + initial WalletTransaction
6. Return JWT + user

**`login`:**
1. Find user by email
2. Compare password hash
3. Return JWT + user (generic error on failure)

**`me`:**
- Returns user for valid token
- Returns `null` if no token
- Throws if token is invalid

---

## Resolvers

**Index:** `apps/api/src/graphql/resolvers/index.ts` merges all resolver modules.

| Module | Queries | Mutations |
|--------|---------|-----------|
| `auth.ts` | `me` | `register`, `login` |
| `quote.ts` | `stocks`, `quote`, `quotes`, `priceHistory`, `watchlistQuotes` | — |
| `portfolio.ts` | `portfolio`, `transactions`, `wallet` | — |
| `order.ts` | — | `placeOrder` |
| `watchlist.ts` | `watchlist` | `addToWatchlist`, `removeFromWatchlist` |

Resolvers are intentionally thin — they validate auth, call services, and map Prisma types to GraphQL types.

---

## Services

### Price Service (`services/priceService.ts`)

Simulates stock prices deterministically.

**In-memory cache:** All `Stock` rows loaded at startup via `initStockConfigCache()`. Cache does not refresh until server restart.

**Price formula** (`getPriceAt`):

```
price = basePrice × (1 + drift + wiggle + noise)

drift  = sin(t/3600 + seed) × 0.02      # slow hourly trend
wiggle = sin(t/15 + seed×2) × 0.005     # faster oscillation
noise  = (seededRandom(bucket + seed) - 0.5) × 0.006   # 5-second buckets
```

| Function | Purpose |
|----------|---------|
| `getCurrentPrice(ticker)` | Price right now |
| `getPriceAtTime(ticker, timestampMs)` | Price at a specific time |
| `getPriceHistory(ticker, days)` | 61 points across N days |
| `getDayStats(ticker)` | Open, day low, day high |
| `getAllStocks()` | Ticker catalog from cache |

### Order Service (`services/orderService.ts`)

**`placeOrder(prisma, userId, ticker, side, quantity, confirmedPrice)`**

1. Validate quantity > 0
2. `assertConfirmedPrice` — reject if drift > 0.5%
3. Use `confirmedPrice` as fill price
4. Inside `prisma.$transaction`:

**BUY:**
- Check wallet balance ≥ total
- Debit wallet, create WalletTransaction (DEBIT)
- Create or update Holding (weighted average cost)

**SELL:**
- Check holding quantity ≥ sell quantity
- Reduce or delete holding
- Credit wallet, create WalletTransaction (CREDIT)

**Both:**
- Create Order (status: FILLED)
- Create Transaction record

### Portfolio Service (`services/portfolioService.ts`)

**`getPortfolioSummary(prisma, userId)`**

Aggregates:
- Cash balance from Wallet
- Holdings with live `getCurrentPrice` per ticker
- `holdingsValue`, `totalValue`
- `todayGain` — compares current value vs start-of-day prices
- `totalReturnPercent` — (market value - cost basis) / cost basis

---

## Error Handling

**File:** `apps/api/src/graphql/errors.ts`

```typescript
badUserInput(message)    → extensions.code: "BAD_USER_INPUT"
unauthenticated(message) → extensions.code: "UNAUTHENTICATED"
```

Services throw these errors; Apollo formats them as GraphQL errors. There is no global Express error middleware — Apollo handles all `/graphql` errors.

---

## CORS

```typescript
cors({ origin: CORS_ORIGIN })  // default: http://localhost:3000
```

Only the configured frontend origin can make browser requests to the API. Server-to-server requests (curl, etc.) are unaffected.

---

## Seed Script

**File:** `apps/api/prisma/seed.ts`

Run via `pnpm --filter api db:seed`. Uses `upsert` for idempotency.

Creates:
- 20 stocks with base prices and seeds
- Demo user with wallet, watchlist, and AAPL holding

---

## File Map

```
apps/api/src/
├── index.ts                    # Server entry
├── context.ts                  # GraphQL context
├── lib/
│   ├── auth.ts                 # JWT + bcrypt
│   ├── prisma.ts               # Prisma singleton
│   └── requireAuth.ts          # Auth guard
├── graphql/
│   ├── schema.ts               # SDL type definitions
│   ├── errors.ts               # Error helpers
│   └── resolvers/
│       ├── index.ts
│       ├── auth.ts
│       ├── quote.ts
│       ├── portfolio.ts
│       ├── order.ts
│       └── watchlist.ts
└── services/
    ├── priceService.ts
    ├── orderService.ts
    └── portfolioService.ts
```

---

## Next Steps

- [GraphQL API](./05-graphql-api.md) — operation reference
- [Features](./08-features.md) — end-to-end feature flows
- [Roadmap & Limitations](./12-roadmap-and-limitations.md) — known backend gaps
