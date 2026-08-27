# Frontend

The frontend is a **Next.js 14** application using the **App Router**, located in `apps/web`.

---

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Server redirect → `/dashboard` |
| `/dashboard` | `app/dashboard/page.tsx` | Portfolio hub |
| `/stock/[symbol]` | `app/stock/[symbol]/page.tsx` | Stock detail + trading |
| `/wallet` | `app/wallet/page.tsx` | Wallet overview |
| `/stock/[symbol]` (404) | `app/stock/[symbol]/not-found.tsx` | Next.js not-found page |

**No middleware.** Routes are not server-protected. Auth checks happen in client components.

---

## Root Layout

**File:** `app/layout.tsx`

- `lang="en"` on `<html>`
- Inter font via `next/font/google` (swap, preload, fallback)
- Dark viewport (`themeColor: #0a0a0a`)
- Resource hints: `preconnect` + `dns-prefetch` to API origin and Dicebear
- Wraps all pages in `ClientProviders`

---

## Provider Tree

**File:** `components/providers/ClientProviders.tsx`

```
AuthProvider
  └── WatchlistProvider
        ├── {page content}
        └── AuthModalHost (dynamic import, ssr: false)
```

| Provider | File | Purpose |
|----------|------|---------|
| `AuthProvider` | `lib/auth/context.tsx` | User state, auth modal control |
| `WatchlistProvider` | `lib/watchlist/context.tsx` | API-backed watchlist symbols |
| `AuthModalHost` | `components/auth/AuthModalHost.tsx` | Lazy-loaded login/signup modal |

---

## Component Organization

```
components/
├── auth/           AuthModal, AuthModalHost, AuthButton (unused)
├── dashboard/      PortfolioStats, AllocationSection, WatchlistSection,
│                   OrderSection, TransactionHistorySection
├── stock/          StockPageContent, StockHeader, StockChart,
│                   StockStats, StockTradePanel
├── wallet/         WalletPageContent, WalletSummary, WalletHoldingsSection,
│                   WalletActivitySection, WalletTradesSection, WalletDemoBanner
├── order/          OrderConfirmModal, OrderFeedbackModal
├── onboarding/     WelcomeModal
├── layout/         AppLayout, Header, Footer, PageContainer
├── providers/      ClientProviders
└── ui/             Button, Card, Input, Modal, Select, Avatar, etc.
```

### Layout shell

`AppLayout` wraps every page with `Header` + content + `Footer` on a black background.

`PageContainer` constrains content to `max-width: 1600px` with responsive padding.

---

## Pages in Detail

### Dashboard (`DashboardContent.tsx`)

Sections top to bottom:

1. **WelcomeModal** — shown to unauthenticated users (once, stored in localStorage)
2. **PortfolioStats** — total value, today's gain, total return
3. **AllocationSection** — horizontal bar chart of holdings by weight
4. **Grid (2 columns on large screens):**
   - `WatchlistSection` — live quotes for watchlist tickers
   - `OrderSection` — buy/sell form with stock picker
5. **TransactionHistorySection** — recent trades

Uses `refreshKey` state — incremented after orders to re-fetch portfolio and transactions.

### Stock page (`StockPageContent.tsx`)

1. Back link to dashboard
2. `StockHeader` — price, change, watch toggle
3. `StockChart` — SVG chart with period selector
4. `StockStats` — price, open, day range, shares owned
5. `StockTradePanel` — buy/sell for this ticker

Polls quote every **5 seconds** (`STOCK_DETAIL_POLL_MS`).

### Wallet page (`WalletPageContent.tsx`)

Auth-gated. Shows loading/error states, then:

1. `WalletSummary` — cash, invested, total value
2. `WalletDemoBanner` — paper trading info
3. `WalletHoldingsSection` — holdings table with live prices
4. `WalletActivitySection` — cash ledger
5. `WalletTradesSection` — trade history

Data from `useWalletData` hook → `fetchWallet()` GraphQL query.

---

## State Management

### Auth (`lib/auth/context.tsx`)

| State | Description |
|-------|-------------|
| `user` | Current `AuthUser` or null |
| `authReady` | True after sessionStorage hydration |
| `isAuthenticated` | `user && token` both present |
| `modalOpen` / `modalMode` | Auth modal visibility and tab |

On mount: reads `getStoredUser()` from sessionStorage.

### Watchlist (`lib/watchlist/context.tsx`)

| State | Description |
|-------|-------------|
| `symbols` | Ticker array from API |
| `isReady` | True after initial load |

Refetches when `isAuthenticated` changes. `toggle()` calls add/remove mutations.

### Data fetching patterns

| Pattern | Used for |
|---------|----------|
| `useEffect` + fetch | Portfolio, transactions, wallet, stocks catalog |
| `usePolling` hook | Header tickers, watchlist quotes, wallet holdings |
| `setInterval` in useEffect | Stock page quote (5s), chart 1D refresh (60s) |
| `refreshKey` prop | Re-fetch after order placement |

---

## GraphQL Client

**Base transport:** `lib/graphql/client.ts`

```typescript
graphqlRequest<T>(query, variables?, token?)
  → POST {NEXT_PUBLIC_API_URL}/graphql
  → cache: "no-store"
  → Authorization: Bearer {token} (when provided)
  → throws on first GraphQL error
```

Each domain has a dedicated file — see [GraphQL API](./05-graphql-api.md#client-functions-web).

Authenticated calls use `getStoredToken()` from `lib/auth/token.ts`.

---

## Token Storage

**File:** `lib/auth/token.ts`

| Key | Storage | Content |
|-----|---------|---------|
| `stockfolio_token` | `sessionStorage` | JWT string |
| `stockfolio_user` | `sessionStorage` | JSON `AuthUser` |

Cleared on logout. Survives page refresh within the same tab but not across tabs or after tab close.

---

## Polling

**Hook:** `lib/hooks/usePolling.ts`

```typescript
QUOTE_POLL_INTERVAL_MS = 60_000   // 1 minute between polls
QUOTE_POLL_DEFER_MS    = 2_000    // delay before first poll
```

Returns `{ data, error, refresh }`. Cleans up interval on unmount.

| Consumer | Interval | Condition |
|----------|----------|-----------|
| Header ticker strip | 60s | Always |
| WatchlistSection | 60s | Has symbols |
| WalletHoldingsSection | 60s | Has holdings |
| StockPageContent | 5s | Always on stock page |
| StockChart (1D only) | 60s | Period = "1d" |

---

## UI Primitives

Local components in `components/ui/`:

| Component | Notes |
|-----------|-------|
| `Button` | Variants: primary, outline; fullWidth support |
| `Card` | Renders `<section>` with optional `<h2>` title |
| `Modal` | Portal to body, Escape to close, scroll lock |
| `Input` / `NumberInput` / `Select` | Labeled form controls with `useId()` |
| `Avatar` | Next.js Image + Dicebear fallback |
| `SummaryMetric` | Label + value display for stats |

Shared package: `@stockfolio/ui` exports `Button` (used alongside local Button).

---

## Formatting Utilities

**File:** `lib/utils/format.ts`

| Function | Example output |
|----------|------------------|
| `formatCurrency(228.4)` | `$228.40` |
| `formatChange(1.2)` | `+1.2%` |
| `formatSignedCurrency(612)` | `+$612` |

Used across dashboard, stock, wallet, and order components.

---

## Dynamic Imports

`AuthModalHost` is loaded with `next/dynamic({ ssr: false })` to keep auth UI out of the server bundle and avoid hydration issues with sessionStorage.

---

## Metadata

**File:** `lib/site/metadata.ts`

Root metadata (title template, description, Open Graph). Stock pages generate dynamic metadata: `{SYMBOL} Stock Quote`.

---

## Next Steps

- [Features](./08-features.md) — detailed feature walkthroughs
- [Accessibility](./09-accessibility.md) — a11y patterns
- [Performance](./10-performance.md) — optimization details
