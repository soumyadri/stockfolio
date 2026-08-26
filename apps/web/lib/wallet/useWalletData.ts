"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWallet, type WalletDetails } from "../graphql/wallet";

export function useWalletData(enabled: boolean) {
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setWallet(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchWallet();
      setWallet(data);
    } catch (err) {
      setWallet(null);
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { wallet, loading, error, refresh };
}
