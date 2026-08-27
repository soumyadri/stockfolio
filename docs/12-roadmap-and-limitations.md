# Roadmap & Limitations

Known gaps, planned work, and security considerations for Stockfolio.

---

## Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Monorepo & tooling | ✅ Done |
| 2 | Database & Prisma | ✅ Done |
| 3 | Backend core (GraphQL, auth, orders) | ✅ Done |
| 4 | Frontend core (dashboard, wallet, stock pages) | ✅ Done |
| 5 | Design system + Storybook | 🔜 Planned |
| 6 | Accessibility pass (WCAG AA) | 🔜 Planned |
| 7 | Live market data (Finnhub) | 🔜 Planned |
| 8 | Testing & CI (Playwright, GitHub Actions) | 🔜 Planned |
| 9 | Deployment (Vercel + Render + Neon) | 🔜 Planned |
| 10 | Optional AWS layer | 🔜 Planned |

---

## Known Limitations

### Trading & Financial

| Limitation | Impact | Planned fix |
|------------|--------|-------------|
| **Simulated prices** | Prices don't match real markets | Integrate Finnhub API |
| **No row-level locking** | Concurrent orders can race on wallet balance | `SELECT FOR UPDATE` or optimistic locking |
| **Float math in services** | JS `Number` used despite DB `Decimal` — potential rounding drift | Use decimal.js or Prisma Decimal throughout |
| **Immediate fill only** | No pending/limit/stop orders | Order status workflow |
| **No fractional share limits** | Any positive quantity accepted | Min lot size validation |
| **Price cache stale on restart only** | New stocks need server restart to appear | Cache invalidation or TTL |

### Authentication & Security

| Limitation | Impact | Planned fix |
|------------|--------|-------------|
| **JWT in sessionStorage** | Vulnerable to XSS (better than localStorage, but not httpOnly cookies) | httpOnly cookie sessions |
| **No token refresh** | 30-day tokens with no rotation | Refresh token flow |
| **No token revocation** | Logout is client-only; stolen tokens work until expiry | Token blocklist or short-lived tokens |
| **No rate limiting** | Brute-force login and account spam possible | express-rate-limit on auth endpoints |
| **No password reset** | Users can't recover accounts | Email-based reset flow |
| **Weak password policy** | Only 8-char minimum, no complexity rules | Stronger validation |
| **Demo credentials in seed** | `demo@stockfolio.app` / `demo1234` is public knowledge | Environment-gated seed or forced password change |
| **No `me` query on startup** | Expired tokens show as logged-in until API fails | Validate token on app load |
| **No GraphQL depth/complexity limits** | Potential DoS via expensive queries | Apollo Server plugins |
| **No security headers** | Missing CSP, HSTS, etc. | helmet middleware |

### Frontend

| Limitation | Impact | Planned fix |
|------------|--------|-------------|
| **No route protection** | `/wallet` renders for logged-out users (shows empty state) | Middleware or server-side auth |
| **Demo creates new accounts** | "Try the demo" registers random emails, bloating DB | Use seeded demo account instead |
| **Welcome modal says $10,000** | Marketing copy doesn't match $1,000 registration | Align copy with actual amount |
| **No mobile nav menu** | Dashboard/Wallet links hidden on mobile | Responsive navigation |
| **Hand-written GraphQL types** | Client/server types can drift | GraphQL Code Generator |
| **`graphql-types` package empty** | Placeholder only | Populate via codegen |

### Operations

| Limitation | Impact | Planned fix |
|------------|--------|-------------|
| **No tests** | `pnpm test` is a placeholder | Unit + integration + E2E tests |
| **No CI/CD** | No automated lint/test/deploy | GitHub Actions workflow |
| **No monitoring/logging** | No structured logs or error tracking | Add logging + Sentry/Datadog |
| **No deployment config** | Manual deployment only | Vercel (web) + Render (API) + Neon (DB) |

---

## Security Model Summary

### What is protected

- Passwords hashed with bcrypt (10 rounds)
- JWT signed with server secret
- CORS restricted to configured origin
- Auth required for portfolio, wallet, orders, watchlist mutations
- Generic login error messages (no user enumeration)
- Order price validated server-side (client can't set arbitrary fill price)

### What is NOT protected

- Public GraphQL queries (`stocks`, `quote`, `priceHistory`) — no auth needed
- No request rate limiting
- No input sanitization beyond basic validation
- No HTTPS enforcement (dev uses HTTP)
- Demo account credentials are in the README and seed script

**Do not deploy to production without addressing the security gaps above.**

---

## Architectural Decisions & Trade-offs

| Decision | Why | Trade-off |
|----------|-----|-----------|
| GraphQL over REST | Flexible queries, typed schema | More complex than REST for simple CRUD |
| Simulated pricing | No API key needed, works offline | Not realistic for trading simulation |
| sessionStorage for JWT | Simpler than cookies, tab-scoped | XSS risk remains |
| Client-side auth only | Faster to build, no SSR complexity | Routes not truly protected |
| Monorepo with pnpm | Shared config and UI | More setup than a single repo |
| Prisma ORM | Type-safe queries, migrations | Abstraction over raw SQL |
| No Apollo Client on frontend | Smaller bundle, simple fetch | No caching, batching, or subscriptions |
| Polling over WebSockets | Simple implementation | Higher latency and server load |

---

## Migration Notes

### From mock data to API (completed)

The following were removed in favor of API-backed data:

- `lib/mock/dashboard.ts` — mock portfolio stats, watchlist data
- `lib/mock/stocks.ts` — stale stock catalog with wrong prices
- `lib/mock/wallet.ts` — fake wallet with $46K invested
- `lib/wallet/useWallet.ts` + `storage.ts` — localStorage wallet
- `lib/watchlist/storage.ts` — localStorage watchlist

Formatters moved to `lib/utils/format.ts`.

### Future: Finnhub integration

When adding live market data:

1. Add `FINNHUB_API_KEY` to API env
2. Create `marketDataService.ts` with Finnhub client
3. Replace `priceService.ts` calls or add a provider switch
4. Update seed to use real tickers only
5. Handle market hours (prices frozen when market closed)
6. Add rate limiting for external API calls

---

## Contributing

This is a portfolio/learning project. If extending it:

1. Read the [docs index](./README.md) first
2. Follow conventions in [Development Guide](./11-development.md)
3. Run `pnpm typecheck` and `pnpm lint` before committing
4. Update relevant docs when adding features

---

## Related Documents

- [Overview](./01-overview.md) — project purpose
- [Architecture](./02-architecture.md) — system design
- [Accessibility](./09-accessibility.md) — a11y gaps
- [Performance](./10-performance.md) — optimization opportunities
