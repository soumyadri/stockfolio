"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchQuotes } from "../../lib/graphql/quotes";
import {
  isPositiveChange,
  STOCK_DETAIL_POLL_MS,
  type ChartPeriod,
  type Quote,
} from "../../lib/types/stock";
import { AppLayout } from "../layout/AppLayout";
import { PageContainer } from "../layout/PageContainer";
import { StockChart } from "./StockChart";
import { StockHeader } from "./StockHeader";
import { StockStats } from "./StockStats";
import { StockTradePanel } from "./StockTradePanel";

interface StockPageContentProps {
  symbol: string;
}

export function StockPageContent({ symbol }: StockPageContentProps) {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("7d");
  const [liveQuote, setLiveQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuote = useCallback(async () => {
    const quotes = await fetchQuotes([symbol]);
    if (!quotes.length) throw new Error(`Unknown ticker: ${symbol}`);
    return quotes[0];
  }, [symbol]);

  useEffect(() => {
    setLiveQuote(null);
    setError(null);
  }, [symbol]);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const quote = await loadQuote();
        if (cancelled) return;
        setLiveQuote(quote);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load quote");
      }
    };

    refresh();
    const id = setInterval(refresh, STOCK_DETAIL_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [loadQuote]);

  if (error) {
    return (
      <AppLayout>
        <main className="w-full py-4 sm:py-6 lg:py-8">
          <PageContainer>
            <p className="text-red-400">Stock not found: {symbol}</p>
            <Link href="/dashboard" className="mt-4 inline-block text-sm text-blue-400">
              ← Back to dashboard
            </Link>
          </PageContainer>
        </main>
      </AppLayout>
    );
  }

  if (!liveQuote) {
    return (
      <AppLayout>
        <main className="w-full py-4 sm:py-6 lg:py-8">
          <PageContainer>
            <p className="text-slate-400">Loading {symbol}…</p>
          </PageContainer>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="w-full py-4 sm:py-6 lg:py-8">
        <PageContainer className="space-y-5 sm:space-y-6">
          <Link
            href="/dashboard"
            className="inline-flex text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to dashboard
          </Link>

          <StockHeader quote={liveQuote} />
          <StockChart
            ticker={liveQuote.ticker}
            isPositive={isPositiveChange(liveQuote.changePercent)}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
          />
          <StockStats quote={liveQuote} />
          <StockTradePanel quote={liveQuote} />
        </PageContainer>
      </main>
    </AppLayout>
  );
}
