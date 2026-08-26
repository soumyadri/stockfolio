import type { Metadata } from "next";
import { WalletPageContent } from "../../components/wallet/WalletPageContent";
import { pageTitle } from "../../lib/site/metadata";

export const metadata: Metadata = pageTitle("Wallet");

export default function WalletPage() {
  return <WalletPageContent />;
}
