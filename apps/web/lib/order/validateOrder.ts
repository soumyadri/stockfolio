import { formatCurrency } from "../mock/dashboard";

export function validateBuyOrder(cashBalance: number, orderTotal: number): string | null {
  if (orderTotal <= 0) {
    return "Enter a valid quantity";
  }
  if (cashBalance < orderTotal) {
    return `Insufficient funds. Available ${formatCurrency(cashBalance)}, required ${formatCurrency(orderTotal)}.`;
  }
  return null;
}

export function validateSellOrder(
  sharesOwned: number,
  quantity: number,
  ticker: string,
): string | null {
  if (quantity <= 0) {
    return "Enter a valid quantity";
  }
  if (sharesOwned <= 0) {
    return `You don't hold any ${ticker} shares in your account.`;
  }
  if (sharesOwned < quantity) {
    return `Insufficient shares. You own ${sharesOwned} ${ticker} but tried to sell ${quantity}.`;
  }
  return null;
}
