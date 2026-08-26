import { useCallback, useEffect, useState } from "react";

export const QUOTE_POLL_INTERVAL_MS = 60_000;
export const QUOTE_POLL_DEFER_MS = 2_000;

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs = QUOTE_POLL_INTERVAL_MS,
  enabled = true,
  deferMs = QUOTE_POLL_DEFER_MS,
): { data: T | null; error: string | null; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!enabled) return;
    fetcher()
      .then((result) => setData(result))
      .catch((err: Error) => setError(err.message));
  }, [fetcher, enabled]);

  useEffect(() => {
    if (!enabled) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let deferId: ReturnType<typeof setTimeout> | undefined;

    const start = () => {
      refresh();
      intervalId = setInterval(refresh, intervalMs);
    };

    if (deferMs > 0) {
      deferId = setTimeout(start, deferMs);
    } else {
      start();
    }

    return () => {
      if (deferId) clearTimeout(deferId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [refresh, intervalMs, enabled, deferMs]);

  return { data, error, refresh };
}
