import { StockPageContent } from "../../../components/stock/StockPageContent";

interface StockPageProps {
  params: { symbol: string };
}

export default function StockPage({ params }: StockPageProps) {
  return <StockPageContent symbol={params.symbol.toUpperCase()} />;
}
