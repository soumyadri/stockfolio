"use client";

import { formatCurrency } from "../../lib/mock/dashboard";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface OrderConfirmModalProps {
  isOpen: boolean;
  ticker: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  onConfirm: () => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function OrderConfirmModal({
  isOpen,
  ticker,
  side,
  quantity,
  price,
  onConfirm,
  onCancel,
  submitting = false,
}: OrderConfirmModalProps) {
  const total = quantity * price;
  const isBuy = side === "buy";

  return (
    <Modal isOpen={isOpen} onClose={submitting ? () => {} : onCancel}>
      <div className="mb-5 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Confirm order</p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {isBuy ? "Buy" : "Sell"} {quantity} {ticker}
        </h2>
      </div>

      <div className="mb-6 space-y-3 rounded-xl border border-[#2a2a2a] bg-[#111111] p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Side</span>
          <span className={isBuy ? "font-medium text-emerald-400" : "font-medium text-red-400"}>
            {isBuy ? "Buy" : "Sell"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Quantity</span>
          <span className="font-medium text-white">{quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Price per share</span>
          <span className="font-medium text-white">{formatCurrency(price)}</span>
        </div>
        <div className="flex justify-between border-t border-[#2a2a2a] pt-3">
          <span className="text-slate-400">Estimated total</span>
          <span className="font-semibold text-white">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={onConfirm}
          disabled={submitting}
          className={isBuy ? "!bg-emerald-600 hover:!bg-emerald-500" : "!bg-red-600 hover:!bg-red-500"}
        >
          {submitting ? "Placing…" : "Confirm order"}
        </Button>
      </div>
    </Modal>
  );
}
