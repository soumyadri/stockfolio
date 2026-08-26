"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OrderConfirmModal } from "../order/OrderConfirmModal";
import { OrderFeedbackModal } from "../order/OrderFeedbackModal";
import { useAuth } from "../../lib/auth/context";
import { placeOrder, type OrderResult } from "../../lib/graphql/orders";
import { fetchPortfolio, type PortfolioSummary } from "../../lib/graphql/portfolio";
import { validateBuyOrder, validateSellOrder } from "../../lib/order/validateOrder";
import type { Quote } from "../../lib/types/stock";
import { formatCurrency } from "../../lib/mock/dashboard";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { NumberInput } from "../ui/NumberInput";

type OrderSide = "buy" | "sell";

interface StockTradePanelProps {
  quote: Quote;
  onOrderPlaced?: () => void;
}

export function StockTradePanel({ quote, onOrderPlaced }: StockTradePanelProps) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [side, setSide] = useState<OrderSide>("buy");
  const [quantity, setQuantity] = useState("10");
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackVariant, setFeedbackVariant] = useState<"success" | "error">("success");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [filledOrder, setFilledOrder] = useState<OrderResult | undefined>();

  const qty = Math.max(0, Number(quantity) || 0);
  const estimatedTotal = useMemo(() => qty * quote.price, [qty, quote.price]);

  const loadPortfolio = useCallback(async () => {
    if (!isAuthenticated) {
      setPortfolio(null);
      return null;
    }
    try {
      const data = await fetchPortfolio();
      setPortfolio(data);
      return data;
    } catch {
      setPortfolio(null);
      return null;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  const getSharesOwned = (data: PortfolioSummary | null): number => {
    if (!data) return quote.sharesOwned;
    const holding = data.holdings.find((h) => h.ticker === quote.ticker);
    return holding?.quantity ?? 0;
  };

  const showError = (message: string) => {
    setFeedbackVariant("error");
    setFeedbackMessage(message);
    setFilledOrder(undefined);
    setFeedbackOpen(true);
  };

  const handlePlaceOrderClick = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (!qty || qty <= 0) {
      showError("Enter a valid quantity");
      return;
    }

    setChecking(true);
    const latestPortfolio = (await loadPortfolio()) ?? portfolio;
    setChecking(false);

    const cashBalance = latestPortfolio?.cashBalance ?? 0;
    const sharesOwned = getSharesOwned(latestPortfolio);

    const validationError =
      side === "buy"
        ? validateBuyOrder(cashBalance, estimatedTotal)
        : validateSellOrder(sharesOwned, qty, quote.ticker);

    if (validationError) {
      showError(validationError);
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      const result = await placeOrder(quote.ticker, side === "buy" ? "BUY" : "SELL", qty);
      setConfirmOpen(false);
      setFilledOrder(result);
      setFeedbackVariant("success");
      setFeedbackMessage("");
      setFeedbackOpen(true);
      await loadPortfolio();
      onOrderPlaced?.();
    } catch (err) {
      setConfirmOpen(false);
      showError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <div className="mb-4 grid grid-cols-2 gap-3" role="group" aria-label="Order side">
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

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:flex-1">
            <NumberInput
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
            />
          </div>
          <p className="text-sm text-slate-400 sm:shrink-0">
            Est. total:{" "}
            <span className="font-medium text-white">{formatCurrency(estimatedTotal)}</span>
          </p>
        </div>

        {isAuthenticated && portfolio && (
          <p className="mb-3 text-xs text-slate-500">
            {side === "buy"
              ? `Available cash: ${formatCurrency(portfolio.cashBalance)}`
              : `You own: ${getSharesOwned(portfolio)} ${quote.ticker}`}
          </p>
        )}

        <Button
          variant="primary"
          fullWidth
          className="!py-3"
          onClick={() => void handlePlaceOrderClick()}
          disabled={checking || submitting}
        >
          {checking ? "Checking…" : "Place order"}
        </Button>
      </Card>

      <OrderConfirmModal
        isOpen={confirmOpen}
        ticker={quote.ticker}
        side={side}
        quantity={qty}
        price={quote.price}
        onConfirm={() => void handleConfirmOrder()}
        onCancel={() => setConfirmOpen(false)}
        submitting={submitting}
      />

      <OrderFeedbackModal
        isOpen={feedbackOpen}
        variant={feedbackVariant}
        message={feedbackMessage}
        order={filledOrder}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
}
