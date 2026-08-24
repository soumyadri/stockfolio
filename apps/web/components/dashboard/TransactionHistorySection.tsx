"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/context";
import { fetchTransactions, type TransactionItem } from "../../lib/graphql/portfolio";
import { formatCurrency } from "../../lib/mock/dashboard";
import { Card } from "../ui/Card";

export function TransactionHistorySection() {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[] | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setTransactions(null);
      return;
    }

    fetchTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]));
  }, [isAuthenticated]);

  return (
    <Card title="Transaction history">
      {!isAuthenticated ? (
        <p className="text-sm text-slate-500">Sign in to view transactions.</p>
      ) : transactions === null ? (
        <p className="text-sm text-slate-500">Loading transactions…</p>
      ) : !transactions.length ? (
        <p className="text-sm text-slate-500">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[320px] space-y-1">
            <div className="grid grid-cols-4 gap-2 px-1 pb-2 text-xs text-slate-500 sm:gap-4">
              <span>Date</span>
              <span>Stock</span>
              <span>Side</span>
              <span className="text-right">Total</span>
            </div>

            {transactions.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-4 gap-2 rounded-lg px-1 py-2.5 hover:bg-[#1a1a1a] sm:gap-4"
              >
                <span className="text-sm text-slate-300">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-sm font-medium text-white">{item.ticker}</span>
                <span
                  className={`text-sm ${item.side === "BUY" ? "text-emerald-400" : "text-red-400"}`}
                >
                  {item.side === "BUY" ? "Buy" : "Sell"}
                </span>
                <span className="text-right text-sm text-slate-300">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
