import { graphqlRequest } from "./client";
import { getStoredToken } from "../auth/token";

export interface HoldingItem {
  ticker: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
}

export interface PortfolioSummary {
  cashBalance: number;
  holdingsValue: number;
  totalValue: number;
  todayGain: number;
  totalReturnPercent: number;
  holdings: HoldingItem[];
}

export interface TransactionItem {
  id: string;
  date: string;
  ticker: string;
  side: string;
  quantity: number;
  price: number;
  total: number;
}

const PORTFOLIO_QUERY = `
  query Portfolio {
    portfolio {
      cashBalance holdingsValue totalValue todayGain totalReturnPercent
      holdings { ticker quantity avgCost currentPrice marketValue }
    }
  }
`;

const TRANSACTIONS_QUERY = `
  query Transactions {
    transactions { id date ticker side quantity price total }
  }
`;

export async function fetchPortfolio(): Promise<PortfolioSummary> {
  const data = await graphqlRequest<{ portfolio: PortfolioSummary }>(
    PORTFOLIO_QUERY,
    undefined,
    getStoredToken() ?? undefined,
  );
  return data.portfolio;
}

export async function fetchTransactions(): Promise<TransactionItem[]> {
  const data = await graphqlRequest<{ transactions: TransactionItem[] }>(
    TRANSACTIONS_QUERY,
    undefined,
    getStoredToken() ?? undefined,
  );
  return data.transactions;
}
