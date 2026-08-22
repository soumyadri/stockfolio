"use client";

import Link from "next/link";
import { AppLayout } from "../layout/AppLayout";
import { PageContainer } from "../layout/PageContainer";
import { useWallet } from "../../lib/wallet/useWallet";
import { WalletActivitySection } from "./WalletActivitySection";
import { WalletDemoBanner } from "./WalletDemoBanner";
import { WalletSummary } from "./WalletSummary";

export function WalletPageContent() {
  const { wallet, totalValue, resetDemoWallet, isReady } = useWallet();

  if (!isReady || !wallet) {
    return (
      <AppLayout>
        <main className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-slate-500">Loading wallet...</p>
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

          <WalletSummary
            availableCash={wallet.availableCash}
            invested={wallet.invested}
            totalValue={totalValue}
          />
          <WalletDemoBanner />
          <WalletActivitySection activities={wallet.activities} onReset={resetDemoWallet} />
        </PageContainer>
      </main>
    </AppLayout>
  );
}
