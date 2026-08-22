import type { WalletActivity } from "../../lib/mock/wallet";
import { formatSignedCurrency } from "../../lib/mock/dashboard";
import { Card } from "../ui/Card";

interface WalletActivitySectionProps {
  activities: WalletActivity[];
  onReset: () => void;
}

export function WalletActivitySection({ activities, onReset }: WalletActivitySectionProps) {
  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-white">Wallet activity</h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 self-start rounded-lg border border-[#3a3a3a] px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-[#555] hover:bg-[#1a1a1a] sm:text-sm"
        >
          <span aria-hidden>↻</span>
          Reset demo wallet
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[320px]">
          <div className="grid grid-cols-[80px_1fr_auto] gap-4 border-b border-[#2a2a2a] pb-3 text-xs text-slate-500 sm:grid-cols-[100px_1fr_auto] sm:text-sm">
            <span>Date</span>
            <span>Description</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="divide-y divide-[#2a2a2a]">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="grid grid-cols-[80px_1fr_auto] gap-4 py-3 sm:grid-cols-[100px_1fr_auto]"
              >
                <span className="text-sm text-slate-300">{activity.date}</span>
                <span className="text-sm text-white">{activity.description}</span>
                <span
                  className={`text-right text-sm font-medium ${
                    activity.amount >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatSignedCurrency(activity.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
