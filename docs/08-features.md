# Features

This document walks through every major feature from the user's perspective and explains the backend-to-frontend flow for each.

---

## Authentication

### Sign up

1. User clicks **Sign up** in header or welcome modal
2. `AuthModal` opens in signup mode
3. User enters email + password (min 8 chars)
4. `registerUser()` → GraphQL `register` mutation
5. API creates user + $1,000 wallet + initial credit transaction
6. JWT + user returned → stored in `sessionStorage`
7. Modal closes, dashboard loads portfolio data

### Log in

Same flow with `loginUser()` → `login` mutation. Generic error message on wrong credentials.

### Try the demo

1. User clicks **"Try the demo"** in auth modal
2. `generateDemoCredentials()` creates random email + 8-char password
3. Auto-registers via `register` mutation (new account each click)
4. User is logged in immediately

> The seeded `demo@stockfolio.app` account is separate — log in manually with `demo1234`.

### Log out

Header avatar menu → Log out → `clearAuth()` removes sessionStorage, resets user state. Watchlist clears.

### Session persistence

- Token stored in `sessionStorage` (tab-scoped)
- Page refresh within same tab: user stays logged in
- New tab or closed tab: must log in again
- No server-side session validation on page load (token not verified via `me` query)

---

## Dashboard

**Route:** `/dashboard`

### Portfolio stats

Three metrics at the top:

| Metric | Source |
|--------|--------|
| Total value | `portfolio.totalValue` (cash + holdings market value) |
| Today's gain | `portfolio.todayGain` (vs start-of-day prices) |
| Total return % | `portfolio.totalReturnPercent` (vs cost basis) |

Shows skeleton while loading, "Sign in to view" when logged out.

### Allocation chart

Horizontal bar showing holdings weighted by `marketValue / totalValue`. Colors assigned per ticker. Empty state when no holdings.

### Watchlist

- Loads tickers from `watchlist` query when authenticated
- Polls `quotes` every 60 seconds for live prices
- Each row links to `/stock/{ticker}` and has a Trade shortcut
- Empty state: "Log in to manage your watchlist" or "Add stocks from a stock page"

### Place an order

See [Order Flow](#order-flow) below. Dashboard version includes a stock picker (`fetchStocks`).

### Transaction history

Table of recent trades from `transactions` query. Refreshes when `refreshKey` changes (after order placement).

---

## Stock Page

**Route:** `/stock/[symbol]` (e.g. `/stock/AAPL`)

### Quote header

- Ticker, company name, live price, change amount/percent
- **Watch** button toggles watchlist (prompts login if not authenticated)
- Quote polls every **5 seconds**

### Price chart

- SVG area/line chart with period buttons: 1D, 7D, 30D, 6M, 1Y
- Data from `priceHistory(ticker, days)` query
- 1D period auto-refreshes every 60 seconds

### Stock stats

Four metrics: live price, open, day range (low–high), shares owned.

### Trade panel

Same order flow as dashboard but fixed to the current stock. Shows available cash or shares owned inline.

---

## Order Flow

Shared between `OrderSection` (dashboard) and `StockTradePanel` (stock page).

```
┌─────────────────────────────────────────────────────────┐
│  1. User selects Buy/Sell + quantity                    │
│  2. Clicks "Place order"                                │
│     → Not logged in? Open auth modal                    │
│     → Invalid qty? Show error feedback                  │
├─────────────────────────────────────────────────────────┤
│  3. CHECKING phase                                      │
│     → Re-fetch portfolio (fresh cash + shares)          │
│     → Dashboard: re-fetch latest quote price            │
│     → Client validation (validateOrder.ts)              │
│       • Buy: cash >= order total                        │
│       • Sell: owns enough shares                        │
│     → Fail? Show error feedback modal                   │
├─────────────────────────────────────────────────────────┤
│  4. CONFIRM modal                                       │
│     Shows: side, quantity, price per share, total     │
│     Price locked at this moment (confirmedPrice)        │
├─────────────────────────────────────────────────────────┤
│  5. User clicks "Confirm order"                         │
│     → placeOrder(ticker, side, qty, confirmedPrice)     │
│     → API validates price within 0.5% tolerance         │
│     → API executes in database transaction            │
├─────────────────────────────────────────────────────────┤
│  6. FEEDBACK modal                                      │
│     Success: shows fill price, quantity, total          │
│     Error: shows API message (e.g. "Price has changed") │
│     → Refresh portfolio + parent callbacks              │
└─────────────────────────────────────────────────────────┘
```

### Client validation (`lib/order/validateOrder.ts`)

| Check | Buy | Sell |
|-------|-----|------|
| Amount > 0 | ✓ | ✓ |
| Sufficient cash | ✓ | — |
| Owns shares | — | ✓ |
| Enough shares | — | ✓ |

### Server validation (`orderService.ts`)

- Quantity > 0
- Confirmed price within 0.5% of current simulated price
- Sufficient funds (buy) or shares (sell)
- All inside a Prisma transaction

---

## Wallet

**Route:** `/wallet` (auth required)

### Summary

Three metrics: available cash, invested (holdings market value), total account value.

### Holdings table

Lists each holding with quantity, avg cost, current price (polled every 60s), and market value.

### Cash ledger

`WalletTransaction` entries: CREDIT (green), DEBIT (red), RESET. Shows amount and running balance.

### Trade history

Same data as dashboard transaction history but on the wallet page.

Data source: single `wallet` GraphQL query returning portfolio + ledger + trades.

---

## Watchlist

### Add/remove stocks

1. Navigate to a stock page (e.g. `/stock/TSLA`)
2. Click **Watch** / **Watching** button in header
3. `toggle(ticker)` in WatchlistContext
4. Calls `addToWatchlist` or `removeFromWatchlist` mutation
5. Dashboard watchlist updates on next load/poll

Requires authentication. Unauthenticated users see a login prompt when clicking Watch.

### Data storage

Watchlist is stored in the `WatchlistItem` database table, scoped per user. No localStorage — fully API-backed.

---

## Onboarding

### Welcome modal

Shown on dashboard for **unauthenticated** users who haven't dismissed it.

- Stored in `localStorage` key `stockfolio_welcome_dismissed`
- Promotes $10,000 trial wallet (marketing copy — actual registration gives $1,000)
- **"Create your account"** → opens signup modal
- **"Explore for now"** → dismisses modal

Automatically closes when user logs in.

---

## Simulated Pricing

Prices are generated server-side, not from a real market feed.

**How it works:**
1. Each stock has a `basePrice` and `tickerSeed` in the database
2. `priceService.ts` applies time-based sine waves + noise
3. Prices update continuously based on `Date.now()`
4. Same ticker at the same timestamp always produces the same price (deterministic)

**What this means for users:**
- Prices look realistic with intraday movement
- Charts show smooth historical curves
- Prices do not match real markets
- All users see the same simulated price at the same time

---

## Header Ticker Strip

The header shows live prices for 5 tickers: AAPL, TSLA, INFY, RELIANCE, MSFT.

- Polls every 60 seconds via `usePolling`
- Each ticker links to its stock page
- Visible on desktop; hidden on mobile

---

## Error States

| Scenario | User sees |
|----------|-----------|
| Unknown stock symbol | "Stock not found" with back link |
| API down / network error | Empty states, skeleton loaders, or error messages |
| Insufficient funds | Error feedback modal with formatted amounts |
| Price drift > 0.5% | "Price has changed. Please review your order and try again." |
| Expired JWT | API returns UNAUTHENTICATED; UI may show empty portfolio until re-login |

---

## Next Steps

- [GraphQL API](./05-graphql-api.md) — operation reference for each feature
- [Accessibility](./09-accessibility.md) — how features are exposed to assistive tech
- [Performance](./10-performance.md) — polling and loading strategies
