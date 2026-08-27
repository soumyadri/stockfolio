# GraphQL API

The Stockfolio API is a **GraphQL** endpoint served by Apollo Server on Express.

**Endpoint:** `POST http://localhost:4000/graphql`

**Schema file:** `apps/api/src/graphql/schema.ts`

---

## Authentication

Most mutations and some queries require a logged-in user. Pass the JWT as a Bearer token:

```http
Authorization: Bearer <token>
```

| Auth level | Meaning |
|------------|---------|
| **Public** | No token needed |
| **Optional** | Works without token; enriches response if token present |
| **Required** | Returns `UNAUTHENTICATED` error without valid token |

Tokens are obtained from `login` or `register` mutations.

---

## Types

### User

```graphql
type User {
  id: ID!
  email: String!
  isDemo: Boolean!
  createdAt: String!
}
```

### AuthPayload

```graphql
type AuthPayload {
  token: String!
  user: User!
}
```

### Stock

```graphql
type Stock {
  ticker: String!
  companyName: String!
}
```

### Quote

```graphql
type Quote {
  ticker: String!
  companyName: String!
  price: Float!
  changePercent: Float!
  changeAmount: Float!
  open: Float!
  dayLow: Float!
  dayHigh: Float!
  sharesOwned: Float!    # 0 if unauthenticated
}
```

### PricePoint

```graphql
type PricePoint {
  date: String!    # ISO timestamp
  price: Float!
}
```

### OrderResult

```graphql
type OrderResult {
  id: ID!
  ticker: String!
  side: String!         # "BUY" or "SELL"
  quantity: Float!
  filledPrice: Float!
  status: String!       # "FILLED"
}
```

### HoldingItem

```graphql
type HoldingItem {
  ticker: String!
  quantity: Float!
  avgCost: Float!
  currentPrice: Float!
  marketValue: Float!
}
```

### PortfolioSummary

```graphql
type PortfolioSummary {
  cashBalance: Float!
  holdingsValue: Float!
  totalValue: Float!
  todayGain: Float!
  totalReturnPercent: Float!
  holdings: [HoldingItem!]!
}
```

### TransactionItem

```graphql
type TransactionItem {
  id: ID!
  date: String!
  ticker: String!
  side: String!
  quantity: Float!
  price: Float!
  total: Float!
}
```

### WalletDetails

Extends portfolio data with ledger and trades:

```graphql
type WalletDetails {
  cashBalance: Float!
  holdingsValue: Float!
  totalValue: Float!
  todayGain: Float!
  totalReturnPercent: Float!
  holdings: [HoldingItem!]!
  ledger: [WalletLedgerEntry!]!
  trades: [TransactionItem!]!
}

type WalletLedgerEntry {
  id: ID!
  date: String!
  type: String!          # CREDIT, DEBIT, RESET
  amount: Float!
  balanceAfter: Float!
  reference: String
}
```

### Enums

```graphql
enum OrderSide {
  BUY
  SELL
}
```

---

## Queries

### `me` — Optional auth

Returns the current user, or `null` if not logged in. Throws if token is present but invalid.

```graphql
query Me {
  me {
    id
    email
    isDemo
    createdAt
  }
}
```

**Client:** Not currently called on app startup (auth hydrates from sessionStorage).

---

### `stocks` — Public

Returns all tradeable tickers from the database.

```graphql
query Stocks {
  stocks {
    ticker
    companyName
  }
}
```

**Used by:** Order stock picker on dashboard.

---

### `quote` — Optional auth

Single stock quote. `sharesOwned` is populated when authenticated.

```graphql
query Quote($ticker: String!) {
  quote(ticker: $ticker) {
    ticker
    companyName
    price
    changePercent
    changeAmount
    open
    dayLow
    dayHigh
    sharesOwned
  }
}
```

---

### `quotes` — Optional auth

Batch quotes for multiple tickers. Preserves input order (with duplicates deduplicated).

```graphql
query Quotes($tickers: [String!]!) {
  quotes(tickers: $tickers) {
    ticker
    price
    changePercent
    changeAmount
    sharesOwned
  }
}
```

**Used by:** Header ticker strip, watchlist, wallet holdings, stock pages.

---

### `priceHistory` — Public

Historical price points for charting.

```graphql
query PriceHistory($ticker: String!, $days: Int!) {
  priceHistory(ticker: $ticker, days: $days) {
    date
    price
  }
}
```

| `days` value | Chart period |
|--------------|--------------|
| 1 | 1D |
| 7 | 7D |
| 30 | 30D |
| 180 | 6M |
| 365 | 1Y |

Returns 61 data points evenly spaced across the requested range.

---

### `portfolio` — Required auth

Portfolio summary with live holdings valuations.

```graphql
query Portfolio {
  portfolio {
    cashBalance
    holdingsValue
    totalValue
    todayGain
    totalReturnPercent
    holdings {
      ticker
      quantity
      avgCost
      currentPrice
      marketValue
    }
  }
}
```

---

### `wallet` — Required auth

Full wallet view: portfolio summary + cash ledger + trade history (last 50 each).

```graphql
query Wallet {
  wallet {
    cashBalance
    holdingsValue
    totalValue
    todayGain
    totalReturnPercent
    holdings { ticker quantity avgCost currentPrice marketValue }
    ledger { id date type amount balanceAfter reference }
    trades { id date ticker side quantity price total }
  }
}
```

---

### `transactions` — Required auth

Recent trades (last 50).

```graphql
query Transactions {
  transactions {
    id
    date
    ticker
    side
    quantity
    price
    total
  }
}
```

---

### `watchlist` — Required auth

User's watchlist ticker symbols.

```graphql
query Watchlist {
  watchlist
}
```

Returns: `["AAPL", "MSFT", ...]`

---

### `watchlistQuotes` — Required auth

Quotes for all watchlist items (convenience query).

```graphql
query WatchlistQuotes {
  watchlistQuotes {
    ticker
    price
    changePercent
  }
}
```

**Note:** The web app uses `watchlist` + `quotes` separately instead of this combined query.

---

## Mutations

### `register` — Public

Create a new account with $1,000 wallet.

```graphql
mutation Register($email: String!, $password: String!) {
  register(email: $email, password: $password) {
    token
    user { id email isDemo }
  }
}
```

**Validation:**
- Email must match basic regex
- Password minimum 8 characters
- Email must not already exist

---

### `login` — Public

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user { id email isDemo }
  }
}
```

Returns generic "Invalid email or password" on failure (no user enumeration).

---

### `placeOrder` — Required auth

Execute a buy or sell at the confirmed price.

```graphql
mutation PlaceOrder(
  $ticker: String!
  $side: OrderSide!
  $quantity: Float!
  $confirmedPrice: Float!
) {
  placeOrder(
    ticker: $ticker
    side: $side
    quantity: $quantity
    confirmedPrice: $confirmedPrice
  ) {
    id
    ticker
    side
    quantity
    filledPrice
    status
  }
}
```

**Price locking:** The server validates `confirmedPrice` is within **0.5%** of the current simulated price. If it passes, the order fills at `confirmedPrice` exactly.

**Buy side:** Debits wallet, creates/updates holding.
**Sell side:** Reduces/deletes holding, credits wallet.

**Errors:**
- `Insufficient funds` — not enough cash
- `Insufficient shares` — not enough holdings to sell
- `Price has changed. Please review your order and try again.` — drift > 0.5%
- `Unknown ticker: X` — ticker not in Stock table

---

### `addToWatchlist` — Required auth

```graphql
mutation AddToWatchlist($ticker: String!) {
  addToWatchlist(ticker: $ticker)
}
```

Returns updated watchlist array. Idempotent (upsert).

---

### `removeFromWatchlist` — Required auth

```graphql
mutation RemoveFromWatchlist($ticker: String!) {
  removeFromWatchlist(ticker: $ticker)
}
```

Returns updated watchlist array.

---

## Error Codes

GraphQL errors include an `extensions.code` field:

| Code | Meaning |
|------|---------|
| `BAD_USER_INPUT` | Validation failure (bad email, insufficient funds, etc.) |
| `UNAUTHENTICATED` | Missing, invalid, or expired token |

Example error response:

```json
{
  "errors": [{
    "message": "Insufficient funds",
    "extensions": { "code": "BAD_USER_INPUT" }
  }]
}
```

---

## Example: Full Auth + Order Flow

```bash
# 1. Login
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email:\"demo@stockfolio.app\", password:\"demo1234\") { token } }"}'

# 2. Place order (replace TOKEN)
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"query":"mutation { placeOrder(ticker:\"AAPL\", side:BUY, quantity:1, confirmedPrice:228.40) { id filledPrice status } }"}'
```

---

## Client Functions (Web)

Each GraphQL operation has a typed wrapper in `apps/web/lib/graphql/`:

| File | Functions |
|------|-----------|
| `client.ts` | `graphqlRequest()` — base transport |
| `auth.ts` | `loginUser`, `registerUser` |
| `quotes.ts` | `fetchQuotes`, `fetchQuote`, `fetchPriceHistory`, `fetchStocks` |
| `portfolio.ts` | `fetchPortfolio`, `fetchTransactions` |
| `wallet.ts` | `fetchWallet` |
| `orders.ts` | `placeOrder` |
| `watchlist.ts` | `fetchWatchlist`, `addToWatchlist`, `removeFromWatchlist` |

---

## Next Steps

- [Backend](./06-backend.md) — resolver and service implementation
- [Features](./08-features.md) — how the UI uses these operations
