"use client";

import { useMemo, useState } from "react";
import type { StockDetail } from "../../lib/mock/stocks";
import { formatCurrency } from "../../lib/mock/dashboard";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { NumberInput } from "../ui/NumberInput";

type OrderSide = "buy" | "sell";

interface StockTradePanelProps {
  stock: StockDetail;
}

export function StockTradePanel({ stock }: StockTradePanelProps) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [quantity, setQuantity] = useState("10");

  const qty = Math.max(1, Number(quantity) || 0);
  const estimatedTotal = useMemo(() => qty * stock.price, [qty, stock.price]);

  return (
    <Card>
      <div className="mb-4 grid grid-cols-2 gap-3">
        {(["buy", "sell"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setSide(value)}
            className={`rounded-lg border py-2.5 text-sm font-semibold capitalize transition-colors sm:py-3 ${
              side === value
                ? value === "buy"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500 bg-red-500/10 text-red-400"
                : "border-[#3a3a3a] text-slate-300 hover:border-[#555]"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:flex-1">
          <NumberInput value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <p className="text-sm text-slate-400 sm:shrink-0">
          Est. total:{" "}
          <span className="font-medium text-white">{formatCurrency(estimatedTotal)}</span>
        </p>
      </div>

      <Button variant="primary" fullWidth className="!py-3">
        Place order
      </Button>
    </Card>
  );
}
