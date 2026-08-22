"use client";

import { useState } from "react";
import { orderStocks } from "../../lib/mock/dashboard";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { NumberInput } from "../ui/NumberInput";
import { Select } from "../ui/Select";

type OrderSide = "buy" | "sell";

interface OrderSectionProps {
  selectedStock: string;
  onStockChange: (symbol: string) => void;
}

const stockOptions = orderStocks.map((stock) => ({ value: stock, label: stock }));

export function OrderSection({ selectedStock, onStockChange }: OrderSectionProps) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [quantity, setQuantity] = useState("10");

  const handlePlaceOrder = () => {
    // Mock — API integration in a later phase
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
        <NumberInput
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <Button variant="primary" fullWidth onClick={handlePlaceOrder}>
        Place order
      </Button>
    </Card>
  );
}
