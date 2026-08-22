import { formatCurrency } from "../../lib/mock/dashboard";
import { SummaryMetric } from "../ui/SummaryMetric";

interface WalletSummaryProps {
  availableCash: number;
  invested: number;
  totalValue: number;
}

export function WalletSummary({ availableCash, invested, totalValue }: WalletSummaryProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 lg:gap-8">
      <SummaryMetric label="Available cash" value={formatCurrency(availableCash)} />
      <SummaryMetric label="Invested" value={formatCurrency(invested)} />
      <SummaryMetric label="Total account value" value={formatCurrency(totalValue)} />
    </section>
  );
}
