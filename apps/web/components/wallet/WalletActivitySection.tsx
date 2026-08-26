import type { WalletLedgerEntry } from "../../lib/graphql/wallet";
import { formatCurrency, formatSignedCurrency } from "../../lib/mock/dashboard";
import { Card } from "../ui/Card";

interface WalletActivitySectionProps {
  ledger: WalletLedgerEntry[];
}

function ledgerSignedAmount(entry: WalletLedgerEntry): number {
  if (entry.type === "DEBIT") return -entry.amount;
  return entry.amount;
}

function formatLedgerType(type: string): string {
  switch (type) {
    case "CREDIT":
      return "Credit";
    case "DEBIT":
      return "Debit";
    case "RESET":
      return "Reset";
    default:
      return type;
  }
}

export function WalletActivitySection({ ledger }: WalletActivitySectionProps) {
  return (
    <Card title="Cash ledger">
      {ledger.length === 0 ? (
        <p className="text-sm text-slate-500">No wallet activity yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            <div className="grid grid-cols-[88px_72px_1fr_auto_auto] gap-3 border-b border-[#2a2a2a] pb-3 text-xs text-slate-500 sm:grid-cols-[100px_80px_1fr_auto_auto] sm:gap-4 sm:text-sm">
              <span>Date</span>
              <span>Type</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Balance</span>
            </div>

            <div className="divide-y divide-[#2a2a2a]">
              {ledger.map((entry) => {
                const signed = ledgerSignedAmount(entry);
                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[88px_72px_1fr_auto_auto] gap-3 py-3 sm:grid-cols-[100px_80px_1fr_auto_auto] sm:gap-4"
                  >
                    <span className="text-sm text-slate-300">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-sm text-slate-400">{formatLedgerType(entry.type)}</span>
                    <span className="text-sm text-white">
                      {entry.reference ?? formatLedgerType(entry.type)}
                    </span>
                    <span
                      className={`text-right text-sm font-medium ${
                        signed >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatSignedCurrency(signed)}
                    </span>
                    <span className="text-right text-sm text-slate-300">
                      {formatCurrency(entry.balanceAfter)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
