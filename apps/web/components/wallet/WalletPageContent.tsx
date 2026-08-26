"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/context";
import { useWalletData } from "../../lib/wallet/useWalletData";
import { AppLayout } from "../layout/AppLayout";
import { PageContainer } from "../layout/PageContainer";
import { Button } from "../ui/Button";
import { WalletActivitySection } from "./WalletActivitySection";
import { WalletDemoBanner } from "./WalletDemoBanner";
import { WalletHoldingsSection } from "./WalletHoldingsSection";
import { WalletSummary } from "./WalletSummary";
import { WalletTradesSection } from "./WalletTradesSection";

export function WalletPageContent() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { wallet, loading, error } = useWalletData(isAuthenticated);
  const [liveHoldingsValue, setLiveHoldingsValue] = useState(0);

  useEffect(() => {
    if (wallet) {
      setLiveHoldingsValue(wallet.holdingsValue);
    }
  }, [wallet]);

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <main className="w-full py-4 sm:py-6 lg:py-8">
          <PageContainer className="space-y-5">
            <Link
              href="/dashboard"
              className="inline-flex text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to dashboard
            </Link>
            <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-8 text-center">
              <p className="text-slate-400">Sign in to view your wallet and ledger.</p>
              <Button variant="primary" className="mt-4" onClick={() => openAuthModal("login")}>
                Log in
              </Button>
            </div>
          </PageContainer>
        </main>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <main className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-slate-500">Loading wallet…</p>
        </main>
      </AppLayout>
    );
  }

  if (error || !wallet) {
    return (
      <AppLayout>
        <main className="w-full py-4 sm:py-6 lg:py-8">
          <PageContainer>
            <p className="text-red-400">{error ?? "Failed to load wallet"}</p>
          </PageContainer>
        </main>
      </AppLayout>
    );
  }

  const totalValue = +(wallet.cashBalance + liveHoldingsValue).toFixed(2);

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
            availableCash={wallet.cashBalance}
            invested={liveHoldingsValue}
            totalValue={totalValue}
          />
          <WalletDemoBanner />
          <WalletHoldingsSection
            holdings={wallet.holdings}
            onHoldingsValueChange={setLiveHoldingsValue}
          />
          <WalletActivitySection ledger={wallet.ledger} />
          <WalletTradesSection trades={wallet.trades} />
        </PageContainer>
      </main>
    </AppLayout>
  );
}
