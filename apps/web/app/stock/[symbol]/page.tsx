import type { Metadata } from "next";
import { StockPageContent } from "../../../components/stock/StockPageContent";
import { SITE_NAME } from "../../../lib/site/metadata";

interface StockPageProps {
  params: { symbol: string };
}

export function generateMetadata({ params }: StockPageProps): Metadata {
  const symbol = params.symbol.toUpperCase();
  return {
    title: `${symbol} Stock Quote`,
    description: `View live ${symbol} price, chart, and place paper trades on ${SITE_NAME}.`,
  };
}

export default function StockPage({ params }: StockPageProps) {
  return <StockPageContent symbol={params.symbol.toUpperCase()} />;
}
