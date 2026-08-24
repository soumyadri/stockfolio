import { graphqlRequest } from "./client";
import { getStoredToken } from "../auth/token";
import type { PricePoint, Quote, Stock } from "../types/stock";

const QUOTE_FIELDS = `
  ticker companyName price changePercent changeAmount open dayLow dayHigh sharesOwned
`;

const QUOTES_QUERY = `
  query Quotes($tickers: [String!]!) {
    quotes(tickers: $tickers) {
      ${QUOTE_FIELDS}
    }
  }
`;

const PRICE_HISTORY_QUERY = `
  query PriceHistory($ticker: String!, $days: Int!) {
    priceHistory(ticker: $ticker, days: $days) {
      date price
    }
  }
`;

const STOCKS_QUERY = `
  query Stocks {
    stocks { ticker companyName }
  }
`;

export async function fetchQuotes(tickers: string[], token?: string): Promise<Quote[]> {
  if (tickers.length === 0) return [];

  const data = await graphqlRequest<{ quotes: Quote[] }>(
    QUOTES_QUERY,
    { tickers: tickers.map((t) => t.toUpperCase()) },
    token ?? getStoredToken() ?? undefined,
  );
  return data.quotes;
}

export async function fetchQuote(ticker: string, token?: string): Promise<Quote> {
  const quotes = await fetchQuotes([ticker], token);
  if (!quotes.length) {
    throw new Error(`Unknown ticker: ${ticker}`);
  }
  return quotes[0];
}

export async function fetchPriceHistory(
  ticker: string,
  days: number,
): Promise<PricePoint[]> {
  const data = await graphqlRequest<{ priceHistory: PricePoint[] }>(
    PRICE_HISTORY_QUERY,
    { ticker: ticker.toUpperCase(), days },
  );
  return data.priceHistory;
}

export async function fetchStocks(): Promise<Stock[]> {
  const data = await graphqlRequest<{ stocks: Stock[] }>(STOCKS_QUERY);
  return data.stocks;
}
