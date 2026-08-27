export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    isDemo: Boolean!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Stock {
    ticker: String!
    companyName: String!
  }

  type Quote {
    ticker: String!
    companyName: String!
    price: Float!
    changePercent: Float!
    changeAmount: Float!
    open: Float!
    dayLow: Float!
    dayHigh: Float!
    sharesOwned: Float!
  }

  type PricePoint {
    date: String!
    price: Float!
  }

  type OrderResult {
    id: ID!
    ticker: String!
    side: String!
    quantity: Float!
    filledPrice: Float!
    status: String!
  }

  type HoldingItem {
    ticker: String!
    quantity: Float!
    avgCost: Float!
    currentPrice: Float!
    marketValue: Float!
  }

  type PortfolioSummary {
    cashBalance: Float!
    holdingsValue: Float!
    totalValue: Float!
    todayGain: Float!
    totalReturnPercent: Float!
    holdings: [HoldingItem!]!
  }

  type TransactionItem {
    id: ID!
    date: String!
    ticker: String!
    side: String!
    quantity: Float!
    price: Float!
    total: Float!
  }

  type WalletLedgerEntry {
    id: ID!
    date: String!
    type: String!
    amount: Float!
    balanceAfter: Float!
    reference: String
  }

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

  type Query {
    me: User
    stocks: [Stock!]!
    quote(ticker: String!): Quote!
    quotes(tickers: [String!]!): [Quote!]!
    priceHistory(ticker: String!, days: Int!): [PricePoint!]!
    watchlistQuotes: [Quote!]!
    watchlist: [String!]!
    portfolio: PortfolioSummary!
    transactions: [TransactionItem!]!
    wallet: WalletDetails!
  }

  enum OrderSide {
    BUY
    SELL
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    placeOrder(
      ticker: String!
      side: OrderSide!
      quantity: Float!
      confirmedPrice: Float!
    ): OrderResult!
    addToWatchlist(ticker: String!): [String!]!
    removeFromWatchlist(ticker: String!): [String!]!
  }
`;
