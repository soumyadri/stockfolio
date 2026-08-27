# Performance

This document covers performance optimizations, data-fetching strategies, and trade-offs in Stockfolio.

---

## Overview

Stockfolio is a client-rendered dashboard app that polls for quote updates. Performance priorities:

1. Fast initial page load
2. Minimal layout shift during data loading
3. Controlled network usage from polling
4. Small JavaScript bundles

---

## Frontend Optimizations

### Next.js configuration

**File:** `apps/web/next.config.mjs`

| Setting | Effect |
|---------|--------|
| `compress: true` | Gzip compression for responses |
| `poweredByHeader: false` | Removes `X-Powered-By` header |
| `transpilePackages: ["@stockfolio/ui"]` | Compiles shared UI package |
| `optimizePackageImports: ["@stockfolio/ui"]` | Tree-shakes unused UI exports |
| `images.remotePatterns` | Allows optimized Dicebear avatar images |

### Font loading

**File:** `app/layout.tsx`

```typescript
const inter = Inter({
  subsets: ["latin"],
  display: "swap",           // Show fallback font immediately
  adjustFontFallback: true,    // Reduce layout shift
  preload: true,               // Preload font file
});
```

`display: "swap"` prevents invisible text during font load (FOIT).

### Code splitting

| Technique | What | Why |
|-----------|------|-----|
| `next/dynamic` | `AuthModalHost` with `ssr: false` | Auth UI not in server bundle; avoids sessionStorage hydration issues |
| App Router | Automatic per-route splitting | Each page loads only its JS |

No route-level `loading.tsx` files exist yet.

### Resource hints

**File:** `app/layout.tsx` + `lib/site/resource-hints.ts`

```html
<link rel="preconnect" href="{API_ORIGIN}" crossorigin />
<link rel="dns-prefetch" href="{API_ORIGIN}" />
<link rel="dns-prefetch" href="https://api.dicebear.com" />
```

- **preconnect** to API origin: establishes TCP/TLS early for GraphQL calls
- **dns-prefetch** to Dicebear: resolves DNS before avatar loads

### Image optimization

`Avatar` component uses `next/image` with explicit `sizes` prop. Remote Dicebear URLs are configured in `next.config.mjs`.

### CSS optimizations

**File:** `app/globals.css`

- `.tabular-nums` — monospace number alignment without extra font load
- `.metric-value` min-heights — prevents layout shift when stats load
- `html.modal-open { overflow: hidden }` — prevents background scroll without JS layout calculations

---

## Data Fetching Strategy

### No caching

All GraphQL requests use `cache: "no-store"` in `lib/graphql/client.ts`. This ensures fresh portfolio and quote data but means no HTTP-level caching.

### Polling intervals

| Data | Interval | Defer | Location |
|------|----------|-------|----------|
| Header tickers | 60s | 2s | `Header.tsx` |
| Watchlist quotes | 60s | 2s | `WatchlistSection.tsx` |
| Wallet holdings prices | 60s | 2s | `WalletHoldingsSection.tsx` |
| Stock page quote | 5s | — | `StockPageContent.tsx` |
| Chart (1D period) | 60s | — | `StockChart.tsx` |

**Defer pattern:** `usePolling` waits 2 seconds before the first fetch, preventing a burst of GraphQL calls on page load when multiple components mount simultaneously.

**Conditional polling:** Watchlist and wallet holdings only poll when they have tickers to fetch. Chart 1D polling only runs when the 1D period is selected.

### One-shot fetches

These load once on mount (or when auth changes):

- Portfolio summary (dashboard)
- Transaction history
- Wallet details
- Stock catalog (order picker)
- Price history (chart — re-fetches on period change)

### Refresh after mutations

After placing an order:
- Dashboard: `refreshKey` increments → portfolio + transactions re-fetch
- Stock page: `onOrderPlaced` → quote refresh
- No optimistic updates — UI waits for server response

---

## Loading States

| Component | Loading UX |
|-----------|------------|
| PortfolioStats | Skeleton placeholders with min-height |
| WatchlistSection | Per-row skeleton (symbol shown, price as "—") |
| WalletPageContent | Full-page loading text |
| StockPageContent | Null quote until first fetch completes |
| Auth modal | Button disabled + "Please wait..." text |

Skeleton rows use `aria-hidden` so screen readers aren't confused by placeholder content.

---

## Backend Performance

### Stock config cache

All `Stock` rows are loaded into an in-memory `Map` at server startup (`initStockConfigCache`). Price lookups are O(1) without database queries.

**Trade-off:** New stocks added to the database while the server is running won't appear until restart.

### Price calculation

`getPriceAt` is pure math (sin, random) — no I/O. `getDayStats` loops 5-minute buckets from start of day to now, which is O(hours) per call.

`resolveQuotes` in the quote resolver fetches prices in parallel via `Promise.all`.

### Database queries

- Portfolio holdings: one query + N price lookups (N = number of holdings)
- Wallet page: parallel `Promise.all` for ledger + trades
- Transactions/watchlist: limited to 50 rows (`take: 50`)

### Transactions

Order execution uses `prisma.$transaction` for atomicity. No row-level locking — see [limitations](./12-roadmap-and-limitations.md).

---

## Bundle Size Considerations

| Choice | Impact |
|--------|--------|
| No state management library | Smaller bundle (no Redux/Zustand) |
| Tailwind CSS | Utility classes, purged in production |
| SVG charts (no chart library) | No recharts/chart.js dependency |
| Minimal `@stockfolio/ui` package | Only Button shared so far |
| GraphQL client is hand-written fetch | No Apollo Client on frontend |

---

## Network Efficiency

### What could be improved

| Area | Current | Potential improvement |
|------|---------|----------------------|
| Quote fetching | Separate calls per component | Batch into single `quotes` call |
| Portfolio + transactions | Two queries on dashboard | Single combined query |
| Stock page polling | 5s interval | WebSocket or SSE for push updates |
| GraphQL | No query batching | Apollo Client with batch link |
| Price history | 61 points per request | Cache by ticker+days |

### What works well

- 60s poll interval for most data (low server load)
- 2s defer prevents thundering herd on page load
- `quotes` batch query used for multiple tickers in one request
- Conditional polling (disabled when no data to fetch)

---

## Lighthouse History

A previous commit ("Improve Lighthouse performance and accessibility on the web app") addressed:

- Font loading strategy (`display: swap`)
- Resource hints for API and avatar origins
- Layout stability (metric min-heights)
- Semantic HTML and ARIA improvements

Run Lighthouse in Chrome DevTools against `http://localhost:3000/dashboard` to check current scores.

---

## Production Checklist

Before deploying:

- [ ] Set `compress: true` (already in next.config)
- [ ] Use production `JWT_SECRET` and `DATABASE_URL`
- [ ] Set `CORS_ORIGIN` to production frontend URL
- [ ] Run `pnpm build` and test with `next start`
- [ ] Consider CDN for static assets (Vercel handles this automatically)
- [ ] Monitor API response times for `portfolio` and `quotes` queries
- [ ] Add rate limiting before public exposure

---

## Monitoring (Not Yet Implemented)

Planned for production:

- API response time metrics
- GraphQL query complexity logging
- Error rate tracking
- Database connection pool monitoring

---

## Next Steps

- [Development Guide](./11-development.md) — how to add features efficiently
- [Roadmap & Limitations](./12-roadmap-and-limitations.md) — planned performance work
