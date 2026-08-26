"use client";

import type { OrderResult } from "../../lib/graphql/orders";
import { formatCurrency } from "../../lib/mock/dashboard";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface OrderFeedbackModalProps {
  isOpen: boolean;
  variant: "success" | "error";
  message: string;
  order?: OrderResult;
  onClose: () => void;
}

export function OrderFeedbackModal({
  isOpen,
  variant,
  message,
  order,
  onClose,
}: OrderFeedbackModalProps) {
  const isSuccess = variant === "success";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            isSuccess ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          }`}
        >
          {isSuccess ? (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <h2 className="text-xl font-semibold text-white">
          {isSuccess ? "Order filled" : "Order failed"}
        </h2>

        {isSuccess && order ? (
          <div className="mt-4 w-full space-y-2 rounded-xl border border-[#2a2a2a] bg-[#111111] p-4 text-sm">
            <p className="text-slate-300">
              {order.side === "BUY" ? "Bought" : "Sold"}{" "}
              <span className="font-medium text-white">
                {order.quantity} {order.ticker}
              </span>{" "}
              at {formatCurrency(order.filledPrice)}
            </p>
            <p className="font-medium text-emerald-400">
              Total: {formatCurrency(order.quantity * order.filledPrice)}
            </p>
            <p className="text-xs text-slate-500">Saved to your transaction history.</p>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{message}</p>
        )}

        <Button variant="primary" fullWidth className="mt-6" onClick={onClose}>
          {isSuccess ? "Done" : "Close"}
        </Button>
      </div>
    </Modal>
  );
}
