"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAuth } from "../../lib/auth/context";
import { fetchQuotes } from "../../lib/graphql/quotes";
import { formatChange } from "../../lib/mock/dashboard";
import { QUOTE_POLL_DEFER_MS, QUOTE_POLL_INTERVAL_MS, usePolling } from "../../lib/hooks/usePolling";
import type { Quote } from "../../lib/types/stock";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { PageContainer } from "./PageContainer";

function AuthActionsSkeleton() {
  return (
    <div
      className="flex h-9 w-[168px] shrink-0 items-center justify-end gap-1.5 sm:w-[192px] sm:gap-2"
      aria-hidden
    >
      <div className="h-9 w-[4.5rem] animate-pulse rounded-lg bg-[#1a1a1a] sm:w-20" />
      <div className="h-9 w-[4.5rem] animate-pulse rounded-lg bg-[#1a1a1a] sm:w-20" />
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-end">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="User menu"
        className="rounded-full ring-offset-2 ring-offset-black transition hover:ring-2 hover:ring-[#3a3a3a]"
      >
        <Avatar alt={user.email} size="md" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-20 min-w-[220px] rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-2 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#2a2a2a] px-4 py-3">
              <Avatar alt={user.email} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-slate-500">Paper trader</p>
              </div>
            </div>
            <Link
              href="/wallet"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-[#252525]"
            >
              Wallet
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-[#252525]"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const TICKER_SYMBOLS = ["AAPL", "TSLA", "INFY", "RELIANCE", "MSFT"];

type TickerItem = Pick<Quote, "ticker" | "changePercent">;

function HeaderTicker({ items }: { items: TickerItem[] }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.ticker}
          href={`/stock/${item.ticker}`}
          aria-label={`${item.ticker}, ${formatChange(item.changePercent)} today`}
          className="inline-flex min-w-[5.75rem] shrink-0 items-baseline gap-1 whitespace-nowrap transition hover:opacity-80 sm:min-w-[6.25rem]"
        >
          <span className="font-medium text-white">{item.ticker}</span>
          <span
            className={`tabular-nums ${
              item.changePercent >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatChange(item.changePercent)}
          </span>
        </Link>
      ))}
    </>
  );
}

export function Header() {
  const { authReady, isAuthenticated, openAuthModal } = useAuth();
  const fetcher = useCallback(() => fetchQuotes(TICKER_SYMBOLS), []);
  const { data: quotes } = usePolling<Quote[]>(
    fetcher,
    QUOTE_POLL_INTERVAL_MS,
    true,
    QUOTE_POLL_DEFER_MS,
  );

  const tickerItems: TickerItem[] =
    quotes ??
    TICKER_SYMBOLS.map((ticker) => ({
      ticker,
      changePercent: 0,
    }));

  return (
    <header className="w-full border-b border-[#1f1f1f] bg-black">
      <PageContainer className="flex items-center gap-3 py-3 sm:gap-4 sm:py-3.5">
        <Link
          href="/dashboard"
          aria-label="Stockfolio home"
          className="shrink-0 transition-opacity hover:opacity-80"
        >
          <Logo showText={false} className="sm:hidden" />
          <Logo className="hidden sm:flex" />
        </Link>

        <nav className="hidden shrink-0 items-center gap-4 border-l border-[#1f1f1f] pl-3 text-sm lg:flex">
          <Link href="/dashboard" className="text-slate-400 transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/wallet" className="text-slate-400 transition hover:text-white">
            Wallet
          </Link>
        </nav>

        <div className="flex min-h-[1.25rem] min-w-0 flex-1 items-center gap-3 overflow-x-auto border-l border-[#1f1f1f] pl-3 text-xs scrollbar-none sm:gap-5 sm:pl-4 sm:text-sm">
          <HeaderTicker items={tickerItems} />
        </div>

        <div className="flex shrink-0 items-center">
          {!authReady ? (
            <AuthActionsSkeleton />
          ) : isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex h-9 w-[168px] shrink-0 items-center justify-end gap-1.5 sm:w-[192px] sm:gap-2">
              <Button variant="outline" onClick={() => openAuthModal("login")}>
                Log in
              </Button>
              <Button variant="primary" onClick={() => openAuthModal("signup")}>
                Sign up
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </header>
  );
}
