import { DEFAULT_WALLET, type WalletState } from "../mock/wallet";

const WALLET_KEY = "stockfolio_wallet";

export function loadWallet(): WalletState {
  if (typeof window === "undefined") return DEFAULT_WALLET;
  const stored = localStorage.getItem(WALLET_KEY);
  if (!stored) return DEFAULT_WALLET;
  try {
    return JSON.parse(stored) as WalletState;
  } catch {
    return DEFAULT_WALLET;
  }
}

export function saveWallet(state: WalletState): void {
  localStorage.setItem(WALLET_KEY, JSON.stringify(state));
}

export function resetWallet(): WalletState {
  saveWallet(DEFAULT_WALLET);
  return DEFAULT_WALLET;
}
