"use client";

import { useState } from "react";
import { WelcomeModal } from "../../components/onboarding/WelcomeModal";
import { AllocationSection } from "../../components/dashboard/AllocationSection";
import { OrderSection } from "../../components/dashboard/OrderSection";
import { PortfolioStats } from "../../components/dashboard/PortfolioStats";
import { TransactionHistorySection } from "../../components/dashboard/TransactionHistorySection";
import { WatchlistSection } from "../../components/dashboard/WatchlistSection";
import { AppLayout } from "../../components/layout/AppLayout";
import { PageContainer } from "../../components/layout/PageContainer";
import { useWelcomeModal } from "../../lib/onboarding/useWelcomeModal";

export function DashboardContent() {
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const { isOpen, dismiss, openSignup } = useWelcomeModal();

  return (
    <AppLayout>
      <WelcomeModal
        isOpen={isOpen}
        onDismiss={dismiss}
        onCreateAccount={openSignup}
      />

      <main className="w-full py-4 sm:py-6 lg:py-8">
        <PageContainer className="space-y-4 sm:space-y-5 lg:space-y-6">
          <PortfolioStats />
          <AllocationSection />

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
            <WatchlistSection onTrade={setSelectedStock} />
            <OrderSection selectedStock={selectedStock} onStockChange={setSelectedStock} />
          </div>

          <TransactionHistorySection />
        </PageContainer>
      </main>
    </AppLayout>
  );
}
