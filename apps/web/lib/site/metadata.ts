import type { Metadata } from "next";

export const SITE_NAME = "Stockfolio";
export const SITE_DESCRIPTION =
  "Paper trading portfolio tracker — track live stock quotes, place buy and sell orders, monitor holdings, and manage your virtual cash wallet.";
export const SITE_TAGLINE = "Practice investing with simulated live market data.";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Paper Trading Portfolio`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "paper trading",
    "stock portfolio",
    "virtual trading",
    "stock tracker",
    "investment simulator",
    "watchlist",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Paper Trading Portfolio`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Paper Trading Portfolio`,
    description: SITE_DESCRIPTION,
  },
};

export function pageTitle(title: string): Metadata {
  return { title, description: SITE_DESCRIPTION };
}
