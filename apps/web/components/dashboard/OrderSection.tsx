"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/context";
import { placeOrder } from "../../lib/graphql/orders";
import { fetchStocks } from "../../lib/graphql/quotes";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { NumberInput } from "../ui/NumberInput";
import { Select } from "../ui/Select";

type OrderSide = "buy" | "sell";

interface OrderSectionProps {
  selectedStock: string;
  onStockChange: (symbol: string) => void;
  onOrderPlaced?: () => void;
}

export function OrderSection({ selectedStock, onStockChange, onOrderPlaced }: OrderSectionProps) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [side, setSide] = useState<OrderSide>("buy");
  const [quantity, setQuantity] = useState("10");
  const [stockOptions, setStockOptions] = useState<{ value: string; label: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStocks()
      .then((stocks) =>
        setStockOptions(stocks.map((s) => ({ value: s.ticker, label: s.ticker }))),
      )
      .catch(() => setStockOptions([]));
  }, []);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setMessage("Enter a valid quantity");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const result = await placeOrder(selectedStock, side === "buy" ? "BUY" : "SELL", qty);
      setMessage(`Order filled: ${result.quantity} ${result.ticker} @ $${result.filledPrice}`);
      onOrderPlaced?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Place an order">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors sm:py-3 ${
            side === "buy"
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-[#3a3a3a] text-slate-300 hover:border-[#555]"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors sm:py-3 ${
            side === "sell"
              ? "border-red-500 bg-red-500/10 text-red-400"
              : "border-[#3a3a3a] text-slate-300 hover:border-[#555]"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          options={stockOptions}
          value={selectedStock}
          onChange={(e) => onStockChange(e.target.value)}
        />
        <NumberInput value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>

      {message && (
        <p className={`mb-3 text-sm ${message.includes("filled") ? "text-emerald-400" : "text-red-400"}`}>
          {message}
        </p>
      )}

      <Button variant="primary" fullWidth onClick={handlePlaceOrder} disabled={submitting}>
        {submitting ? "Placing…" : "Place order"}
      </Button>
    </Card>
  );
}
