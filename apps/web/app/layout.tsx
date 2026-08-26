import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "../components/providers/ClientProviders";
import { rootMetadata } from "../lib/site/metadata";
import { DICEBEAR_ORIGIN, getApiOrigin } from "../lib/site/resource-hints";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  preload: true,
  variable: "--font-inter",
});

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiOrigin = getApiOrigin();

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={apiOrigin} />
        <link rel="dns-prefetch" href={DICEBEAR_ORIGIN} />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
