"use client";

import { useCallback, useEffect, useState } from "react";
import { getTotalAccountValue, type WalletState } from "../mock/wallet";
import { loadWallet, resetWallet, saveWallet } from "./storage";

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState | null>(null);

  useEffect(() => {
    setWallet(loadWallet());
  }, []);

  const totalValue = wallet ? getTotalAccountValue(wallet) : 0;

  const resetDemoWallet = useCallback(() => {
    const restored = resetWallet();
    setWallet(restored);
  }, []);

  const updateWallet = useCallback((next: WalletState) => {
    setWallet(next);
    saveWallet(next);
  }, []);

  return { wallet, totalValue, resetDemoWallet, updateWallet, isReady: wallet !== null };
}
