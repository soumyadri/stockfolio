import { notFound } from "next/navigation";
import { StockPageContent } from "../../../components/stock/StockPageContent";
import { getStock } from "../../../lib/mock/stocks";

interface StockPageProps {
  params: { symbol: string };
}

export default function StockPage({ params }: StockPageProps) {
  const stock = getStock(params.symbol);
  if (!stock) notFound();

  return <StockPageContent stock={stock} />;
}
