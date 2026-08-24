import type { PortfolioSummary } from "../../lib/graphql/portfolio";
import { AllocationSectionInner } from "./PortfolioStats";

interface AllocationSectionProps {
  portfolio: PortfolioSummary | null;
  isAuthenticated: boolean;
}

export function AllocationSection(props: AllocationSectionProps) {
  return <AllocationSectionInner {...props} />;
}
