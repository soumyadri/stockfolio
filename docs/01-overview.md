# Overview

## What is Stockfolio?

Stockfolio is a **full-stack paper trading web application**. Users can:

- Create an account and receive a virtual cash wallet
- Browse simulated stock quotes and price charts
- Place buy and sell orders without real money
- Track portfolio value, holdings, and trade history
- Maintain a personal watchlist of tickers

It is built as a **portfolio / learning project** that demonstrates modern web development patterns: monorepo tooling, GraphQL APIs, JWT authentication, PostgreSQL with Prisma, and a React/Next.js frontend.

---

## Core Concepts

### Paper trading

All money and shares are simulated. There is no connection to a real brokerage or payment system. New users receive **$1,000** in virtual cash on registration (same as the seeded demo account).

### Simulated market data

Stock prices are **not** fetched from a live market API today. Instead, a deterministic **price engine** on the backend generates realistic-looking quotes based on:

- A `basePrice` per ticker (stored in the database)
- A `tickerSeed` for per-stock variation
- Time-based sine waves and noise for intraday movement

This means prices are reproducible and work offline from external APIs, but they do not reflect real markets.

### Confirmed-price execution

When a user places an order, they confirm a specific price shown in the UI. The server fills the order at that **confirmed price**, as long as it is within **0.5%** of the current simulated price. This prevents stale quotes from executing at unexpected values.

### Authentication

Users register and log in with email and password. The API returns a **JWT** stored in the browser's `sessionStorage` (cleared when the tab closes). Protected GraphQL operations require a `Bearer` token.

---

## What the App Includes

| Area | Description |
|------|-------------|
| **Dashboard** | Portfolio summary, allocation chart, watchlist, order form, transaction history |
| **Stock page** | Per-ticker quote, chart, stats, buy/sell panel |
| **Wallet page** | Cash balance, holdings, ledger entries, trade log |
| **Auth** | Login, sign-up, and one-click demo account creation |

---

## Monorepo Packages

```
stockfolio/
├── apps/
│   ├── api/          # Express + Apollo GraphQL backend
│   └── web/          # Next.js 14 frontend
└── packages/
    ├── config/       # Shared ESLint, Prettier, TSConfig
    ├── graphql-types/ # Placeholder for future GraphQL codegen
    └── ui/           # Shared React components (Button, etc.)
```

The root `package.json` orchestrates all workspaces via **pnpm**.

---

## Technology Summary

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 14, React 18, Tailwind CSS, TypeScript |
| API | Express, Apollo Server 5, GraphQL |
| Database | PostgreSQL (Neon-compatible) |
| ORM | Prisma 6 |
| Auth | JWT + bcrypt |
| Tooling | pnpm workspaces, ESLint, Prettier |

---

## User Roles

There is only one user type today — a registered trader. The `isDemo` flag on the `User` model marks the seeded demo account but does not change API behavior.

---

## Next Steps

- [Architecture](./02-architecture.md) — how the pieces connect
- [Getting Started](./03-getting-started.md) — run the project locally
- [Features](./08-features.md) — walk through each feature in detail
