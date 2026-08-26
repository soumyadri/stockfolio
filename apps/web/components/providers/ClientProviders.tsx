"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { AuthProvider } from "../../lib/auth/context";
import { WatchlistProvider } from "../../lib/watchlist/context";

const AuthModalHost = dynamic(
  () => import("../auth/AuthModalHost").then((mod) => mod.AuthModalHost),
  { ssr: false },
);

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WatchlistProvider>
        {children}
        <AuthModalHost />
      </WatchlistProvider>
    </AuthProvider>
  );
}
