import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
