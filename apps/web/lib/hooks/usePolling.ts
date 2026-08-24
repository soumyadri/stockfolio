import { useCallback, useEffect, useState } from "react";

export const QUOTE_POLL_INTERVAL_MS = 60_000;

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs = QUOTE_POLL_INTERVAL_MS,
  enabled = true,
): { data: T | null; error: string | null; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!enabled) return;
    fetcher()
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [fetcher, enabled]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs, enabled]);

  return { data, error, refresh };
}
