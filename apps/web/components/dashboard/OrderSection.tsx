"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OrderConfirmModal } from "../order/OrderConfirmModal";
import { OrderFeedbackModal } from "../order/OrderFeedbackModal";
import { useAuth } from "../../lib/auth/context";
import { placeOrder, type OrderResult } from "../../lib/graphql/orders";
import { fetchPortfolio, type PortfolioSummary } from "../../lib/graphql/portfolio";
import { fetchQuotes, fetchStocks } from "../../lib/graphql/quotes";
import { validateBuyOrder, validateSellOrder } from "../../lib/order/validateOrder";
import { formatCurrency } from "../../lib/mock/dashboard";
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
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackVariant, setFeedbackVariant] = useState<"success" | "error">("success");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [filledOrder, setFilledOrder] = useState<OrderResult | undefined>();

  const qty = Math.max(0, Number(quantity) || 0);
  const estimatedTotal = useMemo(() => qty * currentPrice, [qty, currentPrice]);

  useEffect(() => {
    fetchQuotes([selectedStock])
      .then((quotes) => setCurrentPrice(quotes[0]?.price ?? 0))
      .catch(() => setCurrentPrice(0));
  }, [selectedStock]);

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

  useEffect(() => {
    fetchStocks()
      .then((stocks) =>
        setStockOptions(stocks.map((s) => ({ value: s.ticker, label: s.ticker }))),
      )
      .catch(() => setStockOptions([]));
  }, []);

  const getSharesOwned = (data: PortfolioSummary | null, ticker: string): number => {
    const holding = data?.holdings.find((h) => h.ticker === ticker);
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
    const quotes = await fetchQuotes([selectedStock]).catch(() => []);
    const price = quotes[0]?.price ?? currentPrice;
    setCurrentPrice(price);
    setChecking(false);

    const orderTotal = qty * price;
    const sharesOwned = getSharesOwned(latestPortfolio, selectedStock);

    const validationError =
      side === "buy"
        ? validateBuyOrder(latestPortfolio?.cashBalance ?? 0, orderTotal)
        : validateSellOrder(sharesOwned, qty, selectedStock);

    if (validationError) {
      showError(validationError);
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      const result = await placeOrder(selectedStock, side === "buy" ? "BUY" : "SELL", qty);
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
      <Card title="Place an order">
        <div className="mb-4 grid grid-cols-2 gap-3" role="group" aria-label="Order side">
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
            label="Stock"
            options={stockOptions}
            value={selectedStock}
            onChange={(e) => onStockChange(e.target.value)}
          />
          <NumberInput
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={1}
          />
        </div>

        {isAuthenticated && portfolio && (
          <p className="mb-3 text-xs text-slate-500">
            {side === "buy"
              ? `Available cash: ${formatCurrency(portfolio.cashBalance)}`
              : `You own: ${getSharesOwned(portfolio, selectedStock)} ${selectedStock}`}
          </p>
        )}

        <Button
          variant="primary"
          fullWidth
          onClick={() => void handlePlaceOrderClick()}
          disabled={checking || submitting}
        >
          {checking ? "Checking…" : "Place order"}
        </Button>
      </Card>

      <OrderConfirmModal
        isOpen={confirmOpen}
        ticker={selectedStock}
        side={side}
        quantity={qty}
        price={currentPrice}
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
