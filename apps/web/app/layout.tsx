import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../lib/auth/context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stockfolio",
  description: "Paper trading portfolio tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
