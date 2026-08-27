import { graphqlRequest } from "./client";
import { getStoredToken } from "../auth/token";

const WATCHLIST_QUERY = `
  query Watchlist {
    watchlist
  }
`;

const ADD_TO_WATCHLIST_MUTATION = `
  mutation AddToWatchlist($ticker: String!) {
    addToWatchlist(ticker: $ticker)
  }
`;

const REMOVE_FROM_WATCHLIST_MUTATION = `
  mutation RemoveFromWatchlist($ticker: String!) {
    removeFromWatchlist(ticker: $ticker)
  }
`;

export async function fetchWatchlist(): Promise<string[]> {
  const data = await graphqlRequest<{ watchlist: string[] }>(
    WATCHLIST_QUERY,
    undefined,
    getStoredToken() ?? undefined,
  );
  return data.watchlist;
}

export async function addToWatchlist(ticker: string): Promise<string[]> {
  const data = await graphqlRequest<{ addToWatchlist: string[] }>(
    ADD_TO_WATCHLIST_MUTATION,
    { ticker: ticker.toUpperCase() },
    getStoredToken() ?? undefined,
  );
  return data.addToWatchlist;
}

export async function removeFromWatchlist(ticker: string): Promise<string[]> {
  const data = await graphqlRequest<{ removeFromWatchlist: string[] }>(
    REMOVE_FROM_WATCHLIST_MUTATION,
    { ticker: ticker.toUpperCase() },
    getStoredToken() ?? undefined,
  );
  return data.removeFromWatchlist;
}
