"use client";

import Link from "next/link";
import type { StockDetail } from "../../lib/mock/stocks";
import { isPositiveChange } from "../../lib/mock/stocks";
import { AppLayout } from "../layout/AppLayout";
import { PageContainer } from "../layout/PageContainer";
import { StockChart } from "./StockChart";
import { StockHeader } from "./StockHeader";
import { StockStats } from "./StockStats";
import { StockTradePanel } from "./StockTradePanel";

interface StockPageContentProps {
  stock: StockDetail;
}

export function StockPageContent({ stock }: StockPageContentProps) {
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

          <StockHeader stock={stock} />
          <StockChart
            symbol={stock.symbol}
            price={stock.price}
            isPositive={isPositiveChange(stock.changePercent)}
          />
          <StockStats stock={stock} />
          <StockTradePanel stock={stock} />
        </PageContainer>
      </main>
    </AppLayout>
  );
}
