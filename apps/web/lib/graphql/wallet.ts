import { graphqlRequest } from "./client";
import { getStoredToken } from "../auth/token";
import type { HoldingItem, PortfolioSummary, TransactionItem } from "./portfolio";

export interface WalletLedgerEntry {
  id: string;
  date: string;
  type: string;
  amount: number;
  balanceAfter: number;
  reference: string | null;
}

export interface WalletDetails extends PortfolioSummary {
  ledger: WalletLedgerEntry[];
  trades: TransactionItem[];
}

const WALLET_QUERY = `
  query Wallet {
    wallet {
      cashBalance holdingsValue totalValue todayGain totalReturnPercent
      holdings { ticker quantity avgCost currentPrice marketValue }
      ledger { id date type amount balanceAfter reference }
      trades { id date ticker side quantity price total }
    }
  }
`;

export async function fetchWallet(): Promise<WalletDetails> {
  const data = await graphqlRequest<{ wallet: WalletDetails }>(
    WALLET_QUERY,
    undefined,
    getStoredToken() ?? undefined,
  );
  return data.wallet;
}

export type { HoldingItem, TransactionItem };
