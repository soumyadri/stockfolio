export function WalletDemoBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 sm:px-5 sm:py-4">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-400/50 text-xs text-blue-400">
        i
      </span>
      <p className="text-sm leading-relaxed text-blue-300">
        Paper trading wallet — balances and ledger entries reflect your simulated trades, not real
        money.
      </p>
    </div>
  );
}
