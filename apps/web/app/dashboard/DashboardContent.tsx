"use client";

import { useCallback, useEffect, useState } from "react";
import { WelcomeModal } from "../../components/onboarding/WelcomeModal";
import { AllocationSection } from "../../components/dashboard/AllocationSection";
import { OrderSection } from "../../components/dashboard/OrderSection";
import { PortfolioStats } from "../../components/dashboard/PortfolioStats";
import { TransactionHistorySection } from "../../components/dashboard/TransactionHistorySection";
import { WatchlistSection } from "../../components/dashboard/WatchlistSection";
import { AppLayout } from "../../components/layout/AppLayout";
import { PageContainer } from "../../components/layout/PageContainer";
import { useAuth } from "../../lib/auth/context";
import { fetchPortfolio, type PortfolioSummary } from "../../lib/graphql/portfolio";
import { useWelcomeModal } from "../../lib/onboarding/useWelcomeModal";

export function DashboardContent() {
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [refreshKey, setRefreshKey] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const { isAuthenticated } = useAuth();
  const { isOpen, dismiss, openSignup } = useWelcomeModal();

  useEffect(() => {
    if (!isAuthenticated) {
      setPortfolio(null);
      return;
    }

    fetchPortfolio()
      .then(setPortfolio)
      .catch(() => setPortfolio(null));
  }, [isAuthenticated, refreshKey]);

  const handleOrderPlaced = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <AppLayout>
      <WelcomeModal
        isOpen={isOpen}
        onDismiss={dismiss}
        onCreateAccount={openSignup}
      />

      <main className="w-full py-4 sm:py-6 lg:py-8">
        <PageContainer className="space-y-4 sm:space-y-5 lg:space-y-6" key={refreshKey}>
          <PortfolioStats portfolio={portfolio} isAuthenticated={isAuthenticated} />
          <AllocationSection portfolio={portfolio} isAuthenticated={isAuthenticated} />

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
            <WatchlistSection />
            <OrderSection
              selectedStock={selectedStock}
              onStockChange={setSelectedStock}
              onOrderPlaced={handleOrderPlaced}
            />
          </div>

          <TransactionHistorySection />
        </PageContainer>
      </main>
    </AppLayout>
  );
}
